import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import PatientDashboard from './components/patient/Dashboard';
import PatientProfile from './components/patient/Profile';
import UserManagement from './components/admin/UserManagement';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Routes>
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/dashboard" element={<Navigate to="/patient" replace />} />
          <Route path="/" element={<Navigate to="/patient" replace />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;