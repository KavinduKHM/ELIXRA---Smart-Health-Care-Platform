import React from 'react';
import { Link } from 'react-router-dom';
import './StaticPages.css';

const VALUES = [
  { title: 'Patient-first', text: 'Every decision starts with a simpler, calmer experience for the people we serve.' },
  { title: 'Trust & security', text: 'Health data is sensitive — we protect it with encryption and strict access controls.' },
  { title: 'Accessibility', text: 'Quality care shouldn’t depend on location. Care travels to the patient, online.' },
  { title: 'Clinical quality', text: 'Verified doctors, structured records, and tools that support better outcomes.' },
];

const AboutPage = () => (
  <div className="page">
    <header className="page-hero">
      <span className="page-hero-eyebrow">Who we are</span>
      <h1>Bridging technology and human care.</h1>
      <p>ELIXRA is a smart healthcare platform built to make quality medical care simple, connected, and accessible — from the first symptom search to the final prescription.</p>
    </header>

    <section className="about-split">
      <div className="about-split-copy">
        <h2>Our mission</h2>
        <p>We believe getting the right care shouldn’t be complicated. ELIXRA connects patients with verified specialists, powers secure video consultations, and keeps every prescription and report in one place.</p>
        <p>By combining thoughtful design with a robust microservices platform, we help clinics and independent doctors deliver a modern, reassuring experience — while patients stay in control of their health journey.</p>
      </div>
      <div className="about-split-visual">
        <img src={`${process.env.PUBLIC_URL}/health-team.webp`} alt="A collaborative medical team reviewing patient data" loading="lazy" />
      </div>
    </section>

    <section className="page-stats">
      <div className="page-stat"><strong>98%</strong><span>Patient satisfaction</span></div>
      <div className="page-stat"><strong>50k+</strong><span>Consultations</span></div>
      <div className="page-stat"><strong>120+</strong><span>Doctors</span></div>
      <div className="page-stat"><strong>24/7</strong><span>Availability</span></div>
    </section>

    <section className="page-section">
      <div className="page-section-head">
        <h2>What we stand for</h2>
        <p>The values that shape how we build and how we care.</p>
      </div>
      <div className="page-grid-2">
        {VALUES.map((v) => (
          <article key={v.title} className="glass-card">
            <div className="value-item">
              <span className="value-tick" aria-hidden="true">✓</span>
              <div>
                <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.15rem', fontWeight: 800 }}>{v.title}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.6 }}>{v.text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section className="page-hero" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>Join the ELIXRA community</h1>
      <p style={{ margin: '0 auto 1.5rem' }}>Whether you’re a patient or a doctor, better care starts here.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/register" className="home-btn home-btn-light">Create account</Link>
        <Link to="/contact" className="home-btn home-btn-outline">Contact us</Link>
      </div>
    </section>
  </div>
);

export default AboutPage;
