// src/components/doctor/VideoConsultation.js
import React, { useState, useEffect } from 'react';
import { getUpcomingAppointmentsForDoctor, updateAppointmentStatus } from '../../services/appointmentService';

const VideoConsultation = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

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
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Video Consultations</h2>
      {appointments.length === 0 ? (
        <p>No upcoming confirmed appointments.</p>
      ) : (
        appointments.map(apt => (
          <div key={apt.id} style={{ borderBottom: '1px solid #eee', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
            <p><strong>Patient:</strong> {apt.patientName} (ID: {apt.patientId})</p>
            <p><strong>Time:</strong> {new Date(apt.appointmentTime).toLocaleString()}</p>
            <button onClick={() => handleStartCall(apt)}>Start Video Call</button>
            <button onClick={() => handleComplete(apt.id)}>Complete Consultation</button>
          </div>
        ))
      )}
    </div>
  );
};

export default VideoConsultation;