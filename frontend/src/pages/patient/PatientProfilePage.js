import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Profile from '../../components/patient/Profile';

const PatientProfilePage = () => {
  const { profile, patientId, setProfile } = useOutletContext();

  return (
    <div>
      <h1>Profile</h1>
      <Profile profile={profile} patientId={patientId} onProfileUpdate={setProfile} />
    </div>
  );
};

export default PatientProfilePage;
