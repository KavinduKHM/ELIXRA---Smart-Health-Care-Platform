// src/pages/VideoRoom.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { joinSession, endSession } from '../services/api';
import VideoCall from '../components/telemedicine/VideoCall';
import WaitingRoom from '../components/telemedicine/WaitingRoom';

const VideoRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user info from localStorage (set after login)
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole'); // 'PATIENT' or 'DOCTOR'

  useEffect(() => {
    const fetchJoinInfo = async () => {
      try {
        const data = await joinSession(sessionId, userId, userRole);
        setSessionData(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to join session');
      } finally {
        setLoading(false);
      }
    };
    fetchJoinInfo();
  }, [sessionId, userId, userRole]);

  const handleEndCall = async () => {
    try {
      await endSession(sessionId, userId, 'Consultation ended by user');
      navigate('/dashboard'); // redirect after call
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  if (loading) return <div>Loading video session...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!sessionData) return null;

  return (
    <div className="video-room">
      <h2>Video Consultation</h2>
      {!sessionData.sessionActive ? (
        <WaitingRoom sessionId={sessionId} />
      ) : (
        <VideoCall
          channelName={sessionData.channelName}
          token={sessionData.token}
          appId={sessionData.appId}
          userId={sessionData.userId}
          userRole={sessionData.userRole}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default VideoRoom;