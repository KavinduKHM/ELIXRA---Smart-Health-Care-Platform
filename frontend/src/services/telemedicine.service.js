import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const telemedApi = createApiClient(serviceUrls.telemed);

export async function joinVideoSession(payload) {
  // expected: POST /video/sessions/join
  const res = await telemedApi.post('/sessions/join', payload);
  return res.data;
}

export async function createVideoSession(payload) {
  const res = await telemedApi.post('/sessions', payload);
  return res.data;
}

export async function endVideoSession(payload) {
  const res = await telemedApi.post('/sessions/end', payload);
  return res.data;
}
