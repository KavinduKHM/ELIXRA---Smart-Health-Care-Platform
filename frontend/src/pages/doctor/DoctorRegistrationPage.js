import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerDoctor } from '../../services/doctorService';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  specialty: '',
  qualification: '',
  experienceYears: '',
  bio: '',
  consultationFee: '',
  averageConsultationDuration: ''
};

const DoctorRegistrationPage = () => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const phoneDigits = formData.phoneNumber.replace(/\D/g, '');

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phoneNumber: phoneDigits || null,
      specialty: formData.specialty.trim(),
      qualification: formData.qualification.trim() || null,
      experienceYears: formData.experienceYears === '' ? null : Number(formData.experienceYears),
      bio: formData.bio.trim() || null,
      consultationFee: formData.consultationFee === '' ? null : Number(formData.consultationFee),
      averageConsultationDuration: formData.averageConsultationDuration === '' ? null : Number(formData.averageConsultationDuration)
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.specialty) {
      alert('Please fill all required fields.');
      return;
    }
    if (payload.firstName.length < 2 || payload.lastName.length < 2) {
      alert('First name and last name must be at least 2 characters.');
      return;
    }
    if (payload.phoneNumber && payload.phoneNumber.length !== 10) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (payload.experienceYears != null && payload.experienceYears < 0) {
      alert('Experience years cannot be negative.');
      return;
    }
    if (payload.consultationFee != null && payload.consultationFee <= 0) {
      alert('Consultation fee must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerDoctor(payload);
      const createdDoctorId = response?.data?.id;
      const doctorName = [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim();

      if (createdDoctorId) {
        localStorage.setItem('doctorId', String(createdDoctorId));
        localStorage.setItem('elixra.doctorId', String(createdDoctorId));
      }

      if (doctorName) {
        localStorage.setItem('elixra.userName', doctorName);
        localStorage.setItem('elixra.userRole', 'Doctor');
      }

      navigate('/', {
        replace: true,
        state: {
          flashMessage: {
            type: 'success',
            text: createdDoctorId
              ? `Doctor registration saved successfully. Welcome Dr. ${doctorName || 'to ELIXRA'}.`
              : 'Doctor registration saved successfully.',
          },
        },
      });
    } catch (error) {
      const responseData = error?.response?.data;
      const firstValidationError = responseData?.errors
        ? Object.values(responseData.errors)[0]
        : null;
      const message = firstValidationError || responseData?.message || 'Doctor registration failed.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ width: 'min(760px, 100%)' }}>
        <h2 className="cardTitle">Doctor Registration</h2>
        <p className="muted" style={{ marginTop: 0 }}>Fill the form to register as a doctor.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          <input name="firstName" type="text" placeholder="First Name *" value={formData.firstName} onChange={handleChange} required />
          <input name="lastName" type="text" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required />
          <input name="phoneNumber" type="text" placeholder="Phone Number (10 digits)" value={formData.phoneNumber} onChange={handleChange} />
          <input name="specialty" type="text" placeholder="Specialty *" value={formData.specialty} onChange={handleChange} required />
          <input name="qualification" type="text" placeholder="Qualification" value={formData.qualification} onChange={handleChange} />
          <input name="experienceYears" type="number" min="0" placeholder="Experience Years" value={formData.experienceYears} onChange={handleChange} />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} rows={3} />
          <input name="consultationFee" type="number" min="0" step="0.01" placeholder="Consultation Fee" value={formData.consultationFee} onChange={handleChange} />
          <input
            name="averageConsultationDuration"
            type="number"
            min="1"
            placeholder="Average Consultation Duration (minutes)"
            value={formData.averageConsultationDuration}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/doctor')} disabled={isSubmitting}>Cancel</button>
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Registration'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistrationPage;

