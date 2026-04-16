// src/components/patient/PatientAppointments.js
import React, { useEffect, useMemo, useState } from 'react';
import { getUpcomingAppointmentsForPatient } from '../../services/appointmentService';

const PatientAppointments = ({ patientId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getUpcomingAppointmentsForPatient(patientId);
        if (!isMounted) return;
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setError('Failed to load appointments');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [patientId]);

  const { pending, confirmed, other } = useMemo(() => {
    const list = Array.isArray(appointments) ? appointments : [];

    const pendingList = [];
    const confirmedList = [];
    const otherList = [];

    for (const apt of list) {
      const status = String(apt.status).toUpperCase();
      if (status === 'CONFIRMED') {
        confirmedList.push(apt);
      } else if (status === 'PENDING' || status === 'PENDING_PAYMENT' || status === 'RESCHEDULED') {
        pendingList.push(apt);
      } else {
        otherList.push(apt);
      }
    }

    return {
      pending: pendingList,
      confirmed: confirmedList,
      other: otherList,
    };
  }, [appointments]);

  const joinVideo = (apt) => {
    const channelName = `appointment_${apt.id}`;
    const url = `/video-call/${encodeURIComponent(channelName)}/${encodeURIComponent(patientId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Your Appointments</h2>

      {loading && <p>Loading appointments...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p>No upcoming appointments.</p>
      )}

      {!loading && !error && appointments.length > 0 && pending.length === 0 && confirmed.length === 0 && (
        <p>No pending/confirmed upcoming appointments.</p>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h3>Pending</h3>
          {pending.map((apt) => (
            <div key={apt.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <p><strong>Doctor:</strong> {apt.doctorName || 'Doctor'} (ID: {apt.doctorId})</p>
              <p><strong>Time:</strong> {apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : '—'}</p>
              <p><strong>Status:</strong> {apt.status}</p>
            </div>
          ))}
        </div>
      )}

      {confirmed.length > 0 && (
        <div style={{ marginBottom: other.length > 0 ? '1rem' : 0 }}>
          <h3>Confirmed</h3>
          {confirmed.map((apt) => (
            <div key={apt.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <p><strong>Doctor:</strong> {apt.doctorName || 'Doctor'} (ID: {apt.doctorId})</p>
              <p><strong>Time:</strong> {apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : '—'}</p>
              <p><strong>Status:</strong> {apt.status}</p>
              <button onClick={() => joinVideo(apt)}>Join Video Session</button>
            </div>
          ))}
        </div>
      )}

      {other.length > 0 && (
        <div>
          <h3>Other</h3>
          {other.map((apt) => (
            <div key={apt.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <p><strong>Doctor:</strong> {apt.doctorName || 'Doctor'} (ID: {apt.doctorId})</p>
              <p><strong>Time:</strong> {apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : '—'}</p>
              <p><strong>Status:</strong> {apt.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
