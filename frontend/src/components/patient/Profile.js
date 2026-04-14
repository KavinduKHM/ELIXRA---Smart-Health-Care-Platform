import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	PencilSquareIcon,
	PhotoIcon,
	TrashIcon,
	UserCircleIcon,
	XCircleIcon
} from '@heroicons/react/24/outline';
import './Profile.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || '';

const initialForm = {
	firstName: '',
	lastName: '',
	middleName: '',
	email: '',
	phoneNumber: '',
	dateOfBirth: '',
	gender: '',
	bloodGroup: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	state: '',
	postalCode: '',
	country: '',
	emergencyContactName: '',
	emergencyContactPhone: '',
	emergencyContactRelation: '',
	allergies: '',
	chronicConditions: '',
	currentMedications: ''
};

const parseJwtPayload = (token) => {
	try {
		const base64Url = token.split('.')[1];
		if (!base64Url) return null;
		const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split('')
				.map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
				.join('')
		);

		return JSON.parse(jsonPayload);
	} catch (error) {
		return null;
	}
};

const extractUserIdFromToken = (token) => {
	const payload = parseJwtPayload(token);
	if (!payload) return null;

	const keys = ['userId', 'id', 'user_id', 'sub'];
	for (const key of keys) {
		const value = payload[key];
		if (value === null || value === undefined) continue;

		const parsed = Number(value);
		if (Number.isInteger(parsed) && parsed > 0) {
			return parsed;
		}
	}

	return null;
};

const resolveCloudinaryUrl = (value) => {
	if (!value) return '';
	const candidate = String(value).trim();
	if (!candidate) return '';

	if (/^https?:\/\//i.test(candidate)) {
		return candidate;
	}

	if (!CLOUDINARY_CLOUD_NAME) {
		return '';
	}

	return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${candidate}`;
};

const formatProfileToForm = (profile) => ({
	firstName: profile?.firstName || '',
	lastName: profile?.lastName || '',
	middleName: profile?.middleName || '',
	email: profile?.email || '',
	phoneNumber: profile?.phoneNumber || '',
	dateOfBirth: profile?.dateOfBirth || '',
	gender: profile?.gender || '',
	bloodGroup: profile?.bloodGroup || '',
	addressLine1: profile?.addressLine1 || '',
	addressLine2: profile?.addressLine2 || '',
	city: profile?.city || '',
	state: profile?.state || '',
	postalCode: profile?.postalCode || '',
	country: profile?.country || '',
	emergencyContactName: profile?.emergencyContactName || '',
	emergencyContactPhone: profile?.emergencyContactPhone || '',
	emergencyContactRelation: profile?.emergencyContactRelation || '',
	allergies: profile?.allergies || '',
	chronicConditions: profile?.chronicConditions || '',
	currentMedications: profile?.currentMedications || ''
});

const buildPlaceholderAvatarFile = () => {
	const svg = `
	<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
		<defs>
			<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="#e6ecf8" />
				<stop offset="100%" stop-color="#cfd9ef" />
			</linearGradient>
		</defs>
		<rect width="300" height="300" fill="url(#bg)" />
		<circle cx="150" cy="115" r="56" fill="#9aa8c6" />
		<ellipse cx="150" cy="286" rx="112" ry="102" fill="#9aa8c6" />
	</svg>
	`;

	return new File([new Blob([svg], { type: 'image/svg+xml' })], 'default-avatar.svg', {
		type: 'image/svg+xml'
	});
};

const validateField = (name, value, fullForm) => {
	const trimmed = typeof value === 'string' ? value.trim() : value;

	if (name === 'firstName') {
		if (!trimmed) return 'First name is required.';
		if (!/^[a-zA-Z\s'-]{2,40}$/.test(trimmed)) return 'Use 2-40 letters only.';
	}

	if (name === 'lastName') {
		if (!trimmed) return 'Last name is required.';
		if (!/^[a-zA-Z\s'-]{2,40}$/.test(trimmed)) return 'Use 2-40 letters only.';
	}

	if (name === 'email') {
		if (!trimmed) return 'Email is required.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Invalid email format.';
	}

	if (name === 'phoneNumber') {
		if (!trimmed) return 'Phone number is required.';
		if (!/^\d{10}$/.test(trimmed)) return 'Phone number must be exactly 10 digits.';
	}

	if (name === 'dateOfBirth') {
		if (trimmed) {
			const chosen = new Date(trimmed);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			if (Number.isNaN(chosen.getTime()) || chosen >= today) {
				return 'Date of birth must be a valid past date.';
			}
		}
	}

	if (name === 'emergencyContactPhone' && trimmed && !/^\d{10}$/.test(trimmed)) {
		return 'Emergency contact phone must be 10 digits.';
	}

	if (name === 'postalCode' && trimmed && !/^[a-zA-Z0-9\-\s]{3,12}$/.test(trimmed)) {
		return 'Postal code format looks invalid.';
	}

	if ((name === 'emergencyContactPhone' || name === 'emergencyContactName') && fullForm) {
		if (fullForm.emergencyContactName && !fullForm.emergencyContactPhone) {
			return name === 'emergencyContactPhone' ? 'Emergency contact phone is required when name is provided.' : '';
		}
	}

	return '';
};

const PatientProfile = () => {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [removingPhoto, setRemovingPhoto] = useState(false);
	const [editableFields, setEditableFields] = useState({});

	const [patientId, setPatientId] = useState(null);
	const [profile, setProfile] = useState(null);
	const [form, setForm] = useState(initialForm);
	const [originalForm, setOriginalForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [message, setMessage] = useState({ type: '', text: '' });

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	useEffect(() => {
		const loadProfile = async () => {
			setLoading(true);
			setMessage({ type: '', text: '' });

			try {
				const token = localStorage.getItem('accessToken');
				if (!token) {
					throw new Error('No active session found. Please log in again.');
				}

				const userId = extractUserIdFromToken(token);
				const sessionPatientId = Number(localStorage.getItem('patientId'));

				let loadedProfile = null;
				if (userId) {
					const byUser = await axios.get(`${API_BASE_URL}/api/patients/user/${userId}`, {
						headers: authHeaders
					});
					loadedProfile = byUser.data;
				} else if (Number.isInteger(sessionPatientId) && sessionPatientId > 0) {
					const byPatient = await axios.get(
						`${API_BASE_URL}/api/patients/${sessionPatientId}/profile`,
						{ headers: authHeaders }
					);
					loadedProfile = byPatient.data;
				}

				if (!loadedProfile?.id) {
					throw new Error('Unable to load patient profile for this user.');
				}

				localStorage.setItem('patientId', String(loadedProfile.id));
				setPatientId(loadedProfile.id);
				setProfile(loadedProfile);
				const mapped = formatProfileToForm(loadedProfile);
				setForm(mapped);
				setOriginalForm(mapped);
				setEditableFields({});
			} catch (error) {
				const errorText = error?.response?.data?.message || error.message || 'Failed to load profile.';
				setMessage({ type: 'error', text: errorText });
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [authHeaders]);

	const avatarUrl = useMemo(() => resolveCloudinaryUrl(profile?.profilePictureUrl), [profile]);

	const hasChanges = useMemo(() => {
		return Object.keys(form).some((key) => (form[key] || '') !== (originalForm[key] || ''));
	}, [form, originalForm]);

	const hasOpenEditors = useMemo(() => Object.values(editableFields).some(Boolean), [editableFields]);

	const validateForm = (values) => {
		const nextErrors = {};
		Object.keys(values).forEach((key) => {
			const err = validateField(key, values[key], values);
			if (err) nextErrors[key] = err;
		});
		return nextErrors;
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => {
			const next = { ...prev, [name]: value };
			const fieldError = validateField(name, value, next);
			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: fieldError
			}));
			return next;
		});
	};

	const handleSave = async () => {
		const nextErrors = validateForm(form);
		setErrors(nextErrors);

		if (Object.values(nextErrors).some(Boolean)) {
			setMessage({ type: 'error', text: 'Please correct the validation errors before saving.' });
			return;
		}

		if (!patientId) {
			setMessage({ type: 'error', text: 'Cannot update profile because patient ID is missing.' });
			return;
		}

		setSaving(true);
		setMessage({ type: '', text: '' });

		try {
			const payload = Object.fromEntries(
				Object.entries(form).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val])
			);

			const response = await axios.put(
				`${API_BASE_URL}/api/patients/${patientId}/profile`,
				payload,
				{ headers: authHeaders }
			);

			setProfile(response.data);
			const mapped = formatProfileToForm(response.data);
			setForm(mapped);
			setOriginalForm(mapped);
			setEditableFields({});
			setMessage({ type: 'success', text: 'Profile updated successfully.' });
		} catch (error) {
			const errorText = error?.response?.data?.message || 'Failed to update profile.';
			setMessage({ type: 'error', text: errorText });
		} finally {
			setSaving(false);
		}
	};

	const uploadPicture = async (file) => {
		if (!file || !patientId) return;

		const formData = new FormData();
		formData.append('file', file);

		const response = await axios.post(
			`${API_BASE_URL}/api/patients/${patientId}/profile-picture`,
			formData,
			{
				headers: {
					...authHeaders,
					'Content-Type': 'multipart/form-data'
				}
			}
		);

		setProfile(response.data);
	};

	const handlePictureUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			setMessage({ type: 'error', text: 'Please upload a valid image file.' });
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setMessage({ type: 'error', text: 'Image must be smaller than 5MB.' });
			return;
		}

		setUploadingPhoto(true);
		setMessage({ type: '', text: '' });

		try {
			await uploadPicture(file);
			setMessage({ type: 'success', text: 'Profile picture updated.' });
		} catch (error) {
			const errorText = error?.response?.data?.message || 'Failed to upload profile picture.';
			setMessage({ type: 'error', text: errorText });
		} finally {
			setUploadingPhoto(false);
			event.target.value = '';
		}
	};

	const handleDeletePicture = async () => {
		if (!patientId) return;
		setRemovingPhoto(true);
		setMessage({ type: '', text: '' });

		try {
			// Backend exposes only upload for profile picture changes, so remove is implemented by replacing with default avatar.
			const placeholder = buildPlaceholderAvatarFile();
			await uploadPicture(placeholder);
			setMessage({ type: 'success', text: 'Profile picture removed.' });
		} catch (error) {
			const errorText = error?.response?.data?.message || 'Failed to remove profile picture.';
			setMessage({ type: 'error', text: errorText });
		} finally {
			setRemovingPhoto(false);
		}
	};

	const resetForm = () => {
		setForm(formatProfileToForm(profile || {}));
		setOriginalForm(formatProfileToForm(profile || {}));
		setErrors({});
		setEditableFields({});
		setMessage({ type: '', text: '' });
	};

	const toggleFieldEdit = (name) => {
		setEditableFields((prev) => ({ ...prev, [name]: !prev[name] }));
		setMessage({ type: '', text: '' });
	};

	if (loading) {
		return (
			<div className="pp-loading-wrap">
				<div className="pp-loading-spinner" />
				<p>Loading your profile...</p>
			</div>
		);
	}

	return (
		<div className="pp-shell">
			<header className="pp-header">
				<div>
					<h1>My Profile</h1>
					<p>Data is loaded from your profile in DB. Click the edit icon beside each field to update it.</p>
				</div>
				<div className="pp-edit-chip">Per-field editing enabled</div>
			</header>

			{message.text && (
				<div className={`pp-message pp-message-${message.type}`}>
					{message.type === 'success' ? (
						<CheckCircleIcon className="pp-message-icon" />
					) : (
						<ExclamationTriangleIcon className="pp-message-icon" />
					)}
					<span>{message.text}</span>
				</div>
			)}

			<section className="pp-top-card">
				<div className="pp-avatar-wrap">
					{avatarUrl ? (
						<img src={avatarUrl} alt="Patient profile" className="pp-avatar" />
					) : (
						<div className="pp-avatar-fallback">
							<UserCircleIcon className="pp-avatar-icon" />
						</div>
					)}
				</div>

				<div className="pp-photo-actions">
					<label className="pp-photo-btn" htmlFor="profile-upload-input">
						<PhotoIcon className="pp-icon" />
						{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
					</label>
					<input
						id="profile-upload-input"
						type="file"
						accept="image/*"
						onChange={handlePictureUpload}
						disabled={uploadingPhoto || removingPhoto}
						hidden
					/>

					<button
						className="pp-photo-btn pp-photo-btn-danger"
						type="button"
						onClick={handleDeletePicture}
						disabled={uploadingPhoto || removingPhoto}
					>
						<TrashIcon className="pp-icon" />
						{removingPhoto ? 'Removing...' : 'Delete Photo'}
					</button>
				</div>
			</section>

			<section className="pp-form-grid">
				<Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} disabled={!editableFields.firstName} required onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.firstName} />
				<Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} disabled={!editableFields.lastName} required onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.lastName} />
				<Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} error={errors.middleName} disabled={!editableFields.middleName} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.middleName} />
				<Field label="Email" name="email" value={form.email} onChange={handleChange} error={errors.email} disabled={!editableFields.email} required onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.email} />
				<Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} disabled={!editableFields.phoneNumber} required onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.phoneNumber} />
				<Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} error={errors.dateOfBirth} disabled={!editableFields.dateOfBirth} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.dateOfBirth} />

				<SelectField
					label="Gender"
					name="gender"
					value={form.gender}
					onChange={handleChange}
					error={errors.gender}
					disabled={!editableFields.gender}
					onToggleEdit={toggleFieldEdit}
					isEditing={!!editableFields.gender}
					options={['Male', 'Female', 'Other', 'Prefer not to say']}
				/>

				<SelectField
					label="Blood Group"
					name="bloodGroup"
					value={form.bloodGroup}
					onChange={handleChange}
					error={errors.bloodGroup}
					disabled={!editableFields.bloodGroup}
					onToggleEdit={toggleFieldEdit}
					isEditing={!!editableFields.bloodGroup}
					options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
				/>

				<Field label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} error={errors.addressLine1} disabled={!editableFields.addressLine1} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.addressLine1} />
				<Field label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} error={errors.addressLine2} disabled={!editableFields.addressLine2} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.addressLine2} />
				<Field label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} disabled={!editableFields.city} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.city} />
				<Field label="State" name="state" value={form.state} onChange={handleChange} error={errors.state} disabled={!editableFields.state} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.state} />
				<Field label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} error={errors.postalCode} disabled={!editableFields.postalCode} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.postalCode} />
				<Field label="Country" name="country" value={form.country} onChange={handleChange} error={errors.country} disabled={!editableFields.country} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.country} />

				<Field
					label="Emergency Contact Name"
					name="emergencyContactName"
					value={form.emergencyContactName}
					onChange={handleChange}
					error={errors.emergencyContactName}
					disabled={!editableFields.emergencyContactName}
					onToggleEdit={toggleFieldEdit}
					isEditing={!!editableFields.emergencyContactName}
				/>
				<Field
					label="Emergency Contact Phone"
					name="emergencyContactPhone"
					value={form.emergencyContactPhone}
					onChange={handleChange}
					error={errors.emergencyContactPhone}
					disabled={!editableFields.emergencyContactPhone}
					onToggleEdit={toggleFieldEdit}
					isEditing={!!editableFields.emergencyContactPhone}
				/>
				<Field
					label="Emergency Contact Relation"
					name="emergencyContactRelation"
					value={form.emergencyContactRelation}
					onChange={handleChange}
					error={errors.emergencyContactRelation}
					disabled={!editableFields.emergencyContactRelation}
					onToggleEdit={toggleFieldEdit}
					isEditing={!!editableFields.emergencyContactRelation}
				/>

				<TextAreaField label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} error={errors.allergies} disabled={!editableFields.allergies} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.allergies} />
				<TextAreaField label="Chronic Conditions" name="chronicConditions" value={form.chronicConditions} onChange={handleChange} error={errors.chronicConditions} disabled={!editableFields.chronicConditions} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.chronicConditions} />
				<TextAreaField label="Current Medications" name="currentMedications" value={form.currentMedications} onChange={handleChange} error={errors.currentMedications} disabled={!editableFields.currentMedications} onToggleEdit={toggleFieldEdit} isEditing={!!editableFields.currentMedications} />
			</section>

			{(hasOpenEditors || hasChanges) && (
				<footer className="pp-footer-actions">
					<button className="pp-btn pp-btn-secondary" type="button" onClick={resetForm}>
						<XCircleIcon className="pp-icon" />
						Cancel
					</button>
					<button className="pp-btn pp-btn-primary" type="button" onClick={handleSave} disabled={saving}>
						<CheckCircleIcon className="pp-icon" />
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</footer>
			)}
		</div>
	);
};

const Field = ({ label, name, value, onChange, error, disabled, type = 'text', required = false, onToggleEdit, isEditing }) => (
	<label className="pp-field">
		<span className="pp-field-head">
			<span>
				{label}
				{required && <strong className="pp-required">*</strong>}
			</span>
			<button type="button" className={`pp-inline-edit ${isEditing ? 'pp-inline-edit-active' : ''}`} onClick={() => onToggleEdit(name)}>
				<PencilSquareIcon className="pp-inline-edit-icon" />
			</button>
		</span>
		<input
			className={`pp-input ${error ? 'pp-input-error' : ''}`}
			type={type}
			name={name}
			value={value}
			onChange={onChange}
			disabled={disabled}
			autoComplete="off"
		/>
		{error && <small className="pp-error-text">{error}</small>}
	</label>
);

const SelectField = ({ label, name, value, onChange, error, disabled, options, onToggleEdit, isEditing }) => (
	<label className="pp-field">
		<span className="pp-field-head">
			<span>{label}</span>
			<button type="button" className={`pp-inline-edit ${isEditing ? 'pp-inline-edit-active' : ''}`} onClick={() => onToggleEdit(name)}>
				<PencilSquareIcon className="pp-inline-edit-icon" />
			</button>
		</span>
		<select className={`pp-input ${error ? 'pp-input-error' : ''}`} name={name} value={value} onChange={onChange} disabled={disabled}>
			<option value="">Select {label}</option>
			{options.map((item) => (
				<option value={item} key={item}>
					{item}
				</option>
			))}
		</select>
		{error && <small className="pp-error-text">{error}</small>}
	</label>
);

const TextAreaField = ({ label, name, value, onChange, error, disabled, onToggleEdit, isEditing }) => (
	<label className="pp-field pp-field-full">
		<span className="pp-field-head">
			<span>{label}</span>
			<button type="button" className={`pp-inline-edit ${isEditing ? 'pp-inline-edit-active' : ''}`} onClick={() => onToggleEdit(name)}>
				<PencilSquareIcon className="pp-inline-edit-icon" />
			</button>
		</span>
		<textarea className={`pp-input ${error ? 'pp-input-error' : ''}`} name={name} value={value} onChange={onChange} disabled={disabled} rows={3} />
		{error && <small className="pp-error-text">{error}</small>}
	</label>
);

export default PatientProfile;

