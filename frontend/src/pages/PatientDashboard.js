// src/pages/PatientDashboard.js
import React, { useState, useEffect } from 'react';
import Profile from '../components/patient/Profile';
import Documents from '../components/patient/Documents';
import Prescriptions from '../components/patient/Prescriptions';
import MedicalHistory from '../components/patient/MedicalHistory';
import BookAppointment from '../components/patient/BookAppointment';
import { getPatientProfile, getPatientDocuments, getPatientPrescriptions, getPatientMedicalHistory } from '../services/patientService';

const PatientDashboard = () => {
  const [patientId, setPatientId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  const loadAllData = async (id) => {
    try {
      const profileRes = await getPatientProfile(id);
      setProfile(profileRes.data);
      const docsRes = await getPatientDocuments(id);
      setDocuments(docsRes.data);
      const prescRes = await getPatientPrescriptions(id);
      setPrescriptions(prescRes.data);
      const histRes = await getPatientMedicalHistory(id);
      setMedicalHistory(histRes.data);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      alert('Failed to load patient data. Make sure the ID exists and services are running.');
      setLoaded(false);
    }
  };

  const handleLoad = () => {
    if (patientId && !isNaN(patientId)) {
      loadAllData(patientId);
    } else {
      alert('Enter a valid numeric patient ID');
    }
  };

  const refreshDocuments = async () => {
    const docsRes = await getPatientDocuments(patientId);
    setDocuments(docsRes.data);
  };

  if (!loaded) {
    return (
      <div>
        <h2>Patient Dashboard</h2>
        <p>Enter your patient ID to view your data:</p>
        <input
          type="number"
          placeholder="Patient ID"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
        />
        <button onClick={handleLoad}>Load</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Patient Dashboard</h1>
      <p><strong>Patient ID:</strong> {patientId}</p>
      <Profile profile={profile} patientId={patientId} onProfileUpdate={setProfile} />
      <Documents documents={documents} patientId={patientId} onDocumentUploaded={refreshDocuments} />
      <Prescriptions prescriptions={prescriptions} />
      <MedicalHistory history={medicalHistory} />
      <BookAppointment patientId={patientId} />
    </div>
  );
};

export default PatientDashboard;