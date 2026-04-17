import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AvailabilityManager from '../../components/doctor/AvailabilityManager';
import AppointmentRequests from '../../components/doctor/AppointmentRequests';
import VideoConsultation from '../../components/doctor/VideoConsultation';

const DoctorAppointmentsPage = () => {
  const { doctorId } = useOutletContext();

  return (
    <div>
      <h1>Appointments</h1>
      <AvailabilityManager doctorId={doctorId} />
      <AppointmentRequests doctorId={doctorId} />
      <VideoConsultation doctorId={doctorId} />
    </div>
  );
};

export default DoctorAppointmentsPage;
