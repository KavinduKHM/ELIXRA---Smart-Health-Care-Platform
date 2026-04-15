// src/components/VideoCall.jsx
import { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import VideoControls from './VideoControls';

const VideoCall = ({ channelName, token, appId, userId, userRole, onEndCall }) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});

  useEffect(() => {
    const initAgora = async () => {
      // Create client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Handle remote user events
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          const playerId = `remote-video-${user.uid}`;
          remoteVideoRefs.current[user.uid] = remoteVideoTrack;
          setRemoteUsers(prev => [...prev, user]);
          remoteVideoTrack.play(playerId);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
        delete remoteVideoRefs.current[user.uid];
      });

      client.on('user-left', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      // Join channel
      await client.join(appId, channelName, token, userId);
      console.log('Joined channel:', channelName);

      // Create local tracks
      const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      setLocalVideoTrack(cameraTrack);
      await client.publish([microphoneTrack, cameraTrack]);

      // Play local video
      if (localVideoRef.current) {
        cameraTrack.play(localVideoRef.current);
      }
    };

    initAgora();

    return () => {
      // Cleanup
      if (clientRef.current) {
        clientRef.current.leave();
        clientRef.current.removeAllListeners();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      Object.values(remoteVideoRefs.current).forEach(track => {
        track.stop();
        track.close();
      });
    };
  }, [channelName, token, appId, userId]);

  const handleToggleAudio = async () => {
    const audioTrack = clientRef.current?.localAudioTrack;
    if (audioTrack) {
      await audioTrack.setEnabled(!audioTrack.enabled);
    }
  };

  const handleToggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
    }
  };

  const handleEndCall = async () => {
    if (clientRef.current) {
      await clientRef.current.leave();
    }
    if (onEndCall) onEndCall();
  };

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <div className="local-video">
          <div ref={localVideoRef} className="video-player" />
          <div className="label">You ({userRole})</div>
        </div>
        {remoteUsers.map(user => (
          <div key={user.uid} className="remote-video">
            <div id={`remote-video-${user.uid}`} className="video-player" />
            <div className="label">User {user.uid}</div>
          </div>
        ))}
      </div>
      <VideoControls
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default VideoCall;