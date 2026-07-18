// src/pages/patient/PatientBookAppointmentPage.js
import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { searchDoctors, getAvailableSlots, bookAppointment } from '../../services/appointmentService';
import StripePayment from '../../components/common/StripePayment';
import SPECIALTIES from '../../constants/specialties';
import './PatientBookAppointmentPage.css';

const STEPS = [
  { kicker: 'Step 1', title: 'Find a doctor' },
  { kicker: 'Step 2', title: 'Choose doctor' },
  { kicker: 'Step 3', title: 'Pick a slot' },
  { kicker: 'Step 4', title: 'Confirm & pay' },
];

const isProfileActive = (profile) => {
  if (!profile) return true;
  const statusText = String(profile.status || '').toUpperCase();
  if (['INACTIVE', 'DEACTIVE', 'DEACTIVATED', '0'].includes(statusText)) return false;
  if (profile.active === false) return false;
  return true;
};

const initials = (name) =>
  String(name || 'Dr')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const ratingStars = (rating) => {
  const r = Math.round(Number(rating) || 0);
  if (!r) return 'New';
  return '★'.repeat(r) + '☆'.repeat(5 - r);
};

const PatientBookAppointmentPage = () => {
  const { patientId, profile } = useOutletContext();
  const navigate = useNavigate();
  const patientIsActive = isProfileActive(profile);
  const today = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState(0);
  const [specialty, setSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [searching, setSearching] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [booking, setBooking] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [paid, setPaid] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const maxReachedStep = useMemo(() => {
    if (paid) return 3;
    if (createdAppointment) return 3;
    if (selectedSlot) return 2;
    if (selectedDoctor) return 2;
    if (doctors.length) return 1;
    return 0;
  }, [paid, createdAppointment, selectedSlot, selectedDoctor, doctors.length]);

  const resetFromSearch = () => {
    setSelectedDoctor(null);
    setSlots([]);
    setSelectedSlot(null);
    setCreatedAppointment(null);
    setPaid(false);
  };

  const handleSearch = async (event) => {
    event?.preventDefault?.();
    if (!patientIsActive) {
      setMessage({ type: 'error', text: 'Your profile is deactivated. Reactivate it from the Profile tab to book.' });
      return;
    }
    if (!specialty) {
      setMessage({ type: 'error', text: 'Please choose a medical specialty to search.' });
      return;
    }
    setSearching(true);
    setMessage({ type: '', text: '' });
    resetFromSearch();
    try {
      const res = await searchDoctors(specialty, selectedDate);
      const list = Array.isArray(res.data) ? res.data : [];
      setDoctors(list);
      setStep(1);
      if (list.length === 0) {
        setMessage({ type: 'error', text: 'No verified doctors found for this specialty. Try another specialty or date.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Search failed. Make sure the appointment service is running.' });
    } finally {
      setSearching(false);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setStep(2);
    setLoadingSlots(true);
    try {
      const dateTime = `${selectedDate}T00:00:00`;
      const slotsRes = await getAvailableSlots(doctor.id, dateTime);
      setSlots(Array.isArray(slotsRes.data) ? slotsRes.data : []);
    } catch (err) {
      console.error(err);
      setSlots([]);
      setMessage({ type: 'error', text: 'Could not load slots. Make sure the doctor service is running.' });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) {
      setMessage({ type: 'error', text: 'Please pick a time slot first.' });
      return;
    }
    setBooking(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await bookAppointment({
        patientId: parseInt(patientId, 10),
        doctorId: selectedDoctor.id,
        appointmentTime: selectedSlot.startTime,
        durationMinutes: 30,
        symptoms,
      });
      setCreatedAppointment(res.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
      const status = err?.response?.status;
      setMessage({
        type: 'error',
        text: backendMessage ? `Booking failed (${status}): ${backendMessage}` : 'Booking failed. Please try again.',
      });
    } finally {
      setBooking(false);
    }
  };

  const goStep = (target) => {
    if (target <= maxReachedStep) setStep(target);
  };

  return (
    <div className="book-page">
      <header className="book-head">
        <div>
          <h1>Book a New Appointment</h1>
          <p>Search verified specialists, choose a slot, and confirm in a few guided steps.</p>
        </div>
        <Link to={`/patient/${patientId}/appointments`} className="book-back-link">← Back to Appointments</Link>
      </header>

      <div className="book-stepper" role="tablist" aria-label="Booking steps">
        {STEPS.map((s, index) => {
          return (
            <button
              key={s.title}
              type="button"
              className={`book-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-done' : ''}`}
              onClick={() => goStep(index)}
              disabled={index > maxReachedStep}
            >
              <span className="book-step-num">{index < step ? '✓' : index + 1}</span>
              <span className="book-step-label">
                <span className="book-step-kicker">{s.kicker}</span>
                <span className="book-step-title">{s.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      {message.text && (
        <div className={`book-alert ${message.type === 'success' ? 'is-success' : ''}`} role="alert">
          {message.text}
        </div>
      )}

      {/* STEP 1 — Search */}
      {step === 0 && (
        <section className="book-panel">
          <h2 className="book-panel-title">Find a doctor</h2>
          <p className="book-panel-sub">Pick a specialty and your preferred date to see available specialists.</p>
          <form className="book-search-grid" onSubmit={handleSearch}>
            <div className="book-field">
              <label htmlFor="book-specialty">Medical specialty</label>
              <select
                id="book-specialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={!patientIsActive}
              >
                <option value="">Select a specialty…</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="book-field">
              <label htmlFor="book-date">Preferred date</label>
              <input
                id="book-date"
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!patientIsActive}
              />
            </div>
            <button type="submit" className="book-search-btn" disabled={!patientIsActive || searching}>
              {searching ? 'Searching…' : 'Search Doctors'}
            </button>
          </form>
        </section>
      )}

      {/* STEP 2 — Choose doctor */}
      {step === 1 && (
        <section className="book-panel">
          <h2 className="book-panel-title">Choose a doctor</h2>
          <p className="book-panel-sub">{doctors.length} specialist{doctors.length === 1 ? '' : 's'} available for {specialty} on {selectedDate}.</p>
          {doctors.length === 0 ? (
            <div className="book-empty">
              <span className="book-empty-emoji">🔍</span>
              No doctors found. Go back and try a different specialty or date.
            </div>
          ) : (
            <div className="book-doctors-grid">
              {doctors.map((doc) => (
                <article key={doc.id} className={`book-doctor-card ${selectedDoctor?.id === doc.id ? 'is-selected' : ''}`}>
                  <div className="book-doctor-top">
                    <div className="book-doctor-avatar">
                      {doc.profilePicture ? <img src={doc.profilePicture} alt="" /> : initials(doc.name)}
                    </div>
                    <div>
                      <h3 className="book-doctor-name">{doc.name}</h3>
                      <span className="book-doctor-specialty">{doc.specialty}</span>
                    </div>
                  </div>
                  <div className="book-doctor-meta">
                    <span className="book-tag"><span className="book-tag-star">★</span> {ratingStars(doc.rating)}</span>
                    {doc.experienceYears != null && <span className="book-tag">{doc.experienceYears} yrs exp</span>}
                    {doc.qualification && <span className="book-tag">{doc.qualification}</span>}
                  </div>
                  <div className="book-doctor-fee">
                    Consultation <strong>Rs. {doc.consultationFee ?? '—'}</strong>
                  </div>
                  <button type="button" className="book-select-btn" onClick={() => handleSelectDoctor(doc)}>
                    Select & view slots
                  </button>
                </article>
              ))}
            </div>
          )}
          <div className="book-actions">
            <button type="button" className="book-btn-ghost" onClick={() => setStep(0)}>← Change search</button>
            <span />
          </div>
        </section>
      )}

      {/* STEP 3 — Pick slot */}
      {step === 2 && selectedDoctor && (
        <section className="book-panel">
          <h2 className="book-panel-title">Pick a time slot</h2>
          <p className="book-panel-sub">Choose an available slot and briefly describe your symptoms.</p>

          <div className="book-selected-doctor">
            <div className="book-doctor-avatar">
              {selectedDoctor.profilePicture ? <img src={selectedDoctor.profilePicture} alt="" /> : initials(selectedDoctor.name)}
            </div>
            <div>
              <h3 className="book-doctor-name">{selectedDoctor.name}</h3>
              <span className="book-doctor-specialty">{selectedDoctor.specialty} · Rs. {selectedDoctor.consultationFee ?? '—'}</span>
            </div>
          </div>

          <p className="book-slots-day">Slots for {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>

          {loadingSlots ? (
            <div className="book-empty">Loading available slots…</div>
          ) : slots.length === 0 ? (
            <div className="book-empty">
              <span className="book-empty-emoji">🗓️</span>
              No open slots for this date. Try another date or doctor.
            </div>
          ) : (
            <div className="book-slots-grid">
              {slots.map((slot) => {
                const disabled = slot.isBooked;
                const selected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`book-slot-chip ${selected ? 'is-selected' : ''}`}
                    disabled={disabled}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </button>
                );
              })}
            </div>
          )}

          <textarea
            className="book-symptoms"
            rows={3}
            placeholder="Describe your symptoms (optional but recommended)…"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />

          <div className="book-actions">
            <button type="button" className="book-btn-ghost" onClick={() => setStep(1)}>← Back to doctors</button>
            <button type="button" onClick={handleBook} disabled={!selectedSlot || booking}>
              {booking ? 'Booking…' : 'Confirm & Continue to Payment'}
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 — Confirm & pay */}
      {step === 3 && createdAppointment && (
        <section className="book-panel">
          {paid ? (
            <div className="book-success-hero">
              <div className="book-success-icon" aria-hidden="true">✓</div>
              <h2 className="book-panel-title">Appointment confirmed!</h2>
              <p className="book-panel-sub">
                Your request has been sent to {selectedDoctor?.name}. You’ll be notified once it’s approved.
              </p>
              <button type="button" onClick={() => navigate(`/patient/${patientId}/appointments`)}>
                Go to My Appointments
              </button>
            </div>
          ) : (
            <>
              <h2 className="book-panel-title">Review & pay</h2>
              <p className="book-panel-sub">Confirm the details and complete payment to submit your request.</p>

              <div className="book-review-grid">
                <div className="book-review-item">
                  <span className="book-review-key">Doctor</span>
                  <span className="book-review-val">{selectedDoctor?.name}</span>
                </div>
                <div className="book-review-item">
                  <span className="book-review-key">Specialty</span>
                  <span className="book-review-val">{selectedDoctor?.specialty}</span>
                </div>
                <div className="book-review-item">
                  <span className="book-review-key">Date & time</span>
                  <span className="book-review-val">{selectedSlot ? new Date(selectedSlot.startTime).toLocaleString() : '—'}</span>
                </div>
                <div className="book-review-item">
                  <span className="book-review-key">Appointment ID</span>
                  <span className="book-review-val">#{createdAppointment.id}</span>
                </div>
                <div className="book-review-item">
                  <span className="book-review-key">Consultation fee</span>
                  <span className="book-review-val">Rs. {selectedDoctor?.consultationFee ?? 1500}</span>
                </div>
                <div className="book-review-item">
                  <span className="book-review-key">Symptoms</span>
                  <span className="book-review-val">{symptoms || 'Not provided'}</span>
                </div>
              </div>

              <StripePayment
                appointmentId={createdAppointment.id}
                amount={selectedDoctor?.consultationFee || 1500}
                clientSecret={createdAppointment.clientSecret}
                onSuccess={() => {
                  setPaid(true);
                  setMessage({ type: 'success', text: 'Payment successful! Appointment confirmed.' });
                }}
                onError={(err) => setMessage({ type: 'error', text: `Payment failed: ${err}` })}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default PatientBookAppointmentPage;
