// src/services/patientService.js
import { PATIENT_API, PATIENT_UPLOAD_API } from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

const PROFILE_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'middleName',
  'email',
  'phoneNumber',
  'dateOfBirth',
  'gender',
  'bloodGroup',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelation',
  'allergies',
  'chronicConditions',
  'currentMedications'
];

const normalizeProfileUpdateValue = (value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  }
  // If any date input is ever added in the UI, prefer sending LocalDate strings.
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return value;
};

const toProfileUpdateRequest = (data) => {
  const request = {};
  for (const key of PROFILE_UPDATE_FIELDS) {
    if (data && Object.prototype.hasOwnProperty.call(data, key)) {
      const normalized = normalizeProfileUpdateValue(data[key]);
      if (normalized !== undefined) request[key] = normalized;
    }
  }
  return request;
};

export const getPatientProfile = (patientId) => 
  PATIENT_API.get(`/${patientId}/profile`);

export const updatePatientProfile = (patientId, data) => 
  PATIENT_API.put(`/${patientId}/profile`, toProfileUpdateRequest(data));

export const getPatientDocuments = (patientId) => 
  PATIENT_API.get(`/${patientId}/documents`);

export const uploadDocument = (patientId, formData) => 
  PATIENT_UPLOAD_API.post(`/${patientId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updatePatientDocument = (patientId, documentId, formData) =>
  PATIENT_UPLOAD_API.put(`/${patientId}/documents/${documentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const uploadPatientProfilePicture = (patientId, formData) =>
  PATIENT_UPLOAD_API.post(`/${patientId}/profile-picture`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getPatientPrescriptions = (patientId) => 
  PATIENT_API.get(`/${patientId}/prescriptions`);

export const getPatientMedicalHistory = (patientId) => 
  PATIENT_API.get(`/${patientId}/medical-history/all`);

export const addPatientMedicalHistoryRecord = (patientId, payload) =>
  PATIENT_API.post(`/${patientId}/medical-history`, payload);

export const updatePatientMedicalHistoryRecord = (historyId, payload) =>
  PATIENT_API.put(`/medical-history/${historyId}`, payload);

export const deletePatientDocument = (patientId, documentId) =>
  PATIENT_API.delete(`/${patientId}/documents/${documentId}`);

export const deletePatientMedicalHistoryRecord = (patientId, historyId) =>
  PATIENT_API.delete(`/medical-history/${historyId}`);

export const setPatientProfileActiveState = async (patientId, isActive) => {
  const adminStatusUrl = `${API_BASE_URL}/api/admin/patients/${patientId}/status?active=${isActive}`;
  return PATIENT_API.put(adminStatusUrl);
};

export const deactivatePatientProfile = (patientId) =>
  setPatientProfileActiveState(patientId, false);

export const deletePatientProfile = async (patientId) => {
  try {
    return await PATIENT_API.delete(`/${patientId}/account/permanent`);
  } catch (_) {
    try {
      return await PATIENT_API.delete(`/${patientId}/account`);
    } catch (_) {
      return PATIENT_API.delete(`/${patientId}`);
    }
  }
};