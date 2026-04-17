import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorPrescriptions from '../../components/doctor/Prescriptions';

const DoctorPrescriptionsPage = () => {
  const { doctorId } = useOutletContext();

  return (
    <div>
      <h1>Prescriptions</h1>
      <DoctorPrescriptions doctorId={doctorId} />
    </div>
  );
};

export default DoctorPrescriptionsPage;
