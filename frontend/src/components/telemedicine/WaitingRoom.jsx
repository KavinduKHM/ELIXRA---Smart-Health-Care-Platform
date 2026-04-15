// src/components/WaitingRoom.jsx
import { useEffect, useState } from 'react';
import { getSessionDetails } from '../../services/api';

const WaitingRoom = ({ sessionId }) => {
  const [status, setStatus] = useState('WAITING');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const details = await getSessionDetails(sessionId);
        if (details.status === 'ACTIVE') {
          setStatus('ACTIVE');
          window.location.reload(); // reload to join the active session
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="waiting-room">
      <h3>Waiting for the other participant to join...</h3>
      <p>Session status: {status}</p>
    </div>
  );
};

export default WaitingRoom;