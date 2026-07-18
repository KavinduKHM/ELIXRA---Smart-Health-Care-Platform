// src/pages/auth/RegisterLanding.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const RegisterLanding = () => {
  return (
    <div className="auth-shell" style={{ gridTemplateColumns: '1fr' }}>
      <main className="auth-main">
        <div style={{ width: 'min(760px, 100%)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.9rem', margin: '0 0 0.4rem', fontWeight: 800 }}>Create your account</h1>
            <p className="muted" style={{ margin: 0 }}>
              Tell us who you are so we can set up the right experience for you.
            </p>
          </div>

          <div className="auth-choice-grid">
            <Link to="/patient/register" className="auth-choice-card">
              <div className="auth-choice-icon" aria-hidden="true">🧑‍⚕️</div>
              <h3>I'm a Patient</h3>
              <p>Book appointments, join video consultations, and manage your prescriptions and medical reports.</p>
              <span className="auth-choice-cta">Register as Patient →</span>
            </Link>

            <Link to="/doctor/register" className="auth-choice-card">
              <div className="auth-choice-icon" aria-hidden="true">👨‍⚕️</div>
              <h3>I'm a Doctor</h3>
              <p>Set your availability, accept appointment requests, run consultations, and issue digital prescriptions.</p>
              <span className="auth-choice-cta">Register as Doctor →</span>
            </Link>
          </div>

          <p className="auth-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RegisterLanding;
