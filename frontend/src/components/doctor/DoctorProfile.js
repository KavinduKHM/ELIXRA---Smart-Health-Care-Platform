// src/components/doctor/DoctorProfile.js
import React, { useState } from 'react';
import { updateDoctorProfile } from '../../services/doctorService';
import {
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiMail,
  FiPhone,
  FiSave,
  FiUser,
  FiX,
} from 'react-icons/fi';
import './DoctorProfile.css';

const DoctorProfile = ({ profile, doctorId, onProfileUpdate, searchQuery = '' }) => {
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

  if (!profile) return <div className="doctorProfileLoading">Loading profile...</div>;

  const fullName = `Dr. ${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'DR';

  const normalizedSearch = String(searchQuery || '').trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;

  const contains = (...values) => values
    .filter((value) => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(normalizedSearch));

  const sectionMatches = {
    summary: !hasSearch || contains(fullName, profile.specialty, profile.experienceYears, profile.consultationFee, profile.status),
    personal: !hasSearch || contains(profile.firstName, profile.lastName, profile.email, profile.phoneNumber),
    professional: !hasSearch || contains(profile.specialty, profile.qualification, profile.experienceYears, profile.consultationFee),
    bio: !hasSearch || contains(profile.bio),
  };

  const hasAnyMatch = sectionMatches.summary || sectionMatches.personal || sectionMatches.professional || sectionMatches.bio;

  return (
    <div className="doctorProfileRoot">
      {!editMode ? (
        hasAnyMatch ? (
          <div className="doctorProfileGrid">
            {sectionMatches.summary && (
              <aside className="doctorProfileCard doctorProfileSummary">
                <div className="doctorProfileAvatar">{initials}</div>
                <h2>{fullName}</h2>
                <p className="doctorProfileRole">{profile.specialty || 'Specialty not set'}</p>

                <div className="doctorProfileStats">
                  <div>
                    <strong>{profile.experienceYears ?? 0}+</strong>
                    <span>Years</span>
                  </div>
                  <div>
                    <strong>${profile.consultationFee ?? 0}</strong>
                    <span>Fee</span>
                  </div>
                  <div>
                    <strong>{profile.status || 'ACTIVE'}</strong>
                    <span>Status</span>
                  </div>
                </div>

                <button type="button" className="doctorProfilePrimaryBtn" onClick={() => setEditMode(true)}>
                  <FiEdit2 /> Edit Profile
                </button>
              </aside>
            )}

            <section className="doctorProfileDetails">
              {sectionMatches.personal && (
                <div className="doctorProfileCard">
                  <div className="doctorProfileCardHeader">
                    <h3><FiUser /> Personal Information</h3>
                  </div>
                  <div className="doctorProfileInfoGrid">
                    <div><span>First Name</span><strong>{profile.firstName || '-'}</strong></div>
                    <div><span>Last Name</span><strong>{profile.lastName || '-'}</strong></div>
                    <div><span><FiMail /> Email</span><strong>{profile.email || '-'}</strong></div>
                    <div><span><FiPhone /> Phone</span><strong>{profile.phoneNumber || '-'}</strong></div>
                  </div>
                </div>
              )}

              {(sectionMatches.professional || sectionMatches.bio) && (
                <div className="doctorProfileCard doctorProfileTwoCol">
                  {sectionMatches.professional && (
                    <div>
                      <div className="doctorProfileCardHeader">
                        <h3><FiAward /> Professional Details</h3>
                      </div>
                      <div className="doctorProfileInfoList">
                        <p><span>Specialty</span><strong>{profile.specialty || '-'}</strong></p>
                        <p><span>Qualification</span><strong>{profile.qualification || '-'}</strong></p>
                        <p><span><FiCalendar /> Experience</span><strong>{profile.experienceYears ?? 0} years</strong></p>
                        <p><span><FiDollarSign /> Consultation Fee</span><strong>${profile.consultationFee ?? 0}</strong></p>
                      </div>
                    </div>
                  )}
                  {sectionMatches.bio && (
                    <div>
                      <div className="doctorProfileCardHeader">
                        <h3><FiBookOpen /> Biography</h3>
                      </div>
                      <p className="doctorProfileBio">{profile.bio || 'No biography added yet.'}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="doctorProfileNoResults">
            <h3>No matching profile details</h3>
            <p>Try a different keyword like name, email, specialty, qualification, or bio text.</p>
          </div>
        )
      ) : (
        <section className="doctorProfileCard doctorProfileEditCard">
          <div className="doctorProfileCardHeader">
            <h3><FiEdit2 /> Edit Doctor Profile</h3>
          </div>

          <div className="doctorProfileFormGrid">
            <label>
              First Name
              <input type="text" placeholder="First Name" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </label>
            <label>
              Last Name
              <input type="text" placeholder="Last Name" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </label>
            <label>
              Email
              <input type="email" placeholder="Email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
            </label>
            <label>
              Phone
              <input type="tel" placeholder="Phone" value={formData.phoneNumber || ''} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
            </label>
            <label>
              Specialty
              <input type="text" placeholder="Specialty" value={formData.specialty || ''} onChange={e => setFormData({...formData, specialty: e.target.value})} />
            </label>
            <label>
              Qualification
              <input type="text" placeholder="Qualification" value={formData.qualification || ''} onChange={e => setFormData({...formData, qualification: e.target.value})} />
            </label>
            <label>
              Experience Years
              <input type="number" placeholder="Experience Years" value={formData.experienceYears || ''} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
            </label>
            <label>
              Consultation Fee
              <input type="number" placeholder="Consultation Fee" value={formData.consultationFee || ''} onChange={e => setFormData({...formData, consultationFee: e.target.value})} />
            </label>
          </div>

          <label className="doctorProfileBioField">
            Biography
            <textarea placeholder="Bio" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </label>

          <div className="doctorProfileActions">
            <button type="button" className="doctorProfilePrimaryBtn" onClick={handleSave}><FiSave /> Save</button>
            <button type="button" className="doctorProfileGhostBtn" onClick={() => setEditMode(false)}><FiX /> Cancel</button>
          </div>
        </section>
      )}
    </div>
  );
};

export default DoctorProfile;