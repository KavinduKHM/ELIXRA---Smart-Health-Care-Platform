// src/pages/PatientDashboard.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPatientProfile } from '../services/patientService';

const PatientDashboard = () => {
  const [patientId, setPatientId] = useState('');
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const flashMessage = location?.state?.flashMessage;

  const handleLoad = async () => {
    const id = String(patientId || '').trim();

    if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
      setMessage({ type: 'error', text: 'Invalid patient ID. Please enter a valid numeric ID.' });
      return;
    }

    setLoadingPatient(true);
    setMessage({ type: '', text: '' });

    try {
      await getPatientProfile(Number(id));
      navigate(`/patient/${encodeURIComponent(id)}/appointments`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) {
        setMessage({ type: 'error', text: 'Patient not found. Please check the patient ID.' });
      } else {
        setMessage({ type: 'error', text: 'Unable to verify patient ID right now. Please try again.' });
      }
    } finally {
      setLoadingPatient(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      {message.text && (
        <section
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(2, 6, 23, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: 'min(92vw, 520px)',
              borderRadius: '18px',
              border: `1px solid ${message.type === 'success' ? '#b7ebc6' : '#f1c3c3'}`,
              background: message.type === 'success'
                ? 'linear-gradient(180deg, #ecfff3 0%, #ffffff 100%)'
                : 'linear-gradient(180deg, #fff4f4 0%, #ffffff 100%)',
              boxShadow: '0 24px 50px rgba(15, 23, 42, 0.28)',
              textAlign: 'center',
              padding: '1.4rem 1.1rem 1.2rem',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                width: '66px',
                height: '66px',
                margin: '0 auto 0.85rem',
                borderRadius: '999px',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '1.9rem',
                fontWeight: 800,
                background: message.type === 'success' ? '#16a34a' : '#dc2626',
              }}
            >
              {message.type === 'success' ? '✓' : '!'}
            </div>
            <h3 style={{ margin: 0, color: message.type === 'success' ? '#0e6b2f' : '#8f1111' }}>
              {message.type === 'success' ? 'Success' : 'Action Failed'}
            </h3>
            <p style={{ margin: '0.65rem auto 1rem', maxWidth: '44ch', color: message.type === 'success' ? '#14532d' : '#7f1d1d' }}>
              {message.text}
            </p>
            <button type="button" onClick={() => setMessage({ type: '', text: '' })}>
              Close
            </button>
          </div>
        </section>
      )}

      <div className="card" style={{ width: 'min(640px, 100%)' }}>
        <h2 className="cardTitle">Patient Dashboard</h2>
        <p className="muted" style={{ marginTop: 0 }}>Enter your patient ID to continue.</p>
        {flashMessage?.text && (
          <p
            style={{
              marginTop: 0,
              color: flashMessage.type === 'success' ? '#14532d' : '#7f1d1d',
              background: flashMessage.type === 'success' ? '#ebfff1' : '#fff3f3',
              border: `1px solid ${flashMessage.type === 'success' ? '#bae8c8' : '#f1c3c3'}`,
              borderRadius: '10px',
              padding: '0.55rem 0.7rem',
            }}
          >
            {flashMessage.text}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Patient ID"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            disabled={loadingPatient}
            style={{ flex: '1 1 220px', margin: 0 }}
          />
          <button onClick={handleLoad} disabled={loadingPatient}>
            {loadingPatient ? 'Checking...' : 'Continue'}
          </button>
          <button type="button" onClick={() => navigate('/patient/register')} disabled={loadingPatient}>New Patient Registration</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;