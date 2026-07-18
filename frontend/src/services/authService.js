// src/services/authService.js
import { PATIENT_API, DOCTOR_API } from './api';

/**
 * Authenticate a patient with email + password.
 * Returns the patient profile (id, firstName, lastName, email, ...).
 */
export const loginPatient = (email, password) =>
  PATIENT_API.post('/login', { email, password });

/**
 * Authenticate a doctor with email + password.
 * Returns the doctor profile (id, firstName, lastName, email, specialty, ...).
 */
export const loginDoctor = (email, password) =>
  DOCTOR_API.post('/login', { email, password });
