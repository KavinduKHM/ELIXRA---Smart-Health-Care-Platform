import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorPrescriptions from '../../components/doctor/Prescriptions';
import './DoctorPrescriptionsPage.css';

const DoctorPrescriptionsPage = () => {
  const { doctorId } = useOutletContext();

  return (
    <div className="doctor-prescriptions-page">
      <DoctorPrescriptions doctorId={doctorId} />
    </div>
  );
};

export default DoctorPrescriptionsPage;
