// src/pages/PatientDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveSessionsForPatient } from '../services/api';

const PatientDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const patientId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!patientId) {
        setSessions([]);
        setError('Missing userId. Please log in again.');
        return;
      }
      try {
        setError('');
        const data = await getActiveSessionsForPatient(patientId);
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        setSessions([]);
        setError(e?.message || 'Failed to load sessions.');
      }
    };
    fetchSessions();
  }, [patientId]);

  return (
    <div>
      <h2>My Active Video Sessions</h2>
      {error && <p>{error}</p>}
      {!error && sessions.length === 0 && <p>No active sessions.</p>}
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            Appointment ID: {session.appointmentId} - Status: {session.status}
            <Link to={`/video-room/${session.id}`}>
              <button>Join</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientDashboard;