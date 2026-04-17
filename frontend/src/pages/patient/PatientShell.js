import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import {
  getPatientProfile,
  getPatientDocuments,
  getPatientPrescriptions,
  getPatientMedicalHistory,
} from '../../services/patientService';

const PatientShell = () => {
  const { patientId } = useParams();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  const patientIdNum = useMemo(() => Number(patientId), [patientId]);

  const refreshDocuments = useCallback(async () => {
    const docsRes = await getPatientDocuments(patientIdNum);
    setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
  }, [patientIdNum]);

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      if (!Number.isFinite(patientIdNum) || patientIdNum <= 0) {
        setLoadError('Invalid patient id');
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const [profileRes, docsRes, prescRes, histRes] = await Promise.all([
          getPatientProfile(patientIdNum),
          getPatientDocuments(patientIdNum),
          getPatientPrescriptions(patientIdNum),
          getPatientMedicalHistory(patientIdNum),
        ]);

        if (!isMounted) return;
        setProfile(profileRes.data);
        setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
        setPrescriptions(Array.isArray(prescRes.data) ? prescRes.data : []);
        setMedicalHistory(Array.isArray(histRes.data) ? histRes.data : []);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        const status = err?.response?.status;
        setLoadError(status === 404 ? 'Patient not found' : 'Failed to load patient data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAll();

    return () => {
      isMounted = false;
    };
  }, [patientIdNum]);

  const outletContext = useMemo(
    () => ({
      patientId: patientIdNum,
      profile,
      setProfile,
      documents,
      prescriptions,
      medicalHistory,
      refreshDocuments,
    }),
    [patientIdNum, profile, documents, prescriptions, medicalHistory, refreshDocuments]
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <h3 className="sidebarTitle">Patient</h3>
          <div className="sidebarMeta">ID: {patientId}</div>
        </div>
        <nav className="sidebarNav">
          <NavLink
            to="appointments"
            end
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Appointments
          </NavLink>
          <NavLink
            to="prescriptions"
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Prescriptions
          </NavLink>
          <NavLink
            to="history-documents"
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            History & Documents
          </NavLink>
          <NavLink
            to="profile"
            className={({ isActive }) => `sidebarLink ${isActive ? 'sidebarLinkActive' : ''}`}
          >
            Profile
          </NavLink>
        </nav>
        <div style={{ marginTop: '1rem' }}>
          <Link to="/patient" style={{ color: 'white' }}>Switch patient</Link>
        </div>
      </aside>

      <section className="content">
        {loading && <p>Loading patient data...</p>}
        {!loading && loadError && (
          <div>
            <p style={{ color: 'red' }}>{loadError}</p>
            <Link to="/patient">Go back</Link>
          </div>
        )}
        {!loading && !loadError && <Outlet context={outletContext} />}
      </section>
    </div>
  );
};

export default PatientShell;
