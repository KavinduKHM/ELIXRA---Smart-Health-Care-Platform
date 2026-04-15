import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';
import { storage } from '../lib/storage';
import { getPatientByUserId, registerPatient } from './patient.service';
import { getDoctorByUserId, registerDoctor } from './doctor.service';

const authApi = createApiClient(serviceUrls.auth);

function normalizeAuthResponse(data) {
  if (!data || typeof data !== 'object') return null;

  // Support common shapes:
  // { accessToken, refreshToken, role, userId }
  // { token, refreshToken, role, id }
  // { jwt, role, userId }
  const accessToken = data.accessToken || data.token || data.jwt;
  const refreshToken = data.refreshToken;
  const role = data.role || data.userRole || data.authorities?.[0];
  const userId = data.userId ?? data.id ?? data.user?.id;

  if (!accessToken || !role || userId === undefined || userId === null) {
    return { ...data, accessToken, refreshToken, role, userId };
  }

  return { accessToken, refreshToken, role, userId };
}

export async function login(payload) {
  // Preferred: dedicated auth-service (if available)
  try {
    const res = await authApi.post('/login', payload);
    return normalizeAuthResponse(res.data);
  } catch (e) {
    // Fallback: this repo's docker-compose does not include an auth service.
    // Allow dev login by ID so the rest of the platform can be exercised.
    const status = e?.response?.status;
    if (status && status !== 404) throw e;

    const { role, userId } = payload || {};
    if (!userId) throw e;

    // Validate the ID exists.
    if (role === 'PATIENT') await getPatientByUserId(userId);
    if (role === 'DOCTOR') await getDoctorByUserId(userId);

    return {
      accessToken: 'dev',
      refreshToken: null,
      role,
      userId: String(userId),
    };
  }
}

export async function register(payload) {
  // Preferred: dedicated auth-service (if available)
  try {
    const res = await authApi.post('/register', payload);
    return res.data;
  } catch (e) {
    const status = e?.response?.status;
    if (status && status !== 404) throw e;

    // Fallback: register in patient-service / doctor-service
    if (payload?.role === 'PATIENT') return registerPatient(payload);
    if (payload?.role === 'DOCTOR') return registerDoctor(payload);
    throw e;
  }
}

export async function refreshToken() {
  const token = storage.getRefreshToken();
  if (!token) return null;

  const res = await authApi.post('/refresh', { refreshToken: token });
  const normalized = normalizeAuthResponse(res.data);

  if (normalized?.accessToken) {
    storage.setAccessToken(normalized.accessToken);
  }
  if (normalized?.refreshToken) {
    storage.setRefreshToken(normalized.refreshToken);
  }
  if (normalized?.role) {
    storage.setUserRole(normalized.role);
  }
  if (normalized?.userId !== undefined && normalized?.userId !== null) {
    storage.setUserId(normalized.userId);
  }

  return normalized;
}
