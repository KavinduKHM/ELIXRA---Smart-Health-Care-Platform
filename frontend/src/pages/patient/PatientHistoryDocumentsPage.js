import React from 'react';
import { useOutletContext } from 'react-router-dom';
import MedicalHistory from '../../components/patient/MedicalHistory';
import Documents from '../../components/patient/Documents';

const PatientHistoryDocumentsPage = () => {
  const { medicalHistory, documents, patientId, refreshDocuments } = useOutletContext();

  return (
    <div>
      <h1>Medical History & Documents</h1>
      <MedicalHistory history={medicalHistory || []} />
      <Documents
        documents={documents || []}
        patientId={patientId}
        onDocumentUploaded={refreshDocuments}
      />
    </div>
  );
};

export default PatientHistoryDocumentsPage;
