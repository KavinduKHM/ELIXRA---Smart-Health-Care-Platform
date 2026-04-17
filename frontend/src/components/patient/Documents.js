// src/components/patient/Documents.js
import React, { useState } from 'react';
import { deletePatientDocument, updatePatientDocument, uploadDocument } from '../../services/patientService';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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

const Documents = ({ documents, patientId, onDocumentUploaded, profile }) => {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('LAB_REPORT');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({ file: '', description: '' });
  const [popup, setPopup] = useState(null);
  const patientIsActive = isProfileActive(profile);

  const validateFile = (selectedFile, isEditing) => {
    if (!selectedFile && !isEditing) return 'Please select a file.';
    if (!selectedFile) return '';
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      return 'Unsupported file type. Use PDF, JPG, PNG, DOC, or DOCX.';
    }
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      return 'File size must be 10MB or less.';
    }
    return '';
  };

  const validateDescription = (text) => {
    const value = String(text || '').trim();
    if (!value) return 'Description is required.';
    if (value.length < 3) return 'Description must be at least 3 characters.';
    if (value.length > 180) return 'Description must be 180 characters or less.';
    return '';
  };

  const validateForm = ({ nextFile = file, nextDescription = description, isEditing = !!editingId } = {}) => {
    return {
      file: validateFile(nextFile, isEditing),
      description: validateDescription(nextDescription),
    };
  };

  const hasErrors = (value) => Object.values(value).some(Boolean);

  const closePopup = () => setPopup(null);

  const showSuccess = (message) => {
    setPopup({ type: 'success', title: 'Success', message });
  };

  const showError = (message) => {
    setPopup({ type: 'error', title: 'Failed', message });
  };

  const resetForm = () => {
    setFile(null);
    setDocType('LAB_REPORT');
    setDescription('');
    setEditingId(null);
    setErrors({ file: '', description: '' });
  };

  const handleFileChange = (nextFile) => {
    setFile(nextFile || null);
    setErrors((prev) => ({ ...prev, file: validateFile(nextFile || null, !!editingId) }));
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
  };

  const handleUpload = async () => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before uploading documents.');
      return;
    }
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      showError('Please fix form validation errors before saving.');
      return;
    }

    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('description', String(description).trim());
    try {
      if (editingId) {
        await updatePatientDocument(patientId, editingId, formData);
      } else {
        await uploadDocument(patientId, formData);
      }
      showSuccess(editingId ? 'Document updated successfully.' : 'Document uploaded successfully.');
      onDocumentUploaded(); // refresh list
      resetForm();
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      showError(backendMessage || 'Upload failed. Please try again.');
    }
  };

  const handleEdit = (doc) => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before editing documents.');
      return;
    }
    setEditingId(doc.id);
    setDocType(doc.documentType || 'LAB_REPORT');
    setDescription(doc.description || '');
    setFile(null);
    setErrors({ file: '', description: '' });
  };

  const handleDelete = async (doc) => {
    if (!patientIsActive) {
      showError('Patient profile is deactive (0). Please activate from Profile before deleting documents.');
      return;
    }
    const confirmed = window.confirm(`Delete document "${doc.fileName || 'Document'}"?`);
    if (!confirmed) return;

    try {
      await deletePatientDocument(patientId, doc.id);
      onDocumentUploaded();
      if (editingId === doc.id) resetForm();
      showSuccess('Document deleted successfully.');
    } catch (err) {
      console.error(err);
      const backendMessage = err?.response?.data?.message;
      showError(backendMessage || 'Delete failed. Please try again.');
    }
  };

  return (
    <>
      <div className="documents-card">
        <div className="documents-card-head">
          <h2>Medical Documents</h2>
        </div>
        {!patientIsActive && (
          <p className="documents-warning">
            Profile is deactive (0). Activate profile to upload documents.
          </p>
        )}
        <div className="documents-upload-form">
          <input
            type="file"
            disabled={!patientIsActive}
            onChange={(e) => handleFileChange(e.target.files[0] || null)}
          />
          {editingId ? (
            <p className="field-help">Choose a new file only if you want to replace the existing file.</p>
          ) : null}
          {errors.file && <p className="field-error">{errors.file}</p>}
          <select value={docType} disabled={!patientIsActive} onChange={(e) => setDocType(e.target.value)}>
            <option value="LAB_REPORT">Lab Report</option>
            <option value="PRESCRIPTION">Prescription</option>
            <option value="MEDICAL_CERTIFICATE">Medical Certificate</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Description"
            value={description}
            disabled={!patientIsActive}
            onChange={(e) => handleDescriptionChange(e.target.value)}
          />
          {errors.description && <p className="field-error">{errors.description}</p>}
          <button
            type="button"
            className="documents-upload-btn"
            onClick={handleUpload}
            disabled={!patientIsActive}
          >
            {editingId ? 'Save Changes' : 'Upload'}
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

        {documents.length === 0 ? (
          <p className="documents-empty">No documents uploaded.</p>
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <article key={doc.id} className="documents-item">
                <h4>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="documents-item-link">
                    {doc.fileName || 'Document'}
                  </a>
                </h4>
                <p className="documents-item-meta">
                  {(doc.documentType || 'OTHER').replaceAll('_', ' ')}
                </p>
                <p className="documents-item-desc">{doc.description || 'No description provided.'}</p>
                <div className="item-actions">
                  <button type="button" onClick={() => handleEdit(doc)} disabled={!patientIsActive}>Edit</button>
                  <button type="button" className="item-delete-btn" onClick={() => handleDelete(doc)} disabled={!patientIsActive}>Delete</button>
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

export default Documents;