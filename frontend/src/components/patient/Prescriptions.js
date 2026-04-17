// src/components/patient/Prescriptions.js
import React from 'react';

const Prescriptions = ({ prescriptions }) => {
  return (
    <div className="prescriptions-board">
      <h2 className="prescriptions-board-title">Your Medication Plans</h2>
      {prescriptions.length === 0 ? (
        <p className="prescriptions-empty">No prescriptions found.</p>
      ) : (
        <ul className="prescriptions-list">
          {prescriptions.map(p => (
            <li key={p.id} className="prescriptions-item">
              <div className="prescriptions-item-top">
                <h3>{p.diagnosis || 'General Prescription'}</h3>
                <span className="prescriptions-validity">Valid until: {p.validUntil || 'N/A'}</span>
              </div>
              <p className="prescriptions-doctor">Dr. {p.doctorName || 'Unknown Doctor'}</p>
              <p className="prescriptions-medicines">
                Medicines: {(Array.isArray(p.medications) ? p.medications : [])
                  .map(m => `${m.medicationName || m.medicineName || 'Medication'} (${m.dosage || 'N/A'})`)
                  .join(', ') || 'N/A'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Prescriptions;