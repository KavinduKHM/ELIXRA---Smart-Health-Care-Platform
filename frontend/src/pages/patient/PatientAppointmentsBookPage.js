import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import PatientAppointments from '../../components/patient/PatientAppointments';
import './PatientAppointmentsBookPage.css';

const PatientAppointmentsBookPage = () => {
  const { patientId } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="appointments-theme">
      <header className="appointments-theme-head">
        <div>
          <h1>Your Appointments</h1>
          <p>Manage your clinical visits and digital sessions.</p>
        </div>
        <button
          type="button"
          className="appointments-theme-cta"
          onClick={() => navigate(`/patient/${patientId}/book`)}
        >
          + Book New Appointment
        </button>
      </header>

      <div className="appointments-theme-single" data-fade-card="left">
        <PatientAppointments patientId={patientId} />
      </div>
    </div>
  );
};

export default PatientAppointmentsBookPage;
