// src/components/patient/BookAppointment.js
import React, { useState } from 'react';
import { searchDoctors, getAvailableSlots, bookAppointment } from '../../services/appointmentService';
import StripePayment from '../common/StripePayment';

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

const BookAppointment = ({ patientId, profile }) => {
  const [specialty, setSpecialty] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [message, setMessage] = useState('');
  const [createdAppointment, setCreatedAppointment] = useState(null); // store after booking
  const [showPayment, setShowPayment] = useState(false);
  const patientIsActive = isProfileActive(profile);

  const showActivationPrompt = () => {
    alert('Patient is deactive (0). Please activate profile from the Profile tab to continue.');
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = async () => {
    if (!patientIsActive) {
      showActivationPrompt();
      return;
    }
    if (!specialty) return;
    try {
      const res = await searchDoctors(specialty, selectedDate);
      setDoctors(res.data);
      setSelectedDoctor(null);
      setSlots([]);
      setSelectedSlot(null);
      setMessage('');
      setShowPayment(false);
      setCreatedAppointment(null);
    } catch (err) {
      console.error(err);
      alert('Search failed. Make sure appointment service is running.');
    }
  };

  // When user selects a doctor, fetch available slots for the chosen date
  const handleSelectDoctor = async (doctor) => {
    if (!patientIsActive) {
      showActivationPrompt();
      return;
    }
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }
    setSelectedDoctor(doctor);
    try {
      // Use the selected date (format: YYYY-MM-DD) and convert to LocalDateTime string
      const dateTime = `${selectedDate}T00:00:00`;
      const slotsRes = await getAvailableSlots(doctor.id, dateTime);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error(err);
      alert('Could not fetch slots. Make sure doctor service is running.');
    }
  };


  // Book appointment (no payment yet)
  const handleBook = async () => {
    if (!patientIsActive) {
      showActivationPrompt();
      return;
    }
    if (!selectedDoctor || !selectedSlot) {
      alert('Select a doctor and a time slot');
      return;
    }
    const appointmentData = {
      patientId: parseInt(patientId),
      doctorId: selectedDoctor.id,
      appointmentTime: selectedSlot.startTime,
      durationMinutes: 30,
      symptoms: symptoms
    };
    try {
      const res = await bookAppointment(appointmentData);
      setCreatedAppointment(res.data);
      setShowPayment(true);
      setMessage('Appointment created! Please complete payment to confirm.');
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message || err?.response?.data?.error;
      const status = err?.response?.status;
      const fallback = err?.message || 'Booking failed.';
      const finalMessage = backendMessage
        ? `❌ Booking failed (${status}): ${backendMessage}`
        : `❌ Booking failed${status ? ` (${status})` : ''}: ${fallback}`;
      setMessage(finalMessage);
    }
  };

  return (
    <div className="quick-booking-card">
      <div className="quick-booking-head">
        <h2>Quick Booking</h2>
        <p>Find specialists, pick a slot, and complete checkout in one flow.</p>
      </div>
      {!patientIsActive && (
        <p className="quick-booking-warning">
          Profile is deactive (0). Activate profile to book appointments.
        </p>
      )}
      {message && <p className={`quick-booking-message ${message.includes('successful') ? 'quick-booking-message-success' : ''}`}>{message}</p>}

      {/* Step 1: Specialty and Date */}
      <div className="quick-booking-form">
        <label className="quick-booking-label" htmlFor="quick-book-specialty">Medical Specialty</label>
        <input
          id="quick-book-specialty"
          type="text"
          placeholder="Cardiology, Dermatology, Neurology..."
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          disabled={!patientIsActive}
          className="quick-booking-input"
        />
        <label className="quick-booking-label" htmlFor="quick-book-date">Preferred Date</label>
        <input
          id="quick-book-date"
          type="date"
          value={selectedDate}
          min={today}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={!patientIsActive}
          className="quick-booking-input"
        />
        <button type="button" onClick={handleSearch} disabled={!patientIsActive} className="quick-booking-search-btn">Search Doctors</button>
      </div>

      {/* Step 2: List of doctors */}
      {doctors.length > 0 && (
        <div className="quick-booking-doctors">
          <h3>Select a Doctor</h3>
          {doctors.map(doc => (
            <div key={doc.id} className="quick-booking-doctor-item">
              <p className="quick-booking-doctor-name"><strong>{doc.name}</strong></p>
              <p className="quick-booking-doctor-meta">{doc.specialty}</p>
              <p className="quick-booking-doctor-fee">Consultation fee: ${doc.consultationFee}</p>
              <button type="button" className="quick-booking-select-btn" onClick={() => handleSelectDoctor(doc)} disabled={!patientIsActive}>Select & View Slots</button>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Available slots for selected doctor */}
      {selectedDoctor && (
        <div className="quick-booking-slots">
          <h3>Available Slots for Dr. {selectedDoctor.name} on {selectedDate}</h3>
          {slots.length === 0 ? (
            <p className="quick-booking-empty">No available slots for this date.</p>
          ) : (
            <ul className="quick-booking-slots-list">
              {slots.map(slot => (
                <li key={slot.id}>
                  <span>{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}</span>
                  <button type="button" onClick={() => setSelectedSlot(slot)} className="quick-booking-slot-btn">Select</button>
                </li>
              ))}
            </ul>
          )}
          {selectedSlot && <p className="quick-booking-selected-slot"><strong>Selected slot:</strong> {new Date(selectedSlot.startTime).toLocaleString()}</p>}
          <textarea
            placeholder="Describe your symptoms"
            rows="3"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            disabled={!patientIsActive}
            className="quick-booking-symptoms"
          />
          <button type="button" className="quick-booking-confirm-btn" onClick={handleBook} disabled={!patientIsActive}>Book Appointment</button>
        </div>
      )}

      {/* Step 4: Mock payment (appears after booking) */}
      {showPayment && createdAppointment && (
        <div className="quick-booking-payment">
          <h4>Complete Payment</h4>
          <p>Appointment ID: {createdAppointment.id}</p>
          <p>Amount: Consultation fee (${selectedDoctor?.consultationFee || '1500'})</p>
          <StripePayment
            appointmentId={createdAppointment.id}
            amount={selectedDoctor?.consultationFee || 1500}
            clientSecret={createdAppointment.clientSecret}
            onSuccess={() => {
              setMessage('✅ Payment successful! Appointment confirmed.');
              setShowPayment(false);
              // Optionally refresh appointment list or redirect
            }}
            onError={(err) => setMessage(`❌ Payment failed: ${err}`)}
          />
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
