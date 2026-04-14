import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
	CalendarDaysIcon,
	ClipboardDocumentCheckIcon,
	ExclamationTriangleIcon,
	HeartIcon,
	MagnifyingGlassIcon,
	PencilSquareIcon,
	TrashIcon,
	CheckIcon,
	XMarkIcon
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
import { format } from 'date-fns';
import './MedicalHistory.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082';

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

const COLORS = ['#2f80ed', '#1f9d67', '#f59f00', '#c94848', '#6f4cdc', '#15aabf'];

const normalizeHistoryItem = (item) => ({
	id: item?.id,
	historyType: item?.historyType || 'Other',
	title: item?.title || 'Untitled record',
	description: item?.description || '',
	eventDate: item?.eventDate || item?.createdAt || null,
	doctorName: item?.doctorName || 'N/A',
	facilityName: item?.facilityName || 'N/A',
	status: item?.status || 'UNKNOWN',
	createdAt: item?.createdAt || null
});

const toDateTimeLocal = (value) => {
	if (!value) return '';
	const dt = new Date(value);
	if (Number.isNaN(dt.getTime())) return '';
	const pad = (n) => String(n).padStart(2, '0');
	return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
};

const toApiDateTime = (localValue) => {
	if (!localValue) return null;
	return `${localValue}:00`;
};

const PatientMedicalHistory = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [feedback, setFeedback] = useState({ type: '', text: '' });
	const [patient, setPatient] = useState(null);
	const [historyRecords, setHistoryRecords] = useState([]);
	const [searchInput, setSearchInput] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const [activeCategory, setActiveCategory] = useState('ALL');
	const [editingRecordId, setEditingRecordId] = useState(null);
	const [editDraft, setEditDraft] = useState(null);
	const [busyRecordIds, setBusyRecordIds] = useState({});

	useEffect(() => {
		const loadMedicalHistory = async () => {
			setLoading(true);
			setError('');
			setFeedback({ type: '', text: '' });

			try {
				const token = localStorage.getItem('accessToken');
				if (!token) {
					throw new Error('No active session found. Please log in again.');
				}

				const headers = { Authorization: `Bearer ${token}` };
				const userId = extractUserIdFromToken(token);
				let profile = null;

				if (userId) {
					const byUserResponse = await axios.get(`${API_BASE_URL}/api/patients/user/${userId}`, { headers });
					profile = byUserResponse.data;
				} else {
					const patientIdFromSession = Number(localStorage.getItem('patientId'));
					if (!Number.isInteger(patientIdFromSession) || patientIdFromSession <= 0) {
						throw new Error('Unable to resolve logged-in patient identity.');
					}

					const byIdResponse = await axios.get(
						`${API_BASE_URL}/api/patients/${patientIdFromSession}/profile`,
						{ headers }
					);
					profile = byIdResponse.data;
				}

				if (!profile?.id) {
					throw new Error('Patient profile was not found.');
				}

				setPatient(profile);
				localStorage.setItem('patientId', String(profile.id));

				let records = [];
				try {
					const allHistoryResponse = await axios.get(
						`${API_BASE_URL}/api/patients/${profile.id}/medical-history/all`,
						{ headers }
					);
					records = allHistoryResponse.data || [];
				} catch (allErr) {
					const fallbackResponse = await axios.get(
						`${API_BASE_URL}/api/patients/${profile.id}/medical-history`,
						{ headers }
					);
					records = fallbackResponse.data ? [fallbackResponse.data] : [];
				}

				const normalized = records
					.map(normalizeHistoryItem)
					.sort((a, b) => new Date(b.eventDate || 0) - new Date(a.eventDate || 0));

				setHistoryRecords(normalized);
			} catch (loadError) {
				const msg = loadError?.response?.data?.message || loadError.message || 'Failed to load medical history.';
				setError(msg);
			} finally {
				setLoading(false);
			}
		};

		loadMedicalHistory();
	}, []);

	const categoryOptions = useMemo(() => {
		const set = new Set(historyRecords.map((record) => record.historyType || 'Other'));
		return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
	}, [historyRecords]);

	const filteredRecords = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return historyRecords.filter((record) => {
			const matchesCategory = activeCategory === 'ALL' || (record.historyType || 'Other') === activeCategory;
			if (!matchesCategory) return false;

			if (!query) return true;

			const haystack = [
				record.title,
				record.description,
				record.historyType,
				record.status,
				record.doctorName,
				record.facilityName
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return haystack.includes(query);
		});
	}, [historyRecords, activeCategory, searchQuery]);

	const summary = useMemo(() => {
		const completed = filteredRecords.filter((record) => String(record.status).toUpperCase() === 'COMPLETED').length;
		const pending = filteredRecords.filter((record) => String(record.status).toUpperCase() === 'PENDING').length;
		const latest = filteredRecords[0]?.eventDate ? format(new Date(filteredRecords[0].eventDate), 'MMM dd, yyyy') : 'N/A';

		return {
			total: filteredRecords.length,
			completed,
			pending,
			latest
		};
	}, [filteredRecords]);

	const typeDistribution = useMemo(() => {
		const map = filteredRecords.reduce((acc, curr) => {
			const key = curr.historyType || 'Other';
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(map).map(([name, value], index) => ({
			name,
			value,
			color: COLORS[index % COLORS.length]
		}));
	}, [filteredRecords]);

	const statusDistribution = useMemo(() => {
		const map = filteredRecords.reduce((acc, curr) => {
			const key = (curr.status || 'UNKNOWN').toUpperCase();
			acc[key] = (acc[key] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(map).map(([name, value], index) => ({
			name,
			value,
			color: COLORS[index % COLORS.length]
		}));
	}, [filteredRecords]);

	const monthlyTrend = useMemo(() => {
		const monthMap = {};

		filteredRecords.forEach((record) => {
			if (!record.eventDate) return;
			const date = new Date(record.eventDate);
			const key = format(date, 'yyyy-MM');
			monthMap[key] = (monthMap[key] || 0) + 1;
		});

		return Object.keys(monthMap)
			.sort()
			.map((monthKey) => ({
				month: format(new Date(`${monthKey}-01T00:00:00`), 'MMM yy'),
				count: monthMap[monthKey]
			}));
	}, [filteredRecords]);

	const setRecordBusy = (recordId, busy) => {
		setBusyRecordIds((prev) => ({ ...prev, [recordId]: busy }));
	};

	const startEditRecord = (record) => {
		setEditingRecordId(record.id);
		setEditDraft({
			historyType: record.historyType || '',
			title: record.title || '',
			description: record.description || '',
			eventDate: toDateTimeLocal(record.eventDate),
			doctorName: record.doctorName === 'N/A' ? '' : record.doctorName,
			facilityName: record.facilityName === 'N/A' ? '' : record.facilityName,
			status: record.status || 'UNKNOWN'
		});
		setFeedback({ type: '', text: '' });
	};

	const cancelEditRecord = () => {
		setEditingRecordId(null);
		setEditDraft(null);
	};

	const updateEditDraft = (field, value) => {
		setEditDraft((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateRecord = async (recordId) => {
		if (!editDraft) return;

		if (!editDraft.historyType || !editDraft.title || !editDraft.eventDate) {
			setFeedback({ type: 'error', text: 'History type, title, and event date are required to update a record.' });
			return;
		}

		setRecordBusy(recordId, true);
		setFeedback({ type: '', text: '' });

		try {
			const token = localStorage.getItem('accessToken');
			const headers = token ? { Authorization: `Bearer ${token}` } : {};
			const payload = {
				historyType: editDraft.historyType,
				title: editDraft.title,
				description: editDraft.description || '',
				eventDate: toApiDateTime(editDraft.eventDate),
				doctorName: editDraft.doctorName || '',
				facilityName: editDraft.facilityName || '',
				status: editDraft.status || 'UNKNOWN'
			};

			const response = await axios.put(`${API_BASE_URL}/api/patients/medical-history/${recordId}`, payload, { headers });
			const updated = normalizeHistoryItem(response.data);

			setHistoryRecords((prev) =>
				prev
					.map((record) => (record.id === recordId ? updated : record))
					.sort((a, b) => new Date(b.eventDate || 0) - new Date(a.eventDate || 0))
			);

			cancelEditRecord();
			setFeedback({ type: 'success', text: 'Medical history record updated successfully.' });
		} catch (updateError) {
			const msg = updateError?.response?.data?.message || 'Failed to update record.';
			setFeedback({ type: 'error', text: msg });
		} finally {
			setRecordBusy(recordId, false);
		}
	};

	const handleDeleteRecord = async (recordId) => {
		setRecordBusy(recordId, true);
		setFeedback({ type: '', text: '' });

		try {
			const token = localStorage.getItem('accessToken');
			const headers = token ? { Authorization: `Bearer ${token}` } : {};
			await axios.delete(`${API_BASE_URL}/api/patients/medical-history/${recordId}`, { headers });
			setHistoryRecords((prev) => prev.filter((record) => record.id !== recordId));
			if (editingRecordId === recordId) {
				cancelEditRecord();
			}
			setFeedback({ type: 'success', text: 'Medical history record deleted.' });
		} catch (deleteError) {
			const msg = deleteError?.response?.data?.message || 'Failed to delete record.';
			setFeedback({ type: 'error', text: msg });
		} finally {
			setRecordBusy(recordId, false);
		}
	};

	const onSearch = () => {
		setSearchQuery(searchInput.trim());
	};

	const onClearSearch = () => {
		setSearchInput('');
		setSearchQuery('');
	};

	if (loading) {
		return (
			<div className="mh-loading-wrap">
				<div className="mh-loading-spinner" />
				<p>Loading medical history...</p>
			</div>
		);
	}

	return (
		<div className="mh-shell">
			<header className="mh-header-card">
				<div>
					<h1>Medical History</h1>
					<p>
						Timeline and analytical view for{patient?.firstName ? ` ${patient.firstName} ${patient?.lastName || ''}` : ' your'} clinical records.
					</p>
				</div>
			</header>

			{error && (
				<section className="mh-alert mh-alert-error">
					<ExclamationTriangleIcon className="mh-alert-icon" />
					<div>
						<h3>Unable to load data</h3>
						<p>{error}</p>
					</div>
				</section>
			)}

			{feedback.text && (
				<section className={`mh-alert ${feedback.type === 'error' ? 'mh-alert-error' : 'mh-alert-success'}`}>
					{feedback.type === 'error' ? (
						<ExclamationTriangleIcon className="mh-alert-icon" />
					) : (
						<ClipboardDocumentCheckIcon className="mh-alert-icon" />
					)}
					<div>
						<h3>{feedback.type === 'error' ? 'Action failed' : 'Action completed'}</h3>
						<p>{feedback.text}</p>
					</div>
				</section>
			)}

			<section className="mh-stats-grid">
				<article className="mh-stat-card">
					<div className="mh-stat-head">
						<p>Total Records</p>
						<ClipboardDocumentCheckIcon className="mh-stat-icon mh-stat-blue" />
					</div>
					<h3>{summary.total}</h3>
					<span>All medical history entries</span>
				</article>

				<article className="mh-stat-card">
					<div className="mh-stat-head">
						<p>Completed</p>
						<HeartIcon className="mh-stat-icon mh-stat-green" />
					</div>
					<h3>{summary.completed}</h3>
					<span>Marked as completed</span>
				</article>

				<article className="mh-stat-card">
					<div className="mh-stat-head">
						<p>Pending</p>
						<ExclamationTriangleIcon className="mh-stat-icon mh-stat-amber" />
					</div>
					<h3>{summary.pending}</h3>
					<span>Still under follow-up</span>
				</article>

				<article className="mh-stat-card">
					<div className="mh-stat-head">
						<p>Latest Event</p>
						<CalendarDaysIcon className="mh-stat-icon mh-stat-violet" />
					</div>
					<h3>{summary.latest}</h3>
					<span>Most recent clinical event</span>
				</article>
			</section>

			<section className="mh-list-card">
				<div className="mh-card-head">
					<h2>History Records</h2>
					<div className="mh-head-actions">
						<span className="mh-chip">{filteredRecords.length} entries</span>
						<Link className="mh-btn" to="/patient/medical-history/update">Update Form</Link>
						<Link className="mh-btn mh-btn-primary" to="/patient/medical-history/new">Add Record</Link>
					</div>
				</div>

				<div className="mh-controls">
					<div className="mh-search-box">
						<input
							type="text"
							className="mh-search-input"
							placeholder="Search by title, type, doctor, status..."
							value={searchInput}
							onChange={(event) => setSearchInput(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === 'Enter') onSearch();
							}}
						/>
						<button type="button" className="mh-btn mh-btn-primary" onClick={onSearch}>
							<MagnifyingGlassIcon className="mh-btn-icon" /> Search
						</button>
						<button type="button" className="mh-btn" onClick={onClearSearch}>
							<XMarkIcon className="mh-btn-icon" /> Clear
						</button>
					</div>

					<div className="mh-category-row">
						{categoryOptions.map((category) => (
							<button
								key={category}
								type="button"
								className={`mh-category-btn ${activeCategory === category ? 'mh-category-btn-active' : ''}`}
								onClick={() => setActiveCategory(category)}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{filteredRecords.length === 0 ? (
					<p className="mh-empty">No medical history records found for this patient.</p>
				) : (
					<div className="mh-table-wrap">
						<table className="mh-table">
							<thead>
								<tr>
									<th>Title</th>
									<th>Type</th>
									<th>Event Date</th>
									<th>Status</th>
									<th>Doctor</th>
									<th>Facility</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredRecords.map((record) => {
									const isEditing = editingRecordId === record.id;
									const isBusy = !!busyRecordIds[record.id];
									return (
										<React.Fragment key={record.id}>
											<tr>
												<td>{record.title}</td>
												<td>{record.historyType}</td>
												<td>{record.eventDate ? format(new Date(record.eventDate), 'MMM dd, yyyy h:mm a') : 'N/A'}</td>
												<td>
													<span className={`mh-status-pill mh-status-${String(record.status).toLowerCase()}`}>{record.status}</span>
												</td>
												<td>{record.doctorName}</td>
												<td>{record.facilityName}</td>
												<td>
													<div className="mh-row-actions">
														<button
															type="button"
															className="mh-btn mh-btn-sm"
															onClick={() => startEditRecord(record)}
															disabled={isBusy}
														>
															<PencilSquareIcon className="mh-btn-icon" /> Update
														</button>
														<button
															type="button"
															className="mh-btn mh-btn-sm mh-btn-danger"
															onClick={() => handleDeleteRecord(record.id)}
															disabled={isBusy}
														>
															<TrashIcon className="mh-btn-icon" /> {isBusy ? 'Processing...' : 'Delete'}
														</button>
													</div>
												</td>
											</tr>
											{isEditing && editDraft && (
												<tr className="mh-edit-row">
													<td colSpan={7}>
														<div className="mh-edit-grid">
															<label>
																<span>Title</span>
																<input value={editDraft.title} onChange={(e) => updateEditDraft('title', e.target.value)} />
															</label>
															<label>
																<span>Type</span>
																<input value={editDraft.historyType} onChange={(e) => updateEditDraft('historyType', e.target.value)} />
															</label>
															<label>
																<span>Date & Time</span>
																<input type="datetime-local" value={editDraft.eventDate} onChange={(e) => updateEditDraft('eventDate', e.target.value)} />
															</label>
															<label>
																<span>Status</span>
																<select value={editDraft.status} onChange={(e) => updateEditDraft('status', e.target.value)}>
																	<option value="COMPLETED">COMPLETED</option>
																	<option value="PENDING">PENDING</option>
																	<option value="CANCELLED">CANCELLED</option>
																	<option value="UNKNOWN">UNKNOWN</option>
																</select>
															</label>
															<label>
																<span>Doctor</span>
																<input value={editDraft.doctorName} onChange={(e) => updateEditDraft('doctorName', e.target.value)} />
															</label>
															<label>
																<span>Facility</span>
																<input value={editDraft.facilityName} onChange={(e) => updateEditDraft('facilityName', e.target.value)} />
															</label>
															<label className="mh-edit-full">
																<span>Description</span>
																<textarea rows={2} value={editDraft.description} onChange={(e) => updateEditDraft('description', e.target.value)} />
															</label>
														</div>
														<div className="mh-edit-actions">
															<button type="button" className="mh-btn mh-btn-primary mh-btn-sm" onClick={() => handleUpdateRecord(record.id)} disabled={isBusy}>
																<CheckIcon className="mh-btn-icon" /> {isBusy ? 'Saving...' : 'Save Update'}
															</button>
															<button type="button" className="mh-btn mh-btn-sm" onClick={cancelEditRecord} disabled={isBusy}>
																<XMarkIcon className="mh-btn-icon" /> Cancel
															</button>
														</div>
													</td>
												</tr>
											)}
										</React.Fragment>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>

			<section className="mh-chart-grid">
				<div className="mh-chart-card">
					<div className="mh-card-head">
						<h2>History Type Distribution</h2>
						<span className="mh-chip">By category</span>
					</div>
					{typeDistribution.length > 0 ? (
						<ResponsiveContainer width="100%" height={280}>
							<PieChart>
								<Pie
									data={typeDistribution}
									dataKey="value"
									nameKey="name"
									cx="50%"
									cy="50%"
									innerRadius={55}
									outerRadius={95}
									label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
								>
									{typeDistribution.map((item, idx) => (
										<Cell key={`type-${idx}`} fill={item.color} />
									))}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					) : (
						<p className="mh-empty">No data to plot yet.</p>
					)}
				</div>

				<div className="mh-chart-card">
					<div className="mh-card-head">
						<h2>Status Breakdown</h2>
						<span className="mh-chip">Current state</span>
					</div>
					{statusDistribution.length > 0 ? (
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={statusDistribution}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="name" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Bar dataKey="value" radius={[8, 8, 0, 0]}>
									{statusDistribution.map((item, idx) => (
										<Cell key={`status-${idx}`} fill={item.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="mh-empty">No data to plot yet.</p>
					)}
				</div>
			</section>

			<section className="mh-chart-card mh-chart-bottom">
				<div className="mh-card-head">
					<h2>Medical Events Trend</h2>
					<span className="mh-chip">Monthly records</span>
				</div>
				{monthlyTrend.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={monthlyTrend}>
							<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
							<XAxis dataKey="month" stroke="#607086" />
							<YAxis allowDecimals={false} stroke="#607086" />
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="count"
								name="Events"
								stroke="#2f80ed"
								strokeWidth={2.5}
								dot={{ r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				) : (
					<p className="mh-empty">No data to plot yet.</p>
				)}
			</section>
		</div>
	);
};

export default PatientMedicalHistory;

