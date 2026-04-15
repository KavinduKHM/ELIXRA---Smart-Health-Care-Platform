import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const patientApi = createApiClient(serviceUrls.patients);

export async function getPatientProfile(patientId) {
  const res = await patientApi.get(`/${patientId}/profile`);
  return res.data;
}

export async function updatePatientProfile(patientId, payload) {
  const res = await patientApi.put(`/${patientId}/profile`, payload);
  return res.data;
}

export async function getPatientByUserId(userId) {
  const res = await patientApi.get(`/user/${userId}`);
  return res.data;
}

export async function registerPatient(payload) {
  const res = await patientApi.post('/register', payload);
  return res.data;
}

export async function uploadPatientProfilePicture(patientId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await patientApi.post(`/${patientId}/profile-picture`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function uploadPatientDocument(patientId, { file, documentType, description, notes }) {
  const form = new FormData();
  form.append('file', file);
  form.append('documentType', documentType);
  if (description) form.append('description', description);
  if (notes) form.append('notes', notes);

  const res = await patientApi.post(`/${patientId}/documents`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function listPatientDocuments(patientId) {
  const res = await patientApi.get(`/${patientId}/documents`);
  return res.data;
}

export async function deletePatientDocument(patientId, documentId) {
  const res = await patientApi.delete(`/${patientId}/documents/${documentId}`);
  return res.data;
}

export async function listPatientPrescriptions(patientId) {
  const res = await patientApi.get(`/${patientId}/prescriptions`);
  return res.data;
}

export async function listPatientMedicalHistory(patientId) {
  const res = await patientApi.get(`/${patientId}/medical-history/all`);
  return res.data;
}

export async function addPatientMedicalHistory(patientId, payload) {
  const res = await patientApi.post(`/${patientId}/medical-history`, payload);
  return res.data;
}

export async function updateMedicalHistory(historyId, payload) {
  const res = await patientApi.put(`/medical-history/${historyId}`, payload);
  return res.data;
}

export async function deleteMedicalHistory(historyId) {
  const res = await patientApi.delete(`/medical-history/${historyId}`);
  return res.data;
}
