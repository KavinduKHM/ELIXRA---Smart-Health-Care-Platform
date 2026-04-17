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

  if (loading) return <p className="doctor-empty">Loading appointment requests...</p>;

  return (
    <div className="doctor-ui-card doctor-requests">
      <div className="doctor-ui-card-header">
        <div>
          <h2 className="doctor-ui-card-title">Appointment Requests</h2>
          <p className="doctor-ui-card-subtitle">Review and confirm incoming patient requests.</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <p className="doctor-empty">No pending requests.</p>
      ) : (
        <div className="doctor-requests-stack">
          {appointments.map(apt => (
            <article key={apt.id} className="doctor-request-card">
              <span className="doctor-request-status">{apt.status}</span>
              <p className="doctor-request-meta"><strong>Patient:</strong> {apt.patientName} (ID: {apt.patientId})</p>
              <p className="doctor-request-meta"><strong>Time:</strong> {new Date(apt.appointmentTime).toLocaleString()}</p>
              <p className="doctor-request-meta"><strong>Symptoms:</strong> {apt.symptoms || 'Not provided'}</p>
              <div className="doctor-action-row">
                <button
                  type="button"
                  className="doctor-ui-btn"
                  onClick={() => handleStatus(apt.id, 'CONFIRMED', 'Confirmed by doctor')}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="doctor-ui-btn doctor-ui-btn-danger"
                  onClick={() => handleStatus(apt.id, 'CANCELLED', 'Cancelled by doctor')}
                >
                  Cancel
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentRequests;