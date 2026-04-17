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

  const renderAppointmentCard = (apt, category) => {
    const doctorName = apt.doctorName || 'Doctor';
    const specialty = apt.doctorSpecialty || apt.specialty || 'Specialist';
    const timeLabel = apt.appointmentTime ? new Date(apt.appointmentTime).toLocaleString() : '—';

    return (
      <article key={apt.id} className="apt-card">
        <div className="apt-avatar" aria-hidden="true">{doctorName.charAt(0).toUpperCase()}</div>
        <div className="apt-content">
          <h4>{`Dr. ${doctorName}`}</h4>
          <p className="apt-specialty">{specialty}</p>
          <p className="apt-time">{timeLabel}</p>
        </div>
        <div className="apt-actions">
          <span className={`apt-badge apt-badge-${category}`}>{String(apt.status || '').replace('_', ' ') || category}</span>
          {category === 'confirmed' ? (
            <button type="button" className="apt-join-btn" onClick={() => joinVideo(apt)}>
              Join Video Session
            </button>
          ) : null}
        </div>
      </article>
    );
  };

  return (
    <div className="appointments-board">
      <h2 className="appointments-board-title">Appointments Timeline</h2>

      {loading && <p className="appointments-empty">Loading appointments...</p>}
      {error && <p className="appointments-error">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="appointments-empty">No upcoming appointments.</p>
      )}

      {!loading && !error && appointments.length > 0 && pending.length === 0 && confirmed.length === 0 && (
        <p className="appointments-empty">No pending/confirmed upcoming appointments.</p>
      )}

      {pending.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-pending">Pending</h3>
          <div className="appointments-stack">
            {pending.map((apt) => renderAppointmentCard(apt, 'pending'))}
          </div>
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-confirmed">Confirmed</h3>
          <div className="appointments-stack">
            {confirmed.map((apt) => renderAppointmentCard(apt, 'confirmed'))}
          </div>
        </div>
      )}

      {other.length > 0 && (
        <div className="appointments-group">
          <h3 className="appointments-group-title appointments-group-title-other">Other</h3>
          <div className="appointments-stack">
            {other.map((apt) => renderAppointmentCard(apt, 'other'))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
