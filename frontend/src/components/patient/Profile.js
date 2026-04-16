// src/components/patient/Profile.js
import React, { useState } from 'react';
import { updatePatientProfile } from '../../services/patientService';

const Profile = ({ profile, patientId, onProfileUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = async () => {
    const phone = (formData?.phoneNumber ?? '').toString().trim();
    if (phone.length > 0 && !/^\d{10}$/.test(phone)) {
      alert('Phone number must be exactly 10 digits');
      return;
    }

    try {
      const res = await updatePatientProfile(patientId, formData);
      const updatedProfile = res?.data ?? formData;
      onProfileUpdate(updatedProfile);
      setFormData(updatedProfile);
      setEditMode(false);
      alert('Profile updated');
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;

      const validationErrors = data?.errors && typeof data.errors === 'object'
        ? Object.entries(data.errors).map(([field, message]) => `${field}: ${message}`).join('\n')
        : null;

      const serverMessage = validationErrors
        || data?.message
        || data?.error
        || (typeof data === 'string' ? data : null);

      console.error('Profile update failed', { status, data, err });
      alert(serverMessage ? `Update failed (HTTP ${status}):\n${serverMessage}` : 'Update failed');
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
      <h2>Profile</h2>
      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phoneNumber}</p>
          <p><strong>Date of Birth:</strong> {profile.dateOfBirth}</p>
          <p><strong>Gender:</strong> {profile.gender}</p>
          <p><strong>Blood Group:</strong> {profile.bloodGroup}</p>
          <p><strong>Address:</strong> {profile.addressLine1}, {profile.city}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      ) : (
        <div>
          <input type="text" placeholder="First Name" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input type="text" placeholder="Last Name" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="tel" placeholder="Phone" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Profile;