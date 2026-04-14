// src/pages/DoctorDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveSessionsForDoctor } from '../services/api';

const DoctorDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const doctorId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!doctorId) {
        setSessions([]);
        setError('Missing userId. Please log in again.');
        return;
      }
      try {
        setError('');
        const data = await getActiveSessionsForDoctor(doctorId);
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        setSessions([]);
        setError(e?.message || 'Failed to load sessions.');
      }
    };
    fetchSessions();
  }, [doctorId]);

  return (
    <div>
      <h2>My Active Video Consultations</h2>
      {error && <p>{error}</p>}
      {!error && sessions.length === 0 && <p>No active sessions.</p>}
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            Appointment ID: {session.appointmentId} – Status: {session.status}
            <Link to={`/video-room/${session.id}`}>
              <button>Join</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DoctorDashboard;