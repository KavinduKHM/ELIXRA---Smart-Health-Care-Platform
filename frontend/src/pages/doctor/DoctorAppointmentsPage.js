import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AvailabilityManager from '../../components/doctor/AvailabilityManager';
import AppointmentRequests from '../../components/doctor/AppointmentRequests';
import VideoConsultation from '../../components/doctor/VideoConsultation';

const DoctorAppointmentsPage = () => {
  const { doctorId, profile } = useOutletContext();
  const isVerified = profile?.status === 'VERIFIED';

  return (
    <div>
      <h1>Appointments</h1>
      <AvailabilityManager doctorId={doctorId} isVerified={isVerified} />
      <AppointmentRequests doctorId={doctorId} />
      <VideoConsultation doctorId={doctorId} />
    </div>
  );
};

export default DoctorAppointmentsPage;
