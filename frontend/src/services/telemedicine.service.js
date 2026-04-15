import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const telemedApi = createApiClient(serviceUrls.telemed);

export async function joinVideoSession(payload) {
  // POST /api/video/sessions/join
  const res = await telemedApi.post('/sessions/join', payload);
  return res.data;
}

export async function createVideoSession(payload) {
  // POST /api/video/sessions
  const res = await telemedApi.post('/sessions', payload);
  return res.data;
}

export async function endVideoSession(payload) {
  // POST /api/video/sessions/end
  const res = await telemedApi.post('/sessions/end', payload);
  return res.data;
}

export async function getSessionDetails(sessionId) {
  // GET /api/video/sessions/{id}
  const res = await telemedApi.get(`/sessions/${sessionId}`);
  return res.data;
}

export async function canJoinSession(sessionId, { userId, userRole }) {
  // GET /api/video/sessions/{id}/can-join?userId=...&userRole=...
  const res = await telemedApi.get(`/sessions/${sessionId}/can-join`, { params: { userId, userRole } });
  return res.data;
}
