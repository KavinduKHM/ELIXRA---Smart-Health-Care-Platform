import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AvailabilityManager from '../../components/doctor/AvailabilityManager';
import AppointmentRequests from '../../components/doctor/AppointmentRequests';
import VideoConsultation from '../../components/doctor/VideoConsultation';
import './DoctorAppointmentsPage.css';

const DoctorAppointmentsPage = () => {
  const { doctorId } = useOutletContext();

  return (
    <div className="doctor-appointments-theme">
      <header className="doctor-appointments-head">
        <div>
          <h1>Appointments Hub</h1>
          <p>Manage availability, review incoming requests, and launch consultations.</p>
        </div>
        <div className="doctor-appointments-head-badge">Doctor #{doctorId}</div>
      </header>

      <div className="doctor-appointments-layout">
        <section className="doctor-appointments-main">
          <AvailabilityManager doctorId={doctorId} />
          <AppointmentRequests doctorId={doctorId} />
        </section>
        <aside className="doctor-appointments-side">
          <VideoConsultation doctorId={doctorId} />
        </aside>
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;
