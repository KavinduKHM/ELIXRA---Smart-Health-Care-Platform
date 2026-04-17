import React, { useMemo, useRef } from 'react';
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

  const docsRef = useRef(null);

  const summary = useMemo(() => {
    const historyCount = Array.isArray(medicalHistory) ? medicalHistory.length : 0;
    const docsCount = Array.isArray(documents) ? documents.length : 0;

    const chronicRaw = String(profile?.chronicConditions || '').trim();
    const chronicCount = chronicRaw
      ? chronicRaw.split(/,|\n/).map((x) => x.trim()).filter(Boolean).length
      : 0;

    const requiredKeys = ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth'];
    const filled = requiredKeys.filter((k) => String(profile?.[k] || '').trim()).length;
    const completeness = Math.round((filled / requiredKeys.length) * 100);

    const needsAttention = [];
    if (!String(profile?.email || '').trim()) needsAttention.push('Add an email address to receive notifications.');
    if (!docsCount) needsAttention.push('Upload at least one document to keep records complete.');
    if (!historyCount) needsAttention.push('Add at least one medical history entry for your timeline.');

    return {
      historyCount,
      docsCount,
      chronicCount,
      completeness,
      needsAttention,
    };
  }, [medicalHistory, documents, profile]);

  return (
    <div className="historydocs-theme">
      <header className="historydocs-theme-head">
        <div>
          <h1>Medical History & Documents</h1>
          <p>Track care events and manage your uploaded reports in one place.</p>
        </div>

        <div className="historydocs-theme-actions">
          <button type="button" className="historydocs-action-secondary" onClick={() => window.print()}>
            Export Summary
          </button>
          <button
            type="button"
            className="historydocs-action-primary"
            onClick={() => docsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            Upload Document
          </button>
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
          <section className="historydocs-summary">
            <div className="historydocs-summary-card">
              <div className="historydocs-summary-title">Health Summary</div>
              <div className="historydocs-summary-metric">
                <span className="historydocs-summary-metric-value">{summary.completeness}%</span>
                <span className="historydocs-summary-metric-label">Profile completeness</span>
              </div>

              <div className="historydocs-summary-stats">
                <div className="historydocs-summary-stat">
                  <div className="historydocs-summary-stat-value">{summary.docsCount}</div>
                  <div className="historydocs-summary-stat-label">Documents</div>
                </div>
                <div className="historydocs-summary-stat">
                  <div className="historydocs-summary-stat-value">{summary.historyCount}</div>
                  <div className="historydocs-summary-stat-label">Timeline items</div>
                </div>
                <div className="historydocs-summary-stat">
                  <div className="historydocs-summary-stat-value">{summary.chronicCount}</div>
                  <div className="historydocs-summary-stat-label">Chronic conditions</div>
                </div>
              </div>
            </div>

            <div className="historydocs-summary-card historydocs-summary-insight">
              <div className="historydocs-summary-title">Portal Insights</div>
              <p className="historydocs-summary-text">
                {summary.needsAttention.length
                  ? summary.needsAttention[0]
                  : 'Everything looks up to date. Keep your records current before your next visit.'}
              </p>
            </div>

            {summary.needsAttention.length ? (
              <div className="historydocs-summary-card historydocs-summary-attn">
                <div className="historydocs-summary-title">Awaiting Action</div>
                <ul className="historydocs-summary-list">
                  {summary.needsAttention.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <div ref={docsRef} />
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
