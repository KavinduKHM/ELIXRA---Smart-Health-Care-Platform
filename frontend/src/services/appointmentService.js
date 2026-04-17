// src/services/appointmentService.js
import { APPOINTMENT_API } from './api';

// ========== Patient-facing functions ==========
export const searchDoctors = (specialty) => 
  APPOINTMENT_API.get(`/doctors/search?specialty=${specialty}`);

export const getAvailableSlots = (doctorId, date = '2026-04-20T00:00:00') => 
  APPOINTMENT_API.get(`/doctors/${doctorId}/slots?date=${date}`);

export const bookAppointment = (appointmentData) => 
  APPOINTMENT_API.post('', appointmentData);

export const getUpcomingAppointmentsForPatient = (patientId) =>
  APPOINTMENT_API.get(`/patient/${patientId}/upcoming`);

// ========== Doctor-facing functions ==========
export const getDoctorAppointments = (doctorId, page = 0, size = 20) => 
  APPOINTMENT_API.get(`/doctor/${doctorId}?page=${page}&size=${size}`);

export const getPendingAppointmentsForDoctor = (doctorId) => 
  APPOINTMENT_API.get(`/doctor/${doctorId}/pending`);

export const updateAppointmentStatus = (appointmentId, statusData) => 
  APPOINTMENT_API.patch(`/${appointmentId}/status`, statusData);

export const getUpcomingAppointmentsForDoctor = (doctorId) => 
  APPOINTMENT_API.get(`/doctor/${doctorId}/upcoming`);