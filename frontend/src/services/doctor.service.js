import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const doctorApi = createApiClient(serviceUrls.doctors);

export async function getDoctorProfile(doctorId) {
  const res = await doctorApi.get(`/${doctorId}`);
  return res.data;
}

export async function updateDoctorProfile(doctorId, payload) {
  const res = await doctorApi.put(`/${doctorId}/profile`, payload);
  return res.data;
}

export async function searchDoctors({ q, page = 0, size = 10 } = {}) {
  const res = await doctorApi.get('/search', { params: { q: q || '', page, size } });
  return res.data;
}

export async function getDoctorByUserId(userId) {
  const res = await doctorApi.get(`/user/${userId}`);
  return res.data;
}

export async function registerDoctor(payload) {
  const res = await doctorApi.post('/register', payload);
  return res.data;
}

export async function getDoctorAvailability(doctorId) {
  const res = await doctorApi.get(`/${doctorId}/availability`);
  return res.data;
}

export async function updateDoctorAvailability(doctorId, payload) {
  const res = await doctorApi.post(`/${doctorId}/availability`, payload);
  return res.data;
}

export async function deleteDoctorAvailability(doctorId, availabilityId) {
  const res = await doctorApi.delete(`/${doctorId}/availability/${availabilityId}`);
  return res.data;
}

export async function listDoctorPatientsDocuments(doctorId, patientId) {
  const res = await doctorApi.get(`/${doctorId}/patients/${patientId}/documents`);
  return res.data;
}

export async function verifyDoctor(doctorId) {
  const res = await doctorApi.put(`/${doctorId}/verify`);
  return res.data;
}

export async function suspendDoctor(doctorId) {
  const res = await doctorApi.put(`/${doctorId}/suspend`);
  return res.data;
}

export async function listVerifiedDoctors() {
  const res = await doctorApi.get('/verified');
  return res.data;
}
