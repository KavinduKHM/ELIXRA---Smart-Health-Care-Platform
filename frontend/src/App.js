// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import VideoCallComponent from './components/telemedicine/VideoCall';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/doctor" element={<DoctorDashboard />} />
          <Route path="/video-call/:channelName/:userAccount" element={<VideoCallComponent />} />
          <Route path="/" element={<PatientDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;