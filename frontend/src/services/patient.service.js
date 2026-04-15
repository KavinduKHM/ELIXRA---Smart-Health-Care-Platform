import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '')
  || 'http://localhost:8082';
const APPOINTMENT_URL = 'http://localhost:8084';
const TELEMEDICINE_URL = 'http://localhost:8085';

const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const dashboardService = {
  // Get patient profile
  getPatientProfile: async (patientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/profile`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      throw error;
    }
  },

  // Get patient appointments
  getPatientAppointments: async (patientId, page = 0, size = 100) => {
    try {
      const response = await axios.get(
        `${APPOINTMENT_URL}/api/appointments/patient/${patientId}?page=${page}&size=${size}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { content: [] };
    }
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/prescriptions`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
  },

  // Get patient documents
  getPatientDocuments: async (patientId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientId}/documents`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  // Get active video sessions
  getActiveVideoSessions: async (patientId) => {
    try {
      const response = await axios.get(
        `${TELEMEDICINE_URL}/api/video/patients/${patientId}/active`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching video sessions:', error);
      return [];
    }
  }
};

export default dashboardService;
