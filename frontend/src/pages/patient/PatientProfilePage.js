import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Profile from '../../components/patient/Profile';

const PatientProfilePage = () => {
  const {
    profile,
    patientId,
    setProfile,
    documents,
    setDocuments,
    medicalHistory,
    setMedicalHistory,
    refreshDocuments,
    refreshMedicalHistory,
  } = useOutletContext();

  return (
    <div className="patient-profile-page">
      <header className="patient-profile-head">
        <h1>Profile</h1>
        <p>Manage your personal information, account state, and documents.</p>
      </header>
      <Profile
        profile={profile}
        patientId={patientId}
        onProfileUpdate={setProfile}
        documents={documents || []}
        medicalHistory={medicalHistory || []}
        onDocumentsUpdate={setDocuments}
        onMedicalHistoryUpdate={setMedicalHistory}
        refreshDocuments={refreshDocuments}
        refreshMedicalHistory={refreshMedicalHistory}
      />
    </div>
  );
};

export default PatientProfilePage;
