import React, { useState } from 'react';
import './StaticPages.css';

const CONTACTS = [
  { icon: '📍', label: 'Address', value: '221 Wellness Avenue, Colombo 07, Sri Lanka' },
  { icon: '📞', label: 'Phone', value: '+94 11 234 5678' },
  { icon: '✉️', label: 'Email', value: 'support@elixra.health' },
  { icon: '🕒', label: 'Hours', value: 'Support available 24 / 7' },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSent(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    // Front-end only demo — no message is actually transmitted.
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="page">
      <header className="page-hero">
        <span className="page-hero-eyebrow">Get in touch</span>
        <h1>We’d love to hear from you.</h1>
        <p>Questions, feedback, or partnership ideas — reach out and our team will get back to you shortly.</p>
      </header>

      <section className="contact-grid">
        <div className="glass-card contact-info">
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', fontWeight: 800 }}>Contact details</h2>
          {CONTACTS.map((c) => (
            <div key={c.label} className="contact-info-item">
              <span className="contact-info-icon" aria-hidden="true">{c.icon}</span>
              <div>
                <strong>{c.label}</strong>
                <span>{c.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card">
          <h2 style={{ margin: '0 0 1rem', fontSize: '1.3rem', fontWeight: 800 }}>Send us a message</h2>
          {sent && <div className="contact-success" style={{ marginBottom: '1rem' }}>Thanks! Your message has been received — we’ll be in touch soon.</div>}
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="page-grid-2" style={{ gap: '1rem' }}>
              <div className="contact-field">
                <label htmlFor="c-name">Name</label>
                <input id="c-name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
              <div className="contact-field">
                <label htmlFor="c-email">Email</label>
                <input id="c-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
            </div>
            <div className="contact-field">
              <label htmlFor="c-subject">Subject</label>
              <input id="c-subject" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
            </div>
            <div className="contact-field">
              <label htmlFor="c-message">Message</label>
              <textarea id="c-message" name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Write your message…" required />
            </div>
            <button type="submit" className="contact-submit">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
