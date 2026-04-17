import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  deletePatientDocument,
  deletePatientMedicalHistoryRecord,
  deletePatientProfile,
  setPatientProfileActiveState,
  updatePatientProfile,
  uploadPatientProfilePicture,
} from '../../services/patientService';
import './Profile.css';

const PROFILE_IMAGE_CANDIDATE_KEYS = [
  'profilePictureUrl',
  'profileImageUrl',
  'imageUrl',
  'avatarUrl',
  'photoUrl',
];

const PROFILE_FIELDS = [
  { key: 'firstName', label: 'First Name', type: 'text', required: true },
  { key: 'lastName', label: 'Last Name', type: 'text', required: true },
  { key: 'middleName', label: 'Middle Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true },
  {
    key: 'gender',
    label: 'Gender',
    type: 'select',
    options: ['', 'Male', 'Female', 'Other', 'Prefer not to say'],
  },
  {
    key: 'bloodGroup',
    label: 'Blood Group',
    type: 'select',
    options: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  { key: 'addressLine1', label: 'Address Line 1', type: 'text' },
  { key: 'addressLine2', label: 'Address Line 2', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'state', label: 'State', type: 'text' },
  { key: 'postalCode', label: 'Postal Code', type: 'text' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text' },
  { key: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel' },
  { key: 'emergencyContactRelation', label: 'Emergency Contact Relation', type: 'text' },
  { key: 'allergies', label: 'Allergies', type: 'textarea' },
  { key: 'chronicConditions', label: 'Chronic Conditions', type: 'textarea' },
  { key: 'currentMedications', label: 'Current Medications', type: 'textarea' },
];

const getInitialFormData = (profile) => {
  const defaults = {};
  PROFILE_FIELDS.forEach((field) => {
    defaults[field.key] = profile?.[field.key] ?? '';
  });
  return defaults;
};

const normalizeMessage = (err, fallback) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  const validationErrors = data?.errors && typeof data.errors === 'object'
    ? Object.entries(data.errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ')
    : '';

  const serverMessage =
    validationErrors ||
    data?.message ||
    data?.error ||
    (typeof data === 'string' ? data : '');

  return serverMessage || (status ? `${fallback} (HTTP ${status})` : fallback);
};

const resolveProfileImage = (profile, patientId) => {
  for (const key of PROFILE_IMAGE_CANDIDATE_KEYS) {
    if (profile?.[key]) return profile[key];
  }
  return patientId ? `http://localhost:8082/api/patients/${patientId}/profile-picture` : '';
};

const isProfileActive = (profile) => {
  if (!profile) return true;
  const statusRaw = profile.status;
  if (statusRaw === 0 || statusRaw === '0') return false;
  if (statusRaw === 1 || statusRaw === '1') return true;

  const statusText = String(statusRaw || '').toUpperCase();
  if (statusText === 'INACTIVE' || statusText === 'DEACTIVE' || statusText === 'DEACTIVATED') return false;
  if (statusText === 'ACTIVE' || statusText === 'ACTIVATED') return true;

  if (profile.active === false) return false;
  if (profile.active === true) return true;
  return true;
};

const Profile = ({
  profile,
  patientId,
  documents,
  medicalHistory,
  onProfileUpdate,
  onDocumentsUpdate,
  onMedicalHistoryUpdate,
  refreshDocuments,
  refreshMedicalHistory,
}) => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData(profile));
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loadingAction, setLoadingAction] = useState('');
  const [profilePreview, setProfilePreview] = useState('');
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const fileInputRef = useRef(null);
  const deleteRedirectTimerRef = useRef(null);

  const patientDisplayName = useMemo(() => {
    const first = String(profile?.firstName || '').trim();
    const middle = String(profile?.middleName || '').trim();
    const last = String(profile?.lastName || '').trim();
    return [first, middle, last].filter(Boolean).join(' ') || 'Patient';
  }, [profile]);

  const active = useMemo(() => isProfileActive(profile), [profile]);

  const profileImageUrl = useMemo(() => {
    if (profilePreview) return profilePreview;
    return resolveProfileImage(profile, patientId);
  }, [profile, patientId, profilePreview]);

  useEffect(() => {
    setFormData(getInitialFormData(profile));
  }, [profile]);

  useEffect(() => {
    if (message.type !== 'success' || !message.text) return undefined;
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 4500);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => () => {
    if (profilePreview) URL.revokeObjectURL(profilePreview);
  }, [profilePreview]);

  useEffect(() => () => {
    if (deleteRedirectTimerRef.current) {
      clearTimeout(deleteRedirectTimerRef.current);
    }
  }, []);

  const setError = (text) => setMessage({ type: 'error', text });
  const setSuccess = (text) => setMessage({ type: 'success', text });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) return 'First name is required.';
    if (!formData.lastName?.trim()) return 'Last name is required.';
    if (!formData.email?.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return 'Invalid email format.';
    if (!formData.phoneNumber?.trim()) return 'Phone number is required.';
    if (!/^\d{10}$/.test(formData.phoneNumber.trim())) return 'Phone number must be 10 digits.';
    if (!formData.dateOfBirth?.trim()) return 'Date of birth is required.';
    if (formData.emergencyContactPhone && !/^\d{10}$/.test(String(formData.emergencyContactPhone).trim())) {
      return 'Emergency contact phone must be 10 digits.';
    }
    return '';
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file for profile picture.');
      return;
    }

    if (profilePreview) URL.revokeObjectURL(profilePreview);
    setProfilePictureFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const openProfilePhotoPicker = () => {
    if (!editMode) {
      setError('Enable edit mode to update profile photo.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoadingAction('save');
    setMessage({ type: '', text: '' });

    try {
      const profileRes = await updatePatientProfile(patientId, formData);
      let updatedProfile = profileRes?.data ?? { ...profile, ...formData };

      if (profilePictureFile) {
        const imagePayload = new FormData();
        imagePayload.append('file', profilePictureFile);
        await uploadPatientProfilePicture(patientId, imagePayload);
        updatedProfile = {
          ...updatedProfile,
          profilePictureUrl: `${resolveProfileImage(updatedProfile, patientId)}?t=${Date.now()}`,
        };
      }

      onProfileUpdate(updatedProfile);
      setFormData(getInitialFormData(updatedProfile));
      setProfilePictureFile(null);
      setProfilePreview('');
      setEditMode(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(normalizeMessage(err, 'Failed to update profile.'));
    } finally {
      setLoadingAction('');
    }
  };

  const handleToggleActivation = async () => {
    const targetActive = !active;
    const confirmed = window.confirm(
      targetActive
        ? 'Activate this patient profile?'
        : 'Deactivate this patient profile? While inactive, booking and document/history actions will be disabled.'
    );
    if (!confirmed) return;

    setLoadingAction('status-toggle');
    setMessage({ type: '', text: '' });

    try {
      const response = await setPatientProfileActiveState(patientId, targetActive);
      const next = response?.data
        ? {
          ...profile,
          ...response.data,
          status: response.data.active ? 1 : 0,
        }
        : {
          ...profile,
          active: targetActive,
          status: targetActive ? 1 : 0,
        };
      onProfileUpdate(next);
      setSuccess(targetActive ? 'Profile activated successfully.' : 'Profile deactivated successfully.');
    } catch (err) {
      setError(normalizeMessage(err, targetActive ? 'Failed to activate profile.' : 'Failed to deactivate profile.'));
    } finally {
      setLoadingAction('');
    }
  };

  const handleDeleteProfile = async () => {
    const confirmed = window.confirm(
      'Delete profile permanently? This will also delete all medical history and uploaded documents for this patient.'
    );
    if (!confirmed) return;

    const typed = window.prompt('Type DELETE to confirm permanent deletion.');
    if (typed !== 'DELETE') {
      setError('Delete cancelled. Confirmation text did not match.');
      return;
    }

    setLoadingAction('delete');
    setMessage({ type: '', text: '' });

    try {
      const documentDeletes = await Promise.allSettled(
        (documents || [])
          .filter((doc) => doc?.id !== undefined && doc?.id !== null)
          .map((doc) => deletePatientDocument(patientId, doc.id))
      );

      const historyDeletes = await Promise.allSettled(
        (medicalHistory || [])
          .filter((record) => record?.id !== undefined && record?.id !== null)
          .map((record) => deletePatientMedicalHistoryRecord(patientId, record.id))
      );

      const failedDocDeletes = documentDeletes.filter((r) => r.status === 'rejected').length;
      const failedHistoryDeletes = historyDeletes.filter((r) => r.status === 'rejected').length;

      if (failedDocDeletes > 0 || failedHistoryDeletes > 0) {
        setError(
          `Could not delete all related records. Failed documents: ${failedDocDeletes}, failed history records: ${failedHistoryDeletes}. Profile was not deleted.`
        );
        if (typeof refreshDocuments === 'function') await refreshDocuments();
        if (typeof refreshMedicalHistory === 'function') await refreshMedicalHistory();
        return;
      }

      await deletePatientProfile(patientId);

      onDocumentsUpdate([]);
      onMedicalHistoryUpdate([]);
      setSuccess('Patient deleted successfully. Redirecting to dashboard...');

      if (deleteRedirectTimerRef.current) {
        clearTimeout(deleteRedirectTimerRef.current);
      }

      deleteRedirectTimerRef.current = setTimeout(() => {
        onProfileUpdate(null);
        navigate('/patient', {
          replace: true,
          state: {
            flashMessage: {
              type: 'success',
              text: 'Patient profile deleted successfully.',
            },
          },
        });
      }, 1500);
    } catch (err) {
      setError(normalizeMessage(err, 'Failed to delete profile.'));
    } finally {
      setLoadingAction('');
    }
  };

  const renderFieldInput = (field) => {
    const value = formData[field.key] ?? '';

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          rows={3}
          onChange={(e) => handleChange(field.key, e.target.value)}
          placeholder={field.label}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select value={value} onChange={(e) => handleChange(field.key, e.target.value)}>
          {field.options.map((opt) => (
            <option key={`${field.key}-${opt || 'empty'}`} value={opt}>
              {opt || `Select ${field.label}`}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={value}
        required={Boolean(field.required)}
        onChange={(e) => handleChange(field.key, e.target.value)}
        placeholder={field.label}
      />
    );
  };

  if (!profile) return <p>Loading profile...</p>;

  const viewGroups = [
    {
      key: 'personal',
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: patientDisplayName },
        { label: 'Email Address', value: profile?.email },
        { label: 'Phone Number', value: profile?.phoneNumber },
        { label: 'Date of Birth', value: profile?.dateOfBirth },
        { label: 'Gender', value: profile?.gender },
      ],
    },
    {
      key: 'medical',
      title: 'Medical Details',
      items: [
        { label: 'Blood Group', value: profile?.bloodGroup },
        { label: 'Allergies', value: profile?.allergies },
        { label: 'Chronic Conditions', value: profile?.chronicConditions },
        { label: 'Current Medications', value: profile?.currentMedications },
      ],
    },
    {
      key: 'address',
      title: 'Residential Address',
      items: [
        { label: 'Street Address', value: [profile?.addressLine1, profile?.addressLine2].filter(Boolean).join(', ') },
        { label: 'City', value: profile?.city },
        { label: 'State', value: profile?.state },
        { label: 'Postal Code', value: profile?.postalCode },
        { label: 'Country', value: profile?.country },
      ],
    },
    {
      key: 'emergency',
      title: 'Emergency Contact',
      items: [
        { label: 'Name', value: profile?.emergencyContactName },
        { label: 'Relationship', value: profile?.emergencyContactRelation },
        { label: 'Phone Number', value: profile?.emergencyContactPhone },
      ],
    },
  ];

  return (
    <div className="profile-card">
      {message.text && (
        <section className="profile-popup-overlay" role="status" aria-live="polite">
          <div className={`profile-popup-modal profile-popup-${message.type}`}>
            <div className="profile-popup-icon" aria-hidden="true">
              {message.type === 'success' ? '✓' : '!'}
            </div>
            <h3>{message.type === 'success' ? 'Success' : 'Action Failed'}</h3>
            <p>{message.text}</p>
            <div className="profile-popup-actions">
              <button
                type="button"
                className="profile-btn-secondary"
                onClick={() => setMessage({ type: '', text: '' })}
              >
                Close
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="profile-top">
        <div className="profile-picture-block">
          <button
            type="button"
            className={`profile-photo-picker ${editMode ? 'profile-photo-picker-editable' : ''}`}
            title={editMode ? 'Change profile photo' : 'Enable edit mode to change profile photo'}
            onClick={openProfilePhotoPicker}
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Patient profile"
                className="profile-photo"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="profile-photo-fallback">P</span>
            )}
            <span className="profile-photo-badge">Edit</span>
          </button>
          <input
            id="profile-photo-input"
            className="profile-photo-input"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleProfilePictureChange}
            disabled={!editMode}
            ref={fileInputRef}
          />
          <small className="muted">
            {editMode ? 'Tap avatar to change photo.' : 'Enable edit mode to change photo.'}
          </small>
        </div>

        <div className="profile-heading-wrap">
          <h2 className="profile-title">{patientDisplayName}</h2>
          <div className="profile-meta-chips">
            <span className="profile-chip">Patient ID: {patientId}</span>
            <span className="profile-chip">
              Status: {active ? 'Active (1)' : 'Deactive (0)'}
            </span>
          </div>
        </div>
      </div>

      {!editMode ? (
        <div className="profile-section-grid">
          {viewGroups.map((group) => (
            <section key={group.key} className="profile-section">
              <div className="profile-section-head">
                <h3 className="profile-section-title">{group.title}</h3>
              </div>
              <div className="profile-section-body">
                {group.items
                  .filter((item) => item.label)
                  .map((item) => (
                    <div key={`${group.key}-${item.label}`} className="profile-kv">
                      <div className="profile-kv-label">{item.label}</div>
                      <div className="profile-kv-value">
                        {String(item.value || '').trim() ? String(item.value) : '-'}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="profile-grid">
          {PROFILE_FIELDS.map((field) => (
            <label className="profile-field" key={field.key}>
              <span>
                {field.label}
                {field.required && <strong className="profile-required">*</strong>}
              </span>
              {renderFieldInput(field)}
            </label>
          ))}
        </div>
      )}

      <div className="profile-actions">
        {!editMode ? (
          <button type="button" onClick={() => setEditMode(true)} disabled={Boolean(loadingAction)}>
            Edit Profile
          </button>
        ) : (
          <>
            <button type="button" onClick={handleSave} disabled={loadingAction === 'save'}>
              {loadingAction === 'save' ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={() => {
                setFormData(getInitialFormData(profile));
                setProfilePictureFile(null);
                if (profilePreview) URL.revokeObjectURL(profilePreview);
                setProfilePreview('');
                setEditMode(false);
              }}
              disabled={Boolean(loadingAction)}
            >
              Cancel
            </button>
          </>
        )}

        <button
          type="button"
          className="profile-btn-warning"
          onClick={handleToggleActivation}
          disabled={loadingAction === 'status-toggle' || loadingAction === 'delete'}
        >
          {loadingAction === 'status-toggle'
            ? (active ? 'Deactivating...' : 'Activating...')
            : (active ? 'Deactivate Profile' : 'Activate Profile')}
        </button>

        <button
          type="button"
          className="profile-btn-danger"
          onClick={handleDeleteProfile}
          disabled={loadingAction === 'status-toggle' || loadingAction === 'delete'}
        >
          {loadingAction === 'delete' ? 'Deleting...' : 'Delete Profile'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
