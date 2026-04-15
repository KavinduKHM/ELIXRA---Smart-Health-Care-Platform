// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TelemedicinePatientDashboard from './pages/PatientDashboard';
import TelemedicineDoctorDashboard from './pages/DoctorDashboard';
import VideoRoom from './pages/VideoRoom';
import PatientDashboard from './components/patient/Dashboard';
import PatientMedicalHistory from './components/patient/MedicalHistory';
import MedicalHistoryForm from './components/patient/MedicalHistoryForm';
import MedicalHistoryUpdate from './components/patient/MedicalHistoryUpdate';
import PatientProfile from './components/patient/Profile';
import MedicalDocument from './components/patient/MedicalDocument';
import UserManagement from './components/admin/UserManagement';
import UploadDocument from './components/patient/UploadDocument';
import UpdateDocument from './components/patient/UpdateDocument';
import BookAppointment from './components/patient/BookAppointment';
import CreateProfile from './components/patient/CreateProfile';
import Prescriptions from './components/patient/Prescriptions';
import { setAuthToken } from './services/api';

// Example: get token from localStorage after login
const token = localStorage.getItem('accessToken');
if (token) setAuthToken(token);

function App() {
  const userRole = localStorage.getItem('userRole');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            userRole === 'PATIENT' ? <TelemedicinePatientDashboard /> : <TelemedicineDoctorDashboard />
          }
        />
        <Route path="/video-room/:sessionId" element={<VideoRoom />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/documents" element={<MedicalDocument />} />
        <Route path="/patient/appointments" element={<BookAppointment />} />
        <Route path="/documents/upload" element={<UploadDocument />} />
        <Route path="/documents/update" element={<UpdateDocument />} />
        <Route path="/patient/medical-history" element={<PatientMedicalHistory />} />
        <Route path="/patient/medical-history/new" element={<MedicalHistoryForm />} />
        <Route path="/patient/medical-history/update" element={<MedicalHistoryUpdate />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/profile/create" element={<CreateProfile />} />
        <Route path="/patient/prescriptions" element={<Prescriptions />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="*" element={<Navigate to="/patient" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
