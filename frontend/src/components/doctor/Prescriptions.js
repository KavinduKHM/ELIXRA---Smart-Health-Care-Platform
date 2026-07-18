// src/components/doctor/Prescriptions.js
import React, { useState, useEffect } from 'react';
import { getDoctorPrescriptions, issuePrescription } from '../../services/doctorService';
import { getDoctorAppointments } from '../../services/appointmentService';
import './Prescriptions.css';

const DoctorPrescriptions = ({ doctorId, isVerified = false }) => {
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

  const normalizeLocalDateTime = (value) => {
    const v = String(value || '').trim();
    if (!v) return '';
    // <input type="datetime-local" /> returns "YYYY-MM-DDTHH:mm" (no seconds)
    return v.length === 16 ? `${v}:00` : v;
  };

  const extractBackendError = (err) => {
    const data = err?.response?.data;
    if (!data) return null;

    if (typeof data?.message === 'string' && data.message.trim()) return data.message;

    const errors = data?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      if (firstKey) return `${firstKey}: ${errors[firstKey]}`;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      alert('Only VERIFIED doctors can issue prescriptions.');
      return;
    }
    const patientIdNum = Number(formData.patientId);
    const appointmentIdNum = Number(formData.appointmentId);
    const validUntil = normalizeLocalDateTime(formData.validUntil);

    const medicines = (formData.medicines || [])
      .map((m) => ({
        ...m,
        medicineName: String(m?.medicineName || '').trim(),
        dosage: String(m?.dosage || '').trim() || null,
        frequency: String(m?.frequency || '').trim() || null,
        duration: String(m?.duration || '').trim() || null,
        instructions: String(m?.instructions || '').trim() || null,
      }))
      .filter((m) => m.medicineName);

    if (!Number.isFinite(patientIdNum) || patientIdNum <= 0) {
      alert('Please select a patient');
      return;
    }
    if (!Number.isFinite(appointmentIdNum) || appointmentIdNum <= 0) {
      alert('Please select an appointment');
      return;
    }
    if (!validUntil) {
      alert('Please select a valid until date/time');
      return;
    }
    if (medicines.length === 0) {
      alert('Please add at least one medicine name');
      return;
    }

    const validUntilDate = new Date(validUntil);
    if (Number.isNaN(validUntilDate.getTime())) {
      alert('Valid until must be a valid date/time');
      return;
    }
    if (validUntilDate.getTime() <= Date.now()) {
      alert('Valid until must be in the future');
      return;
    }

    const payload = {
      patientId: patientIdNum,
      appointmentId: appointmentIdNum,
      diagnosis: String(formData.diagnosis || '').trim() || null,
      notes: String(formData.notes || '').trim() || null,
      validUntil,
      medicines,
    };

    try {
      await issuePrescription(doctorId, payload);
      alert('Prescription issued');
      setShowForm(false);
      loadPrescriptions();
      setFormData({
        patientId: '', appointmentId: '', diagnosis: '', notes: '', validUntil: '',
        medicines: [{ medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' }]
      });
    } catch (err) {
      console.error(err);
      const msg = extractBackendError(err) || 'Failed to issue prescription';
      alert(msg);
    }
  };

  const formatIssuedDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const totalMedicinesIssued = prescriptions.reduce((sum, p) => sum + (p.medicines?.length || 0), 0);

  // Map patientId -> patient name (from the doctor's appointments) for friendly labels.
  const patientNameById = React.useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      if (a?.patientId != null && a?.patientName) map.set(String(a.patientId), a.patientName);
    });
    return map;
  }, [appointments]);

  const selectedAppointment = appointments.find((a) => String(a.id) === String(formData.appointmentId));
  const selectedPatientName = selectedAppointment
    ? (selectedAppointment.patientName || `Patient ${selectedAppointment.patientId}`)
    : (formData.patientId ? (patientNameById.get(String(formData.patientId)) || `Patient ${formData.patientId}`) : '');

  return (
    <div className="dp-root">
      <section className="dp-main">
        <div className="dp-headerRow">
          <div>
            <h1 className="dp-title">Prescriptions</h1>
            <p className="dp-subtitle">Manage and issue pharmacological treatments for your patients.</p>
            {!isVerified && <p className="muted">Only VERIFIED doctors can create prescriptions.</p>}
          </div>
          <button type="button" className="dp-primaryBtn" onClick={() => setShowForm(!showForm)} disabled={!isVerified}>
            {showForm ? 'Cancel' : 'Issue New Prescription'}
          </button>
        </div>

        <div className="dp-topicGrid">
          <article className="dp-topicStat">
            <p className="dp-topicLabel">Total Prescriptions</p>
            <h3>{prescriptions.length}</h3>
            <span>Issued by your profile</span>
          </article>
          <article className="dp-topicStat">
            <p className="dp-topicLabel">Appointments</p>
            <h3>{appointments.length}</h3>
            <span>Available for selection</span>
          </article>
          <article className="dp-topicStat">
            <p className="dp-topicLabel">Medicines Listed</p>
            <h3>{totalMedicinesIssued}</h3>
            <span>Across all prescriptions</span>
          </article>
        </div>

        <section className="dp-topicContainer">
          <header className="dp-sectionHeader">
            <h2>Prescription Actions</h2>
            <p>Use filters and create prescriptions from one place.</p>
          </header>

          <div className="dp-toolbar">
            <div className="dp-tabs">
              <button type="button" className="dp-chip dp-chipActive">Active</button>
              <button type="button" className="dp-chip">History</button>
              <button type="button" className="dp-chip">Flagged</button>
            </div>
            <div className="dp-sort">Sorted by: <strong>Recent Issue</strong></div>
          </div>

          {showForm && (
            <div className="dp-formCard">
              <h3 className="dp-formTitle">New Prescription</h3>
              <p className="dp-formHint">Complete patient, appointment, and medicine details before submission.</p>

              <h4 className="dp-formSubTitle">Patient and Appointment</h4>
              <div className="dp-grid2">
                <label className="dp-field">
                  <span className="dp-fieldLabel">Appointment (patient · date &amp; time)</span>
                  <select
                    value={formData.appointmentId}
                    onChange={e => {
                      const nextAppointmentId = e.target.value;
                      const apt = appointments.find(a => String(a.id) === String(nextAppointmentId));
                      setFormData({
                        ...formData,
                        appointmentId: nextAppointmentId,
                        patientId: apt?.patientId != null ? String(apt.patientId) : '',
                      });
                    }}
                  >
                    <option value="">Select an appointment…</option>
                    {appointments.map(apt => (
                      <option key={apt.id} value={apt.id}>
                        {(apt.patientName || `Patient ${apt.patientId}`)} · {new Date(apt.appointmentTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dp-field">
                  <span className="dp-fieldLabel">Patient</span>
                  <input
                    type="text"
                    readOnly
                    className="dp-readonly"
                    placeholder="Auto-filled when you pick an appointment"
                    value={selectedPatientName}
                  />
                </label>
              </div>
              {appointments.length === 0 && (
                <p className="dp-formHint">No appointments found yet. Prescriptions can be issued once you have patient appointments.</p>
              )}

              <h4 className="dp-formSubTitle">Clinical Details</h4>
              <div className="dp-grid2">
                <input type="text" placeholder="Diagnosis" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
                <input
                  type="datetime-local"
                  placeholder="Valid Until"
                  value={formData.validUntil}
                  onChange={e => setFormData({...formData, validUntil: e.target.value})}
                />
              </div>

              <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} />

              <h4 className="dp-formSubTitle">Medicines</h4>
              <div className="dp-medicineList">
                {formData.medicines.map((med, idx) => (
                  <div key={idx} className="dp-medicineRow">
                    <input placeholder="Medicine Name" value={med.medicineName} onChange={e => updateMedicine(idx, 'medicineName', e.target.value)} />
                    <input placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                    <input placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(idx, 'frequency', e.target.value)} />
                    <input placeholder="Duration" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} />
                    <input placeholder="Instructions" value={med.instructions} onChange={e => updateMedicine(idx, 'instructions', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="dp-formActions">
                <button type="button" className="dp-secondaryBtn" onClick={addMedicine}>+ Add Medicine</button>
                <button type="button" className="dp-primaryBtn" onClick={handleSubmit}>Submit Prescription</button>
              </div>
            </div>
          )}
        </section>

        <section className="dp-topicContainer">
          <header className="dp-sectionHeader">
            <h2>Issued Prescriptions</h2>
            <p>Review recently generated prescriptions and quick actions.</p>
          </header>

          <div className="dp-list">
            {prescriptions.length === 0 ? (
              <div className="dp-empty">No prescriptions issued yet.</div>
            ) : (
              prescriptions.map((p) => {
                const firstMedicine = p.medicines?.[0];
                return (
                  <article key={p.id} className="dp-card">
                    <div className="dp-cardTop">
                      <div>
                        <div className="dp-patient">{patientNameById.get(String(p.patientId)) || `Patient ${p.patientId}`}</div>
                        <div className="dp-drugLine">
                          <span className="dp-drugName">{firstMedicine?.medicineName || 'Prescription'}</span>
                          <span>{firstMedicine?.dosage || '-'}</span>
                        </div>
                      </div>
                      <div className="dp-issuedWrap">
                        <span className="dp-issuedLabel">Issued Date</span>
                        <strong>{formatIssuedDate(p.issuedAt)}</strong>
                      </div>
                    </div>

                    <div className="dp-cardBottom">
                      <div className="dp-metaRow">
                        <span>{firstMedicine?.frequency || 'As directed'}</span>
                        <span>{firstMedicine?.duration || 'Duration not set'}</span>
                      </div>
                      <div className="dp-actions">
                        <button type="button" className="dp-iconBtn" aria-label="Print">🖨</button>
                        <button type="button" className="dp-iconBtn" aria-label="Share">↗</button>
                        <button type="button" className="dp-detailBtn">View Details</button>
                      </div>
                    </div>

                    {p.diagnosis && <p className="dp-note">Diagnosis: {p.diagnosis}</p>}
                    {p.medicines?.length > 0 && (
                      <ul className="dp-medicineSummary">
                        {p.medicines.map((m, idx) => (
                          <li key={m.id ?? `${p.id}-med-${idx}`}>{m.medicineName} {m.dosage ? `- ${m.dosage}` : ''}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      </section>

      <aside className="dp-sidePanel">
        <section className="dp-aiCard">
          <p className="dp-cardTopic">Assistant Insights</p>
          <h3>Clinical Aura AI</h3>
          <p className="dp-aiStatus">Analysis Active</p>
          <div className="dp-aiPrompt">Are there any potential drug interactions for current prescriptions?</div>
          <div className="dp-aiAnswer">No major direct interactions detected. Monitor high-risk patients and review renal function where relevant.</div>
        </section>

        <section className="dp-metricCard">
          <p className="dp-cardTopic dp-cardTopicLight">Performance</p>
          <p className="dp-metricLabel">Weekly Overview</p>
          <h2>{prescriptions.length}</h2>
          <p>Prescriptions Issued</p>
        </section>

        <section className="dp-sideList">
          <p className="dp-cardTopic">Operations</p>
          <p className="dp-metricLabel">Patient Management</p>
          <div className="dp-sideItem">Renewal Requests</div>
          <div className="dp-sideItem">Laboratory Results</div>
          <div className="dp-sideItem">Pharma Directory</div>
        </section>
      </aside>
    </div>
  );
};

export default DoctorPrescriptions;