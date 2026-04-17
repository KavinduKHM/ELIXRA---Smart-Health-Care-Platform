// src/components/patient/Documents.js
import React, { useState } from 'react';
import { uploadDocument } from '../../services/patientService';

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
  const patientIsActive = isProfileActive(profile);

  const handleUpload = async () => {
    if (!patientIsActive) {
      alert('Patient is deactive (0). Please activate profile from the Profile tab to upload documents.');
      return;
    }
    if (!file) {
      alert('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);
    formData.append('description', description);
    try {
      await uploadDocument(patientId, formData);
      alert('Document uploaded');
      onDocumentUploaded(); // refresh list
      setFile(null);
      setDescription('');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Medical Documents</h2>
      {!patientIsActive && (
        <p style={{ color: '#b42318', fontWeight: 600 }}>
          Profile is deactive (0). Activate profile to upload documents.
        </p>
      )}
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" disabled={!patientIsActive} onChange={(e) => setFile(e.target.files[0])} />
        <select value={docType} disabled={!patientIsActive} onChange={(e) => setDocType(e.target.value)}>
          <option value="LAB_REPORT">Lab Report</option>
          <option value="PRESCRIPTION">Prescription</option>
          <option value="MEDICAL_CERTIFICATE">Medical Certificate</option>
          <option value="OTHER">Other</option>
        </select>
        <input type="text" placeholder="Description" value={description} disabled={!patientIsActive} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleUpload} disabled={!patientIsActive}>Upload</button>
      </div>
      {documents.length === 0 ? (
        <p>No documents uploaded.</p>
      ) : (
        <ul>
          {documents.map(doc => (
            <li key={doc.id}>
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">{doc.fileName}</a> - {doc.documentType} ({doc.description})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Documents;