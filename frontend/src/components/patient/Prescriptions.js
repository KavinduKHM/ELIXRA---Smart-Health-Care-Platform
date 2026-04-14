import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
	BellAlertIcon,
	CheckCircleIcon,
	ClipboardDocumentListIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	EyeSlashIcon,
	MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts';
import { format, differenceInDays } from 'date-fns';
import './Prescriptions.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';
const CHART_COLORS = ['#2f80ed', '#1f9d67', '#f59f00', '#cb4b4b', '#6f4cdc', '#15aabf'];

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
	} catch {
		return null;
	}
};

const extractUserIdFromToken = (token) => {
	const payload = parseJwtPayload(token);
	if (!payload) return null;
	for (const key of ['userId', 'id', 'user_id', 'sub']) {
		const value = Number(payload[key]);
		if (Number.isInteger(value) && value > 0) return value;
	}
	return null;
};

const normalizePrescription = (item) => {
	const prescriptionDate = item?.prescriptionDate ? new Date(item.prescriptionDate) : null;
	const validUntil = item?.validUntil ? new Date(item.validUntil) : null;

	return {
		id: item?.id,
		doctorName: item?.doctorName || 'N/A',
		specialty: item?.doctorSpecialty || 'General',
		diagnosis: item?.diagnosis || 'N/A',
		notes: item?.notes || '',
		medications: Array.isArray(item?.medications) ? item.medications : [],
		medicationCount: Array.isArray(item?.medications) ? item.medications.length : 0,
		appointmentId: item?.appointmentId,
		prescriptionDate,
		validUntil,
		active: typeof item?.active === 'boolean' ? item.active : !!item?.isActive,
		fulfilled: typeof item?.fulfilled === 'boolean' ? item.fulfilled : !!item?.isFulfilled
	};
};

const Prescriptions = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [patientId, setPatientId] = useState('');
	const [prescriptions, setPrescriptions] = useState([]);
	const [showAll, setShowAll] = useState(false);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError('');

			try {
				const token = localStorage.getItem('accessToken');
				let resolvedPatientId = null;

				const userId = token ? extractUserIdFromToken(token) : null;
				if (userId) {
					try {
						const byUser = await axios.get(`${API_BASE_URL}/api/patients/user/${userId}`, { headers: authHeaders });
						resolvedPatientId = Number(byUser?.data?.id) || null;
					} catch {
						// Fallback below.
					}
				}

				if (!resolvedPatientId) {
					const sid = Number(localStorage.getItem('patientId'));
					if (Number.isInteger(sid) && sid > 0) {
						resolvedPatientId = sid;
					}
				}

				if (!resolvedPatientId) {
					throw new Error('Unable to resolve logged-in patient.');
				}

				localStorage.setItem('patientId', String(resolvedPatientId));
				setPatientId(String(resolvedPatientId));

				const res = await axios.get(`${API_BASE_URL}/api/patients/${resolvedPatientId}/prescriptions`, { headers: authHeaders });
				const list = Array.isArray(res.data) ? res.data : [];
				const normalized = list
					.map(normalizePrescription)
					.sort((a, b) => (b.prescriptionDate?.getTime() || 0) - (a.prescriptionDate?.getTime() || 0));

				setPrescriptions(normalized);
			} catch (loadError) {
				setError(loadError?.response?.data?.message || loadError?.message || 'Failed to load prescriptions.');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [authHeaders]);

	const filteredPrescriptions = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return prescriptions;

		return prescriptions.filter((p) => {
			const medicationText = (p.medications || [])
				.map((m) => [m?.medicationName, m?.name, m?.dosage, m?.frequency].filter(Boolean).join(' '))
				.join(' ')
				.toLowerCase();

			const haystack = [p.doctorName, p.specialty, p.diagnosis, p.notes, medicationText]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return haystack.includes(q);
		});
	}, [prescriptions, searchQuery]);

	const visiblePrescriptions = useMemo(() => (showAll ? filteredPrescriptions : filteredPrescriptions.slice(0, 6)), [filteredPrescriptions, showAll]);

	const now = useMemo(() => new Date(), []);

	const activePrescriptions = useMemo(() => {
		return filteredPrescriptions.filter((p) => {
			if (!p.active) return false;
			if (!p.validUntil) return true;
			return p.validUntil > now;
		});
	}, [filteredPrescriptions, now]);

	const expiringSoon = useMemo(() => {
		return activePrescriptions.filter((p) => p.validUntil && differenceInDays(p.validUntil, now) <= 7);
	}, [activePrescriptions, now]);

	const statusChartData = useMemo(() => {
		const active = activePrescriptions.length;
		const inactive = Math.max(filteredPrescriptions.length - active, 0);
		const fulfilled = filteredPrescriptions.filter((p) => p.fulfilled).length;
		const pending = Math.max(filteredPrescriptions.length - fulfilled, 0);

		return [
			{ name: 'Active', value: active, color: '#1f9d67' },
			{ name: 'Inactive/Expired', value: inactive, color: '#cb4b4b' },
			{ name: 'Fulfilled', value: fulfilled, color: '#2f80ed' },
			{ name: 'Pending', value: pending, color: '#f59f00' }
		].filter((d) => d.value > 0);
	}, [activePrescriptions.length, filteredPrescriptions]);

	const monthlyTrendData = useMemo(() => {
		const map = {};
		filteredPrescriptions.forEach((p) => {
			if (!p.prescriptionDate) return;
			const key = format(p.prescriptionDate, 'yyyy-MM');
			map[key] = (map[key] || 0) + 1;
		});
		return Object.keys(map)
			.sort()
			.map((key) => ({ month: format(new Date(`${key}-01T00:00:00`), 'MMM yy'), count: map[key] }));
	}, [filteredPrescriptions]);

	const specialtyChartData = useMemo(() => {
		const map = {};
		filteredPrescriptions.forEach((p) => {
			map[p.specialty] = (map[p.specialty] || 0) + 1;
		});
		return Object.entries(map)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value)
			.slice(0, 8);
	}, [filteredPrescriptions]);

	if (loading) {
		return (
			<div className="pr-loading-wrap">
				<div className="pr-spinner" />
				<p>Loading prescriptions...</p>
			</div>
		);
	}

	return (
		<div className="pr-shell">
			<header className="pr-hero">
				<div>
					<h1>My Prescriptions</h1>
					<p>Prescription details for the logged-in patient, with status insights and trends.</p>
					<span className="pr-meta">Patient ID: {patientId || 'N/A'}</span>
				</div>
			</header>

			{error && (
				<section className="pr-alert pr-alert-error">
					<ExclamationTriangleIcon className="pr-alert-icon" />
					<span>{error}</span>
				</section>
			)}

			{!error && (
				<>
					<section className="pr-alert pr-alert-info">
						<BellAlertIcon className="pr-alert-icon" />
						<span>
							Current active prescriptions: <strong>{activePrescriptions.length}</strong>
						</span>
					</section>

					{expiringSoon.length > 0 && (
						<section className="pr-alert pr-alert-warning">
							<ExclamationTriangleIcon className="pr-alert-icon" />
							<span>
								{expiringSoon.length} prescription{expiringSoon.length > 1 ? 's are' : ' is'} expiring within 7 days.
							</span>
						</section>
					)}
				</>
			)}

			<section className="pr-table-card">
				<div className="pr-table-head">
					<h2>Prescription Records</h2>
					<div className="pr-table-actions">
						<div className="pr-search-box">
							<input
								type="text"
								placeholder="Search doctor, medication, diagnosis..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										setSearchQuery(searchInput.trim());
									}
								}}
							/>
							<button className="pr-btn pr-btn-secondary" type="button" onClick={() => setSearchQuery(searchInput.trim())}>
								<MagnifyingGlassIcon className="pr-btn-icon" /> Search
							</button>
							<button
								className="pr-btn pr-btn-secondary"
								type="button"
								onClick={() => {
									setSearchInput('');
									setSearchQuery('');
								}}
							>
								Clear
							</button>
						</div>
						{filteredPrescriptions.length > 6 && (
						<button className="pr-btn pr-btn-secondary" type="button" onClick={() => setShowAll((prev) => !prev)}>
							{showAll ? (
								<><EyeSlashIcon className="pr-btn-icon" /> Show Less</>
							) : (
								<><EyeIcon className="pr-btn-icon" /> View All</>
							)}
						</button>
						)}
					</div>
				</div>

				<div className="pr-table-wrap">
					<table className="pr-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Prescription Date</th>
								<th>Valid Until</th>
								<th>Doctor</th>
								<th>Specialty</th>
								<th>Diagnosis</th>
								<th>Medications</th>
								<th>Status</th>
							</tr>
						</thead>
						<tbody>
							{visiblePrescriptions.length > 0 ? (
								visiblePrescriptions.map((p) => (
									<tr key={p.id}>
										<td>{p.id}</td>
										<td>{p.prescriptionDate ? format(p.prescriptionDate, 'MMM dd, yyyy') : 'N/A'}</td>
										<td>{p.validUntil ? format(p.validUntil, 'MMM dd, yyyy') : 'N/A'}</td>
										<td>{p.doctorName}</td>
										<td>{p.specialty}</td>
										<td>{p.diagnosis}</td>
										<td>
											<div className="pr-meds">
												<ClipboardDocumentListIcon className="pr-meds-icon" />
												<span>{p.medicationCount}</span>
											</div>
										</td>
										<td>
											<span className={`pr-status ${p.active ? 'pr-status-active' : 'pr-status-inactive'}`}>
												{p.active ? (
													<><CheckCircleIcon className="pr-status-icon" /> Active</>
												) : 'Inactive'}
											</span>
											<span className={`pr-status ${p.fulfilled ? 'pr-status-fulfilled' : 'pr-status-pending'}`}>
												{p.fulfilled ? 'Fulfilled' : 'Pending'}
											</span>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={8} className="pr-empty">No prescription records found.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>

			<section className="pr-chart-grid">
				<article className="pr-chart-card">
					<h3>Prescription Status Mix</h3>
					{statusChartData.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<PieChart>
								<Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={92}>
									{statusChartData.map((item) => (
										<Cell key={item.name} fill={item.color} />
									))}
								</Pie>
								<Legend />
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<p className="pr-empty">No data.</p>
					)}
				</article>

				<article className="pr-chart-card">
					<h3>Monthly Prescription Trend</h3>
					{monthlyTrendData.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<LineChart data={monthlyTrendData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="month" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Line type="monotone" dataKey="count" stroke="#2f80ed" strokeWidth={2.5} />
							</LineChart>
						</ResponsiveContainer>
					) : (
						<p className="pr-empty">No data.</p>
					)}
				</article>
			</section>

			<section className="pr-chart-grid pr-chart-grid-bottom">
				<article className="pr-chart-card pr-chart-card-full">
					<h3>Top Prescribing Specialties</h3>
					{specialtyChartData.length > 0 ? (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={specialtyChartData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="name" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Bar dataKey="value" radius={[8, 8, 0, 0]}>
									{specialtyChartData.map((item, index) => (
										<Cell key={`${item.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="pr-empty">No data.</p>
					)}
				</article>
			</section>
		</div>
	);
};

export default Prescriptions;

