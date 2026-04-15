import { createApiClient } from './api';
import { serviceUrls } from './serviceUrls';

const paymentApi = createApiClient(serviceUrls.payments);

export async function createPaymentIntent(payload) {
  const res = await paymentApi.post('/create-intent', payload);
  return res.data;
}

export async function confirmPayment(payload) {
  const res = await paymentApi.post('/confirm', payload);
  return res.data;
}

export async function listTransactions(params) {
  // Backend supports patient-specific transactions.
  const res = await paymentApi.get(`/patients/${params.patientId}/transactions`);
  return res.data;
}

export async function isAppointmentPaid(appointmentId) {
  const res = await paymentApi.get(`/appointments/${appointmentId}/paid`);
  return res.data;
}
