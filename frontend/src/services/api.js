// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8085/api/video'; // Telemedicine service

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For authenticated requests (add token from localStorage)
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Video session endpoints
export const createSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

export const joinSession = async (sessionId, userId, userRole) => {
  const response = await api.post('/sessions/join', {
    sessionId,
    userId,
    userRole,
  });
  return response.data;
};

export const endSession = async (sessionId, userId, consultationNotes) => {
  const response = await api.post('/sessions/end', {
    sessionId,
    userId,
    consultationNotes,
  });
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/sessions/${sessionId}`);
  return response.data;
};

export const getActiveSessionsForPatient = async (patientId) => {
  const response = await api.get(`/patients/${patientId}/active`);
  return response.data;
};

export const getActiveSessionsForDoctor = async (doctorId) => {
  const response = await api.get(`/doctors/${doctorId}/active`);
  return response.data;
};

export const cancelSession = async (sessionId, userId) => {
  const response = await api.post(`/sessions/${sessionId}/cancel?userId=${userId}`);
  return response.data;
};
