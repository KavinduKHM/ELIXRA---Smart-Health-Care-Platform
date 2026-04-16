// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/" element={<PatientDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;