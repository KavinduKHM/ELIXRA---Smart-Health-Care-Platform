// src/components/doctor/Prescriptions.js
import React, { useState, useEffect } from 'react';
import { getDoctorPrescriptions, issuePrescription } from '../../services/doctorService';
import { getDoctorAppointments } from '../../services/appointmentService';

const DoctorPrescriptions = ({ doctorId }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    diagnosis: '',
    notes: '',
    validUntil: '',
    medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  });

  useEffect(() => {
    loadPrescriptions();
    loadAppointments();
  }, [doctorId]);

  const loadPrescriptions = async () => {
    try {
      const res = await getDoctorPrescriptions(doctorId);
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAppointments = async () => {
    try {
      const res = await getDoctorAppointments(doctorId);
      setAppointments(res.data.content || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...formData.medicines];
    updated[index][field] = value;
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmit = async () => {
    if (!formData.patientId || !formData.appointmentId || !formData.validUntil) {
      alert('Please fill all required fields');
      return;
    }
    try {
      await issuePrescription(doctorId, formData);
      alert('Prescription issued');
      setShowForm(false);
      loadPrescriptions();
      setFormData({
        patientId: '', appointmentId: '', diagnosis: '', notes: '', validUntil: '',
        medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
      });
    } catch (err) {
      console.error(err);
      alert('Failed to issue prescription');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Prescriptions</h2>
      <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Issue New Prescription'}</button>
      {showForm && (
        <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem' }}>
          <select value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
            <option value="">Select Patient</option>
            {appointments.map(apt => (
              <option key={apt.id} value={apt.patientId}>Patient {apt.patientId} (Appt {apt.id})</option>
            ))}
          </select>
          <select value={formData.appointmentId} onChange={e => setFormData({...formData, appointmentId: e.target.value})}>
            <option value="">Select Appointment</option>
            {appointments.map(apt => (
              <option key={apt.id} value={apt.id}>Appointment {apt.id} - {new Date(apt.appointmentTime).toLocaleDateString()}</option>
            ))}
          </select>
          <input type="text" placeholder="Diagnosis" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
          <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          <input type="date" placeholder="Valid Until" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
          <h4>Medicines</h4>
          {formData.medicines.map((med, idx) => (
            <div key={idx} style={{ marginBottom: '0.5rem' }}>
              <input placeholder="Medicine Name" value={med.medicineName} onChange={e => updateMedicine(idx, 'medicineName', e.target.value)} />
              <input placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
              <input placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
              <input placeholder="Duration" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} />
              <input placeholder="Instructions" value={med.instructions} onChange={e => updateMedicine(idx, 'instructions', e.target.value)} />
            </div>
          ))}
          <button onClick={addMedicine}>+ Add Medicine</button>
          <button onClick={handleSubmit}>Submit Prescription</button>
        </div>
      )}
      {prescriptions.length === 0 ? (
        <p>No prescriptions issued yet.</p>
      ) : (
        <ul>
          {prescriptions.map(p => (
            <li key={p.id}>
              <strong>Patient {p.patientId}</strong> - {p.diagnosis} (Issued: {p.issuedAt})
              <ul>
                {p.medicines?.map(m => <li key={m.id}>{m.medicineName} - {m.dosage}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DoctorPrescriptions;