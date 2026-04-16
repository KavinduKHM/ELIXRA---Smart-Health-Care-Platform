// src/services/api.js
import axios from 'axios';

// Backend service base URLs (adjust ports if needed)
export const PATIENT_API = axios.create({
  baseURL: 'http://localhost:8082/api/patients',
  headers: { 'Content-Type': 'application/json' }
});

export const DOCTOR_API = axios.create({
  baseURL: 'http://localhost:8083/api/doctors',
  headers: { 'Content-Type': 'application/json' }
});

export const APPOINTMENT_API = axios.create({
  baseURL: 'http://localhost:8084/api/appointments',
  headers: { 'Content-Type': 'application/json' }
});

// For file uploads (multipart), we'll use a separate instance without default content-type
export const PATIENT_UPLOAD_API = axios.create({
  baseURL: 'http://localhost:8082/api/patients'
});