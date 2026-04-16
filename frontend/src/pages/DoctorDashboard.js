// src/pages/DoctorDashboard.js
import React, { useState, useEffect } from 'react';
import DoctorProfile from '../components/doctor/DoctorProfile';
import AvailabilityManager from '../components/doctor/AvailabilityManager';
import AppointmentRequests from '../components/doctor/AppointmentRequests';
import DoctorPrescriptions from '../components/doctor/Prescriptions';
import VideoConsultation from '../components/doctor/VideoConsultation';
import { getDoctorProfile } from '../services/doctorService';

const DoctorDashboard = () => {
  const [doctorId, setDoctorId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState(null);

  const loadDoctor = async (id) => {
    try {
      const res = await getDoctorProfile(id);
      setProfile(res.data);
      setLoaded(true);
    } catch (err) {
      console.error(err);
      alert('Doctor not found. Make sure doctor ID exists.');
      setLoaded(false);
    }
  };

  const handleLoad = () => {
    if (doctorId && !isNaN(doctorId)) {
      loadDoctor(doctorId);
    } else {
      alert('Enter a valid numeric doctor ID');
    }
  };

  if (!loaded) {
    return (
      <div>
        <h2>Doctor Dashboard</h2>
        <p>Enter your doctor ID to view your dashboard:</p>
        <input
          type="number"
          placeholder="Doctor ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        />
        <button onClick={handleLoad}>Load</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <p><strong>Doctor ID:</strong> {doctorId}</p>
      <DoctorProfile profile={profile} doctorId={doctorId} onProfileUpdate={setProfile} />
      <AvailabilityManager doctorId={doctorId} />
      <AppointmentRequests doctorId={doctorId} />
      <VideoConsultation doctorId={doctorId} />
      <DoctorPrescriptions doctorId={doctorId} />
    </div>
  );
};

export default DoctorDashboard;