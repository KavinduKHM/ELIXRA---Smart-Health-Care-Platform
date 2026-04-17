// src/components/patient/MedicalHistory.js
import React from 'react';

const MedicalHistory = ({ history }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Medical History</h2>
      {history.length === 0 ? (
        <p>No medical history records.</p>
      ) : (
        <ul>
          {history.map(h => (
            <li key={h.id}>
              <strong>{h.title}</strong> ({h.historyType}) - {h.eventDate}<br/>
              {h.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicalHistory;