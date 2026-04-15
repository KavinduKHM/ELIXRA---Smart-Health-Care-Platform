import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import { useAuth } from './hooks/useAuth';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NotFound from './pages/NotFound';
import Notifications from './pages/common/Notifications';

import PatientDashboard from './pages/patient/Dashboard';
import PatientBookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientDocuments from './pages/patient/Documents';
import PatientPrescriptions from './pages/patient/Prescriptions';
import PatientMedicalHistory from './pages/patient/MedicalHistory';
import PatientProfile from './pages/patient/Profile';
import PatientSymptoms from './pages/patient/Symptoms';
import PayAppointment from './pages/patient/PayAppointment';

function RoleHomeRedirect() {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole === 'ADMIN') return <Navigate to="/admin" replace />;
  if (userRole === 'DOCTOR') return <Navigate to="/doctor" replace />;
  return <Navigate to="/patient" replace />;
}

function PatientLayout() {
  return (
    <AppShell role="PATIENT">
      <Routes>
        <Route index element={<PatientDashboard />} />
        <Route path="book" element={<PatientBookAppointment />} />
        <Route path="pay/:appointmentId" element={<PayAppointment />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="documents" element={<PatientDocuments />} />
        <Route path="prescriptions" element={<PatientPrescriptions />} />
        <Route path="history" element={<PatientMedicalHistory />} />
        <Route path="profile" element={<PatientProfile />} />
        <Route path="symptoms" element={<PatientSymptoms />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

function DoctorLayout() {
  return (
    <AppShell role="DOCTOR">
      <Routes>
        <Route index element={<div className="text-sm text-slate-600">Doctor dashboard coming next.</div>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

function AdminLayout() {
  return (
    <AppShell role="ADMIN">
      <Routes>
        <Route index element={<div className="text-sm text-slate-600">Admin dashboard coming next.</div>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleHomeRedirect />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute allowRoles={['PATIENT']} />}>
        <Route path="/patient/*" element={<PatientLayout />} />
      </Route>

      <Route element={<ProtectedRoute allowRoles={['DOCTOR']} />}>
        <Route path="/doctor/*" element={<DoctorLayout />} />
      </Route>

      <Route element={<ProtectedRoute allowRoles={['ADMIN']} />}>
        <Route path="/admin/*" element={<AdminLayout />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
