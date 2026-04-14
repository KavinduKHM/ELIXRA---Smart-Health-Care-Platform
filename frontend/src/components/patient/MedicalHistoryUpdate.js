import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { CheckCircleIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import './MedicalHistoryForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

const initialLookup = {
	patientId: '',
	historyId: ''
};

const initialForm = {
	historyType: '',
	title: '',
	description: '',
	eventDate: '',
	doctorName: '',
	facilityName: '',
	status: 'UNKNOWN'
};

const normalizeHistory = (item) => ({
	id: item?.id,
	historyType: item?.historyType || '',
	title: item?.title || '',
	description: item?.description || '',
	eventDate: item?.eventDate || '',
	doctorName: item?.doctorName || '',
	facilityName: item?.facilityName || '',
	status: item?.status || 'UNKNOWN'
});

const toDateTimeLocal = (value) => {
	if (!value) return '';
	const dt = new Date(value);
	if (Number.isNaN(dt.getTime())) return '';
	const pad = (n) => String(n).padStart(2, '0');
	return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toApiDateTime = (localDateTime) => `${localDateTime}:00`;

const validateLookup = (name, value) => {
	const trimmed = String(value || '').trim();
	if (!trimmed) return `${name === 'patientId' ? 'Patient ID' : 'History ID'} is required.`;
	if (!/^\d+$/.test(trimmed)) return `${name === 'patientId' ? 'Patient ID' : 'History ID'} must be a positive number.`;
	if (Number(trimmed) <= 0) return `${name === 'patientId' ? 'Patient ID' : 'History ID'} must be greater than 0.`;
	return '';
};

const validateField = (name, value) => {
	const trimmed = typeof value === 'string' ? value.trim() : value;

	if (name === 'historyType') {
		if (!trimmed) return 'History type is required.';
		if (trimmed.length < 3) return 'History type must be at least 3 characters.';
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

const MedicalHistoryUpdate = () => {
	const navigate = useNavigate();
	const [lookup, setLookup] = useState(initialLookup);
	const [lookupErrors, setLookupErrors] = useState({});
	const [form, setForm] = useState(initialForm);
	const [errors, setErrors] = useState({});
	const [touched, setTouched] = useState({});
	const [loadingRecord, setLoadingRecord] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [loadedRecordId, setLoadedRecordId] = useState(null);
	const [message, setMessage] = useState({ type: '', text: '' });
	const [updatedRecordInfo, setUpdatedRecordInfo] = useState(null);

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const handleLookupChange = (event) => {
		const { name, value } = event.target;
		setLookup((prev) => ({ ...prev, [name]: value }));
		setLookupErrors((prev) => ({ ...prev, [name]: validateLookup(name, value) }));
	};

	const handleChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
	};

	const handleBlur = (event) => {
		const { name, value } = event.target;
		setTouched((prev) => ({ ...prev, [name]: true }));
		setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
	};

	const canLookup = () => {
		const next = {
			patientId: validateLookup('patientId', lookup.patientId),
			historyId: validateLookup('historyId', lookup.historyId)
		};
		setLookupErrors(next);
		return !next.patientId && !next.historyId;
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

	const fetchRecord = async () => {
		setMessage({ type: '', text: '' });
		if (!canLookup()) {
			setMessage({ type: 'error', text: 'Enter valid Patient ID and History ID.' });
			return;
		}

		setLoadingRecord(true);
		try {
			const patientId = Number(lookup.patientId);
			const historyId = Number(lookup.historyId);

			const allRes = await axios.get(`${API_BASE_URL}/api/patients/${patientId}/medical-history/all`, {
				headers: authHeaders
			});

			const list = Array.isArray(allRes.data) ? allRes.data : [];
			const found = list.find((item) => Number(item?.id) === historyId);

			if (!found) {
				throw new Error('History record not found for this patient.');
			}

			const normalized = normalizeHistory(found);
			setLoadedRecordId(normalized.id);
			setForm({
				historyType: normalized.historyType,
				title: normalized.title,
				description: normalized.description,
				eventDate: toDateTimeLocal(normalized.eventDate),
				doctorName: normalized.doctorName,
				facilityName: normalized.facilityName,
				status: normalized.status
			});
			setErrors({});
			setTouched({});
			setMessage({ type: 'success', text: 'History record loaded. You can now update details.' });
		} catch (fetchError) {
			const msg = fetchError?.response?.data?.message || fetchError.message || 'Failed to fetch history record.';
			setLoadedRecordId(null);
			setMessage({ type: 'error', text: msg });
		} finally {
			setLoadingRecord(false);
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setMessage({ type: '', text: '' });

		if (!loadedRecordId) {
			setMessage({ type: 'error', text: 'Load a history record first.' });
			return;
		}

		if (!validateForm()) {
			setMessage({ type: 'error', text: 'Please fix validation errors before updating.' });
			return;
		}

		setSubmitting(true);
		try {
			const payload = {
				historyType: form.historyType.trim(),
				title: form.title.trim(),
				description: form.description.trim(),
				eventDate: toApiDateTime(form.eventDate),
				doctorName: form.doctorName.trim(),
				facilityName: form.facilityName.trim(),
				status: form.status
			};

			await axios.put(`${API_BASE_URL}/api/patients/medical-history/${loadedRecordId}`, payload, {
				headers: authHeaders
			});

			setMessage({ type: 'success', text: 'Medical history record updated successfully.' });
			setUpdatedRecordInfo({ historyId: loadedRecordId, title: payload.title });
		} catch (submitError) {
			const apiMsg =
				submitError?.response?.data?.message ||
				submitError?.response?.data?.error ||
				submitError?.response?.data;
			const msg = apiMsg ? `Failed to update medical history record: ${String(apiMsg)}` : 'Failed to update medical history record.';
			setMessage({ type: 'error', text: msg });
			setUpdatedRecordInfo(null);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mhf-shell">
			<header className="mhf-header">
				<div>
					<h1>Update Medical History</h1>
					<p>Fetch an existing medical history record, edit details, and save to database.</p>
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
						{message.type === 'success' && updatedRecordInfo && (
							<div className="mhf-alert-actions">
								<button className="mhf-btn mhf-btn-primary" type="button" onClick={() => navigate('/patient/medical-history')}>
									Go to History
								</button>
							</div>
						)}
					</div>
				</section>
			)}

			<section className="mhf-form">
				<div className="mhf-field">
					<span>
						Patient ID<strong className="mhf-required">*</strong>
					</span>
					<input
						name="patientId"
						type="number"
						min="1"
						value={lookup.patientId}
						onChange={handleLookupChange}
						placeholder="Enter patient ID"
					/>
					{lookupErrors.patientId && <small className="mhf-error">{lookupErrors.patientId}</small>}
				</div>

				<div className="mhf-field">
					<span>
						History ID<strong className="mhf-required">*</strong>
					</span>
					<input
						name="historyId"
						type="number"
						min="1"
						value={lookup.historyId}
						onChange={handleLookupChange}
						placeholder="Enter history ID"
					/>
					{lookupErrors.historyId && <small className="mhf-error">{lookupErrors.historyId}</small>}
				</div>

				<div className="mhf-actions mhf-actions-full">
					<button className="mhf-btn mhf-btn-primary" type="button" onClick={fetchRecord} disabled={loadingRecord}>
						<MagnifyingGlassIcon className="mhf-btn-icon" /> {loadingRecord ? 'Fetching...' : 'Fetch Current Data'}
					</button>
				</div>
			</section>

			<form className="mhf-form" onSubmit={handleSubmit} noValidate>
				<Field
					label="History Type"
					name="historyType"
					value={form.historyType}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.historyType ? errors.historyType : ''}
					required
					placeholder="e.g. Surgery, Diagnosis, Follow-up"
					disabled={!loadedRecordId}
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
					disabled={!loadedRecordId}
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
					disabled={!loadedRecordId}
				/>

				<Field
					label="Doctor Name"
					name="doctorName"
					value={form.doctorName}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.doctorName ? errors.doctorName : ''}
					placeholder="Optional"
					disabled={!loadedRecordId}
				/>

				<Field
					label="Facility Name"
					name="facilityName"
					value={form.facilityName}
					onChange={handleChange}
					onBlur={handleBlur}
					error={touched.facilityName ? errors.facilityName : ''}
					placeholder="Optional"
					disabled={!loadedRecordId}
				/>

				<label className="mhf-field">
					<span>Status</span>
					<select name="status" value={form.status} onChange={handleChange} onBlur={handleBlur} disabled={!loadedRecordId}>
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
						disabled={!loadedRecordId}
					/>
					{touched.description && errors.description && <small className="mhf-error">{errors.description}</small>}
				</label>

				<footer className="mhf-actions">
					<Link className="mhf-btn mhf-btn-secondary" to="/patient/medical-history">Cancel</Link>
					<button className="mhf-btn mhf-btn-primary" type="submit" disabled={submitting || !loadedRecordId}>
						{submitting ? 'Updating...' : 'Update Record'}
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
	placeholder = '',
	disabled = false
}) => (
	<label className="mhf-field">
		<span>
			{label}
			{required && <strong className="mhf-required">*</strong>}
		</span>
		<input
			name={name}
			type={type}
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			placeholder={placeholder}
			className={error ? 'mhf-input-error' : ''}
			autoComplete="off"
			disabled={disabled}
		/>
		{error && <small className="mhf-error">{error}</small>}
	</label>
);

export default MedicalHistoryUpdate;
