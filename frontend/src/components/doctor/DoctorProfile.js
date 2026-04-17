// src/components/doctor/DoctorProfile.js
import React, { useState } from 'react';
import { updateDoctorProfile } from '../../services/doctorService';

const DoctorProfile = ({ profile, doctorId, onProfileUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = async () => {
    try {
      await updateDoctorProfile(doctorId, formData);
      onProfileUpdate(formData);
      setEditMode(false);
      alert('Profile updated');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Doctor Profile</h2>
      {!editMode ? (
        <div>
          <p><strong>Name:</strong> Dr. {profile.firstName} {profile.lastName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phoneNumber}</p>
          <p><strong>Specialty:</strong> {profile.specialty}</p>
          <p><strong>Qualification:</strong> {profile.qualification}</p>
          <p><strong>Experience:</strong> {profile.experienceYears} years</p>
          <p><strong>Consultation Fee:</strong> ${profile.consultationFee}</p>
          <p><strong>Bio:</strong> {profile.bio}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      ) : (
        <div>
          <input type="text" placeholder="First Name" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input type="text" placeholder="Last Name" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <input type="text" placeholder="Specialty" value={formData.specialty || ''} onChange={e => setFormData({...formData, specialty: e.target.value})} />
          <input type="text" placeholder="Qualification" value={formData.qualification || ''} onChange={e => setFormData({...formData, qualification: e.target.value})} />
          <input type="number" placeholder="Experience Years" value={formData.experienceYears || ''} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
          <input type="number" placeholder="Consultation Fee" value={formData.consultationFee || ''} onChange={e => setFormData({...formData, consultationFee: e.target.value})} />
          <textarea placeholder="Bio" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;