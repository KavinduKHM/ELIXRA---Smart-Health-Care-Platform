import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PatientAppointments from '../../components/patient/PatientAppointments';
import BookAppointment from '../../components/patient/BookAppointment';
import AISymptomCheckerChatbot from '../../components/patient/AISymptomCheckerChatbot';
import './PatientAppointmentsBookPage.css';

const PatientAppointmentsBookPage = () => {
  const { patientId, profile } = useOutletContext();

  return (
    <div className="appointments-theme">
      <header className="appointments-theme-head">
        <div>
          <h1>Your Appointments</h1>
          <p>Manage your clinical visits and digital sessions.</p>
        </div>
        <button type="button" className="appointments-theme-cta">Book New Appointment</button>
      </header>

      <div className="appointments-theme-layout">
        <section className="appointments-theme-main">
          <PatientAppointments patientId={patientId} />
        </section>

        <aside className="appointments-theme-side">
          <BookAppointment patientId={patientId} profile={profile} />
          <AISymptomCheckerChatbot />
        </aside>
      </div>
    </div>
  );
};

export default PatientAppointmentsBookPage;
