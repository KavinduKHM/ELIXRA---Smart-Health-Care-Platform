// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import VideoRoom from './pages/VideoRoom';
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
            userRole === 'PATIENT' ? <PatientDashboard /> : <DoctorDashboard />
          }
        />
        <Route path="/video-room/:sessionId" element={<VideoRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;