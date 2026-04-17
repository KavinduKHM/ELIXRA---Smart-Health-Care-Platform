// src/components/doctor/AvailabilityManager.js
import React, { useState, useEffect } from 'react';
import { getDoctorAvailability, setAvailability, deleteAvailability } from '../../services/doctorService';

const AvailabilityManager = ({ doctorId }) => {
  const [availabilities, setAvailabilities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00:00',
    endTime: '17:00:00',
    slotDuration: 30
  });

  const loadAvailabilities = async () => {
    try {
      const res = await getDoctorAvailability(doctorId);
      setAvailabilities(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, [doctorId]);

  const handleSubmit = async () => {
    if (!formData.date) {
      alert('Please select a date');
      return;
    }
    try {
      await setAvailability(doctorId, formData);
      alert('Availability added');
      loadAvailabilities();
      setShowForm(false);
      setFormData({ date: '', startTime: '09:00:00', endTime: '17:00:00', slotDuration: 30 });
    } catch (err) {
      console.error(err);
      alert('Failed to add availability');
    }
  };

  const handleDelete = async (availabilityId) => {
    if (window.confirm('Delete this availability?')) {
      try {
        await deleteAvailability(doctorId, availabilityId);
        loadAvailabilities();
      } catch (err) {
        console.error(err);
        alert('Delete failed');
      }
    }
  };

  return (
    <div className="doctor-ui-card doctor-availability">
      <div className="doctor-ui-card-header">
        <div>
          <h2 className="doctor-ui-card-title">Availability Schedule</h2>
          <p className="doctor-ui-card-subtitle">Set your working window and slot duration.</p>
        </div>
        <button type="button" className="doctor-ui-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Availability'}
        </button>
      </div>

      {showForm && (
        <div className="doctor-form-grid">
          <input
            type="date"
            value={formData.date}
            onChange={e => setFormData({...formData, date: e.target.value})}
          />
          <input
            type="number"
            min="5"
            placeholder="Slot Duration (min)"
            value={formData.slotDuration}
            onChange={e => setFormData({...formData, slotDuration: e.target.value})}
          />
          <input
            type="time"
            value={formData.startTime}
            onChange={e => setFormData({...formData, startTime: e.target.value})}
          />
          <input
            type="time"
            value={formData.endTime}
            onChange={e => setFormData({...formData, endTime: e.target.value})}
          />
          <button type="button" className="doctor-ui-btn doctor-form-full" onClick={handleSubmit}>Save Availability</button>
        </div>
      )}

      {availabilities.length === 0 ? (
        <p className="doctor-empty">No availability set yet.</p>
      ) : (
        <div className="doctor-chip-list">
          {availabilities.map(a => (
            <div key={a.id} className="doctor-chip-item">
              <div>
                <div className="doctor-chip-main">{a.availableDate} • {a.startTime} - {a.endTime}</div>
                <div className="doctor-chip-sub">Slot duration: {a.slotDuration} minutes</div>
              </div>
              <button
                type="button"
                className="doctor-ui-btn doctor-ui-btn-secondary"
                onClick={() => handleDelete(a.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;