import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorProfile from '../../components/doctor/DoctorProfile';
import { FiSearch, FiSettings } from 'react-icons/fi';
import './DoctorProfilePage.css';

const DoctorProfilePage = () => {
  const { profile, doctorId, setProfile } = useOutletContext();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="doctorProfilePage">
      <section className="doctorProfilePageTopBar">
        <div>
          <h1>Profile</h1>
          <p>Maintain professional profile details, credentials, and public doctor information.</p>
        </div>
        <div className="doctorProfilePageActions">
          <div className="doctorProfilePageSearch">
            <FiSearch />
            <input
              type="text"
              placeholder="Search profile details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className="doctorProfilePageSettingsBtn" disabled>
            <FiSettings />
          </button>
        </div>
      </section>

      <DoctorProfile profile={profile} doctorId={doctorId} onProfileUpdate={setProfile} searchQuery={searchQuery} />
    </div>
  );
};

export default DoctorProfilePage;
