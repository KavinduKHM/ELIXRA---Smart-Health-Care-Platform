import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './UploadDocument.css';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '')
  || 'http://localhost:8082';

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const initialForm = {
  patientId: '',
  documentId: '',
  documentType: '',
  description: '',
  notes: ''
};

const validateField = (name, value, selectedFile) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;

  if (name === 'patientId' || name === 'documentId') {
    if (!trimmed) return `${name === 'patientId' ? 'Patient' : 'Document'} ID is required.`;
    if (!/^\d+$/.test(trimmed)) return `${name === 'patientId' ? 'Patient' : 'Document'} ID must be a positive number.`;
    if (Number(trimmed) <= 0) return `${name === 'patientId' ? 'Patient' : 'Document'} ID must be greater than 0.`;
  }

  if (name === 'documentType') {
    if (!trimmed) return 'Document type is required.';
    if (trimmed.length < 3) return 'Document type must be at least 3 characters.';
  }

  if (name === 'description' && trimmed && trimmed.length > 250) {
    return 'Description cannot exceed 250 characters.';
  }

  if (name === 'notes' && trimmed && trimmed.length > 1000) {
    return 'Notes cannot exceed 1000 characters.';
  }

  if (name === 'file' && selectedFile) {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      return 'Unsupported file type. Use PDF, JPG, PNG, WEBP, DOC, or DOCX.';
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`;
    }
  }

  return '';
};

const UpdateDocument = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const statePatientId = String(location.state?.patientId || '');
    const stateDocumentId = String(location.state?.documentId || '');
    const currentDocument = location.state?.currentDocument || null;

    setForm((prev) => ({
      ...prev,
      patientId: statePatientId || prev.patientId,
      documentId: stateDocumentId || prev.documentId,
      documentType: currentDocument?.documentType || prev.documentType,
      description: currentDocument?.description || prev.description,
      notes: currentDocument?.notes || prev.notes
    }));
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, selectedFile) }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, selectedFile) }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setTouched((prev) => ({ ...prev, file: true }));
    setErrors((prev) => ({ ...prev, file: validateField('file', '', file) }));
  };

  const validateForm = () => {
    const nextErrors = {
      patientId: validateField('patientId', form.patientId, selectedFile),
      documentId: validateField('documentId', form.documentId, selectedFile),
      documentType: validateField('documentType', form.documentType, selectedFile),
      description: validateField('description', form.description, selectedFile),
      notes: validateField('notes', form.notes, selectedFile),
      file: validateField('file', '', selectedFile)
    };

    setErrors(nextErrors);
    setTouched({ patientId: true, documentId: true, documentType: true, description: true, notes: true, file: true });
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    setProgress(0);

    try {
      const patientId = Number(form.patientId);
      const documentId = Number(form.documentId);
      const payload = new FormData();
      if (selectedFile) payload.append('file', selectedFile);
      payload.append('documentType', form.documentType.trim());
      payload.append('description', form.description.trim());
      payload.append('notes', form.notes.trim());

      await axios.put(`${API_BASE_URL}/api/patients/${patientId}/documents/${documentId}`, payload, {
        headers: {
          ...authHeaders,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setProgress(100);
      navigate('/patient/documents', {
        replace: true,
        state: {
          flashMessage: {
            type: 'success',
            text: 'Document updated successfully.'
          }
        }
      });
    } catch (updateError) {
      const apiMsg =
        updateError?.response?.data?.message ||
        updateError?.response?.data?.error ||
        updateError?.response?.data;
      const msg = apiMsg ? `Update failed: ${String(apiMsg)}` : 'Update failed. Please try again.';
      setProgress(0);
      navigate('/patient/documents', {
        replace: true,
        state: {
          flashMessage: {
            type: 'error',
            text: msg
          }
        }
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="ud-shell">
      <header className="ud-header">
        <div>
          <h1>Update Medical Document</h1>
          <p>Update document details and optionally replace the file.</p>
        </div>
        <Link className="ud-link" to="/patient/documents">Back to documents</Link>
      </header>

      <form className="ud-form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Patient ID"
          name="patientId"
          value={form.patientId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.patientId ? errors.patientId : ''}
          type="number"
          required
          placeholder="Enter patient ID"
        />

        <Field
          label="Document ID"
          name="documentId"
          value={form.documentId}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.documentId ? errors.documentId : ''}
          type="number"
          required
          placeholder="Enter document ID"
        />

        <Field
          label="Document Type"
          name="documentType"
          value={form.documentType}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.documentType ? errors.documentType : ''}
          required
          placeholder="e.g. Lab Report, MRI, Prescription"
        />

        <label className="ud-field ud-field-full">
          <span>Replace File (Optional)</span>
          <input
            type="file"
            onChange={handleFileChange}
            onBlur={() => setTouched((prev) => ({ ...prev, file: true }))}
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            className={touched.file && errors.file ? 'ud-input-error' : ''}
            disabled={updating}
          />
          {selectedFile && (
            <small className="ud-file-meta">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </small>
          )}
          {touched.file && errors.file && <small className="ud-error">{errors.file}</small>}
        </label>

        <label className="ud-field">
          <span>Description</span>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Short description"
            className={touched.description && errors.description ? 'ud-input-error' : ''}
            disabled={updating}
          />
          {touched.description && errors.description && <small className="ud-error">{errors.description}</small>}
        </label>

        <label className="ud-field">
          <span>Notes</span>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            placeholder="Additional notes"
            className={touched.notes && errors.notes ? 'ud-input-error' : ''}
            disabled={updating}
          />
          {touched.notes && errors.notes && <small className="ud-error">{errors.notes}</small>}
        </label>

        {updating && (
          <div className="ud-progress-wrap ud-field-full">
            <div className="ud-progress-label">Updating... {progress}%</div>
            <div className="ud-progress-track">
              <div className="ud-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <footer className="ud-actions ud-field-full">
          <button className="ud-btn ud-btn-secondary" type="button" onClick={() => navigate('/patient/documents')}>
            Cancel
          </button>
          <button className="ud-btn ud-btn-primary" type="submit" disabled={updating}>
            <ArrowPathIcon className="ud-btn-icon" />
            {updating ? 'Updating...' : 'Update Document'}
          </button>
        </footer>
      </form>
    </div>
  );
};

const Field = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  type = 'text',
  placeholder = ''
}) => (
  <label className="ud-field">
    <span>
      {label}
      {required && <strong className="ud-required">*</strong>}
    </span>
    <input
      name={name}
      type={type}
      min={type === 'number' ? '1' : undefined}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      className={error ? 'ud-input-error' : ''}
      autoComplete="off"
      disabled={name === 'documentId' && Boolean(value)}
    />
    {error && <small className="ud-error">{error}</small>}
  </label>
);

export default UpdateDocument;
