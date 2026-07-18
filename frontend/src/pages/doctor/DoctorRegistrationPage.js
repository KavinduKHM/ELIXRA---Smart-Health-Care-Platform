import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerDoctor } from '../../services/doctorService';
import SPECIALTIES from '../../constants/specialties';
import '../../components/patient/PatientRegister.css';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  specialty: '',
  qualification: '',
  experienceYears: '',
  bio: '',
  consultationFee: '',
  averageConsultationDuration: '',
};

const validateField = (name, value, form) => {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  switch (name) {
    case 'firstName':
    case 'lastName':
      if (!trimmed) return 'This field is required.';
      if (!/^[a-zA-Z\s'-]{2,40}$/.test(trimmed)) return 'Use 2-40 letters only.';
      return '';
    case 'email':
      if (!trimmed) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email format.';
      return '';
    case 'password':
      if (!value) return 'Password is required.';
      if (String(value).length < 6) return 'Password must be at least 6 characters.';
      return '';
    case 'confirmPassword':
      if (!value) return 'Please confirm your password.';
      if (form && value !== form.password) return 'Passwords do not match.';
      return '';
    case 'phoneNumber':
      if (trimmed && !/^\d{10}$/.test(trimmed)) return 'Phone number must be exactly 10 digits.';
      return '';
    case 'specialty':
      if (!trimmed) return 'Specialty is required.';
      return '';
    case 'experienceYears':
      if (trimmed !== '' && Number(trimmed) < 0) return 'Experience cannot be negative.';
      return '';
    case 'consultationFee':
      if (trimmed !== '' && Number(trimmed) <= 0) return 'Fee must be greater than 0.';
      return '';
    case 'averageConsultationDuration':
      if (trimmed !== '' && Number(trimmed) <= 0) return 'Duration must be greater than 0.';
      return '';
    default:
      return '';
  }
};

const DoctorRegistrationPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (message.type !== 'error' || !message.text) return undefined;
    const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, value, next),
        ...(name === 'password' ? { confirmPassword: validateField('confirmPassword', next.confirmPassword, next) } : {}),
      }));
      return next;
    });
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value, form) }));
  };

  const validateAll = () => {
    const nextErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key], form);
      if (err) nextErrors[key] = err;
    });
    setErrors(nextErrors);
    const allTouched = {};
    Object.keys(form).forEach((key) => { allTouched[key] = true; });
    setTouched(allTouched);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateAll()) {
      setMessage({ type: 'error', text: 'Please fix the highlighted fields before submitting.' });
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phoneNumber: form.phoneNumber.replace(/\D/g, '') || null,
      specialty: form.specialty.trim(),
      qualification: form.qualification.trim() || null,
      experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears),
      bio: form.bio.trim() || null,
      consultationFee: form.consultationFee === '' ? null : Number(form.consultationFee),
      averageConsultationDuration:
        form.averageConsultationDuration === '' ? null : Number(form.averageConsultationDuration),
    };

    setSubmitting(true);
    try {
      await registerDoctor(payload);
      setSuccess(true);
    } catch (error) {
      const responseData = error?.response?.data;
      const firstValidationError = responseData?.errors ? Object.values(responseData.errors)[0] : null;
      const text = firstValidationError || responseData?.message || 'Doctor registration failed. Please try again.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-shell">
      {success && (
        <section className="register-success-overlay" role="status" aria-live="polite">
          <div className="register-success-modal">
            <div className="register-success-icon" aria-hidden="true">✓</div>
            <h3>Registration Successful</h3>
            <p>Your doctor profile has been created. Sign in to set your availability and start accepting appointments.</p>
            <div className="register-success-actions">
              <button
                type="button"
                className="register-inline-button"
                onClick={() => navigate('/login', { state: { requiredRole: 'doctor' } })}
              >
                Continue to Login
              </button>
            </div>
          </div>
        </section>
      )}

      <header className="register-header">
        <div>
          <h1>Doctor Registration</h1>
          <p>Join ELIXRA and start consulting with patients online.</p>
        </div>
        <Link className="register-link" to="/login">Back to Login</Link>
      </header>

      {message.type === 'error' && message.text && (
        <section className="register-alert register-alert-error" role="alert">
          <span>{message.text}</span>
        </section>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName ? errors.firstName : ''} required />
        <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName ? errors.lastName : ''} required />

        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : ''} required />
        <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber ? errors.phoneNumber : ''} helperText="10 digits (optional)" />

        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur} error={touched.password ? errors.password : ''} required helperText="Used to sign in. Minimum 6 characters." />
        <Field label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={touched.confirmPassword ? errors.confirmPassword : ''} required />

        <SelectField label="Specialty" name="specialty" value={form.specialty} onChange={handleChange} onBlur={handleBlur} options={SPECIALTIES} error={touched.specialty ? errors.specialty : ''} required />
        <Field label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} onBlur={handleBlur} error={touched.qualification ? errors.qualification : ''} helperText="e.g. MBBS, MD" />

        <Field label="Experience (years)" name="experienceYears" type="number" value={form.experienceYears} onChange={handleChange} onBlur={handleBlur} error={touched.experienceYears ? errors.experienceYears : ''} />
        <Field label="Consultation Fee" name="consultationFee" type="number" value={form.consultationFee} onChange={handleChange} onBlur={handleBlur} error={touched.consultationFee ? errors.consultationFee : ''} helperText="Amount per session" />
        <Field label="Avg. Consultation Duration (min)" name="averageConsultationDuration" type="number" value={form.averageConsultationDuration} onChange={handleChange} onBlur={handleBlur} error={touched.averageConsultationDuration ? errors.averageConsultationDuration : ''} />

        <label className="register-field register-field-full">
          <span>Bio</span>
          <textarea name="bio" rows={3} value={form.bio} onChange={handleChange} onBlur={handleBlur} placeholder="Tell patients about your experience and approach." />
        </label>

        <footer className="register-actions register-field-full">
          <button className="register-btn-secondary" type="button" onClick={() => navigate('/login')} disabled={submitting}>
            Cancel
          </button>
          <button className="register-btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register as Doctor'}
          </button>
        </footer>
      </form>
    </div>
  );
};

const Field = ({ label, name, value, onChange, onBlur, error, type = 'text', required = false, helperText = '' }) => (
  <label className="register-field">
    <span>
      {label}
      {required && <strong className="register-required">*</strong>}
    </span>
    <input
      name={name}
      type={type}
      min={type === 'number' ? '0' : undefined}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      required={required}
      className={error ? 'register-input-error' : ''}
      autoComplete="off"
      aria-invalid={Boolean(error)}
    />
    {!error && helperText && <small className="muted">{helperText}</small>}
    {error && <small className="register-error">{error}</small>}
  </label>
);

const SelectField = ({ label, name, value, onChange, onBlur, error, options, required = false }) => (
  <label className="register-field">
    <span>
      {label}
      {required && <strong className="register-required">*</strong>}
    </span>
    <select
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={error ? 'register-input-error' : ''}
      aria-invalid={Boolean(error)}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    {error && <small className="register-error">{error}</small>}
  </label>
);

export default DoctorRegistrationPage;
