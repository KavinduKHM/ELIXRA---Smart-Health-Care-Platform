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
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Availability Schedule</h2>
      <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Availability'}</button>
      {showForm && (
        <div style={{ marginTop: '1rem' }}>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
          <input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
          <input type="number" placeholder="Slot Duration (min)" value={formData.slotDuration} onChange={e => setFormData({...formData, slotDuration: e.target.value})} />
          <button onClick={handleSubmit}>Save</button>
        </div>
      )}
      {availabilities.length === 0 ? (
        <p>No availability set.</p>
      ) : (
        <ul>
          {availabilities.map(a => (
            <li key={a.id}>
              {a.availableDate} {a.startTime} - {a.endTime} (slots: {a.slotDuration} min)
              <button onClick={() => handleDelete(a.id)} style={{ marginLeft: '1rem' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AvailabilityManager;