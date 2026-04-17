// src/pages/DoctorDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [doctorId, setDoctorId] = useState('');
  const navigate = useNavigate();

  const handleLoad = () => {
    if (doctorId && !isNaN(doctorId)) {
      navigate(`/doctor/${encodeURIComponent(doctorId)}/appointments`);
    } else {
      alert('Enter a valid numeric doctor ID');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: 'min(640px, 100%)' }}>
        <h2 className="cardTitle">Doctor Dashboard</h2>
        <p className="muted" style={{ marginTop: 0 }}>Enter your doctor ID to continue.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Doctor ID"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            style={{ flex: '1 1 220px', margin: 0 }}
          />
          <button onClick={handleLoad}>Continue</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;