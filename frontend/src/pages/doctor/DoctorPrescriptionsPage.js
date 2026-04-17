import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorPrescriptions from '../../components/doctor/Prescriptions';
import './DoctorPrescriptionsPage.css';

const DoctorPrescriptionsPage = () => {
  const { doctorId, profile } = useOutletContext();
  const isVerified = profile?.status === 'VERIFIED';

  return (
    <div className="doctor-prescriptions-page">
      <DoctorPrescriptions doctorId={doctorId} isVerified={isVerified} />
    </div>
  );
};

export default DoctorPrescriptionsPage;
