import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorProfile from '../../components/doctor/DoctorProfile';

const DoctorProfilePage = () => {
  const { profile, doctorId, setProfile } = useOutletContext();

  return (
    <div>
      <h1>Profile</h1>
      <DoctorProfile profile={profile} doctorId={doctorId} onProfileUpdate={setProfile} />
    </div>
  );
};

export default DoctorProfilePage;
