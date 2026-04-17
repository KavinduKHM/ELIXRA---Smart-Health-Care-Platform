import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './UserManagement.css';

const PATIENT_BASE = 'http://localhost:8082';
const APPOINTMENT_BASE = 'http://localhost:8084';
const CLOUDINARY_CLOUD_NAME = 'dwona3xzj';

const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

const CHART_COLORS = ['#2f80ed', '#27ae60', '#f2a33a', '#6f4bc5'];

const extractArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.appointments)) return payload.appointments;
  if (Array.isArray(payload?.prescriptions)) return payload.prescriptions;
  if (Array.isArray(payload?.documents)) return payload.documents;
  if (Array.isArray(payload?.records)) return payload.records;
  return undefined;
};

const requestFirstSuccess = async (requests, extractor = extractArrayPayload) => {
  let sawEmptyArray = false;

  for (let i = 0; i < requests.length; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await requests[i]();
      const payload = response?.data;
      const extracted = extractor(payload);

      if (extracted !== undefined) {
        if (Array.isArray(extracted) && extracted.length === 0) {
          sawEmptyArray = true;
          continue;
        }
        return extracted;
      }
    } catch (error) {
      // Try next endpoint option.
    }
  }

  if (sawEmptyArray) {
    return [];
  }

  throw new Error('No endpoint returned data');
};

const normalizeStatus = (raw) => {
  const val = String(raw ?? '').toLowerCase();
  if (val === 'active' || val === 'enabled' || val === 'true') return STATUS.ACTIVE;
  if (val === 'inactive' || val === 'disabled' || val === 'false') return STATUS.INACTIVE;
  return STATUS.ACTIVE;
};

const normalizePatient = (item) => {
  const backendId = item?.id || item?._id || item?.userId || `tmp-${Math.random().toString(36).slice(2, 10)}`;
  const firstName = item?.firstName || item?.firstname || '';
  const lastName = item?.lastName || item?.lastname || '';
  const fullNameCandidate = [firstName, lastName].filter(Boolean).join(' ').trim();

  return {
    id: `patient-${backendId}`,
    backendId,
    userId: item?.userId || item?.user?.id || null,
    fullName: item?.name || item?.fullName || fullNameCandidate || 'Unknown Patient',
    email: item?.email || item?.mail || `patient-${backendId}@example.com`,
    phone: item?.phone || item?.phoneNumber || item?.mobile || item?.contactNo || 'Not available',
    city: item?.city || item?.address?.city || 'Not provided',
    status: normalizeStatus(item?.status ?? item?.active ?? item?.isActive),
    createdAt: item?.createdAt || item?.createdDate || new Date().toISOString(),
    raw: item
  };
};

const resolveCloudinaryUrl = (value) => {
  if (!value) return '';
  const candidate = String(value).trim();
  if (!candidate) return '';

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  // If backend returns only public ID, build a Cloudinary delivery URL.
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${candidate}`;
};

const UserManagement = () => {
  const [patients, setPatients] = useState([]);
  const [showAllPatients, setShowAllPatients] = useState(false);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsTab, setDetailsTab] = useState('overview');

  const [documents, setDocuments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientProfile, setSelectedPatientProfile] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState('');

  const [modalState, setModalState] = useState({
    open: false,
    action: '',
    patient: null,
    reason: '',
    confirmText: '',
    error: '',
    processing: false
  });

  const [toast, setToast] = useState({ open: false, type: 'success', message: '' });

  const authHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  const getWithOptionalAuth = async (url, headers) => {
    try {
      return await axios.get(url, { headers });
    } catch (error) {
      if (headers && Object.keys(headers).length > 0) {
        return axios.get(url);
      }
      throw error;
    }
  };

  const putWithOptionalAuth = async (url, data, headers, params) => {
    try {
      return await axios.put(url, data, { headers, params });
    } catch (error) {
      if (headers && Object.keys(headers).length > 0) {
        return axios.put(url, data, { params });
      }
      throw error;
    }
  };

  const deleteWithOptionalAuth = async (url, headers) => {
    try {
      return await axios.delete(url, { headers });
    } catch (error) {
      if (headers && Object.keys(headers).length > 0) {
        return axios.delete(url);
      }
      throw error;
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError('');

    try {
      const headers = authHeaders();

      const [patientsResult] = await Promise.allSettled([
        requestFirstSuccess([
          () => axios.get(`${PATIENT_BASE}/api/admin/patients`, { headers }),
          () => axios.get(`${PATIENT_BASE}/api/admin/patients/search?name=`, { headers }),
          () => axios.get(`${PATIENT_BASE}/api/admin/patients`),
          () => axios.get(`${PATIENT_BASE}/api/admin/patients/search?name=`)
        ])
      ]);

      const patientList =
        patientsResult.status === 'fulfilled'
          ? patientsResult.value.map((item) => normalizePatient(item))
          : [];

      setPatients(
        patientList.sort((a, b) => {
          const aNum = Number(a.backendId);
          const bNum = Number(b.backendId);

          if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
            return aNum - bNum;
          }

          return String(a.backendId).localeCompare(String(b.backendId), undefined, { numeric: true });
        })
      );

      if (patientList.length === 0) {
        setUsersError('No patient records were returned by backend APIs.');
      }
    } catch (error) {
      setPatients([]);
      setUsersError('Unable to fetch patient data from backend APIs. Please check that services are running.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!toast.open) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast({ open: false, type: 'success', message: '' });
    }, 3500);

    return () => clearTimeout(timer);
  }, [toast]);

  const validateSearch = (value) => {
    if (!value) return '';
    if (value.length > 50) return 'Search can contain up to 50 characters.';
    if (!/^[a-zA-Z0-9@.+_\-\s]+$/.test(value)) {
      return 'Search supports letters, numbers, spaces, @, ., +, _, and - only.';
    }
    return '';
  };

  const onSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value);
    setSearchError(validateSearch(value));
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const statusMatch = statusFilter === 'ALL' ? true : patient.status === statusFilter;
      const cityMatch = cityFilter === 'ALL' ? true : patient.city === cityFilter;
      const searchMatch =
        query.length === 0
          ? true
          : [patient.fullName, patient.email, patient.phone, patient.city, patient.backendId]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(query);

      return statusMatch && cityMatch && searchMatch;
    });
  }, [patients, search, statusFilter, cityFilter]);

  const cityOptions = useMemo(() => {
    const cities = new Set(
      patients
        .map((patient) => patient.city || 'Not provided')
        .filter(Boolean)
    );
    return Array.from(cities).sort((a, b) => a.localeCompare(b));
  }, [patients]);

  const visiblePatients = useMemo(() => {
    if (showAllPatients) {
      return filteredPatients;
    }
    return filteredPatients.slice(0, 8);
  }, [filteredPatients, showAllPatients]);

  const summary = useMemo(() => {
    const totalPatients = patients.length;
    const activePatients = patients.filter((p) => p.status === STATUS.ACTIVE).length;
    const inactivePatients = patients.filter((p) => p.status === STATUS.INACTIVE).length;
    const activeRate = totalPatients > 0 ? Math.round((activePatients / totalPatients) * 100) : 0;

    return {
      totalPatients,
      activePatients,
      inactivePatients,
      activeRate
    };
  }, [patients]);

  const statusChartData = useMemo(
    () => [
      { name: 'Active Patients', value: summary.activePatients, color: '#27ae60' },
      { name: 'Inactive Patients', value: summary.inactivePatients, color: '#f2a33a' }
    ],
    [summary.activePatients, summary.inactivePatients]
  );

  const registrationTrendData = useMemo(() => {
    const months = [];
    const now = new Date();

    const countByMonth = (items, monthDate) => {
      return items.filter((dateStr) => {
        const date = new Date(dateStr);
        return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth();
      }).length;
    };

    const patientCreatedDates = patients.map((p) => p.createdAt).filter(Boolean);

    for (let i = 5; i >= 0; i -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthDate.toLocaleString('en-US', { month: 'short' }),
        patients: countByMonth(patientCreatedDates, monthDate)
      });
    }

    return months;
  }, [patients]);

  const cityDistributionData = useMemo(() => {
    const cityMap = patients.reduce((acc, patient) => {
      const city = patient.city || 'Not provided';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [patients]);

  const loadPatientDetails = async (patient) => {
    setSelectedPatient(patient);
    setDetailsTab('overview');
    setDetailsError('');
    setDetailsLoading(true);

    try {
      const headers = authHeaders();
      const idCandidates = Array.from(
        new Set(
          [patient.backendId, patient.userId, patient?.raw?.userId]
            .filter((value) => value !== null && value !== undefined && value !== '')
            .map((value) => String(value).trim())
            .filter(Boolean)
        )
      );

      const buildPatientScopedUrls = (pathFactory) =>
        idCandidates.map((id) => `${PATIENT_BASE}${pathFactory(id)}`);

      const buildAppointmentScopedUrls = (pathFactory) =>
        idCandidates.map((id) => `${APPOINTMENT_BASE}${pathFactory(id)}`);

      const profilePromise = requestFirstSuccess(
        [
          ...buildPatientScopedUrls((id) => `/api/patients/${id}/profile`).map((url) => () => getWithOptionalAuth(url, headers)),
          ...buildPatientScopedUrls((id) => `/api/admin/patients/${id}`).map((url) => () => getWithOptionalAuth(url, headers))
        ],
        (payload) => payload || null
      );

      const documentsPromise = requestFirstSuccess([
        ...buildPatientScopedUrls((id) => `/api/patients/${id}/documents`).map((url) => () => getWithOptionalAuth(url, headers)),
        ...buildPatientScopedUrls((id) => `/api/admin/patients/${id}/documents`).map((url) => () => getWithOptionalAuth(url, headers)),
        ...buildPatientScopedUrls((id) => `/api/patients/${id}/documents?page=0&size=100`).map((url) => () => getWithOptionalAuth(url, headers))
      ]);

      const prescriptionsPromise = requestFirstSuccess([
        ...buildPatientScopedUrls((id) => `/api/patients/${id}/prescriptions`).map((url) => () => getWithOptionalAuth(url, headers)),
        ...buildPatientScopedUrls((id) => `/api/patients/${id}/prescriptions?page=0&size=100`).map((url) => () => getWithOptionalAuth(url, headers))
      ]);

      const historyPromise = requestFirstSuccess(
        [
          ...buildPatientScopedUrls((id) => `/api/patients/${id}/medical-history/all`).map((url) => () => getWithOptionalAuth(url, headers)),
          ...buildPatientScopedUrls((id) => `/api/patients/${id}/medical-history`).map((url) => () => getWithOptionalAuth(url, headers))
        ],
        (payload) => {
          const list = extractArrayPayload(payload);
          if (list !== undefined) return list;
          if (payload && typeof payload === 'object') return [payload];
          return undefined;
        }
      );

      const appointmentsPromise = requestFirstSuccess([
        ...buildAppointmentScopedUrls((id) => `/api/appointments/patient/${id}?page=0&size=50`).map((url) => () => getWithOptionalAuth(url, headers)),
        ...buildAppointmentScopedUrls((id) => `/api/appointments/patient/${id}`).map((url) => () => getWithOptionalAuth(url, headers)),
        ...buildAppointmentScopedUrls((id) => `/api/appointments/patient/${id}/upcoming`).map((url) => () => getWithOptionalAuth(url, headers))
      ]);

      const [profileRes, docsRes, prescriptionRes, historyRes, appointmentRes] = await Promise.allSettled([
        profilePromise,
        documentsPromise,
        prescriptionsPromise,
        historyPromise,
        appointmentsPromise
      ]);

      const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;
      const docsData = docsRes.status === 'fulfilled' ? docsRes.value : [];
      const prescriptionsData = prescriptionRes.status === 'fulfilled' ? prescriptionRes.value : [];
      const historyData = historyRes.status === 'fulfilled' ? historyRes.value : [];
      const appointmentsData = appointmentRes.status === 'fulfilled' ? appointmentRes.value : [];

      setSelectedPatientProfile(profileData);
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
      setMedicalHistory(Array.isArray(historyData) ? historyData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);

      if (
        profileRes.status === 'rejected' &&
        docsRes.status === 'rejected' &&
        prescriptionRes.status === 'rejected' &&
        historyRes.status === 'rejected' &&
        appointmentRes.status === 'rejected'
      ) {
        setDetailsError('Could not load patient medical details from APIs.');
      }
    } catch (error) {
      setDetailsError('Could not load selected patient details.');
      setSelectedPatientProfile(null);
      setDocuments([]);
      setPrescriptions([]);
      setMedicalHistory([]);
      setAppointments([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedPatient(null);
    setDetailsError('');
    setSelectedPatientProfile(null);
    setDocuments([]);
    setPrescriptions([]);
    setMedicalHistory([]);
    setAppointments([]);
  };

  const openActionModal = (action, patient) => {
    setModalState({
      open: true,
      action,
      patient,
      reason: '',
      confirmText: '',
      error: '',
      processing: false
    });
  };

  const closeModal = () => {
    if (modalState.processing) return;
    setModalState({
      open: false,
      action: '',
      patient: null,
      reason: '',
      confirmText: '',
      error: '',
      processing: false
    });
  };

  const validateAction = () => {
    if (!modalState.patient) return 'No patient selected.';

    return '';
  };

  const tryStatusUpdateApi = async (patient, nextStatus) => {
    const headers = authHeaders();
    const idCandidates = new Set(
      [patient?.backendId, patient?.userId, patient?.raw?.id, patient?.raw?.userId]
        .filter((value) => value !== null && value !== undefined && value !== '')
        .map((value) => String(value).trim())
        .filter(Boolean)
    );

    // Enrich candidate IDs from admin list to ensure we hit the real patient DB primary key.
    try {
      const adminPatientsRes = await getWithOptionalAuth(`${PATIENT_BASE}/api/admin/patients`, headers);
      const adminPatients = extractArrayPayload(adminPatientsRes?.data) || [];
      const matchedPatient = adminPatients.find((item) => {
        const sameEmail = item?.email && patient?.email && String(item.email).toLowerCase() === String(patient.email).toLowerCase();
        const samePhone = item?.phoneNumber && patient?.phone && String(item.phoneNumber) === String(patient.phone);
        const sameName = item?.fullName && patient?.fullName && String(item.fullName).toLowerCase() === String(patient.fullName).toLowerCase();
        return sameEmail || (samePhone && sameName);
      });

      if (matchedPatient?.id !== null && matchedPatient?.id !== undefined) {
        idCandidates.add(String(matchedPatient.id));
      }
      if (matchedPatient?.userId !== null && matchedPatient?.userId !== undefined) {
        idCandidates.add(String(matchedPatient.userId));
      }
    } catch (error) {
      // Continue with known ID candidates only.
    }

    const orderedIds = Array.from(idCandidates);

    for (let i = 0; i < orderedIds.length; i += 1) {
      const candidateId = orderedIds[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await putWithOptionalAuth(
          `${PATIENT_BASE}/api/admin/patients/${candidateId}/status`,
          {},
          headers,
          { active: nextStatus === STATUS.ACTIVE }
        );

        // Some backends return empty body on success; treat any 2xx as success.
        if (response && response.status >= 200 && response.status < 300) {
          let refreshedPatient = response?.data || null;

          if (!refreshedPatient || typeof refreshedPatient !== 'object') {
            try {
              // eslint-disable-next-line no-await-in-loop
              const refreshed = await getWithOptionalAuth(`${PATIENT_BASE}/api/admin/patients/${candidateId}`, headers);
              refreshedPatient = refreshed?.data || null;
            } catch (refreshError) {
              refreshedPatient = null;
            }
          }

          return {
            ok: true,
            patient: refreshedPatient
          };
        }
      } catch (error) {
        // Try next ID candidate.
      }
    }

    return {
      ok: false,
      patient: null
    };
  };

  const tryDeletePatientApi = async (patient) => {
    const headers = authHeaders();

    const idCandidates = new Set(
      [patient?.backendId, patient?.userId, patient?.raw?.id, patient?.raw?.userId]
        .filter((value) => value !== null && value !== undefined && value !== '')
        .map((value) => String(value).trim())
        .filter(Boolean)
    );

    // Enrich IDs from admin list to find actual patient DB primary key.
    try {
      const adminPatientsRes = await getWithOptionalAuth(`${PATIENT_BASE}/api/admin/patients`, headers);
      const adminPatients = extractArrayPayload(adminPatientsRes?.data) || [];
      const matchedPatient = adminPatients.find((item) => {
        const sameEmail = item?.email && patient?.email && String(item.email).toLowerCase() === String(patient.email).toLowerCase();
        const samePhone = item?.phoneNumber && patient?.phone && String(item.phoneNumber) === String(patient.phone);
        const sameName = item?.fullName && patient?.fullName && String(item.fullName).toLowerCase() === String(patient.fullName).toLowerCase();
        return sameEmail || (samePhone && sameName);
      });

      if (matchedPatient?.id !== null && matchedPatient?.id !== undefined) {
        idCandidates.add(String(matchedPatient.id));
      }
      if (matchedPatient?.userId !== null && matchedPatient?.userId !== undefined) {
        idCandidates.add(String(matchedPatient.userId));
      }
    } catch (error) {
      // Continue with known ID candidates only.
    }

    const orderedIds = Array.from(idCandidates);

    for (let i = 0; i < orderedIds.length; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await deleteWithOptionalAuth(
          `${PATIENT_BASE}/api/admin/patients/${orderedIds[i]}/permanent`,
          headers
        );

        if (response && response.status >= 200 && response.status < 300) {
          return true;
        }
      } catch (error) {
        // Try next ID candidate.
      }
    }

    return false;
  };

  const executeAction = async () => {
    const validationError = validateAction();
    if (validationError) {
      setModalState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    const { action, patient } = modalState;
    if (!patient) return;

    setModalState((prev) => ({ ...prev, processing: true, error: '' }));

    if (action === 'activate' || action === 'deactivate') {
      const nextStatus = action === 'activate' ? STATUS.ACTIVE : STATUS.INACTIVE;
      setStatusUpdatingId(patient.id);

      try {
        const statusResult = await tryStatusUpdateApi(patient, nextStatus);

        if (!statusResult.ok) {
          setModalState((prev) => ({
            ...prev,
            processing: false,
            error: `Could not ${action} this patient. Please try again.`
          }));
          return;
        }

        const updatedStatus = normalizeStatus(
          statusResult.patient?.status ?? statusResult.patient?.active ?? statusResult.patient?.isActive ?? nextStatus
        );

        setPatients((prev) =>
          prev.map((item) => (item.id === patient.id ? { ...item, status: updatedStatus } : item))
        );

        setSelectedPatient((prev) => {
          if (!prev || prev.id !== patient.id) return prev;
          return { ...prev, status: updatedStatus };
        });

        await fetchUsers();

        setToast({
          open: true,
          type: 'success',
          message: `${patient.fullName} is now ${updatedStatus}.`
        });

        closeModal();
        return;
      } finally {
        setStatusUpdatingId('');
      }
    }

    if (action === 'delete') {
      const apiSuccess = await tryDeletePatientApi(patient);

      if (!apiSuccess) {
        setModalState((prev) => ({
          ...prev,
          processing: false,
          error: 'Backend delete endpoint failed for this patient.'
        }));
        return;
      }

      await fetchUsers();

      if (selectedPatient?.id === patient.id) {
        closeDetails();
      }

      setToast({
        open: true,
        type: 'success',
        message: `${patient.fullName}'s account was deleted.`
      });

      closeModal();
    }
  };

  const getStatusClass = (status) => {
    return status === STATUS.ACTIVE ? 'um-status-badge active' : 'um-status-badge inactive';
  };

  return (
    <div className="um-page">
      <header className="um-hero">
        <div>
          <p className="um-kicker">Administration</p>
          <h1>Patient Management & Analytics</h1>
          <p className="um-subtitle">
            Manage only patient accounts here, with live user-management stats and patient-vs-doctor comparisons.
          </p>
        </div>
        <button className="um-refresh-btn" type="button" onClick={fetchUsers} disabled={loadingUsers}>
          {loadingUsers ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      <section className="um-summary-grid">
        <SummaryCard label="Total Patients" value={summary.totalPatients} />
        <SummaryCard label="Active Patients" value={summary.activePatients} tone="green" />
        <SummaryCard label="Inactive Patients" value={summary.inactivePatients} tone="amber" />
        <SummaryCard label="Cities Covered" value={cityOptions.length} tone="violet" />
        <SummaryCard label="Patient Active Rate" value={`${summary.activeRate}%`} tone="blue" />
      </section>

      {usersError && <div className="um-inline-alert">{usersError}</div>}

      <section className="um-toolbar um-toolbar-patient-only">
        <div className="um-form-field">
          <label htmlFor="searchUsers">Search patients</label>
          <input
            id="searchUsers"
            type="text"
            value={search}
            onChange={onSearchChange}
            placeholder="Search by name, email, phone, city, or patient ID"
            maxLength={50}
          />
          {searchError && <span className="um-field-error">{searchError}</span>}
        </div>

        <div className="um-form-field">
          <label htmlFor="statusFilter">Status</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value={STATUS.ACTIVE}>Active</option>
            <option value={STATUS.INACTIVE}>Inactive</option>
          </select>
        </div>

        <div className="um-form-field">
          <label htmlFor="cityFilter">City</label>
          <select
            id="cityFilter"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="ALL">All Cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="um-table-wrap">
        {loadingUsers ? (
          <div className="um-loading">Loading patients...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="um-empty">No patient records found for the selected filters.</div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Status</th>
                <th>City</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePatients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div className="um-user-cell">
                      <ProfileAvatar
                        src={resolveCloudinaryUrl(
                          patient.raw?.profilePictureUrl || patient.raw?.profilePicture
                        )}
                        alt={patient.fullName}
                        className="um-avatar"
                      />
                      <div>
                        <p className="um-cell-title">{patient.fullName}</p>
                        <p className="um-cell-sub">{patient.email}</p>
                        <p className="um-cell-sub">{patient.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p className="um-cell-sub">{patient.backendId}</p>
                  </td>
                  <td>
                    <span className={getStatusClass(patient.status)}>{patient.status}</span>
                  </td>
                  <td>{patient.city}</td>
                  <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="um-action-row">
                      <button type="button" className="um-btn muted" onClick={() => loadPatientDetails(patient)}>
                        View details
                      </button>
                      {patient.status === STATUS.ACTIVE ? (
                        <button
                          type="button"
                          className="um-btn warning"
                          onClick={() => openActionModal('deactivate', patient)}
                          disabled={statusUpdatingId === patient.id}
                        >
                          {statusUpdatingId === patient.id ? 'Updating...' : 'Deactivate'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="um-btn success"
                          onClick={() => openActionModal('activate', patient)}
                          disabled={statusUpdatingId === patient.id}
                        >
                          {statusUpdatingId === patient.id ? 'Updating...' : 'Activate'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="um-btn danger"
                        onClick={() => openActionModal('delete', patient)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {filteredPatients.length > 8 && (
        <div className="um-table-footer-actions">
          <button
            type="button"
            className="um-btn muted"
            onClick={() => setShowAllPatients((prev) => !prev)}
          >
            {showAllPatients ? 'Show Less' : `View All (${filteredPatients.length})`}
          </button>
        </div>
      )}

      <section className="um-analytics-grid um-analytics-grid-bottom">
        <article className="um-chart-card um-chart-card-compact">
          <h3>Patient Status Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={62} dataKey="value" label>
                {statusChartData.map((entry, index) => (
                  <Cell key={`status-pie-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="um-chart-card um-chart-card-compact">
          <h3>Patients by City (Top 8)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={cityDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7dde8" />
              <XAxis dataKey="city" stroke="#607086" />
              <YAxis allowDecimals={false} stroke="#607086" />
              <Tooltip />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {cityDistributionData.map((entry, index) => (
                  <Cell key={`city-bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="um-chart-card um-chart-card-compact">
          <h3>6-Month Registration Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={registrationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7dde8" />
              <XAxis dataKey="month" stroke="#607086" />
              <YAxis allowDecimals={false} stroke="#607086" />
              <Tooltip />
              <Area type="monotone" dataKey="patients" stroke="#2f80ed" fill="#9bc0fb" fillOpacity={0.5} />
            </AreaChart>
          </ResponsiveContainer>
        </article>
      </section>

      {selectedPatient && (
        <aside className="um-drawer-backdrop" onClick={closeDetails} role="presentation">
          <div className="um-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="um-drawer-head">
              <div>
                <h2>{selectedPatient.fullName}</h2>
                <p>{selectedPatient.email}</p>
              </div>
              <ProfileAvatar
                src={resolveCloudinaryUrl(
                  selectedPatientProfile?.profilePictureUrl ||
                  selectedPatientProfile?.profilePicture ||
                  selectedPatient.raw?.profilePictureUrl ||
                  selectedPatient.raw?.profilePicture
                )}
                alt={selectedPatient.fullName}
                className="um-avatar um-avatar-large"
              />
              <button type="button" className="um-close-btn" onClick={closeDetails}>
                Close
              </button>
            </div>

            <div className="um-drawer-tabs">
              <button type="button" className={detailsTab === 'overview' ? 'active' : ''} onClick={() => setDetailsTab('overview')}>
                Overview
              </button>
              <button type="button" className={detailsTab === 'documents' ? 'active' : ''} onClick={() => setDetailsTab('documents')}>
                Documents
              </button>
              <button type="button" className={detailsTab === 'prescriptions' ? 'active' : ''} onClick={() => setDetailsTab('prescriptions')}>
                Prescriptions
              </button>
              <button type="button" className={detailsTab === 'medical-history' ? 'active' : ''} onClick={() => setDetailsTab('medical-history')}>
                Medical History
              </button>
              <button type="button" className={detailsTab === 'appointments' ? 'active' : ''} onClick={() => setDetailsTab('appointments')}>
                Appointments
              </button>
            </div>

            {detailsLoading ? (
              <div className="um-loading">Loading patient details...</div>
            ) : (
              <div className="um-drawer-content">
                {detailsError && <div className="um-inline-alert">{detailsError}</div>}

                {detailsTab === 'overview' && (
                  <div className="um-overview-grid">
                    <InfoItem label="Patient ID" value={selectedPatient.backendId} />
                    <InfoItem label="Status" value={selectedPatient.status} />
                    <InfoItem label="Phone" value={selectedPatient.phone} />
                    <InfoItem label="City" value={selectedPatient.city} />
                    <InfoItem
                      label="Created At"
                      value={new Date(selectedPatient.createdAt).toLocaleString()}
                    />
                    <InfoItem label="Blood Group" value={selectedPatientProfile?.bloodGroup} />
                    <InfoItem label="Gender" value={selectedPatientProfile?.gender} />
                    <InfoItem label="Allergies" value={selectedPatientProfile?.allergies} />
                    <InfoItem label="Documents" value={documents.length} />
                    <InfoItem label="Prescriptions" value={prescriptions.length} />
                    <InfoItem label="Medical History" value={medicalHistory.length} />
                    <InfoItem label="Appointments" value={appointments.length} />
                  </div>
                )}

                {detailsTab === 'documents' && (
                  <RecordList
                    title="Medical Documents"
                    records={documents}
                    emptyLabel="No documents available for this patient."
                    renderItem={(item) => (
                      <>
                        <p className="um-record-title">{item.name || item.fileName || 'Document'}</p>
                        <p className="um-record-sub">Type: {item.type || item.documentType || 'Unknown'}</p>
                      </>
                    )}
                  />
                )}

                {detailsTab === 'prescriptions' && (
                  <RecordList
                    title="Prescriptions"
                    records={prescriptions}
                    emptyLabel="No prescriptions available for this patient."
                    renderItem={(item) => (
                      <>
                        <p className="um-record-title">{item.diagnosis || item.medication || 'Prescription'}</p>
                        <p className="um-record-sub">Doctor: {item.doctorName || item.doctorId || 'N/A'}</p>
                        <p className="um-record-sub">
                          Valid Until: {item.validUntil ? new Date(item.validUntil).toLocaleDateString() : 'N/A'}
                        </p>
                      </>
                    )}
                  />
                )}

                {detailsTab === 'medical-history' && (
                  <RecordList
                    title="Medical History"
                    records={medicalHistory}
                    emptyLabel="No medical history available for this patient."
                    renderItem={(item) => (
                      <>
                        <p className="um-record-title">Medical History Record</p>
                        <DynamicMedicalHistoryFields item={item} />
                      </>
                    )}
                  />
                )}

                {detailsTab === 'appointments' && (
                  <RecordList
                    title="Appointments"
                    records={appointments}
                    emptyLabel="No appointments available for this patient."
                    renderItem={(item) => (
                      <>
                        <p className="um-record-title">Status: {item.status || 'Unknown'}</p>
                        <p className="um-record-sub">
                          Time: {item.appointmentTime ? new Date(item.appointmentTime).toLocaleString() : 'N/A'}
                        </p>
                        <p className="um-record-sub">Doctor ID: {item.doctorId || item.doctorName || 'N/A'}</p>
                      </>
                    )}
                  />
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem' }}>
                  <button
                    type="button"
                    className="um-btn muted"
                    onClick={() => { window.location.href = '/admin/user-management'; }}
                  >
                    Back to Patient Management
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {modalState.open && (
        <div className="um-modal-backdrop" role="presentation">
          <div className="um-modal" role="dialog" aria-modal="true">
            <h3>
              {modalState.action === 'activate' && 'Activate Patient Account'}
              {modalState.action === 'deactivate' && 'Deactivate Patient Account'}
              {modalState.action === 'delete' && 'Delete Patient Account'}
            </h3>
            <p>
              Patient: <strong>{modalState.patient?.fullName}</strong>
            </p>

            {(modalState.action === 'activate' || modalState.action === 'deactivate') && (
              <p>
                {modalState.action === 'activate'
                  ? 'This will set the patient account to ACTIVE.'
                  : 'This will set the patient account to INACTIVE.'}
              </p>
            )}

            {modalState.action === 'delete' && (
              <p>
                This will permanently delete this patient and all related records.
              </p>
            )}

            {modalState.error && <p className="um-field-error">{modalState.error}</p>}

            <div className="um-modal-actions">
              <button type="button" className="um-btn muted" onClick={closeModal} disabled={modalState.processing}>
                Cancel
              </button>
              <button
                type="button"
                className={`um-btn ${modalState.action === 'delete' ? 'danger' : 'success'}`}
                onClick={executeAction}
                disabled={modalState.processing}
              >
                {modalState.processing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.open && <div className={`um-toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

const SummaryCard = ({ label, value, tone = 'neutral' }) => (
  <article className={`um-summary-card ${tone}`}>
    <p>{label}</p>
    <h3>{value}</h3>
  </article>
);

const InfoItem = ({ label, value }) => (
  <div className="um-info-item">
    <span>{label}</span>
    <p>{value || 'N/A'}</p>
  </div>
);

const DynamicMedicalHistoryFields = ({ item }) => {
  const fields = Object.entries(item || {}).filter(([key, value]) => {
    if (key === '__v') return false;
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'object') return false;
    return true;
  });

  if (fields.length === 0) {
    return <p className="um-record-sub">No medical history fields returned by API.</p>;
  }

  return (
    <>
      {fields.map(([key, value]) => (
        <p key={key} className="um-record-sub">
          {key}: {String(value)}
        </p>
      ))}
    </>
  );
};

const ProfileAvatar = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(src) && !imageError;

  if (!hasImage) {
    return (
      <div className={`um-avatar-fallback ${className || ''}`} aria-label={alt}>
        <UserCircleIcon className="um-avatar-icon" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

const RecordList = ({ title, records, emptyLabel, renderItem }) => (
  <section>
    <h4 className="um-record-heading">{title}</h4>
    {records.length === 0 ? (
      <p className="um-empty">{emptyLabel}</p>
    ) : (
      <div className="um-record-list">
        {records.map((item, index) => (
          <article key={item.id || item._id || index} className="um-record-item">
            {renderItem(item)}
          </article>
        ))}
      </div>
    )}
  </section>
);

export default UserManagement;
