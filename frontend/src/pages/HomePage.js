import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const location = useLocation();
  const flashMessage = location?.state?.flashMessage;

  return (
    <div className="home-page">
      {flashMessage?.text ? (
        <section className={`home-flash home-flash-${flashMessage.type || 'info'}`} role="status" aria-live="polite">
          {flashMessage.text}
        </section>
      ) : null}

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">Evolution of wellness</span>
          <h1>Smart healthcare for a modern world.</h1>
          <p>
            ELIXRA bridges technology and human care with a restorative patient experience,
            intuitive doctor workflows, and streamlined appointment journeys.
          </p>

          <div className="home-hero-actions">
            <Link to="/patient" className="home-btn home-btn-primary">
              Patient Portal
            </Link>
            <Link to="/doctor" className="home-btn home-btn-secondary">
              Doctor Portal
            </Link>
          </div>

          <div className="home-hero-notes">
            <span>Fast registration</span>
            <span>Appointment booking</span>
            <span>Video consultations</span>
          </div>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <div className="home-hero-card">
            <div className="home-hero-orb" />
            <div className="home-hero-device">
              <span />
            </div>
            <div className="home-hero-stat">
              <strong>98%</strong>
              <span>Patient satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <article>
          <strong>50k+</strong>
          <span>Happy patients</span>
        </article>
        <article>
          <strong>99%</strong>
          <span>Success rate</span>
        </article>
        <article>
          <strong>120+</strong>
          <span>Specialist doctors</span>
        </article>
        <article>
          <strong>24/7</strong>
          <span>Support availability</span>
        </article>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <h2>Redefining the care experience</h2>
          <p>Precision technology meets human-centered design to keep the journey simple.</p>
        </div>

        <div className="home-feature-grid">
          <article className="home-feature-card">
            <span className="home-feature-icon">AI</span>
            <h3>AI-powered diagnostics</h3>
            <p>Advanced symptom assistance helps patients understand next steps earlier.</p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-icon">VC</span>
            <h3>Seamless video consultations</h3>
            <p>Start secure virtual visits from confirmed appointments with one tap.</p>
          </article>
          <article className="home-feature-card">
            <span className="home-feature-icon">SR</span>
            <h3>Secure patient records</h3>
            <p>Private and accessible medical records designed for continuity of care.</p>
          </article>
        </div>
      </section>

      <section className="home-journey">
        <div className="home-journey-copy">
          <h2>Your journey to better health in three simple steps</h2>
          <ol>
            <li>
              <strong>Create your profile</strong>
              <span>Register as a patient or doctor in just a few minutes.</span>
            </li>
            <li>
              <strong>Connect with a specialist</strong>
              <span>Search by specialty, pick an available slot, and book instantly.</span>
            </li>
            <li>
              <strong>Receive personalized care</strong>
              <span>Confirm payment, attend the session, and follow up from your dashboard.</span>
            </li>
          </ol>
        </div>

        <div className="home-journey-visual" aria-hidden="true">
          <div className="home-video-panel">
            <span className="home-video-ring" />
            <span className="home-video-label">How it works</span>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <h2>Ready to prioritize your wellness?</h2>
          <p>Begin with the portal that matches your role and continue from your dashboard.</p>
        </div>
        <div className="home-cta-actions">
          <Link to="/patient/register" className="home-btn home-btn-light">
            Register as Patient
          </Link>
          <Link to="/doctor/register" className="home-btn home-btn-outline">
            Register as Doctor
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
