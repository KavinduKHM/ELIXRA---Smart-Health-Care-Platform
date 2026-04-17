// src/services/doctorService.js
import { DOCTOR_API } from './api';

// Doctor profile
export const registerDoctor = (data) =>
  DOCTOR_API.post('/register', data);

export const getPendingDoctors = () =>
  DOCTOR_API.get('/pending');

export const verifyDoctor = (doctorId) =>
  DOCTOR_API.put(`/${doctorId}/verify`);

export const rejectDoctor = (doctorId) =>
  DOCTOR_API.put(`/${doctorId}/reject`);

export const getDoctorProfile = (doctorId) => 
  DOCTOR_API.get(`/${doctorId}`);

export const updateDoctorProfile = (doctorId, data) => 
  DOCTOR_API.put(`/${doctorId}/profile`, data);

// Availability
export const getDoctorAvailability = (doctorId) => 
  DOCTOR_API.get(`/${doctorId}/availability`);

export const setAvailability = (doctorId, availabilityData) => 
  DOCTOR_API.post(`/${doctorId}/availability`, availabilityData);

export const deleteAvailability = (doctorId, availabilityId) => 
  DOCTOR_API.delete(`/${doctorId}/availability/${availabilityId}`);

// Prescriptions
export const getDoctorPrescriptions = (doctorId) => 
  DOCTOR_API.get(`/${doctorId}/prescriptions`);

export const issuePrescription = (doctorId, prescriptionData) => 
  DOCTOR_API.post(`/${doctorId}/prescriptions`, prescriptionData);

// Appointments (via doctor endpoints – your appointment service may have doctor-specific endpoints)
// We'll call appointment service directly using existing functions