const API_BASE_URL = "http://localhost:8084/api/appointments";

const normalizeDateTimeValue = (value) => {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string" && value.includes("T")) {
    return value;
  }

  return `${value}T00:00:00`;
};

// Helper for handling responses
const handleResponse = async (response) => {
  const text = await response.text();

  if (!response.ok) {
    let message = "Something went wrong";

    if (text) {
      try {
        const error = JSON.parse(text);
        message = error.message || error.error || message;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

// Search doctors by specialty
export const searchDoctors = async (specialty, name = "", date = "") => {
  const params = new URLSearchParams();
  if (specialty) params.append("specialty", specialty);
  if (name) params.append("name", name);
  if (date) params.append("date", date);

  const response = await fetch(`${API_BASE_URL}/doctors/search?${params}`);
  return handleResponse(response);
};

// Get available time slots for a doctor
export const getAvailableSlots = async (doctorId, date) => {
  const normalizedDate = normalizeDateTimeValue(date);
  const response = await fetch(
    `${API_BASE_URL}/doctors/${doctorId}/slots?date=${encodeURIComponent(normalizedDate)}`,
  );
  return handleResponse(response);
};

// Book an appointment
export const bookAppointment = async (appointmentData) => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(appointmentData),
  });
  return handleResponse(response);
};

// Get appointments for a patient
export const getPatientAppointments = async (
  patientId,
  page = 0,
  size = 20,
) => {
  const response = await fetch(
    `${API_BASE_URL}/patient/${patientId}?page=${page}&size=${size}`,
  );
  return handleResponse(response);
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return handleResponse(response);
};

// Cancel appointment
export const cancelAppointment = async (id, reason = "") => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  return handleResponse(response);
};

// Reschedule appointment
export const rescheduleAppointment = async (
  id,
  newAppointmentTime,
  reason = "",
) => {
  const response = await fetch(`${API_BASE_URL}/${id}/reschedule`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newAppointmentTime: normalizeDateTimeValue(newAppointmentTime),
      reason,
    }),
  });
  return handleResponse(response);
};

// Confirm appointment (doctor action - optional for patient view)
export const confirmAppointment = async (id, notes = "") => {
  const response = await fetch(`${API_BASE_URL}/${id}/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notes),
  });
  return handleResponse(response);
};

// Complete appointment
export const completeAppointment = async (id, notes = "") => {
  const response = await fetch(`${API_BASE_URL}/${id}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(notes),
  });
  return handleResponse(response);
};