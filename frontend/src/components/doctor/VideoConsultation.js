// src/components/doctor/VideoConsultation.js
import React, { useState, useEffect } from 'react';
import { getUpcomingAppointmentsForDoctor, updateAppointmentStatus } from '../../services/appointmentService';

const VideoConsultation = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);

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
    const channelName = `appointment_${apt.id}`;
    const url = `/video-call/${encodeURIComponent(channelName)}/${encodeURIComponent(doctorId)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
                  Start Video Call
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