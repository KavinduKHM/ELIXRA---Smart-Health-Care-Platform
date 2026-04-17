import { TELEMEDICINE_API } from './api';

export const getSessionsByAppointment = (appointmentId) =>
  TELEMEDICINE_API.get(`/appointments/${appointmentId}`);

export const createVideoSession = (data) =>
  TELEMEDICINE_API.post('/sessions', data);

export const joinVideoSession = (data) =>
  TELEMEDICINE_API.post('/sessions/join', data);
