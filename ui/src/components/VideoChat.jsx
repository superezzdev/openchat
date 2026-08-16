import React from 'react';
import { useVideoChat } from '../hooks/useVideoChat.js';
import { VideoArea } from './video/VideoArea.jsx';
import { ChatArea } from './chat/ChatArea.jsx';

/**
 * VideoChat component.
 * Note: The core WebRTC logic (getUserMedia, RTCPeerConnection, Offer/Answer, ICE)
 * has been extracted into the `useVideoChat` hook.
 */
const VideoChat = ({ onQuit, interests = [], mode = 'video', question = '' }) => {
  const {
    localVideoRef, remoteVideoRef, messagesEndRef,
    status, isVideoEnabled, isAudioEnabled, messages, chatInput,
    isStrangerTyping, commonInterests, userCount, showReportModal, setShowReportModal,
    spyState, remoteVideoEnabled, remoteAudioEnabled,
    toggleVideo, toggleAudio, handleChatInputChange, sendMessage, submitReport, findStranger
  } = useVideoChat(interests, mode, question);

  return (
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-xblack overflow-hidden relative">
      {mode === 'video' && (
        <VideoArea
          remoteVideoRef={remoteVideoRef}
          localVideoRef={localVideoRef}
          status={status}
          remoteVideoEnabled={remoteVideoEnabled}
          isVideoEnabled={isVideoEnabled}
          isAudioEnabled={isAudioEnabled}
          userCount={userCount}
          commonInterests={commonInterests}
          toggleVideo={toggleVideo}
          toggleAudio={toggleAudio}
          findStranger={findStranger}
          onQuit={onQuit}
          setShowReportModal={setShowReportModal}
          showReportModal={showReportModal}
          submitReport={submitReport}
        />
      )}
      
      <ChatArea
        mode={mode}
        spyState={spyState}
        status={status}
        commonInterests={commonInterests}
        userCount={userCount}
        messages={messages}
        chatInput={chatInput}
        isStrangerTyping={isStrangerTyping}
        handleChatInputChange={handleChatInputChange}
        sendMessage={sendMessage}
        setShowReportModal={setShowReportModal}
        findStranger={findStranger}
        onQuit={onQuit}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default VideoChat;
