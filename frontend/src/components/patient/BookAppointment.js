import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
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
import { format } from 'date-fns';
import './BookAppointment.css';

const PATIENT_API = import.meta.env.VITE_API_URL
  || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '')
  || 'http://localhost:8082';
const APPOINTMENT_API = 'http://localhost:8084';
const COMING_SOON_DAYS = 7;

const STATUS_COLORS = {
  SCHEDULED: '#2f80ed',
  COMPLETED: '#1f9d67',
  CANCELLED: '#cb4b4b',
  NO_SHOW: '#f59f00',
  RESCHEDULED: '#6f4cdc',
  UNKNOWN: '#7b8794'
};

const parseJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const extractUserIdFromToken = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  for (const key of ['userId', 'id', 'user_id', 'sub']) {
    const value = Number(payload[key]);
    if (Number.isInteger(value) && value > 0) return value;
  }
  return null;
};

const normalizeAppointments = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  return [];
};

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState('6');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const authHeaders = useMemo(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('accessToken');
        const fallbackPatientId = Number(localStorage.getItem('patientId'));

        let resolvedPatientId = null;
        const loggedInUserId = token ? extractUserIdFromToken(token) : null;

        if (loggedInUserId) {
          try {
            const profileRes = await axios.get(`${PATIENT_API}/api/patients/user/${loggedInUserId}`, { headers: authHeaders });
            resolvedPatientId = Number(profileRes?.data?.id) || null;
          } catch {
            // Fallback below.
          }
        }

        if (!resolvedPatientId && Number.isInteger(fallbackPatientId) && fallbackPatientId > 0) {
          resolvedPatientId = fallbackPatientId;
        }

        if (!resolvedPatientId) {
          throw new Error('Unable to resolve logged-in patient.');
        }

        localStorage.setItem('patientId', String(resolvedPatientId));
        setPatientId(String(resolvedPatientId));

        const appointmentRes = await axios.get(
          `${APPOINTMENT_API}/api/appointments/patient/${resolvedPatientId}?page=0&size=200`,
          { headers: authHeaders }
        );

        const list = normalizeAppointments(appointmentRes.data)
          .map((item) => {
            const appointmentTime = safeDate(item.appointmentTime || item.dateTime || item.date);
            return {
              id: item.id || item.appointmentId || item._id || `${Math.random()}`,
              doctorName: item.doctorName || item.doctor?.name || item.doctor?.fullName || 'N/A',
              specialty: item.specialization || item.specialty || item.department || 'General',
              reason: item.reason || item.notes || 'N/A',
              status: String(item.status || 'UNKNOWN').toUpperCase(),
              appointmentTime,
              rawAppointmentTime: item.appointmentTime || item.dateTime || item.date || null
            };
          })
          .sort((a, b) => {
            const ta = a.appointmentTime ? a.appointmentTime.getTime() : 0;
            const tb = b.appointmentTime ? b.appointmentTime.getTime() : 0;
            return tb - ta;
          });

        setAppointments(list);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
          fetchError?.message ||
          'Failed to load appointments for current patient.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [authHeaders]);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return appointments;

    return appointments.filter((appointment) => {
      const searchable = [
        appointment.id,
        appointment.doctorName,
        appointment.specialty,
        appointment.reason,
        appointment.status,
        appointment.appointmentTime ? format(appointment.appointmentTime, 'MMM dd, yyyy h:mm a') : appointment.rawAppointmentTime
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [appointments, searchQuery]);

  const visibleAppointments = useMemo(() => {
    if (rowsPerPage === 'ALL') return filteredAppointments;
    const size = Number(rowsPerPage);
    return filteredAppointments.slice(0, size);
  }, [filteredAppointments, rowsPerPage]);

  const statusChartData = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((a) => {
      map[a.status] = (map[a.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || STATUS_COLORS.UNKNOWN
    }));
  }, [filteredAppointments]);

  const monthlyTrendData = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((a) => {
      if (!a.appointmentTime) return;
      const key = format(a.appointmentTime, 'yyyy-MM');
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map)
      .sort()
      .map((key) => ({ month: format(new Date(`${key}-01T00:00:00`), 'MMM yy'), count: map[key] }));
  }, [filteredAppointments]);

  const specialtyChartData = useMemo(() => {
    const map = {};
    filteredAppointments.forEach((a) => {
      map[a.specialty] = (map[a.specialty] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredAppointments]);

  const nextAppointment = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter((a) => a.appointmentTime && a.appointmentTime.getTime() > now && a.status !== 'CANCELLED')
      .sort((a, b) => a.appointmentTime.getTime() - b.appointmentTime.getTime())[0] || null;
  }, [appointments]);

  const todayAppointments = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endToday = startToday + (24 * 60 * 60 * 1000);

    return appointments
      .filter((a) => {
        if (!a.appointmentTime || a.status === 'CANCELLED') return false;
        const time = a.appointmentTime.getTime();
        return time >= startToday && time < endToday;
      })
      .sort((a, b) => a.appointmentTime.getTime() - b.appointmentTime.getTime());
  }, [appointments]);

  const comingSoonAppointments = useMemo(() => {
    const now = new Date();
    const startTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const upcomingLimit = new Date(now.getFullYear(), now.getMonth(), now.getDate() + COMING_SOON_DAYS + 1).getTime();

    return appointments
      .filter((a) => {
        if (!a.appointmentTime || a.status === 'CANCELLED') return false;
        const time = a.appointmentTime.getTime();
        return time >= startTomorrow && time < upcomingLimit;
      })
      .sort((a, b) => a.appointmentTime.getTime() - b.appointmentTime.getTime());
  }, [appointments]);

  if (loading) {
    return (
      <div className="ba-loading-wrap">
        <div className="ba-spinner" />
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="ba-shell">
      <header className="ba-hero">
        <div>
          <h1>My Appointments</h1>
          <p>View all appointments for the logged-in patient in one place.</p>
          <span className="ba-meta">Patient ID: {patientId || 'N/A'}</span>
        </div>
        <button className="ba-btn ba-btn-primary" type="button" onClick={() => navigate('/appointments/book')}>
          <ArrowRightCircleIcon className="ba-btn-icon" /> Go to Book Appointment
        </button>
      </header>

      {error && (
        <section className="ba-alert ba-alert-error">
          <ExclamationTriangleIcon className="ba-alert-icon" />
          <span>{error}</span>
        </section>
      )}

      {!error && nextAppointment && (
        <section className="ba-alert ba-alert-info">
          <CalendarDaysIcon className="ba-alert-icon" />
          <span>
            Next appointment: {nextAppointment.doctorName} on {format(nextAppointment.appointmentTime, 'MMM dd, yyyy h:mm a')}
          </span>
        </section>
      )}

      {!error && todayAppointments.length > 0 && (
        <section className="ba-alert ba-alert-success">
          <CheckCircleIcon className="ba-alert-icon" />
          <span>
            You have {todayAppointments.length} appointment{todayAppointments.length > 1 ? 's' : ''} today.
            {' '}First: {todayAppointments[0].doctorName} at {format(todayAppointments[0].appointmentTime, 'h:mm a')}.
          </span>
        </section>
      )}

      {!error && todayAppointments.length === 0 && comingSoonAppointments.length > 0 && (
        <section className="ba-alert ba-alert-warning">
          <CalendarDaysIcon className="ba-alert-icon" />
          <span>
            Coming soon: {comingSoonAppointments.length} appointment{comingSoonAppointments.length > 1 ? 's' : ''}
            {' '}in the next {COMING_SOON_DAYS} days. Nearest: {comingSoonAppointments[0].doctorName}
            {' '}on {format(comingSoonAppointments[0].appointmentTime, 'MMM dd, yyyy h:mm a')}.
          </span>
        </section>
      )}

      <section className="ba-table-card">
        <div className="ba-table-head">
          <h2>Appointment List</h2>
          <div className="ba-table-tools">
            <div className="ba-search-wrap">
              <MagnifyingGlassIcon className="ba-search-icon" />
              <input
                className="ba-search-input"
                type="text"
                placeholder="Search by doctor, reason, specialty..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput.trim());
                  }
                }}
              />
              <button className="ba-btn ba-btn-light" type="button" onClick={() => setSearchQuery(searchInput.trim())}>
                Search
              </button>
              <button
                className="ba-btn ba-btn-light"
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                }}
              >
                Clear
              </button>
            </div>

            <div className="ba-controls">
              <label htmlFor="rows">Rows:</label>
              <select id="rows" value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)}>
                <option value="6">6</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>
        </div>

        <div className="ba-table-wrap">
          <table className="ba-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date & Time</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleAppointments.length > 0 ? (
                visibleAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>
                      {appointment.appointmentTime
                        ? format(appointment.appointmentTime, 'MMM dd, yyyy h:mm a')
                        : appointment.rawAppointmentTime || 'N/A'}
                    </td>
                    <td>{appointment.doctorName}</td>
                    <td>{appointment.specialty}</td>
                    <td>{appointment.reason}</td>
                    <td>
                      <span className={`ba-status ba-status-${appointment.status.toLowerCase()}`}>
                        {appointment.status === 'COMPLETED' && <CheckCircleIcon className="ba-status-icon" />}
                        {appointment.status === 'CANCELLED' && <XCircleIcon className="ba-status-icon" />}
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="ba-empty">
                    {searchQuery
                      ? 'No appointments match your search.'
                      : 'No appointments found for this patient.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ba-chart-grid">
        <article className="ba-chart-card">
          <h3>Appointments by Status</h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={92}>
                  {statusChartData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="ba-empty">No data.</p>
          )}
        </article>

        <article className="ba-chart-card">
          <h3>Monthly Appointment Trend</h3>
          {monthlyTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
                <XAxis dataKey="month" stroke="#607086" />
                <YAxis allowDecimals={false} stroke="#607086" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2f80ed" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="ba-empty">No data.</p>
          )}
        </article>
      </section>

      <section className="ba-chart-grid ba-chart-grid-bottom">
        <article className="ba-chart-card ba-chart-card-full">
          <h3>Top Specialties</h3>
          {specialtyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={specialtyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
                <XAxis dataKey="name" stroke="#607086" />
                <YAxis allowDecimals={false} stroke="#607086" />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {specialtyChartData.map((item, index) => (
                    <Cell key={`${item.name}-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="ba-empty">No data.</p>
          )}
        </article>
      </section>
    </div>
  );
};

export default BookAppointment;
