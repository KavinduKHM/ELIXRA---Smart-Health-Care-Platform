// src/components/patient/Prescriptions.js
import React from 'react';

const Prescriptions = ({ prescriptions }) => {
  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <ul>
          {prescriptions.map(p => (
            <li key={p.id}>
              <strong>{p.diagnosis}</strong> - Dr. {p.doctorName}<br/>
              Medicines: {p.medications?.map(m => `${m.medicineName} (${m.dosage})`).join(', ')}<br/>
              Valid until: {p.validUntil}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Prescriptions;