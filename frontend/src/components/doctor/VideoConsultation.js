// src/components/doctor/VideoConsultation.js
import React, { useState, useEffect } from 'react';
import { getUpcomingAppointmentsForDoctor, updateAppointmentStatus } from '../../services/appointmentService';
import { createVideoSession, getSessionsByAppointment, joinVideoSession } from '../../services/telemedicineService';

const VideoConsultation = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    loadUpcoming();
  }, [doctorId]);

  const loadUpcoming = async () => {
    try {
      const res = await getUpcomingAppointmentsForDoctor(doctorId);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartCall = async (apt) => {
    if (!apt?.id) return;
    setStartingId(apt.id);
    try {
      const appointmentId = Number(apt.id);
      let sessions = [];
      try {
        const existing = await getSessionsByAppointment(appointmentId);
        sessions = Array.isArray(existing?.data) ? existing.data : [];
      } catch {
        sessions = [];
      }

      let session = sessions[0];
      if (!session?.id) {
        const payload = {
          appointmentId,
          patientId: apt.patientId,
          doctorId: Number(doctorId),
          scheduledStartTime: apt.appointmentTime,
        };
        const created = await createVideoSession(payload);
        session = created?.data;
      }

      if (session?.id) {
        await joinVideoSession({
          sessionId: session.id,
          userId: Number(doctorId),
          userRole: 'DOCTOR',
        });
      }

      const channelName = `appointment_${apt.id}`;
      const url = `/video-call/${encodeURIComponent(channelName)}/${encodeURIComponent(doctorId)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('Unable to start the video session right now.');
    } finally {
      setStartingId(null);
    }
  };

  const handleComplete = async (aptId) => {
    if (window.confirm('Mark this consultation as completed?')) {
      try {
        await updateAppointmentStatus(aptId, { status: 'COMPLETED', notes: 'Consultation done' });
        alert('Appointment marked completed');
        loadUpcoming();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="doctor-ui-card doctor-video-consultations">
      <div className="doctor-ui-card-header">
        <div>
          <h2 className="doctor-ui-card-title">Video Consultations</h2>
          <p className="doctor-ui-card-subtitle">Start calls for confirmed appointments and complete sessions.</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <p className="doctor-empty">No upcoming confirmed appointments.</p>
      ) : (
        <div className="doctor-video-stack">
          {appointments.map(apt => (
            <article key={apt.id} className="doctor-video-card">
              <p className="doctor-video-meta"><strong>Patient:</strong> {apt.patientName} (ID: {apt.patientId})</p>
              <p className="doctor-video-meta"><strong>Time:</strong> {new Date(apt.appointmentTime).toLocaleString()}</p>
              <div className="doctor-action-row">
                <button type="button" className="doctor-ui-btn" onClick={() => handleStartCall(apt)}>
                  {startingId === apt.id ? 'Starting…' : 'Start Video Call'}
                </button>
                <button
                  type="button"
                  className="doctor-ui-btn doctor-ui-btn-secondary"
                  onClick={() => handleComplete(apt.id)}
                >
                  Complete Consultation
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoConsultation;