// src/pages/auth/LoginPage.js
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginPatient, loginDoctor } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ROLES = [
  { key: 'patient', label: 'Patient' },
  { key: 'doctor', label: 'Doctor' },
];

const buildName = (profile) => {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return name || profile?.fullName || profile?.email || 'User';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const initialRole = location?.state?.requiredRole === 'doctor' ? 'doctor' : 'patient';
  const [role, setRole] = useState(initialRole);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const aside = useMemo(
    () =>
      role === 'doctor'
        ? {
            title: 'Welcome back, Doctor.',
            copy: 'Manage your availability, review appointment requests, run video consultations and issue prescriptions — all in one place.',
            points: ['Set available dates & slots', 'Approve appointments & start video calls', 'Issue digital prescriptions'],
          }
        : {
            title: 'Your health, simplified.',
            copy: 'Book appointments with verified specialists, join secure video consultations and keep every prescription and report in one secure place.',
            points: ['Search doctors by specialization', 'Book & join video consultations', 'Access prescriptions & medical reports'],
          },
    [role]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const request = role === 'doctor' ? loginDoctor : loginPatient;
      const { data } = await request(email, password);

      const user = {
        role,
        id: data?.id,
        name: buildName(data),
        email: data?.email || email,
      };
      signIn(user);

      navigate(`/${role}/${user.id}/appointments`, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;
      if (status === 401) {
        setError(serverMessage || 'Invalid email or password.');
      } else if (err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Please make sure the backend services are running.');
      } else {
        setError(serverMessage || 'Something went wrong while signing in. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const asideStyle = {
    backgroundImage: `linear-gradient(160deg, rgba(3,105,161,0.35) 0%, rgba(7,89,133,0.55) 100%), url(${process.env.PUBLIC_URL}/health-team.webp)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="auth-shell">
      <aside className="auth-aside" style={asideStyle}>
        <div>
          <div className="auth-aside-badge">
            <span className="brandDot" aria-hidden="true" />
            ELIXRA
          </div>
          <h2>{aside.title}</h2>
          <p>{aside.copy}</p>
        </div>
        <ul className="auth-aside-list">
          {aside.points.map((point) => (
            <li key={point} className="auth-aside-list-item">
              <span className="tick" aria-hidden="true">✓</span>
              {point}
            </li>
          ))}
        </ul>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>Sign in</h1>
          <p className="auth-card-sub">Choose your role and enter your credentials to continue.</p>

          <div className="auth-segment" role="tablist" aria-label="Select account type">
            {ROLES.map((option) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={role === option.key}
                className={role === option.key ? 'is-active' : ''}
                onClick={() => {
                  setRole(option.key);
                  setError('');
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="auth-alert" role="alert" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-password-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Signing in…' : `Sign in as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}
            </button>
          </form>

          <p className="auth-foot">
            New to ELIXRA?{' '}
            <Link to="/register" state={{ requiredRole: role }}>
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
