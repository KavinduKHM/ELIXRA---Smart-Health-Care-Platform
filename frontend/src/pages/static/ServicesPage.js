import React from 'react';
import { Link } from 'react-router-dom';
import './StaticPages.css';

const SERVICES = [
  { icon: '📅', title: 'Appointment Booking', text: 'Search verified specialists by specialization, view real-time slots, and book in a few guided steps.' },
  { icon: '🎥', title: 'Video Consultations', text: 'Secure, high-quality video visits launched straight from confirmed appointments — no downloads needed.' },
  { icon: '🤖', title: 'AI Symptom Checker', text: 'Describe your symptoms and get instant guidance on the right specialty and possible next steps.' },
  { icon: '💊', title: 'Digital Prescriptions', text: 'Doctors issue structured e-prescriptions that patients can access anytime from their dashboard.' },
  { icon: '🗂️', title: 'Medical Records', text: 'Upload reports and keep prescriptions, history, and documents in one secure, organized place.' },
  { icon: '🔔', title: 'Payments & Reminders', text: 'Smooth checkout for consultations plus timely notifications by email, SMS, and WhatsApp.' },
];

const ServicesPage = () => (
  <div className="page">
    <header className="page-hero">
      <span className="page-hero-eyebrow">What we offer</span>
      <h1>Everything you need for modern, connected care.</h1>
      <p>ELIXRA brings appointments, video consultations, AI guidance, prescriptions, and secure records together in one seamless telemedicine platform.</p>
    </header>

    <section className="page-section">
      <div className="page-section-head">
        <h2>Our Services</h2>
        <p>A complete digital healthcare journey — for patients and doctors alike.</p>
      </div>
      <div className="page-grid-3">
        {SERVICES.map((s) => (
          <article key={s.title} className="glass-card svc-card">
            <div className="svc-icon" aria-hidden="true">{s.icon}</div>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="page-stats">
      <div className="page-stat"><strong>50k+</strong><span>Patients served</span></div>
      <div className="page-stat"><strong>120+</strong><span>Specialist doctors</span></div>
      <div className="page-stat"><strong>15+</strong><span>Specialties</span></div>
      <div className="page-stat"><strong>24/7</strong><span>Support</span></div>
    </section>

    <section className="page-hero" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Ready to experience better care?</h1>
      <p style={{ margin: '0 auto 1.5rem' }}>Create your account and book your first consultation today.</p>
      <Link to="/register" className="home-btn home-btn-light">Get Started</Link>
    </section>
  </div>
);

export default ServicesPage;
