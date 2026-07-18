// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterLanding from './pages/auth/RegisterLanding';
import AboutPage from './pages/static/AboutPage';
import ServicesPage from './pages/static/ServicesPage';
import ContactPage from './pages/static/ContactPage';
import VideoCallComponent from './components/telemedicine/VideoCall';
import PatientShell from './pages/patient/PatientShell';
import PatientRegister from './components/patient/PatientRegister';
import PatientAppointmentsBookPage from './pages/patient/PatientAppointmentsBookPage';
import PatientBookAppointmentPage from './pages/patient/PatientBookAppointmentPage';
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage';
import PatientHistoryDocumentsPage from './pages/patient/PatientHistoryDocumentsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import DoctorShell from './pages/doctor/DoctorShell';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorRegistrationPage from './pages/doctor/DoctorRegistrationPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterLanding />} />

            {/* Registration (public) */}
            <Route path="/patient/register" element={<PatientRegister />} />
            <Route path="/doctor/register" element={<DoctorRegistrationPage />} />

            {/* Legacy dashboard routes now redirect to the proper login */}
            <Route path="/patient" element={<Navigate to="/login" replace state={{ requiredRole: 'patient' }} />} />
            <Route path="/doctor" element={<Navigate to="/login" replace state={{ requiredRole: 'doctor' }} />} />

            {/* Patient portal (protected) */}
            <Route
              path="/patient/:patientId"
              element={
                <ProtectedRoute role="patient" matchParam="patientId">
                  <PatientShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="appointments" replace />} />
              <Route path="appointments" element={<PatientAppointmentsBookPage />} />
              <Route path="book" element={<PatientBookAppointmentPage />} />
              <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
              <Route path="history-documents" element={<PatientHistoryDocumentsPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
            </Route>

            {/* Doctor portal (protected) */}
            <Route
              path="/doctor/:doctorId"
              element={
                <ProtectedRoute role="doctor" matchParam="doctorId">
                  <DoctorShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="appointments" replace />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/user-management" element={<UserManagementPage />} />

            {/* Telemedicine video room (must be signed in) */}
            <Route
              path="/video-call/:channelName/:userAccount"
              element={
                <ProtectedRoute>
                  <VideoCallComponent />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
