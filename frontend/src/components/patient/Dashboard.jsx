import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ArrowTrendingUpIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { differenceInDays, format } from 'date-fns';
import './Dashboard.css';

const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';

const parseJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const extractUserIdFromToken = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const keys = ['userId', 'id', 'user_id', 'sub'];
  for (const key of keys) {
    const value = payload[key];
    if (value === null || value === undefined) continue;

    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

const resolveCloudinaryUrl = (value) => {
  if (!value) return '';
  const candidate = String(value).trim();
  if (!candidate) return '';

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  if (!CLOUDINARY_CLOUD_NAME) {
    return '';
  }

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${candidate}`;
};

const buildInitials = (firstName, lastName) => {
  const first = String(firstName || '').trim().charAt(0);
  const last = String(lastName || '').trim().charAt(0);
  const merged = `${first}${last}`.toUpperCase();

  return merged || 'PT';
};

const PatientDashboard = ({ patientId }) => {
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalPrescriptions: 0,
    activePrescriptions: 0,
    totalDocuments: 0,
    videoSessions: 0
  });

  const [appointmentTrend, setAppointmentTrend] = useState([]);
  const [appointmentStatusData, setAppointmentStatusData] = useState([]);
  const [prescriptionStatus, setPrescriptionStatus] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [bloodPressureData, setBloodPressureData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setDashboardError('');
    setBloodPressureData([]);

    try {
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const sessionPatientId = Number(localStorage.getItem('patientId'));
      const propPatientId = Number(patientId);
      const fallbackPatientId = Number.isInteger(sessionPatientId) && sessionPatientId > 0
        ? sessionPatientId
        : (Number.isInteger(propPatientId) && propPatientId > 0 ? propPatientId : null);

      let resolvedPatientId = null;
      let profile = null;

      const loggedInUserId = token ? extractUserIdFromToken(token) : null;
      if (loggedInUserId) {
        try {
          const byUserRes = await axios.get(
            `http://localhost:8082/api/patients/user/${loggedInUserId}`,
            { headers }
          );
          profile = byUserRes.data;
          resolvedPatientId = Number(profile?.id) || null;
        } catch (error) {
          // Fallback below if this endpoint is unavailable in a deployment.
        }
      }

      if (!resolvedPatientId && fallbackPatientId) {
        const profileRes = await axios.get(
          `http://localhost:8082/api/patients/${fallbackPatientId}/profile`,
          { headers }
        );
        profile = profileRes.data;
        resolvedPatientId = Number(profile?.id) || fallbackPatientId;
      }

      if (!resolvedPatientId || !profile) {
        throw new Error('Unable to resolve logged-in patient profile.');
      }

      setPatient(profile);
      localStorage.setItem('patientId', String(resolvedPatientId));

      const appointmentsRes = await axios.get(
        `http://localhost:8084/api/appointments/patient/${resolvedPatientId}?page=0&size=100`,
        { headers }
      );

      const appointments = appointmentsRes.data.content || [];
      const now = new Date();
      const upcoming = appointments
        .filter((a) => new Date(a.appointmentTime) > now && a.status !== 'CANCELLED')
        .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
      const completed = appointments.filter((a) => a.status === 'COMPLETED');
      const cancelled = appointments.filter((a) => a.status === 'CANCELLED');

      setStats((prev) => ({
        ...prev,
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        cancelledAppointments: cancelled.length
      }));

      setUpcomingAppointments(upcoming.slice(0, 5));
      setAppointmentTrend(generateAppointmentTrend(appointments));
      setAppointmentStatusData([
        { name: 'Completed', value: completed.length, color: '#1f9d67' },
        { name: 'Upcoming', value: upcoming.length, color: '#2f80ed' },
        { name: 'Cancelled', value: cancelled.length, color: '#e06b6b' }
      ]);

      let prescriptions = [];
      try {
        const prescriptionsRes = await axios.get(
          `http://localhost:8082/api/patients/${resolvedPatientId}/prescriptions`,
          { headers }
        );
        prescriptions = prescriptionsRes.data || [];

        const activePrescriptions = prescriptions.filter((p) => {
          if (p.active === false) return false;
          if (!p.validUntil) return true;
          return new Date(p.validUntil) > now;
        });

        setStats((prev) => ({
          ...prev,
          totalPrescriptions: prescriptions.length,
          activePrescriptions: activePrescriptions.length
        }));

        setRecentPrescriptions(
          activePrescriptions
            .sort((a, b) => new Date(b.validUntil || now) - new Date(a.validUntil || now))
            .slice(0, 4)
        );

        setPrescriptionStatus([
          { name: 'Active', value: activePrescriptions.length, color: '#1f9d67' },
          {
            name: 'Expired',
            value: Math.max(prescriptions.length - activePrescriptions.length, 0),
            color: '#f59f00'
          }
        ]);
      } catch (err) {
        setPrescriptionStatus([
          { name: 'Active', value: 0, color: '#1f9d67' },
          { name: 'Expired', value: 0, color: '#f59f00' }
        ]);
      }

      try {
        const documentsRes = await axios.get(
          `http://localhost:8082/api/patients/${resolvedPatientId}/documents`,
          { headers }
        );
        setStats((prev) => ({ ...prev, totalDocuments: documentsRes.data.length || 0 }));
      } catch (err) {
        // optional widget
      }

      try {
        const videoRes = await axios.get(
          `http://localhost:8085/api/video/patients/${resolvedPatientId}/active`,
          { headers }
        );
        setStats((prev) => ({ ...prev, videoSessions: videoRes.data.length || 0 }));
      } catch (err) {
        // optional widget
      }

      generateAlerts(appointments, prescriptions, upcoming.length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardError('Unable to load dashboard data for the logged-in patient. Please sign in again or try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const generateAppointmentTrend = (appointments) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = appointments.filter((a) => {
        const aptDate = new Date(a.appointmentTime);
        return aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
      }).length;

      last6Months.push({ month: months[date.getMonth()], appointments: count });
    }

    return last6Months;
  };

  const generateAlerts = (appointments, prescriptions, upcomingCount) => {
    const now = new Date();
    const nextAlerts = [];

    if (upcomingCount === 0) {
      nextAlerts.push({
        type: 'notice',
        title: 'No Upcoming Appointments',
        message: 'You do not have a follow-up scheduled. Book an appointment to stay on track.',
        icon: 'calendar'
      });
    } else {
      nextAlerts.push({
        type: 'success',
        title: `${upcomingCount} Upcoming Appointment${upcomingCount > 1 ? 's' : ''}`,
        message: `You have ${upcomingCount} appointment${upcomingCount > 1 ? 's' : ''} scheduled in your care plan.`,
        icon: 'check'
      });
    }

    const expiringSoon = prescriptions.filter((p) => {
      if (!p.validUntil) return false;
      const daysToExpire = differenceInDays(new Date(p.validUntil), now);
      return daysToExpire >= 0 && daysToExpire <= 7;
    });

    if (expiringSoon.length > 0) {
      nextAlerts.push({
        type: 'warning',
        title: 'Medication Expiring Soon',
        message: `${expiringSoon.length} prescription${expiringSoon.length > 1 ? 's are' : ' is'} due to expire within 7 days.`,
        icon: 'warning'
      });
    }

    const lastAppointment = appointments
      .filter((a) => a.status === 'COMPLETED')
      .sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime))[0];

    if (lastAppointment) {
      const daysSince = differenceInDays(now, new Date(lastAppointment.appointmentTime));
      if (daysSince > 90) {
        nextAlerts.push({
          type: 'warning',
          title: 'Preventive Checkup Recommended',
          message: 'It has been over 3 months since your last completed visit. Consider scheduling a preventive checkup.',
          icon: 'warning'
        });
      }
    }

    setAlerts(nextAlerts);
  };

  const nextAppointment = useMemo(() => {
    if (!upcomingAppointments.length) return null;
    return upcomingAppointments[0];
  }, [upcomingAppointments]);

  const medicationCoverage = useMemo(() => {
    if (!stats.totalPrescriptions) return 0;
    return Math.round((stats.activePrescriptions / stats.totalPrescriptions) * 100);
  }, [stats.activePrescriptions, stats.totalPrescriptions]);

  const patientAvatarUrl = useMemo(() => {
    return resolveCloudinaryUrl(
      patient?.profilePictureUrl || patient?.profilePicture || patient?.avatarUrl || patient?.photoUrl
    );
  }, [patient]);

  const patientName = useMemo(() => {
    const fullName = [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
    return fullName || 'Patient';
  }, [patient]);

  const patientInitials = useMemo(() => {
    return buildInitials(patient?.firstName, patient?.lastName);
  }, [patient]);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [patientAvatarUrl]);

  if (loading) {
    return (
      <div className="pd-loading-wrap">
        <div className="pd-loading-spinner" />
        <p>Loading patient insights...</p>
      </div>
    );
  }

  return (
    <div className="pd-shell">
      <header className="pd-header-card">
        <div className="pd-header-main">
          <div className="pd-avatar-shell" aria-label={`Patient avatar for ${patientName}`}>
            {patientAvatarUrl && !avatarLoadFailed ? (
              <img
                className="pd-avatar-image"
                src={patientAvatarUrl}
                alt={`Profile of ${patientName}`}
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div className="pd-avatar-fallback" role="img" aria-label={`Initials avatar for ${patientName}`}>
                {patientInitials === 'PT' ? <UserCircleIcon className="pd-avatar-icon" /> : patientInitials}
              </div>
            )}
          </div>

          <div className="pd-header-copy">
            <h1>Patient Health Dashboard</h1>
            <p>
              Welcome back{patient?.firstName ? `, ${patient.firstName} ${patient?.lastName || ''}` : ''}. Here is your current care snapshot.
            </p>
            <div className="pd-patient-meta">
              <span className="pd-patient-meta-pill">{patientName}</span>
              {patient?.email && <span className="pd-patient-meta-pill">{patient.email}</span>}
              {patient?.id && <span className="pd-patient-meta-pill">Patient ID: {patient.id}</span>}
            </div>
          </div>
        </div>

        <div className="pd-highlight-chip">
          <ClockIcon className="pd-chip-icon" />
          {nextAppointment
            ? `Next visit: ${format(new Date(nextAppointment.appointmentTime), 'MMM dd, h:mm a')}`
            : 'No next visit scheduled'}
        </div>
      </header>

      {dashboardError && (
        <section className="pd-alert pd-alert-error">
          <ExclamationTriangleIcon className="pd-alert-icon" />
          <div>
            <h3>Data unavailable</h3>
            <p>{dashboardError}</p>
          </div>
        </section>
      )}

      {alerts.length > 0 && (
        <section className="pd-alert-grid">
          {alerts.map((alert, idx) => (
            <article key={idx} className={`pd-alert pd-alert-${alert.type}`}>
              <div className="pd-alert-icon-wrap">
                {alert.icon === 'calendar' && <CalendarIcon className="pd-alert-icon" />}
                {alert.icon === 'warning' && <ExclamationTriangleIcon className="pd-alert-icon" />}
                {alert.icon === 'check' && <CheckBadgeIcon className="pd-alert-icon" />}
              </div>
              <div>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="pd-stats-grid">
        <StatCard
          title="Appointments"
          value={stats.totalAppointments}
          icon={<CalendarIcon className="pd-stat-icon pd-stat-icon-blue" />}
          trend={`${stats.upcomingAppointments} upcoming`}
          caption={`${stats.completedAppointments} completed this period`}
        />
        <StatCard
          title="Medication Coverage"
          value={`${medicationCoverage}%`}
          icon={<ClipboardDocumentListIcon className="pd-stat-icon pd-stat-icon-green" />}
          trend={`${stats.activePrescriptions}/${stats.totalPrescriptions} active`}
          caption="Based on active prescriptions"
        />
        <StatCard
          title="Clinical Documents"
          value={stats.totalDocuments}
          icon={<DocumentTextIcon className="pd-stat-icon pd-stat-icon-violet" />}
          trend="Records and reports"
          caption="Securely stored"
        />
        <StatCard
          title="Telemedicine"
          value={stats.videoSessions}
          icon={<VideoCameraIcon className="pd-stat-icon pd-stat-icon-red" />}
          trend="Remote sessions"
          caption="Active consultation history"
        />
      </section>

      <section className="pd-chart-grid">
        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Appointment Trend (6 months)</h2>
            <span className="pd-badge"><ArrowTrendingUpIcon className="pd-badge-icon" /> Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={appointmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7dde8" />
              <XAxis dataKey="month" stroke="#607086" />
              <YAxis allowDecimals={false} stroke="#607086" />
              <Tooltip />
              <Area type="monotone" dataKey="appointments" stroke="#2f80ed" fill="#9bc0fb" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Appointment Outcomes</h2>
            <span className="pd-badge">This cycle</span>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={appointmentStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7dde8" />
              <XAxis dataKey="name" stroke="#607086" />
              <YAxis allowDecimals={false} stroke="#607086" />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`status-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="pd-chart-grid pd-chart-grid-second">
        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Prescription Status</h2>
            <span className="pd-badge">Medication</span>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie
                data={prescriptionStatus}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {prescriptionStatus.map((entry, index) => (
                  <Cell key={`pres-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Blood Pressure Trend</h2>
            <span className="pd-badge">Last 7 days</span>
          </div>
          {bloodPressureData.length > 0 ? (
            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={bloodPressureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7dde8" />
                <XAxis dataKey="date" stroke="#607086" />
                <YAxis domain={[60, 160]} stroke="#607086" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="systolic" stroke="#d94b4b" name="Systolic" strokeWidth={2.5} />
                <Line type="monotone" dataKey="diastolic" stroke="#2f80ed" name="Diastolic" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pd-empty">No blood pressure data available in your records yet.</p>
          )}
          <p className="pd-footnote">Live vitals will appear here once available from your clinical data source.</p>
        </div>
      </section>

      <section className="pd-lists-grid">
        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Upcoming Appointments</h2>
            <button className="pd-link-btn" type="button">View all</button>
          </div>
          {upcomingAppointments.length === 0 ? (
            <p className="pd-empty">No upcoming appointments.</p>
          ) : (
            <div className="pd-list">
              {upcomingAppointments.map((apt, idx) => (
                <div key={idx} className="pd-list-row">
                  <div>
                    <p className="pd-list-title">Dr. {apt.doctorName || `ID: ${apt.doctorId}`}</p>
                    <p className="pd-list-subtitle">{apt.doctorSpecialty || 'General Medicine'}</p>
                  </div>
                  <div className="pd-list-right">
                    <p>{format(new Date(apt.appointmentTime), 'MMM dd, yyyy')}</p>
                    <span>{format(new Date(apt.appointmentTime), 'h:mm a')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pd-card">
          <div className="pd-card-head">
            <h2>Recent Prescriptions</h2>
            <button className="pd-link-btn" type="button">View all</button>
          </div>
          {recentPrescriptions.length === 0 ? (
            <p className="pd-empty">No active prescriptions available.</p>
          ) : (
            <div className="pd-list">
              {recentPrescriptions.map((pres, idx) => (
                <div key={idx} className="pd-list-row">
                  <div>
                    <p className="pd-list-title">{pres.diagnosis || 'Prescription'}</p>
                    <p className="pd-list-subtitle">Dr. {pres.doctorName || `ID: ${pres.doctorId}`}</p>
                  </div>
                  <div className="pd-list-right">
                    <span className="pd-pill-success">Active</span>
                    <p>
                      {pres.validUntil
                        ? `Valid until ${format(new Date(pres.validUntil), 'MMM dd, yyyy')}`
                        : 'No validity date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pd-actions-grid">
        <QuickActionButton
          title="Book Appointment"
          icon={<CalendarIcon className="pd-action-icon" />}
          onClick={() => { window.location.href = '/appointments/book'; }}
        />
        <QuickActionButton
          title="Upload Document"
          icon={<DocumentTextIcon className="pd-action-icon" />}
          onClick={() => { window.location.href = '/documents/upload'; }}
        />
        <QuickActionButton
          title="View Prescriptions"
          icon={<ClipboardDocumentListIcon className="pd-action-icon" />}
          onClick={() => { window.location.href = '/prescriptions'; }}
        />
        <QuickActionButton
          title="Video Consultation"
          icon={<VideoCameraIcon className="pd-action-icon" />}
          onClick={() => { window.location.href = '/video/consultations'; }}
        />
      </section>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, caption }) => (
  <article className="pd-stat-card">
    <div className="pd-stat-head">
      <p>{title}</p>
      {icon}
    </div>
    <h3>{value}</h3>
    <p className="pd-stat-trend">{trend}</p>
    <p className="pd-stat-caption">{caption}</p>
  </article>
);

const QuickActionButton = ({ title, icon, onClick }) => (
  <button className="pd-action-btn" onClick={onClick} type="button">
    {icon}
    <span>{title}</span>
  </button>
);

export default PatientDashboard;
