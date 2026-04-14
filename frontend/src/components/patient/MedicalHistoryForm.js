import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import './MedicalHistoryForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

const initialForm = {
	patientId: '',
	historyType: '',
	title: '',
	description: '',
	eventDate: '',
	doctorName: '',
	facilityName: '',
	status: 'COMPLETED'
};

const validateField = (name, value) => {
	const trimmed = typeof value === 'string' ? value.trim() : value;

	if (name === 'historyType') {
		if (!trimmed) return 'History type is required.';
		if (trimmed.length < 3) return 'History type must be at least 3 characters.';
	}

	if (name === 'patientId') {
		if (!trimmed) return 'Patient ID is required.';
		if (!/^\d+$/.test(trimmed)) return 'Patient ID must be a positive number.';
		if (Number(trimmed) <= 0) return 'Patient ID must be greater than 0.';
	}

	if (name === 'title') {
		if (!trimmed) return 'Title is required.';
		if (trimmed.length < 5) return 'Title must be at least 5 characters.';
		if (trimmed.length > 120) return 'Title cannot exceed 120 characters.';
	}

	if (name === 'description' && trimmed && trimmed.length > 1500) {
		return 'Description cannot exceed 1500 characters.';
	}

	if (name === 'eventDate') {
		if (!trimmed) return 'Event date/time is required.';
		const chosen = new Date(trimmed);
		if (Number.isNaN(chosen.getTime())) return 'Invalid event date/time.';
		const now = new Date();
		if (chosen > now) return 'Event date/time cannot be in the future.';
	}

	if (name === 'doctorName' && trimmed && trimmed.length > 100) {
		return 'Doctor name cannot exceed 100 characters.';
	}

	if (name === 'facilityName' && trimmed && trimmed.length > 120) {
		return 'Facility name cannot exceed 120 characters.';
	}

	return '';
};

const toApiDateTime = (localDateTime) => `${localDateTime}:00`;

const MedicalHistoryForm = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [lastSubmitted, setLastSubmitted] = useState(null);

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const handleChange = (event) => {
		const { name, value } = event.target;

		setForm((prev) => ({ ...prev, [name]: value }));
		const nextError = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: nextError }));
	};

	const handleBlur = (event) => {
		const { name, value } = event.target;
		setTouched((prev) => ({ ...prev, [name]: true }));
		const nextError = validateField(name, value);
		setErrors((prev) => ({ ...prev, [name]: nextError }));
	};

	const validateForm = () => {
		const nextErrors = {};
		Object.keys(form).forEach((key) => {
			const err = validateField(key, form[key]);
			if (err) nextErrors[key] = err;
		});

		setErrors(nextErrors);
		setTouched(Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
		return Object.keys(nextErrors).length === 0;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage({ type: '', text: '' });

		if (!validateForm()) {
			setMessage({ type: 'error', text: 'Please fix validation errors before submitting.' });
			return;
		}

		setSubmitting(true);
		try {
			const patientId = Number(form.patientId);
			const payload = {
				historyType: form.historyType.trim(),
				title: form.title.trim(),
				description: form.description.trim(),
				eventDate: toApiDateTime(form.eventDate),
				doctorName: form.doctorName.trim(),
				facilityName: form.facilityName.trim(),
				status: form.status
			};

			await axios.post(`${API_BASE_URL}/api/patients/${patientId}/medical-history`, payload, {
				headers: authHeaders
			});

			setMessage({ type: 'success', text: 'Medical history record added successfully.' });
			setLastSubmitted({ patientId, title: payload.title });
			setForm(initialForm);
			setErrors({});
			setTouched({});
		} catch (submitError) {
			const apiMsg =
				submitError?.response?.data?.message ||
				submitError?.response?.data?.error ||
				submitError?.response?.data;
			const msg = apiMsg ? `Failed to add medical history record: ${String(apiMsg)}` : 'Failed to add medical history record.';
			setMessage({ type: 'error', text: msg });
			setLastSubmitted(null);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mhf-shell">
			<header className="mhf-header">
				<div>
					<h1>Add Medical History</h1>
					<p>Create a new medical history record for the logged-in patient.</p>
				</div>
				<Link className="mhf-link" to="/patient/medical-history">Back to history</Link>
			</header>

			{message.text && (
				<section className={`mhf-alert mhf-alert-${message.type}`} role="status" aria-live="polite">
					{message.type === 'success' ? (
						<CheckCircleIcon className="mhf-alert-icon" />
					) : (
						<ExclamationTriangleIcon className="mhf-alert-icon" />
					)}
					<div>
						<span>{message.text}</span>
						{message.type === 'success' && lastSubmitted && (
							<div className="mhf-alert-actions">
								<button className="mhf-btn mhf-btn-primary" type="button" onClick={() => navigate('/patient/medical-history')}>
									Go to History
								</button>
							</div>
						)}
					</div>
				</section>
			)}

			<form className="mhf-form" onSubmit={handleSubmit} noValidate>
				<Field
					label="Patient ID"
					name="patientId"
					value={form.patientId}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.patientId ? errors.patientId : ''}
					required
					type="number"
					placeholder="Enter patient ID"
				/>

				<Field
					label="History Type"
					name="historyType"
					value={form.historyType}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.historyType ? errors.historyType : ''}
					required
					placeholder="e.g. Surgery, Diagnosis, Follow-up"
				/>

				<Field
					label="Title"
					name="title"
					value={form.title}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.title ? errors.title : ''}
					required
					placeholder="e.g. Hypertension diagnosis"
				/>

				<Field
					label="Event Date & Time"
					name="eventDate"
					type="datetime-local"
					value={form.eventDate}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.eventDate ? errors.eventDate : ''}
					required
				/>

				<Field
					label="Doctor Name"
					name="doctorName"
					value={form.doctorName}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.doctorName ? errors.doctorName : ''}
					placeholder="Optional"
				/>

				<Field
					label="Facility Name"
					name="facilityName"
					value={form.facilityName}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.facilityName ? errors.facilityName : ''}
					placeholder="Optional"
				/>

				<label className="mhf-field">
					<span>Status</span>
					<select name="status" value={form.status} onChange={handleChange} onBlur={handleBlur}>
						<option value="COMPLETED">COMPLETED</option>
						<option value="PENDING">PENDING</option>
						<option value="CANCELLED">CANCELLED</option>
						<option value="UNKNOWN">UNKNOWN</option>
					</select>
				</label>

				<label className="mhf-field mhf-field-full">
					<span>Description</span>
					<textarea
						name="description"
						rows={4}
						value={form.description}
						onChange={handleChange}
						onBlur={handleBlur}
						placeholder="Add medical notes"
					/>
					{touched.description && errors.description && <small className="mhf-error">{errors.description}</small>}
				</label>

				<footer className="mhf-actions">
					<Link className="mhf-btn mhf-btn-secondary" to="/patient/medical-history">Cancel</Link>
					<button className="mhf-btn mhf-btn-primary" type="submit" disabled={submitting}>
						{submitting ? 'Saving...' : 'Add Record'}
					</button>
				</footer>
			</form>
		</div>
	);
};

const Field = ({
	label,
	name,
	value,
	onChange,
	onBlur,
	error,
	required = false,
	type = 'text',
	placeholder = ''
}) => (
	<label className="mhf-field">
		<span>
			{label}
			{required && <strong className="mhf-required">*</strong>}
		</span>
		<input
			name={name}
			type={type}
			min={type === 'number' ? '1' : undefined}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			placeholder={placeholder}
			className={error ? 'mhf-input-error' : ''}
			autoComplete="off"
		/>
		{error && <small className="mhf-error">{error}</small>}
	</label>
);

export default MedicalHistoryForm;
