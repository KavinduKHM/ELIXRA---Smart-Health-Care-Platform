// src/components/patient/Documents.js
import React, { useState } from 'react';
import { uploadDocument } from '../../services/patientService';

const Documents = ({ documents, patientId, onDocumentUploaded }) => {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('LAB_REPORT');
  const [description, setDescription] = useState('');

  const handleUpload = async () => {
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
      <div style={{ marginBottom: '1rem' }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <select value={docType} onChange={(e) => setDocType(e.target.value)}>
          <option value="LAB_REPORT">Lab Report</option>
          <option value="PRESCRIPTION">Prescription</option>
          <option value="MEDICAL_CERTIFICATE">Medical Certificate</option>
          <option value="OTHER">Other</option>
        </select>
        <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={handleUpload}>Upload</button>
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