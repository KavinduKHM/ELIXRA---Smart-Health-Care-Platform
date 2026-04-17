import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import {
  getPatientProfile,
  getPatientDocuments,
  getPatientPrescriptions,
  getPatientMedicalHistory,
} from '../../services/patientService';

const PROFILE_IMAGE_CANDIDATE_KEYS = [
  'profilePictureUrl',
  'profilePicture',
  'profileImageUrl',
  'imageUrl',
  'avatarUrl',
  'photoUrl',
];

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8082').replace(/\/$/, '');

const isValidImageValue = (value) => {
  if (value === null || value === undefined) return false;
  const text = String(value).trim();
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower !== 'null' && lower !== 'undefined' && lower !== 'n/a';
};

const normalizeImageUrl = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text) || text.startsWith('data:') || text.startsWith('blob:')) return text;
  return text.startsWith('/') ? `${API_BASE_URL}${text}` : `${API_BASE_URL}/${text}`;
};

const getFallbackProfileImage = (patientId) =>
  patientId ? `${API_BASE_URL}/api/patients/${patientId}/profile-picture` : '';

const resolveProfileImage = (profile, patientId) => {
  for (const key of PROFILE_IMAGE_CANDIDATE_KEYS) {
    if (isValidImageValue(profile?.[key])) return normalizeImageUrl(profile[key]);
  }
  return getFallbackProfileImage(patientId);
};

const getPatientDisplayName = (profile) => {
  const first = String(profile?.firstName || '').trim();
  const middle = String(profile?.middleName || '').trim();
  const last = String(profile?.lastName || '').trim();
  const full = [first, middle, last].filter(Boolean).join(' ');
  return full || 'Patient';
};

const PatientShell = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [logoutPopup, setLogoutPopup] = useState(null);
  const [sidebarImageSrc, setSidebarImageSrc] = useState('');
  const [triedSidebarFallback, setTriedSidebarFallback] = useState(false);

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);

  const patientIdNum = useMemo(() => Number(patientId), [patientId]);
  const patientName = useMemo(() => getPatientDisplayName(profile), [profile]);
  const patientImage = useMemo(() => resolveProfileImage(profile, patientIdNum), [profile, patientIdNum]);
  const fallbackPatientImage = useMemo(() => getFallbackProfileImage(patientIdNum), [patientIdNum]);

  useEffect(() => {
    setSidebarImageSrc(patientImage || '');
    setTriedSidebarFallback(false);
  }, [patientImage]);

  const refreshDocuments = useCallback(async () => {
    const docsRes = await getPatientDocuments(patientIdNum);
    setDocuments(Array.isArray(docsRes.data) ? docsRes.data : []);
  }, [patientIdNum]);

  const refreshMedicalHistory = useCallback(async () => {
    const historyRes = await getPatientMedicalHistory(patientIdNum);
    setMedicalHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
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
      setDocuments,
      prescriptions,
      medicalHistory,
      setMedicalHistory,
      refreshDocuments,
      refreshMedicalHistory,
    }),
    [patientIdNum, profile, documents, prescriptions, medicalHistory, refreshDocuments, refreshMedicalHistory]
  );

  const handleLogoutClick = (event) => {
    event.preventDefault();
    setLogoutPopup({
      type: 'success',
      title: 'Success',
      text: 'Logged out successfully.',
    });
  };

  const closeLogoutPopup = () => {
    setLogoutPopup(null);
    navigate('/patient', {
      replace: true,
      state: {
        flashMessage: {
          type: 'success',
          text: 'Logged out successfully.',
        },
      },
    });
  };

  return (
    <div className="shell patient-shell">
      <aside className="sidebar patient-sidebar">
        <div className="patient-sidebar-head">
          <div className="patient-sidebar-user">
            <div className="patient-sidebar-avatar-wrap" aria-hidden="true">
              <span className="patient-sidebar-avatar-fallback">{patientName.charAt(0).toUpperCase()}</span>
              {sidebarImageSrc ? (
                <img
                  src={sidebarImageSrc}
                  alt=""
                  className="patient-sidebar-avatar"
                  onError={() => {
                    if (!triedSidebarFallback && fallbackPatientImage && sidebarImageSrc !== fallbackPatientImage) {
                      setSidebarImageSrc(fallbackPatientImage);
                      setTriedSidebarFallback(true);
                      return;
                    }
                    setSidebarImageSrc('');
                  }}
                />
              ) : null}
            </div>
            <div>
              <h3 className="sidebarTitle">{patientName}</h3>
              <div className="sidebarMeta">Patient Profile • ID: {patientId}</div>
            </div>
          </div>
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
        <div className="patient-sidebar-foot">
          <Link to="/patient" className="patient-switch-link patient-logout-link" onClick={handleLogoutClick}>logout</Link>
        </div>
      </aside>

      <section className="content patient-content">
        {loading && <p>Loading patient data...</p>}
        {!loading && loadError && (
          <div>
            <p style={{ color: 'red' }}>{loadError}</p>
            <Link to="/patient">Go back</Link>
          </div>
        )}
        {!loading && !loadError && <Outlet context={outletContext} />}
      </section>

      {logoutPopup && (
        <div className="patient-logout-popup-overlay" role="dialog" aria-modal="true">
          <div className="patient-logout-popup-modal patient-logout-popup-success">
            <div className="patient-logout-popup-icon" aria-hidden="true">✓</div>
            <h3>{logoutPopup.title}</h3>
            <p>{logoutPopup.text}</p>
            <div className="patient-logout-popup-actions">
              <button type="button" onClick={closeLogoutPopup}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientShell;
