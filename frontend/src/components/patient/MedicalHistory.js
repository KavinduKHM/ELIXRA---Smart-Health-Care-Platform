// src/components/patient/MedicalHistory.js
import React from 'react';

const isProfileActive = (profile) => {
  if (!profile) return true;
  if (profile.status === 0 || profile.status === '0') return false;
  if (profile.status === 1 || profile.status === '1') return true;
  const statusText = String(profile.status || '').toUpperCase();
  if (statusText === 'INACTIVE' || statusText === 'DEACTIVE' || statusText === 'DEACTIVATED') return false;
  if (statusText === 'ACTIVE' || statusText === 'ACTIVATED') return true;
  if (profile.active === false) return false;
  return true;
};

const MedicalHistory = ({ history, profile }) => {
  const patientIsActive = isProfileActive(profile);

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Medical History</h2>
      <div style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          disabled={!patientIsActive}
          onClick={() => {
            if (!patientIsActive) {
              alert('Patient is deactive (0). Please activate profile from the Profile tab to add medical history.');
              return;
            }
            alert('Add medical history UI is not available yet in current frontend.');
          }}
        >
          Add Medical History
        </button>
        {!patientIsActive && (
          <p style={{ color: '#b42318', fontWeight: 600, marginTop: '0.5rem' }}>
            Profile is deactive (0). Activate profile to add medical history.
          </p>
        )}
      </div>
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