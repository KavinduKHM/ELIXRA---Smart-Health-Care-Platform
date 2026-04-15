// src/pages/VideoRoom.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import { endVideoSession, joinVideoSession } from '../services/telemedicine.service';
import VideoCall from '../components/telemedicine/VideoCall';
import WaitingRoom from '../components/telemedicine/WaitingRoom';

const VideoRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { actorId, userRole } = useAuth();

  const doJoin = useCallback(async () => {
    if (!sessionId) return;
    if (!actorId || !userRole) throw new Error('Not authenticated');

    const data = await joinVideoSession({
      sessionId: Number(sessionId),
      userId: Number(actorId),
      userRole,
    });

    setSessionData(data);
  }, [actorId, sessionId, userRole]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        if (!sessionId) {
          setError('Missing session ID');
          return;
        }
        if (!actorId || !userRole) {
          setError('Please sign in again to join this call');
          return;
        }

        await doJoin();
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to join session');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [actorId, doJoin, sessionId, userRole]);

  const handleEndCall = async () => {
    try {
      if (!actorId) throw new Error('Not authenticated');

      await endVideoSession({
        sessionId: Number(sessionId),
        userId: Number(actorId),
        consultationNotes: 'Consultation ended by user',
      });

      if (userRole === 'DOCTOR') navigate('/doctor/schedule', { replace: true });
      else navigate('/patient/appointments', { replace: true });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to end session');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Video Consultation</h1>
        <p className="mt-1 text-sm text-slate-600">Session #{sessionId}</p>
      </div>

      {loading ? (
        <Card>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Joining session
          </div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-sm text-rose-600">{error}</div>
        </Card>
      ) : !sessionData ? null : !sessionData.sessionActive ? (
        <WaitingRoom sessionId={Number(sessionId)} onActive={() => doJoin()} />
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
