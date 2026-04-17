// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import VideoCallComponent from './components/telemedicine/VideoCall';
import PatientShell from './pages/patient/PatientShell';
import PatientRegister from './components/patient/PatientRegister';
import PatientAppointmentsBookPage from './pages/patient/PatientAppointmentsBookPage';
import PatientPrescriptionsPage from './pages/patient/PatientPrescriptionsPage';
import PatientHistoryDocumentsPage from './pages/patient/PatientHistoryDocumentsPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import DoctorShell from './pages/doctor/DoctorShell';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import DoctorRegistrationPage from './pages/doctor/DoctorRegistrationPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/patient/:patientId" element={<PatientShell />}>
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<PatientAppointmentsBookPage />} />
            <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
            <Route path="history-documents" element={<PatientHistoryDocumentsPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
          </Route>

          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/doctor/register" element={<DoctorRegistrationPage />} />
          <Route path="/doctor/:doctorId" element={<DoctorShell />}>
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsPage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
          </Route>

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/video-call/:channelName/:userAccount" element={<VideoCallComponent />} />
          <Route path="/" element={<Navigate to="/patient" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;