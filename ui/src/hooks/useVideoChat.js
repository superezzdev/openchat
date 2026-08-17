import { useEffect, useRef, useState } from 'react';

function setVideoBitrate(sdp, bitrate) {
  return sdp.replace(
    /b=AS:\d+/g,
    `b=AS:${bitrate}`
  ).replace(
    /(m=video.*\r\n)/,
    `$1b=AS:${bitrate}\r\n`
  );
}

export const useVideoChat = (interests = [], mode = 'video', question = '') => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const iceServersRef = useRef([{ urls: 'stun:stun.l.google.com:19302' }]);
  const iceCandidateQueue = useRef([]);

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
  const [toastMessage, setToastMessage] = useState("");

  /**
   * Fetches TURN servers from our metered.live API to fallback when STUN fails.
   */
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

  /**
   * Initializes the video chat by asking for permissions and connecting to signaling.
   */
  const init = async (isMounted) => {
    await fetchTurnServers();
    if (!isMounted()) return;

    if (mode === 'video') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
            facingMode: 'user',
            aspectRatio: 16/9
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000
          }
        });
        if (!isMounted()) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        connectSignaling();
      } catch (err) {
        console.error("Failed to access camera/mic", err);
        if (isMounted()) setStatus('error');
      }
    } else {
      setIsVideoEnabled(false);
      setIsAudioEnabled(false);
      connectSignaling();
    }
  };

  /**
   * Connects to the WebSocket server for signaling.
   */
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
          setToastMessage("🎉 Stranger connected!");
          setTimeout(() => setToastMessage(""), 2500);
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

  /**
   * Sets up the WebRTC Peer Connection for P2P video/audio.
   * @param {boolean} isInitiator - Whether this client should create the offer
   * 
   * WHAT ICE servers are: They help browsers find each other across the internet, bypassing firewalls and NATs.
   * WHAT STUN does: It simply tells the browser "here is your public IP address" so it can share it with the peer.
   * 
   * WHY do we call createOffer only on one side?
   * WebRTC requires an asymmetric handshake. One side (the offerer) proposes a connection, 
   * and the other side (the answerer) accepts it. If both tried to offer, they would conflict.
   */
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

    peerConnectionRef.current.onconnectionstatechange = async () => {
      if (peerConnectionRef.current.connectionState === 'connected') {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          const params = sender.getParameters();
          if (!params.encodings) params.encodings = [{}];
          params.encodings[0].maxBitrate = 2500000;
          params.encodings[0].maxFramerate = 30;
          params.encodings[0].networkPriority = 'high';
          await sender.setParameters(params);
        }
      }
    };

    peerConnectionRef.current.oniceconnectionstatechange = () => {
      const state = peerConnectionRef.current.iceConnectionState;
      if (state === 'disconnected') {
        setTimeout(() => {
          if (peerConnectionRef.current && peerConnectionRef.current.iceConnectionState === 'disconnected') {
            peerConnectionRef.current.restartIce();
          }
        }, 3000);
      } else if (state === 'failed') {
        setToastMessage("Connection lost — finding a new stranger...");
        findStranger();
        setTimeout(() => setToastMessage(""), 3000);
      }
    };

    if (isInitiator) {
      const offer = await peerConnectionRef.current.createOffer();
      offer.sdp = setVideoBitrate(offer.sdp, 2500);
      await peerConnectionRef.current.setLocalDescription(offer);
      socketRef.current.send(JSON.stringify({ type: 'offer', offer }));
    }
  };

  /**
   * Handles an incoming WebRTC offer from the initiator.
   * @param {Object} message - The message containing the offer
   * 
   * WHAT SDP is: SDP (Session Description Protocol) is a text string describing the media formats (like H.264 video) and connection info the browser supports.
   */
  const handleOffer = async (message) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await peerConnectionRef.current.createAnswer();
    answer.sdp = setVideoBitrate(answer.sdp, 2500);
    await peerConnectionRef.current.setLocalDescription(answer);
    socketRef.current.send(JSON.stringify({ type: 'answer', answer }));
    processIceQueue();
  };

  const processIceQueue = async () => {
    while (iceCandidateQueue.current.length > 0) {
      const candidate = iceCandidateQueue.current.shift();
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding queued ice candidate', e);
      }
    }
  };

  /**
   * Handles an incoming WebRTC answer.
   * @param {Object} message - The message containing the answer
   */
  const handleAnswer = async (message) => {
    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(message.answer));
    processIceQueue();
  };

  /**
   * Handles incoming ICE candidates from the peer.
   * @param {Object} message - The message containing the ICE candidate
   * 
   * WHAT ICE candidates are: They are potential network paths (IP addresses/ports) to reach the peer.
   * WHY there are multiple: A device might have multiple IPs (Wi-Fi, Cellular, VPN), and ICE tries them all to find the best route.
   */
  const handleIceCandidate = async (message) => {
    try {
      if (peerConnectionRef.current?.remoteDescription) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(message.candidate));
      } else {
        iceCandidateQueue.current.push(message.candidate);
      }
    } catch (e) {
      console.error('Error adding received ice candidate', e);
    }
  };

  /**
   * Handles the event when the peer leaves the connection.
   */
  const handlePeerLeft = () => {
    setStatus('disconnected');
    if (peerConnectionRef.current) { 
      peerConnectionRef.current.close(); 
      peerConnectionRef.current = null; 
    }
  };

  /**
   * Leaves the current room and joins the waiting queue for a new stranger.
   */
  const findStranger = () => {
    setStatus('idle'); setMessages([]); setIsStrangerTyping(false); setCommonInterests([]);
    setShowReportModal(false); setSpyState(null); setRemoteVideoEnabled(true); setRemoteAudioEnabled(true);
    iceCandidateQueue.current = [];
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) { peerConnectionRef.current.close(); peerConnectionRef.current = null; }
    socketRef.current.send(JSON.stringify({ type: 'leave' }));
    setTimeout(() => socketRef.current.send(JSON.stringify({ type: 'join', tags: interests, mode, question })), 100);
  };

  /**
   * Toggles the user's video track on or off.
   */
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

  /**
   * Toggles the user's audio track on or off.
   */
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

  /**
   * Handles changes to the chat input and sends typing indicators.
   * @param {Object} e - The input change event
   */
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

  /**
   * Sends a chat message to the peer.
   * @param {Object} e - The form submit event
   */
  const sendMessage = (e) => {
    if (e) e.preventDefault();
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

  /**
   * Submits a report against the current peer.
   * @param {string} reason - The reason for the report
   */
  const submitReport = async (reason) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: 'anonymous',
          roomType: mode,
          reason
        })
      });
    } catch (e) {
      console.error('Failed to submit report', e);
    }

    if (socketRef.current && status === 'connected') {
      socketRef.current.send(JSON.stringify({ type: 'report', reason }));
    }
    setShowReportModal(false);
    findStranger();
  };

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    init(isMounted);
    
    return () => {
      mounted = false;
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
    spyState, remoteVideoEnabled, remoteAudioEnabled, toastMessage,
    toggleVideo, toggleAudio, handleChatInputChange, sendMessage, submitReport, findStranger
  };
};
