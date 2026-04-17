import React from 'react';
import { useOutletContext } from 'react-router-dom';
import MedicalHistory from '../../components/patient/MedicalHistory';
import Documents from '../../components/patient/Documents';
import './PatientHistoryDocumentsPage.css';

const PatientHistoryDocumentsPage = () => {
  const {
    medicalHistory,
    documents,
    patientId,
    refreshDocuments,
    refreshMedicalHistory,
    profile,
  } = useOutletContext();

  return (
    <div className="historydocs-theme">
      <header className="historydocs-theme-head">
        <div>
          <h1>Medical History & Documents</h1>
          <p>Track care events and manage your uploaded reports in one place.</p>
        </div>
      </header>

      <div className="historydocs-theme-layout">
        <section className="historydocs-theme-main">
          <MedicalHistory
            history={medicalHistory || []}
            patientId={patientId}
            onHistoryAdded={refreshMedicalHistory}
            profile={profile}
          />
        </section>

        <aside className="historydocs-theme-side">
          <Documents
            documents={documents || []}
            patientId={patientId}
            onDocumentUploaded={refreshDocuments}
            profile={profile}
          />
        </aside>
      </div>
    </div>
  );
};

export default PatientHistoryDocumentsPage;
