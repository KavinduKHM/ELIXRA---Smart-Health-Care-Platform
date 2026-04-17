// src/components/doctor/AppointmentRequests.js
import React, { useState, useEffect } from 'react';
import { getPendingAppointmentsForDoctor, updateAppointmentStatus } from '../../services/appointmentService';

const AppointmentRequests = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const res = await getPendingAppointmentsForDoctor(doctorId);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [doctorId]);

  const handleStatus = async (appointmentId, status, notes = '') => {
    try {
      await updateAppointmentStatus(appointmentId, { status, notes });
      alert(`Appointment ${status}`);
      loadRequests(); // refresh
    } catch (err) {
      console.error(err);
      alert('Status update failed');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Appointment Requests</h2>
      {appointments.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        appointments.map(apt => (
          <div key={apt.id} style={{ borderBottom: '1px solid #eee', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
            <p><strong>Patient:</strong> {apt.patientName} (ID: {apt.patientId})</p>
            <p><strong>Time:</strong> {new Date(apt.appointmentTime).toLocaleString()}</p>
            <p><strong>Symptoms:</strong> {apt.symptoms}</p>
            <p><strong>Status:</strong> {apt.status}</p>
            <button onClick={() => handleStatus(apt.id, 'CONFIRMED', 'Confirmed by doctor')}>Confirm</button>
            <button onClick={() => handleStatus(apt.id, 'CANCELLED', 'Cancelled by doctor')}>Cancel</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AppointmentRequests;