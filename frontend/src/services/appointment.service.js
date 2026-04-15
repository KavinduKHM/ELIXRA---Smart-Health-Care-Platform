import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const appointmentApi = createApiClient(serviceUrls.appointments);

export async function searchDoctorsForAppointments(params) {
  const res = await appointmentApi.get('/doctors/search', { params });
  return res.data;
}

export async function getDoctorSlots(doctorId, dateTimeIso) {
  const res = await appointmentApi.get(`/doctors/${doctorId}/slots`, {
    params: { date: dateTimeIso },
  });
  return res.data;
}

export async function listAppointmentsForPatient(patientId, { page = 0, size = 20 } = {}) {
  const res = await appointmentApi.get(`/patient/${patientId}`, { params: { page, size } });
  return res.data;
}

export async function listAppointmentsForDoctor(doctorId, { page = 0, size = 20 } = {}) {
  const res = await appointmentApi.get(`/doctor/${doctorId}`, { params: { page, size } });
  return res.data;
}

export async function createAppointment(payload) {
  const res = await appointmentApi.post('', payload);
  return res.data;
}

export async function getAppointment(appointmentId) {
  const res = await appointmentApi.get(`/${appointmentId}`);
  return res.data;
}

export async function cancelAppointment(appointmentId) {
  const res = await appointmentApi.delete(`/${appointmentId}`);
  return res.data;
}

export async function rescheduleAppointment(appointmentId, payload) {
  const res = await appointmentApi.put(`/${appointmentId}/reschedule`, payload);
  return res.data;
}

export async function acceptAppointment(appointmentId) {
  const res = await appointmentApi.post(`/${appointmentId}/confirm`);
  return res.data;
}

export async function rejectAppointment(appointmentId) {
  // No explicit reject endpoint in current backend.
  // Use status PATCH endpoint if added later.
  throw new Error('Reject endpoint not available in backend');
}

export async function markAppointmentCompleted(appointmentId) {
  const res = await appointmentApi.post(`/${appointmentId}/complete`);
  return res.data;
}

export async function confirmPaymentForAppointment(appointmentId, payload) {
  const res = await appointmentApi.post(`/${appointmentId}/confirm-payment`, payload);
  return res.data;
}

export async function listPendingAppointmentsForDoctor(doctorId) {
  const res = await appointmentApi.get(`/doctor/${doctorId}/pending`);
  return res.data;
}

export async function listUpcomingAppointmentsForDoctor(doctorId) {
  const res = await appointmentApi.get(`/doctor/${doctorId}/upcoming`);
  return res.data;
}

export async function listUpcomingAppointmentsForPatient(patientId) {
  const res = await appointmentApi.get(`/patient/${patientId}/upcoming`);
  return res.data;
}
