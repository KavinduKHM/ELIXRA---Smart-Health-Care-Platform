// src/services/patientService.js
import { PATIENT_API, PATIENT_UPLOAD_API } from './api';

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

export const getPatientPrescriptions = (patientId) => 
  PATIENT_API.get(`/${patientId}/prescriptions`);

export const getPatientMedicalHistory = (patientId) => 
  PATIENT_API.get(`/${patientId}/medical-history/all`);