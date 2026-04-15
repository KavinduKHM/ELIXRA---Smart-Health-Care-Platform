import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';
import { storage } from '../lib/storage';

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
  const res = await authApi.post('/login', payload);
  return normalizeAuthResponse(res.data);
}

export async function register(payload) {
  const res = await authApi.post('/register', payload);
  return res.data;
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
