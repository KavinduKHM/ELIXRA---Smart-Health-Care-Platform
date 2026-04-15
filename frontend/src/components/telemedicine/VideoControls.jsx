// src/components/VideoControls.jsx
import { useState } from 'react';

const VideoControls = ({ onToggleAudio, onToggleVideo, onEndCall }) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const handleAudio = () => {
    setAudioEnabled(!audioEnabled);
    onToggleAudio();
  };

  const handleVideo = () => {
    setVideoEnabled(!videoEnabled);
    onToggleVideo();
  };

  return (
    <div className="controls">
      <button onClick={handleAudio}>
        {audioEnabled ? '🔊 Mute' : '🔇 Unmute'}
      </button>
      <button onClick={handleVideo}>
        {videoEnabled ? '📹 Stop Video' : '🎥 Start Video'}
      </button>
      <button onClick={onEndCall} className="end-call">
        📞 End Call
      </button>
    </div>
  );
};

export default VideoControls;