import { env, getServiceBaseUrl } from '../lib/env';

export const serviceUrls = {
  // Auth service is optional in this repo; keep configurable.
  auth: getServiceBaseUrl('/auth', env.authBaseUrl),

  patients: getServiceBaseUrl('/patients', env.patientBaseUrl),
  admin: getServiceBaseUrl('/admin', env.patientBaseUrl),

  doctors: getServiceBaseUrl('/doctors', env.doctorBaseUrl),
  appointments: getServiceBaseUrl('/appointments', env.appointmentBaseUrl),
  telemed: getServiceBaseUrl('/video', env.telemedBaseUrl),

  aiSymptomChecker: getServiceBaseUrl('/ai/symptom-checker', env.aiBaseUrl),

  payments: getServiceBaseUrl('/payments', env.paymentBaseUrl),
  notifications: getServiceBaseUrl('/notifications', env.notificationBaseUrl),
};
