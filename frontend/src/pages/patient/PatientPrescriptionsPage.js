import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Prescriptions from '../../components/patient/Prescriptions';

const PatientPrescriptionsPage = () => {
  const { prescriptions } = useOutletContext();

  return (
    <div>
      <h1>Prescriptions</h1>
      <Prescriptions prescriptions={prescriptions || []} />
    </div>
  );
};

export default PatientPrescriptionsPage;
