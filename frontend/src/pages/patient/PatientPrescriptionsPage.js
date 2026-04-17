import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Prescriptions from '../../components/patient/Prescriptions';
import './PatientPrescriptionsPage.css';

const PatientPrescriptionsPage = () => {
  const { prescriptions } = useOutletContext();

  return (
    <div className="prescriptions-theme">
      <header className="prescriptions-theme-head">
        <h1>Prescriptions</h1>
        <p>View active medications, diagnosis notes, and validity windows.</p>
      </header>
      <Prescriptions prescriptions={prescriptions || []} />
    </div>
  );
};

export default PatientPrescriptionsPage;
