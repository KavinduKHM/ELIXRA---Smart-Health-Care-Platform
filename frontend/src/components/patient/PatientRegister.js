import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './PatientRegister.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
const MAX_PROFILE_PICTURE_SIZE_MB = 5;
const MAX_PROFILE_PICTURE_SIZE = MAX_PROFILE_PICTURE_SIZE_MB * 1024 * 1024;

const CITY_TO_POSTAL_CODE = {
	bangalore: '560001',
	bengaluru: '560001',
	chennai: '600001',
	delhi: '110001',
	hyderabad: '500001',
	kolkata: '700001',
	mumbai: '400001',
	pune: '411001',
	ahmedabad: '380001',
	jaipur: '302001',
	lucknow: '226001',
	kochi: '682001',
	thiruvananthapuram: '695001',
};

const generateTemporaryUserId = () => {
	const randomSuffix = String(Math.floor(Math.random() * 90 + 10));
	return `${Date.now()}${randomSuffix}`;
};

const createInitialForm = () => ({
	userId: generateTemporaryUserId(),
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
});

const trimValue = (value) => (typeof value === 'string' ? value.trim() : value);
const normalizeCityKey = (value) => trimValue(value).toLowerCase();

const validateField = (name, value, fullForm) => {
	const trimmed = trimValue(value);

	if (name === 'userId') {
		if (!trimmed) return 'User ID is required.';
		if (!/^\d+$/.test(trimmed)) return 'User ID must be a positive number.';
		if (Number(trimmed) <= 0) return 'User ID must be greater than 0.';
	}

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

	if (name === 'dateOfBirth' && trimmed) {
		const chosen = new Date(trimmed);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		if (Number.isNaN(chosen.getTime()) || chosen >= today) {
			return 'Date of birth must be a valid past date.';
		}
	}

	if (name === 'dateOfBirth' && !trimmed) {
		return 'Date of birth is required.';
	}

	if (name === 'emergencyContactPhone' && trimmed && !/^\d{10}$/.test(trimmed)) {
		return 'Emergency contact phone must be 10 digits.';
	}

	if (name === 'postalCode' && trimmed && !/^[a-zA-Z0-9\-\s]{3,12}$/.test(trimmed)) {
		return 'Postal code format looks invalid.';
	}

	if ((name === 'emergencyContactName' || name === 'emergencyContactPhone') && fullForm) {
		const hasName = Boolean(trimValue(fullForm.emergencyContactName));
		const hasPhone = Boolean(trimValue(fullForm.emergencyContactPhone));
		if (hasName && !hasPhone && name === 'emergencyContactPhone') {
			return 'Emergency contact phone is required when name is provided.';
		}
		if (hasPhone && !hasName && name === 'emergencyContactName') {
			return 'Emergency contact name is required when phone is provided.';
		}
	}

	return '';
};

const validateProfilePicture = (file) => {
	if (!file) return '';
	if (!file.type.startsWith('image/')) return 'Please upload a valid image file.';
	if (file.size > MAX_PROFILE_PICTURE_SIZE) {
		return `Profile picture must be smaller than ${MAX_PROFILE_PICTURE_SIZE_MB}MB.`;
	}
	return '';
};

const PatientRegister = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState(() => createInitialForm());
	const [profilePicture, setProfilePicture] = useState(null);
	const [profilePreview, setProfilePreview] = useState('');
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [createdPatientId, setCreatedPatientId] = useState(null);
	const [autoPostalCode, setAutoPostalCode] = useState('');

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => {
			const next = { ...prev, [name]: value };

			if (name === 'postalCode' && autoPostalCode && trimValue(value) !== autoPostalCode) {
				setAutoPostalCode('');
			}

			if (name === 'city') {
				const suggestedPostalCode = CITY_TO_POSTAL_CODE[normalizeCityKey(value)] || '';
				const currentPostalCode = trimValue(next.postalCode);

				if (suggestedPostalCode && (!currentPostalCode || currentPostalCode === autoPostalCode)) {
					next.postalCode = suggestedPostalCode;
					setAutoPostalCode(suggestedPostalCode);
				} else if (!suggestedPostalCode && autoPostalCode && currentPostalCode === autoPostalCode) {
					next.postalCode = '';
					setAutoPostalCode('');
				}
			}

			setErrors((prevErrors) => ({
				...prevErrors,
				[name]: validateField(name, value, next),
				...(name === 'city' ? { postalCode: validateField('postalCode', next.postalCode, next) } : {}),
			}));
			return next;
		});
	};

	const handleBlur = (event) => {
		const { name, value } = event.target;
		setTouched((prev) => ({ ...prev, [name]: true }));
		setErrors((prevErrors) => ({
			...prevErrors,
			[name]: validateField(name, value, form),
		}));
	};

	const handleProfilePictureChange = (event) => {
		const previousPreview = profilePreview;
		const file = event.target.files?.[0] || null;

		setProfilePicture(file);

		if (previousPreview) {
			URL.revokeObjectURL(previousPreview);
		}

		if (file) {
			setProfilePreview(URL.createObjectURL(file));
		} else {
			setProfilePreview('');
		}

		setTouched((prev) => ({ ...prev, profilePicture: true }));
		setErrors((prevErrors) => ({
			...prevErrors,
			profilePicture: validateProfilePicture(file),
		}));
	};

	useEffect(() => () => {
		if (profilePreview) {
			URL.revokeObjectURL(profilePreview);
		}
	}, [profilePreview]);

	useEffect(() => {
		if (message.type !== 'success' || !message.text) return undefined;
		const timer = setTimeout(() => {
			setMessage({ type: '', text: '' });
		}, 4500);
		return () => clearTimeout(timer);
	}, [message]);

	const validateForm = () => {
		const nextErrors = {};

		Object.keys(form).forEach((key) => {
			const err = validateField(key, form[key], form);
			if (err) nextErrors[key] = err;
		});

		const profilePictureError = validateProfilePicture(profilePicture);
		if (profilePictureError) {
			nextErrors.profilePicture = profilePictureError;
		}

		setErrors(nextErrors);

		const touchedAll = {};
		Object.keys(form).forEach((key) => {
			touchedAll[key] = true;
		});
		touchedAll.profilePicture = true;
		setTouched(touchedAll);

		return !Object.values(nextErrors).some(Boolean);
	};

	const resetForm = () => {
		if (profilePreview) {
			URL.revokeObjectURL(profilePreview);
		}
		setForm(createInitialForm());
		setProfilePicture(null);
		setProfilePreview('');
		setErrors({});
		setTouched({});
		setAutoPostalCode('');
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage({ type: '', text: '' });
		setCreatedPatientId(null);

		if (!validateForm()) {
			setMessage({ type: 'error', text: 'Please fix validation errors before submitting.' });
			return;
		}

		setSubmitting(true);

		try {
			const payload = {
				...form,
				userId: Number(form.userId),
				firstName: trimValue(form.firstName),
				lastName: trimValue(form.lastName),
				middleName: trimValue(form.middleName),
				email: trimValue(form.email),
				phoneNumber: trimValue(form.phoneNumber),
				dateOfBirth: form.dateOfBirth || null,
				gender: trimValue(form.gender),
				bloodGroup: trimValue(form.bloodGroup),
				addressLine1: trimValue(form.addressLine1),
				addressLine2: trimValue(form.addressLine2),
				city: trimValue(form.city),
				state: trimValue(form.state),
				postalCode: trimValue(form.postalCode),
				country: trimValue(form.country),
				emergencyContactName: trimValue(form.emergencyContactName),
				emergencyContactPhone: trimValue(form.emergencyContactPhone),
				emergencyContactRelation: trimValue(form.emergencyContactRelation),
				allergies: trimValue(form.allergies),
				chronicConditions: trimValue(form.chronicConditions),
				currentMedications: trimValue(form.currentMedications),
			};

			const response = await axios.post(`${API_BASE_URL}/api/patients/register`, payload, {
				headers: {
					'Content-Type': 'application/json',
					...authHeaders,
				},
			});

			const patientId = response?.data?.id;

			if (patientId) {
				localStorage.setItem('patientId', String(patientId));
			}

			if (profilePicture && patientId) {
				const imagePayload = new FormData();
				imagePayload.append('file', profilePicture);

				await axios.post(`${API_BASE_URL}/api/patients/${patientId}/profile-picture`, imagePayload, {
					headers: {
						...authHeaders,
						'Content-Type': 'multipart/form-data',
					},
				});
			}

			setCreatedPatientId(patientId || null);
			setMessage({
				type: 'success',
				text: patientId
					? `Patient registration saved successfully. New Patient ID: ${patientId}`
					: 'Patient registration saved successfully.',
			});
			resetForm();
		} catch (error) {
			const errorText =
				error?.response?.data?.message ||
				(typeof error?.response?.data === 'string' ? error.response.data : '') ||
				'Failed to register patient in DB.';

			setMessage({ type: 'error', text: errorText });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="register-shell">
			{message.type === 'success' && message.text && (
				<section className="register-success-overlay" role="status" aria-live="polite">
					<div className="register-success-modal">
						<div className="register-success-icon" aria-hidden="true">✓</div>
						<h3>Registration Successful</h3>
						<p>{message.text}</p>
						<div className="register-success-actions">
						{createdPatientId ? (
							<button
								type="button"
								className="register-inline-button"
								onClick={() => navigate(`/patient/${createdPatientId}/profile`)}
							>
								Open Profile
							</button>
						) : null}
							<button
								type="button"
								className="register-inline-button register-inline-button-secondary"
								onClick={() => setMessage({ type: '', text: '' })}
							>
								Done
							</button>
						</div>
					</div>
				</section>
			)}

			<header className="register-header">
				<div>
					<h1>Patient Registration</h1>
					<p>Create a patient profile with proper field validation.</p>
				</div>
				<Link className="register-link" to="/patient">Back to Dashboard</Link>
			</header>

			{message.type === 'error' && message.text && (
				<section
					className="register-alert register-alert-error"
					role="status"
					aria-live="polite"
				>
					<span>{message.text}</span>
				</section>
			)}

			<form className="register-form" onSubmit={handleSubmit} noValidate>
				<div className="register-field register-field-full">
					<span>Profile Picture (optional)</span>
					<div className="register-picture-wrap">
						<label htmlFor="register-profile-picture" className="register-avatar-picker" title="Upload profile picture">
							{profilePreview ? (
								<img src={profilePreview} alt="Profile preview" className="register-avatar-image" />
							) : (
								<span className="register-avatar-fallback" aria-hidden="true">+</span>
							)}
							<span className="register-avatar-badge">Edit</span>
						</label>
						<input
							id="register-profile-picture"
							type="file"
							accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
							onChange={handleProfilePictureChange}
							onBlur={() => setTouched((prev) => ({ ...prev, profilePicture: true }))}
							className="register-file-input"
						/>
						<small className="muted">Tap the round icon to upload or change photo.</small>
					</div>
					{profilePicture && (
						<small className="register-file-meta">
							Selected: {profilePicture.name} ({(profilePicture.size / 1024 / 1024).toFixed(2)} MB)
						</small>
					)}
					{touched.profilePicture && errors.profilePicture && <small className="register-error">{errors.profilePicture}</small>}
				</div>

				<Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur} error={touched.firstName ? errors.firstName : ''} required />
				<Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur} error={touched.lastName ? errors.lastName : ''} required />
				<Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} onBlur={handleBlur} error={touched.middleName ? errors.middleName : ''} />
				<Field label="Email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur} error={touched.email ? errors.email : ''} required />
				<Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} onBlur={handleBlur} error={touched.phoneNumber ? errors.phoneNumber : ''} required />
				<Field label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} onBlur={handleBlur} error={touched.dateOfBirth ? errors.dateOfBirth : ''} required />

				<SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} onBlur={handleBlur} options={['Male', 'Female', 'Other', 'Prefer not to say']} error={touched.gender ? errors.gender : ''} />
				<SelectField label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} onBlur={handleBlur} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} error={touched.bloodGroup ? errors.bloodGroup : ''} />

				<Field label="Address Line 1" name="addressLine1" value={form.addressLine1} onChange={handleChange} onBlur={handleBlur} error={touched.addressLine1 ? errors.addressLine1 : ''} />
				<Field label="Address Line 2" name="addressLine2" value={form.addressLine2} onChange={handleChange} onBlur={handleBlur} error={touched.addressLine2 ? errors.addressLine2 : ''} />
				<Field label="City" name="city" value={form.city} onChange={handleChange} onBlur={handleBlur} error={touched.city ? errors.city : ''} />
				<Field label="State" name="state" value={form.state} onChange={handleChange} onBlur={handleBlur} error={touched.state ? errors.state : ''} />
				<Field
					label="Postal Code"
					name="postalCode"
					value={form.postalCode}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.postalCode ? errors.postalCode : ''}
					helperText={autoPostalCode ? 'Auto-filled from city. You can still edit it.' : 'Enter postal code if city is not recognized.'}
				/>
				<Field label="Country" name="country" value={form.country} onChange={handleChange} onBlur={handleBlur} error={touched.country ? errors.country : ''} />

				<Field label="Emergency Contact Name" name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactName ? errors.emergencyContactName : ''} />
				<Field label="Emergency Contact Phone" name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactPhone ? errors.emergencyContactPhone : ''} />
				<Field label="Emergency Contact Relation" name="emergencyContactRelation" value={form.emergencyContactRelation} onChange={handleChange} onBlur={handleBlur} error={touched.emergencyContactRelation ? errors.emergencyContactRelation : ''} />

				<TextAreaField label="Allergies" name="allergies" value={form.allergies} onChange={handleChange} onBlur={handleBlur} error={touched.allergies ? errors.allergies : ''} />
				<TextAreaField label="Chronic Conditions" name="chronicConditions" value={form.chronicConditions} onChange={handleChange} onBlur={handleBlur} error={touched.chronicConditions ? errors.chronicConditions : ''} />
				<TextAreaField label="Current Medications" name="currentMedications" value={form.currentMedications} onChange={handleChange} onBlur={handleBlur} error={touched.currentMedications ? errors.currentMedications : ''} />

				<footer className="register-actions register-field-full">
					<button className="register-btn-secondary" type="button" onClick={() => navigate('/patient')}>
						Cancel
					</button>
					<button className="register-btn-primary" type="submit" disabled={submitting}>
						{submitting ? 'Registering...' : 'Register Patient'}
					</button>
				</footer>
			</form>
		</div>
	);
};

const Field = ({ label, name, value, onChange, onBlur, error, type = 'text', required = false, readOnly = false, helperText = '' }) => (
	<label className="register-field">
		<span>
			{label}
			{required && <strong className="register-required">*</strong>}
		</span>
		<input
			name={name}
			type={type}
			min={type === 'number' ? '1' : undefined}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			required={required}
			readOnly={readOnly}
			className={error ? 'register-input-error' : ''}
			autoComplete="off"
			aria-invalid={Boolean(error)}
		/>
		{!error && helperText && <small className="muted">{helperText}</small>}
		{error && <small className="register-error">{error}</small>}
	</label>
);

const SelectField = ({ label, name, value, onChange, onBlur, error, options }) => (
	<label className="register-field">
		<span>{label}</span>
		<select
			name={name}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			className={error ? 'register-input-error' : ''}
			aria-invalid={Boolean(error)}
		>
			<option value="">Select {label}</option>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
		{error && <small className="register-error">{error}</small>}
	</label>
);

const TextAreaField = ({ label, name, value, onChange, onBlur, error }) => (
	<label className="register-field register-field-full">
		<span>{label}</span>
		<textarea
			name={name}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			rows={3}
			className={error ? 'register-input-error' : ''}
			aria-invalid={Boolean(error)}
		/>
		{error && <small className="register-error">{error}</small>}
	</label>
);

export default PatientRegister;
