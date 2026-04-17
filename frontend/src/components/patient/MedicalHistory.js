// src/components/patient/MedicalHistory.js
import React, { useState } from 'react';
import {
  addPatientMedicalHistoryRecord,
  updatePatientMedicalHistoryRecord,
  deletePatientMedicalHistoryRecord,
} from '../../services/patientService';

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

const defaultForm = {
  historyType: 'CONSULTATION',
  title: '',
  eventDate: '',
  description: '',
};

const toApiDateTime = (value) => {
  if (!value) return '';
  return value.length === 16 ? `${value}:00` : value;
};

const toInputDateTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 16);
};

const validateHistoryField = (key, value) => {
  const text = String(value || '').trim();
  if (key === 'title') {
    if (!text) return 'Title is required.';
    if (text.length < 3) return 'Title must be at least 3 characters.';
    if (text.length > 120) return 'Title must be 120 characters or less.';
  }
  if (key === 'eventDate') {
    if (!text) return 'Event date and time are required.';
    const dt = new Date(text);
    if (Number.isNaN(dt.getTime())) return 'Enter a valid date and time.';
    if (dt.getTime() > Date.now()) return 'Event date cannot be in the future.';
  }
  if (key === 'description' && text.length > 600) {
    return 'Description must be 600 characters or less.';
  }
  return '';
};

const validateHistoryForm = (values) => {
  return {
    title: validateHistoryField('title', values.title),
    eventDate: validateHistoryField('eventDate', values.eventDate),
    description: validateHistoryField('description', values.description),
  };
};

const hasErrors = (errors) => Object.values(errors).some(Boolean);

const MedicalHistory = ({ history, patientId, onHistoryAdded, profile }) => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({ title: '', eventDate: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [popup, setPopup] = useState(null);
  const patientIsActive = isProfileActive(profile);

  const closePopup = () => setPopup(null);

  const showSuccess = (message) => {
    setPopup({ type: 'success', title: 'Success', message });
  };

  const showError = (message) => {
    setPopup({ type: 'error', title: 'Failed', message });
  };

  const updateField = (key, value) => {
    const nextForm = { ...form, [key]: value };
    setForm(nextForm);
    setErrors((prev) => ({ ...prev, [key]: validateHistoryField(key, value) }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setErrors({ title: '', eventDate: '', description: '' });
    setEditingId(null);
  };

  const handleAddHistory = async () => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before adding history.');
      return;
    }
    const nextErrors = validateHistoryForm(form);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      showError('Please fix form validation errors before saving.');
      return;
    }

    try {
      const payload = {
        historyType: form.historyType,
        title: String(form.title).trim(),
        description: String(form.description || '').trim(),
        eventDate: toApiDateTime(form.eventDate),
      };

      if (editingId) {
        await updatePatientMedicalHistoryRecord(editingId, payload);
      } else {
        await addPatientMedicalHistoryRecord(patientId, payload);
      }

      if (typeof onHistoryAdded === 'function') await onHistoryAdded();
      resetForm();
      showSuccess(editingId ? 'Medical history updated successfully.' : 'Medical history added successfully.');
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      showError(backendMessage || 'Unable to save medical history. Please try again.');
    }
  };

  const handleEdit = (item) => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before editing history.');
      return;
    }
    setEditingId(item.id);
    setForm({
      historyType: item.historyType || 'CONSULTATION',
      title: item.title || '',
      eventDate: toInputDateTime(item.eventDate),
      description: item.description || '',
    });
    setErrors({ title: '', eventDate: '', description: '' });
  };

  const handleDelete = async (item) => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before deleting history.');
      return;
    }
    const confirmed = window.confirm(`Delete history record "${item.title || 'Untitled'}"?`);
    if (!confirmed) return;

    try {
      await deletePatientMedicalHistoryRecord(patientId, item.id);
      if (typeof onHistoryAdded === 'function') await onHistoryAdded();
      if (editingId === item.id) resetForm();
      showSuccess('Medical history deleted successfully.');
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      showError(backendMessage || 'Unable to delete medical history. Please try again.');
    }
  };

  return (
    <>
      <div className="history-card">
        <div className="history-card-head">
          <h2>Medical History</h2>
        </div>
        {!patientIsActive && (
          <p className="history-warning">
            Profile is deactive (0). Activate profile to add medical history.
          </p>
        )}

        <div className="history-form" style={{ marginBottom: '0.85rem' }}>
          <select
            value={form.historyType}
            disabled={!patientIsActive}
            onChange={(e) => updateField('historyType', e.target.value)}
          >
            <option value="CONSULTATION">Consultation</option>
            <option value="DIAGNOSIS">Diagnosis</option>
            <option value="TREATMENT">Treatment</option>
            <option value="SURGERY">Surgery</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            disabled={!patientIsActive}
            onChange={(e) => updateField('title', e.target.value)}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
          <input
            type="datetime-local"
            value={form.eventDate}
            disabled={!patientIsActive}
            onChange={(e) => updateField('eventDate', e.target.value)}
          />
          {errors.eventDate && <p className="field-error">{errors.eventDate}</p>}
          <textarea
            placeholder="Description"
            value={form.description}
            disabled={!patientIsActive}
            onChange={(e) => updateField('description', e.target.value)}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
          <button
            type="button"
            className="history-submit-btn"
            disabled={!patientIsActive}
            onClick={handleAddHistory}
          >
            {editingId ? 'Save Changes' : 'Add Medical History'}
          </button>
          {editingId ? (
            <button
              type="button"
              className="history-cancel-btn"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        {history.length === 0 ? (
          <p className="history-empty">No medical history records.</p>
        ) : (
          <div className="history-list">
            {history.map((h) => (
              <article key={h.id} className="history-item">
                <h4>{h.title}</h4>
                <p className="history-item-meta">
                  {(h.historyType || 'N/A').replaceAll('_', ' ')} • {h.eventDate || 'No date'}
                </p>
                <p className="history-item-desc">{h.description || 'No description provided.'}</p>
                <div className="item-actions">
                  <button type="button" onClick={() => handleEdit(h)} disabled={!patientIsActive}>Edit</button>
                  <button type="button" className="item-delete-btn" onClick={() => handleDelete(h)} disabled={!patientIsActive}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {popup && (
        <div className="historydocs-popup-overlay" role="dialog" aria-modal="true">
          <div
            className={`historydocs-popup-modal ${
              popup.type === 'success' ? 'historydocs-popup-success' : 'historydocs-popup-error'
            }`}
          >
            <div className="historydocs-popup-icon" aria-hidden="true">
              {popup.type === 'success' ? '✓' : '!'}
            </div>
            <h3>{popup.title}</h3>
            <p>{popup.message}</p>
            <div className="historydocs-popup-actions">
              <button type="button" onClick={closePopup}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MedicalHistory;