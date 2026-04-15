export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  authBaseUrl: import.meta.env.VITE_AUTH_BASE_URL,
  patientBaseUrl: import.meta.env.VITE_PATIENT_BASE_URL,
  doctorBaseUrl: import.meta.env.VITE_DOCTOR_BASE_URL,
  appointmentBaseUrl: import.meta.env.VITE_APPOINTMENT_BASE_URL,
  telemedBaseUrl: import.meta.env.VITE_TELEMED_BASE_URL,
  aiBaseUrl: import.meta.env.VITE_AI_BASE_URL,
  paymentBaseUrl: import.meta.env.VITE_PAYMENT_BASE_URL,
  notificationBaseUrl: import.meta.env.VITE_NOTIFICATION_BASE_URL,
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  agoraAppId: import.meta.env.VITE_AGORA_APP_ID,
};

export function getServiceBaseUrl(servicePath, overrideBaseUrl) {
  if (overrideBaseUrl) return overrideBaseUrl;
  return `${env.apiBaseUrl.replace(/\/$/, '')}/${servicePath.replace(/^\//, '')}`;
}
