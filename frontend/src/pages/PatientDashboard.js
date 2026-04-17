// src/pages/PatientDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientId, setPatientId] = useState('');
  const navigate = useNavigate();

  const handleLoad = () => {
    if (patientId && !isNaN(patientId)) {
      navigate(`/patient/${encodeURIComponent(patientId)}/appointments`);
    } else {
      alert('Enter a valid numeric patient ID');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: 'min(640px, 100%)' }}>
        <h2 className="cardTitle">Patient Dashboard</h2>
        <p className="muted" style={{ marginTop: 0 }}>Enter your patient ID to continue.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            style={{ flex: '1 1 220px', margin: 0 }}
          />
          <button onClick={handleLoad}>Continue</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;