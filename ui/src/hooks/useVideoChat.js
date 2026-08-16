import { useEffect, useRef, useState } from 'react';

export const useVideoChat = (interests = [], mode = 'video', question = '') => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const iceServersRef = useRef([{ urls: 'stun:stun.l.google.com:19302' }]);

  const [status, setStatus] = useState('idle');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [commonInterests, setCommonInterests] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [spyState, setSpyState] = useState(null);
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);

  const fetchTurnServers = async () => {
    try {
      const response = await fetch('https://myapp.metered.live/api/v1/turn/credentials?apiKey=YOUR_KEY');
      if (!response.ok) throw new Error('Failed to fetch TURN credentials');
      const data = await response.json();
      iceServersRef.current = [{ urls: 'stun:stun.l.google.com:19302' }, ...data];
    } catch (err) {
      console.warn("Could not fetch TURN servers, falling back to STUN only:", err);
    }
  };

  const init = async () => {
    await fetchTurnServers();
    if (mode === 'video') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        connectSignaling();
      } catch (err) {
        console.error("Failed to access camera/mic", err);
        setStatus('error');
      }
    } else {
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      connectSignaling();
    }
  };

  const connectSignaling = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => findStranger();

    socketRef.current.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'waiting': setStatus('waiting'); break;
        case 'matched':
          setStatus('connected');
          setCommonInterests(message.commonInterests || []);
          if (message.isSpy || message.isSpyStranger) {
            setSpyState({ isSpy: message.isSpy, isSpyStranger: message.isSpyStranger, question: message.question, peerId: message.peerId });
          }
          if (!message.isSpy) {
            setupPeerConnection(message.initiator);
            socketRef.current.send(JSON.stringify({ type: 'mediaState', videoEnabled: isVideoEnabled, audioEnabled: isAudioEnabled }));
          }
          break;
        case 'offer': await handleOffer(message); break;
        case 'answer': await handleAnswer(message); break;
        case 'ice-candidate': await handleIceCandidate(message); break;
        case 'peer_left': handlePeerLeft(); break;
        case 'mediaState':
          if (message.videoEnabled !== undefined) setRemoteVideoEnabled(message.videoEnabled);
          if (message.audioEnabled !== undefined) setRemoteAudioEnabled(message.audioEnabled);
          break;
        case 'chat':
          setIsStrangerTyping(false);
          setMessages(prev => [...prev, { text: message.text, isSent: false, senderId: message.senderId }]);
          break;
        case 'typing': setIsStrangerTyping(message.isTyping); break;
        case 'userCount': setUserCount(message.count); break;
        default: break;
      }
    };
  };

  const setupPeerConnection = async (isInitiator) => {
    peerConnectionRef.current = new RTCPeerConnection({ iceServers: iceServersRef.current });
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, localStreamRef.current));
    }
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) socketRef.current.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
    };
    if (isInitiator) {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.send(JSON.stringify({ type: 'offer', offer }));
    }
  };

  const handleOffer = async (message) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await peerConnectionRef.current.createAnswer();
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.send(JSON.stringify({ type: 'answer', answer }));
  };

  const handleAnswer = async (message) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
  };

  const handleIceCandidate = async (message) => {
    try {
      if (peerConnectionRef.current?.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
      }
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  };

  const handlePeerLeft = () => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    setMessages([]); setIsStrangerTyping(false); setCommonInterests([]); setShowReportModal(false);
    setSpyState(null); setRemoteVideoEnabled(true); setRemoteAudioEnabled(true); setStatus('disconnected');
  };

  const findStranger = () => {
    setStatus('idle'); setMessages([]); setIsStrangerTyping(false); setCommonInterests([]);
    setShowReportModal(false); setSpyState(null); setRemoteVideoEnabled(true); setRemoteAudioEnabled(true);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    socketRef.current.send(JSON.stringify({ type: 'leave' }));
    setTimeout(() => socketRef.current.send(JSON.stringify({ type: 'join', tags: interests, mode, question })), 100);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        if (socketRef.current && status === 'connected') {
          socketRef.current.send(JSON.stringify({ type: 'mediaState', videoEnabled: videoTrack.enabled, audioEnabled: isAudioEnabled }));
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        if (socketRef.current && status === 'connected') {
          socketRef.current.send(JSON.stringify({ type: 'mediaState', audioEnabled: audioTrack.enabled, videoEnabled: isVideoEnabled }));
        }
      }
    }
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
    if (status !== 'connected') return;
    if (!typingTimeoutRef.current) socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: true }));
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: false }));
      typingTimeoutRef.current = null;
    }, 300);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || status !== 'connected') return;
    socketRef.current.send(JSON.stringify({ type: 'chat', text: chatInput }));
    setMessages(prev => [...prev, { text: chatInput, isSent: true }]);
    setChatInput("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      socketRef.current.send(JSON.stringify({ type: 'typing', isTyping: false }));
    }
  };

  const submitReport = (reason) => {
    if (socketRef.current && status === 'connected') {
      socketRef.current.send(JSON.stringify({ type: 'report', reason }));
    }
    setShowReportModal(false);
    findStranger();
  };

  useEffect(() => {
    init();
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return {
    localVideoRef, remoteVideoRef, messagesEndRef,
    status, isVideoEnabled, isAudioEnabled, messages, chatInput,
    isStrangerTyping, commonInterests, userCount, showReportModal, setShowReportModal,
    spyState, remoteVideoEnabled, remoteAudioEnabled,
    toggleVideo, toggleAudio, handleChatInputChange, sendMessage, submitReport, findStranger
  };
};
