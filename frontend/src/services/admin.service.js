import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const adminApi = createApiClient(serviceUrls.admin);

export async function getPatientStats() {
  const res = await adminApi.get('/patients/stats');
  return res.data;
}

export async function listPatients() {
  const res = await adminApi.get('/patients');
  return res.data;
}

export async function searchPatientsByName(name) {
  const res = await adminApi.get('/patients/search', { params: { name } });
  return res.data;
}

export async function setPatientActive(patientId, active) {
  const res = await adminApi.put(`/patients/${patientId}/status`, null, { params: { active } });
  return res.data;
}
