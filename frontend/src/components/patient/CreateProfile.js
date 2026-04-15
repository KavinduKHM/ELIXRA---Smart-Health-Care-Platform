import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircleIcon, ExclamationTriangleIcon, UserCircleIcon, CameraIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import './CreateProfile.css';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '')
  || 'http://localhost:8082';
const MAX_PROFILE_PICTURE_SIZE_MB = 5;
const MAX_PROFILE_PICTURE_SIZE = MAX_PROFILE_PICTURE_SIZE_MB * 1024 * 1024;

const initialForm = {
  userId: '',
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  allergies: '',
  chronicConditions: '',
  currentMedications: ''
};

const validateField = (name, value, fullForm) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;

  if (name === 'userId') {
    if (!trimmed) return 'User ID is required.';
    if (!/^\d+$/.test(trimmed)) return 'User ID must be a positive number.';
    if (Number(trimmed) <= 0) return 'User ID must be greater than 0.';
  }

  if (name === 'firstName') {
    if (!trimmed) return 'First name is required.';
    if (!/^[a-zA-Z\s'-]{2,40}$/.test(trimmed)) return 'Use 2-40 letters only.';
  }

  if (name === 'lastName') {
    if (!trimmed) return 'Last name is required.';
    if (!/^[a-zA-Z\s'-]{2,40}$/.test(trimmed)) return 'Use 2-40 letters only.';
  }

  if (name === 'email') {
    if (!trimmed) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email format.';
  }

  if (name === 'phoneNumber') {
    if (!trimmed) return 'Phone number is required.';
    if (!/^\d{10}$/.test(trimmed)) return 'Phone number must be exactly 10 digits.';
  }

  if (name === 'dateOfBirth' && trimmed) {
    const chosen = new Date(trimmed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(chosen.getTime()) || chosen >= today) {
      return 'Date of birth must be a valid past date.';
    }
  }

  if (name === 'emergencyContactPhone' && trimmed && !/^\d{10}$/.test(trimmed)) {
    return 'Emergency contact phone must be 10 digits.';
  }

  if (name === 'postalCode' && trimmed && !/^[a-zA-Z0-9\-\s]{3,12}$/.test(trimmed)) {
    return 'Postal code format looks invalid.';
  }

  if ((name === 'emergencyContactPhone' || name === 'emergencyContactName') && fullForm) {
    if (fullForm.emergencyContactName && !fullForm.emergencyContactPhone) {
      return name === 'emergencyContactPhone' ? 'Emergency contact phone is required when name is provided.' : '';
    }
  }

  return '';
};

const validateProfilePicture = (file) => {
  if (!file) return '';
  if (!file.type.startsWith('image/')) return 'Please upload a valid image file.';
  if (file.size > MAX_PROFILE_PICTURE_SIZE) {
    return `Profile picture must be smaller than ${MAX_PROFILE_PICTURE_SIZE_MB}MB.`;
  }
  return '';
};

const CreateProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, value, next)
      }));
      return next;
    });
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value, form)
    }));
  };

  const handleProfilePictureChange = (event) => {
    const previousPreview = profilePreview;
    const file = event.target.files?.[0] || null;
    setProfilePicture(file);

    if (previousPreview) {
      URL.revokeObjectURL(previousPreview);
    }

    if (file) {
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfilePreview('');
    }

    setTouched((prev) => ({ ...prev, profilePicture: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      profilePicture: validateProfilePicture(file)
    }));
  };

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const validateForm = () => {
    const nextErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key], form);
      if (err) nextErrors[key] = err;
    });
    const profilePictureError = validateProfilePicture(profilePicture);
    if (profilePictureError) {
      nextErrors.profilePicture = profilePictureError;
    }
    setErrors(nextErrors);

    const touchedAll = {};
    Object.keys(form).forEach((key) => {
      touchedAll[key] = true;
    });
    touchedAll.profilePicture = true;
    setTouched(touchedAll);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix validation errors before submitting.' });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        userId: Number(form.userId),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender.trim(),
        bloodGroup: form.bloodGroup.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postalCode: form.postalCode.trim(),
        country: form.country.trim(),
        emergencyContactName: form.emergencyContactName.trim(),
        emergencyContactPhone: form.emergencyContactPhone.trim(),
        emergencyContactRelation: form.emergencyContactRelation.trim(),
        allergies: form.allergies.trim(),
        chronicConditions: form.chronicConditions.trim(),
        currentMedications: form.currentMedications.trim()
      };

      const response = await axios.post(`${API_BASE_URL}/api/patients/register`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (response?.data?.id) {
        localStorage.setItem('patientId', String(response.data.id));
      }

      if (profilePicture && response?.data?.id) {
        const imagePayload = new FormData();
        imagePayload.append('file', profilePicture);

        await axios.post(
          `${API_BASE_URL}/api/patients/${response.data.id}/profile-picture`,
          imagePayload,
          {
            headers: {
              ...authHeaders,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      navigate('/patient/profile', {
        replace: true,
        state: {
          flashMessage: {
            type: 'success',
            text: 'Patient registration saved to DB successfully.'
          }
        }
      });
    } catch (error) {
      const errorText =
        error?.response?.data?.message ||
        (typeof error?.response?.data === 'string' ? error.response.data : '') ||
        'Failed to register patient in DB.';

      navigate('/patient/profile', {
        replace: true,
        state: {
          flashMessage: {
            type: 'error',
            text: errorText
          }
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cp-shell">
      <header className="cp-header">
        <div>
          <h1>Patient Registration</h1>
          <p>Create a patient profile in DB with linked user ID.</p>
        </div>
        <Link className="cp-link" to="/patient/profile">Back to Profile</Link>
      </header>

      {message.text && (
        <section className={`cp-alert cp-alert-${message.type}`} role="status" aria-live="polite">
          {message.type === 'success' ? (
            <CheckCircleIcon className="cp-alert-icon" />
          ) : (
            <ExclamationTriangleIcon className="cp-alert-icon" />
          )}
          <span>{message.text}</span>
        </section>
      )}

      <form className="cp-form" onSubmit={handleSubmit} noValidate>
        <div className="cp-field cp-field-full">
          <span>Profile Picture (optional)</span>
          <label htmlFor="cp-profile-picture" className="cp-avatar-picker" title="Select profile picture">
            {profilePreview ? (
              <img src={profilePreview} alt="Profile preview" className="cp-avatar-image" />
            ) : (
              <UserCircleIcon className="cp-avatar-placeholder" />
            )}
            <div className="cp-avatar-overlay">
              <CameraIcon className="cp-avatar-overlay-icon" />
            </div>
          </label>
          <input
            id="cp-profile-picture"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
            onChange={handleProfilePictureChange}
            onBlur={() => setTouched((prev) => ({ ...prev, profilePicture: true }))}
            className="cp-hidden-input"
          />
          {profilePicture && (
            <small className="cp-file-meta">
              Selected: {profilePicture.name} ({(profilePicture.size / 1024 / 1024).toFixed(2)} MB)
            </small>
          )}
          {touched.profilePicture && errors.profilePicture && <small className="cp-error">{errors.profilePicture}</small>}
        </div>

        <Field label="User ID" name="userId" value={form.userId} onChange={handleChange} onBlur={handleBlur} error={touched.userId ? errors.userId : ''} type="number" required />
        <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName ? errors.firstName : ''} required />
        <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName ? errors.lastName : ''} required />
        <Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} onBlur={handleBlur} error={touched.middleName ? errors.middleName : ''} />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : ''} required />
        <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber ? errors.phoneNumber : ''} required />
        <Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} onBlur={handleBlur} error={touched.dateOfBirth ? errors.dateOfBirth : ''} />

        <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur} options={['Male', 'Female', 'Other', 'Prefer not to say']} error={touched.gender ? errors.gender : ''} />
        <SelectField label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} onBlur={handleBlur} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} error={touched.bloodGroup ? errors.bloodGroup : ''} />

        <Field label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} onBlur={handleBlur} error={touched.addressLine1 ? errors.addressLine1 : ''} />
        <Field label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} onBlur={handleBlur} error={touched.addressLine2 ? errors.addressLine2 : ''} />
        <Field label="City" name="city" value={form.city} onChange={handleChange} onBlur={handleBlur} error={touched.city ? errors.city : ''} />
        <Field label="State" name="state" value={form.state} onChange={handleChange} onBlur={handleBlur} error={touched.state ? errors.state : ''} />
        <Field label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} onBlur={handleBlur} error={touched.postalCode ? errors.postalCode : ''} />
        <Field label="Country" name="country" value={form.country} onChange={handleChange} onBlur={handleBlur} error={touched.country ? errors.country : ''} />

        <Field label="Emergency Contact Name" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactName ? errors.emergencyContactName : ''} />
        <Field label="Emergency Contact Phone" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactPhone ? errors.emergencyContactPhone : ''} />
        <Field label="Emergency Contact Relation" name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactRelation ? errors.emergencyContactRelation : ''} />

        <TextAreaField label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} onBlur={handleBlur} error={touched.allergies ? errors.allergies : ''} />
        <TextAreaField label="Chronic Conditions" name="chronicConditions" value={form.chronicConditions} onChange={handleChange} onBlur={handleBlur} error={touched.chronicConditions ? errors.chronicConditions : ''} />
        <TextAreaField label="Current Medications" name="currentMedications" value={form.currentMedications} onChange={handleChange} onBlur={handleBlur} error={touched.currentMedications ? errors.currentMedications : ''} />

        <footer className="cp-actions cp-field-full">
          <button className="cp-btn cp-btn-secondary" type="button" onClick={() => navigate('/patient/profile')}>Cancel</button>
          <button className="cp-btn cp-btn-primary" type="submit" disabled={submitting}>
            <UserPlusIcon className="cp-btn-icon" />
            {submitting ? 'Registering...' : 'Register Patient'}
          </button>
        </footer>
      </form>
    </div>
  );
};

const Field = ({ label, name, value, onChange, onBlur, error, type = 'text', required = false }) => (
  <label className="cp-field">
    <span>
      {label}
      {required && <strong className="cp-required">*</strong>}
    </span>
    <input
      name={name}
      type={type}
      min={type === 'number' ? '1' : undefined}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={error ? 'cp-input-error' : ''}
      autoComplete="off"
    />
    {error && <small className="cp-error">{error}</small>}
  </label>
);

const SelectField = ({ label, name, value, onChange, onBlur, error, options }) => (
  <label className="cp-field">
    <span>{label}</span>
    <select name={name} value={value} onChange={onChange} onBlur={onBlur} className={error ? 'cp-input-error' : ''}>
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {error && <small className="cp-error">{error}</small>}
  </label>
);

const TextAreaField = ({ label, name, value, onChange, onBlur, error }) => (
  <label className="cp-field cp-field-full">
    <span>{label}</span>
    <textarea name={name} value={value} onChange={onChange} onBlur={onBlur} rows={3} className={error ? 'cp-input-error' : ''} />
    {error && <small className="cp-error">{error}</small>}
  </label>
);

export default CreateProfile;
