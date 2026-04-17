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
        <button
          type="button"
          className="appointments-theme-cta"
          onClick={() => {
            const target = document.getElementById('quick-booking-section');
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Book New Appointment
        </button>
      </header>

      <div className="appointments-theme-layout">
        <section className="appointments-theme-main" data-fade-card="left">
          <PatientAppointments patientId={patientId} />
        </section>

        <aside className="appointments-theme-side" data-fade-card="right">
          <div id="quick-booking-section">
            <BookAppointment patientId={patientId} profile={profile} />
          </div>
          <div className="appointments-chat-wrap">
            <AISymptomCheckerChatbot />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PatientAppointmentsBookPage;
