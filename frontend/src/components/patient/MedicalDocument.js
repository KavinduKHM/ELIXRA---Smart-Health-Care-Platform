import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	CheckCircleIcon,
	ExclamationTriangleIcon,
	MagnifyingGlassIcon,
	PencilSquareIcon,
	TrashIcon,
	ArrowUpTrayIcon,
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
import './MedicalDocument.css';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : '')
  || 'http://localhost:8082';

const COLORS = ['#2f80ed', '#1f9d67', '#f59f00', '#cb4b4b', '#6f4cdc', '#15aabf'];
const ACCEPTED_TYPES = [
	'application/pdf',
	'image/jpeg',
	'image/png',
	'image/webp',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

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
	for (const key of ['userId', 'id', 'user_id', 'sub']) {
		const value = payload[key];
		const parsed = Number(value);
		if (Number.isInteger(parsed) && parsed > 0) return parsed;
	}
	return null;
};

const getExtension = (fileName, fileType) => {
	const fromName = String(fileName || '').split('.').pop()?.toLowerCase();
	if (fromName && fromName !== String(fileName || '').toLowerCase()) return fromName;
	if (fileType) {
		if (fileType.includes('pdf')) return 'pdf';
		if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'jpg';
		if (fileType.includes('png')) return 'png';
		if (fileType.includes('webp')) return 'webp';
		if (fileType.includes('word')) return 'doc';
	}
	return 'other';
};

const normalizeDocument = (doc) => ({
	id: doc?.id,
	patientId: doc?.patientId,
	fileName: doc?.fileName || 'Unknown file',
	fileUrl: doc?.fileUrl || '',
	fileType: doc?.fileType || '',
	fileSize: Number(doc?.fileSize || 0),
	documentType: doc?.documentType || 'General',
	description: doc?.description || '',
	notes: doc?.notes || '',
	uploadedAt: doc?.uploadedAt || null,
	verified: Boolean(doc?.verified),
	extension: getExtension(doc?.fileName, doc?.fileType)
});

const MedicalDocument = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [patientId, setPatientId] = useState('');
	const [documents, setDocuments] = useState([]);
	const [error, setError] = useState('');
	const [feedback, setFeedback] = useState({ type: '', text: '' });

	const [editingId, setEditingId] = useState(null);
	const [editDraft, setEditDraft] = useState(null);
	const [editFile, setEditFile] = useState(null);
	const [busyIds, setBusyIds] = useState({});

	const [queryInput, setQueryInput] = useState('');
	const [query, setQuery] = useState('');
	const [extensionFilter, setExtensionFilter] = useState('ALL');
	const [flashModal, setFlashModal] = useState(null);

	const authHeaders = useMemo(() => {
		const token = localStorage.getItem('accessToken');
		return token ? { Authorization: `Bearer ${token}` } : {};
	}, []);

	const setBusy = (id, val) => setBusyIds((prev) => ({ ...prev, [id]: val }));

	const fetchDocuments = useCallback(async (pid) => {
		const res = await axios.get(`${API_BASE_URL}/api/patients/${pid}/documents`, { headers: authHeaders });
		const list = Array.isArray(res.data) ? res.data : [];
		const normalized = list.map(normalizeDocument).sort((a, b) => new Date(b.uploadedAt || 0) - new Date(a.uploadedAt || 0));
		setDocuments(normalized);
	}, [authHeaders]);

	useEffect(() => {
		const flash = location.state?.flashMessage;
		if (!flash?.text) return;

		setFlashModal({
			type: flash.type === 'error' ? 'error' : 'success',
			text: String(flash.text)
		});

		navigate(location.pathname, { replace: true, state: {} });
	}, [location.pathname, location.state, navigate]);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError('');
			try {
				const token = localStorage.getItem('accessToken');
				let resolved = null;
				if (token) {
					const userId = extractUserIdFromToken(token);
					if (userId) {
						const profile = await axios.get(`${API_BASE_URL}/api/patients/user/${userId}`, { headers: authHeaders });
						resolved = Number(profile?.data?.id) || null;
					}
				}
				if (!resolved) {
					const sid = Number(localStorage.getItem('patientId'));
					if (Number.isInteger(sid) && sid > 0) resolved = sid;
				}
				if (!resolved) throw new Error('Unable to resolve current patient. Enter patient ID manually below.');

				setPatientId(String(resolved));
				localStorage.setItem('patientId', String(resolved));
				await fetchDocuments(resolved);
			} catch (e) {
				setError(e?.response?.data?.message || e.message || 'Failed to load documents.');
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [authHeaders, fetchDocuments]);

	const filteredDocuments = useMemo(() => {
		const q = query.trim().toLowerCase();
		return documents.filter((doc) => {
			if (extensionFilter !== 'ALL' && doc.extension !== extensionFilter) return false;
			if (!q) return true;
			const haystack = [doc.fileName, doc.documentType, doc.description, doc.notes, doc.fileType].join(' ').toLowerCase();
			return haystack.includes(q);
		});
	}, [documents, query, extensionFilter]);

	const sizeToMB = (size) => (size / (1024 * 1024)).toFixed(2);

	const extensionChart = useMemo(() => {
		const map = {};
		filteredDocuments.forEach((d) => { map[d.extension] = (map[d.extension] || 0) + 1; });
		return Object.entries(map).map(([name, value], i) => ({ name: name.toUpperCase(), value, color: COLORS[i % COLORS.length] }));
	}, [filteredDocuments]);

	const typeChart = useMemo(() => {
		const map = {};
		filteredDocuments.forEach((d) => { map[d.documentType] = (map[d.documentType] || 0) + 1; });
		return Object.entries(map).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
	}, [filteredDocuments]);

	const uploadTrend = useMemo(() => {
		const map = {};
		filteredDocuments.forEach((d) => {
			if (!d.uploadedAt) return;
			const key = format(new Date(d.uploadedAt), 'yyyy-MM');
			map[key] = (map[key] || 0) + 1;
		});
		return Object.keys(map).sort().map((k) => ({ month: format(new Date(`${k}-01T00:00:00`), 'MMM yy'), count: map[k] }));
	}, [filteredDocuments]);

	const sizeChart = useMemo(() => {
		const buckets = { '<1MB': 0, '1-5MB': 0, '5-10MB': 0, '>10MB': 0 };
		filteredDocuments.forEach((d) => {
			const mb = d.fileSize / (1024 * 1024);
			if (mb < 1) buckets['<1MB'] += 1;
			else if (mb < 5) buckets['1-5MB'] += 1;
			else if (mb <= 10) buckets['5-10MB'] += 1;
			else buckets['>10MB'] += 1;
		});
		return Object.entries(buckets).map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }));
	}, [filteredDocuments]);

	const cancelEdit = () => {
		setEditingId(null);
		setEditDraft(null);
		setEditFile(null);
	};

	const handleUpdate = async (docId) => {
		if (!editDraft || !patientId) return;
		if (!editDraft.documentType.trim() || editDraft.documentType.trim().length < 3) {
			setFeedback({ type: 'error', text: 'Document type is required (min 3 chars).' });
			return;
		}
		if (editFile && (!ACCEPTED_TYPES.includes(editFile.type) || editFile.size > 10 * 1024 * 1024)) {
			setFeedback({ type: 'error', text: 'Invalid update file type/size.' });
			return;
		}

		setBusy(docId, true);
		setFeedback({ type: '', text: '' });
		try {
			const payload = new FormData();
			if (editFile) payload.append('file', editFile);
			payload.append('documentType', editDraft.documentType.trim());
			payload.append('description', editDraft.description.trim());
			payload.append('notes', editDraft.notes.trim());

			await axios.put(`${API_BASE_URL}/api/patients/${Number(patientId)}/documents/${docId}`, payload, {
				headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
			});

			await fetchDocuments(Number(patientId));
			cancelEdit();
			setFeedback({ type: 'success', text: 'Document updated successfully.' });
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || 'Update failed.';
			setFeedback({ type: 'error', text: String(msg) });
		} finally {
			setBusy(docId, false);
		}
	};

	const handleDelete = async (docId) => {
		if (!patientId) return;
		setBusy(docId, true);
		setFeedback({ type: '', text: '' });
		try {
			await axios.delete(`${API_BASE_URL}/api/patients/${Number(patientId)}/documents/${docId}`, { headers: authHeaders });
			setDocuments((prev) => prev.filter((d) => d.id !== docId));
			setFeedback({ type: 'success', text: 'Document deleted successfully.' });
		} catch (e) {
			const msg = e?.response?.data?.message || e?.response?.data?.error || 'Delete failed.';
			setFeedback({ type: 'error', text: String(msg) });
		} finally {
			setBusy(docId, false);
		}
	};

	if (loading) {
		return (
			<div className="md-loading-wrap">
				<div className="md-loading-spinner" />
				<p>Loading documents...</p>
			</div>
		);
	}

	return (
		<div className="md-shell">
			{flashModal && (
				<div className="md-modal-backdrop" role="dialog" aria-modal="true">
					<div className="md-modal">
						<div className={`md-alert ${flashModal.type === 'error' ? 'md-alert-error' : 'md-alert-success'}`}>
							{flashModal.type === 'error' ? (
								<ExclamationTriangleIcon className="md-alert-icon" />
							) : (
								<CheckCircleIcon className="md-alert-icon" />
							)}
							<span>{flashModal.text}</span>
						</div>
						<div className="md-modal-actions">
							<button type="button" className="md-btn md-btn-primary" onClick={() => setFlashModal(null)}>
								OK
							</button>
						</div>
					</div>
				</div>
			)}

			<header className="md-header">
				<div>
					<h1>Medical Documents</h1>
					<p>Manage patient documents with Cloudinary-backed upload, update, and delete actions.</p>
				</div>
				<button className="md-btn md-btn-primary" type="button" onClick={() => navigate('/documents/upload')}>
					<ArrowUpTrayIcon className="md-btn-icon" /> Upload New Document
				</button>
			</header>

			{error && (
				<section className="md-alert md-alert-error">
					<ExclamationTriangleIcon className="md-alert-icon" />
					<span>{error}</span>
				</section>
			)}

			{feedback.text && (
				<section className={`md-alert ${feedback.type === 'error' ? 'md-alert-error' : 'md-alert-success'}`} role="status" aria-live="polite">
					{feedback.type === 'error' ? (
						<ExclamationTriangleIcon className="md-alert-icon" />
					) : (
						<CheckCircleIcon className="md-alert-icon" />
					)}
					<span>{feedback.text}</span>
				</section>
			)}

			<section className="md-table-card">
				<div className="md-card-head">
					<h2>Existing Documents</h2>
					<span className="md-chip">{filteredDocuments.length} records</span>
				</div>

				<div className="md-filters">
					<div className="md-search-box">
						<input
							className="md-search-input"
							value={queryInput}
							onChange={(e) => setQueryInput(e.target.value)}
							onKeyDown={(e) => { if (e.key === 'Enter') setQuery(queryInput.trim()); }}
							placeholder="Search by file/type/description"
						/>
						<button type="button" className="md-btn md-btn-primary md-btn-sm" onClick={() => setQuery(queryInput.trim())}>
							<MagnifyingGlassIcon className="md-btn-icon" /> Search
						</button>
						<button type="button" className="md-btn md-btn-sm" onClick={() => { setQueryInput(''); setQuery(''); }}>Clear</button>
						<select
							className="md-category-select"
							value={extensionFilter}
							onChange={(e) => setExtensionFilter(e.target.value)}
						>
							<option value="ALL">All Categories</option>
							<option value="pdf">PDF</option>
							<option value="jpg">JPG</option>
							<option value="png">PNG</option>
						</select>
					</div>
				</div>

				<div className="md-table-wrap">
					<table className="md-table">
						<thead>
							<tr>
								<th>File</th>
								<th>Ext</th>
								<th>Type</th>
								<th>Size</th>
								<th>Uploaded</th>
								<th>Verified</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredDocuments.map((doc) => {
								const isEditing = editingId === doc.id;
								const isBusy = !!busyIds[doc.id];
								return (
									<React.Fragment key={doc.id}>
										<tr>
											<td>
												{doc.fileUrl ? <a href={doc.fileUrl} target="_blank" rel="noreferrer">{doc.fileName}</a> : doc.fileName}
											</td>
											<td>{doc.extension.toUpperCase()}</td>
											<td>{doc.documentType}</td>
											<td>{sizeToMB(doc.fileSize)} MB</td>
											<td>{doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM dd, yyyy h:mm a') : 'N/A'}</td>
											<td>{doc.verified ? 'Yes' : 'No'}</td>
											<td>
												<div className="md-row-actions">
													<button
														className="md-btn md-btn-sm"
														type="button"
														disabled={isBusy}
														onClick={() =>
															navigate('/documents/update', {
																state: {
																	patientId,
																	documentId: doc.id,
																	currentDocument: doc
																}
															})
														}
													>
														<PencilSquareIcon className="md-btn-icon" /> Update
													</button>
													<button className="md-btn md-btn-sm md-btn-danger" type="button" disabled={isBusy} onClick={() => handleDelete(doc.id)}>
														<TrashIcon className="md-btn-icon" /> Delete
													</button>
												</div>
											</td>
										</tr>
										{isEditing && editDraft && (
											<tr className="md-edit-row">
												<td colSpan={7}>
													<div className="md-edit-grid">
														<label>
															<span>Document Type*</span>
															<input value={editDraft.documentType} onChange={(e) => setEditDraft((p) => ({ ...p, documentType: e.target.value }))} />
														</label>
														<label>
															<span>Description</span>
															<input value={editDraft.description} onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))} />
														</label>
														<label>
															<span>Replace File (optional)</span>
															<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
														</label>
														<label className="md-edit-full">
															<span>Notes</span>
															<textarea rows={2} value={editDraft.notes} onChange={(e) => setEditDraft((p) => ({ ...p, notes: e.target.value }))} />
														</label>
													</div>
													<div className="md-edit-actions">
														<button type="button" className="md-btn md-btn-primary md-btn-sm" disabled={isBusy} onClick={() => handleUpdate(doc.id)}>
															<CheckCircleIcon className="md-btn-icon" /> {isBusy ? 'Saving...' : 'Save Update'}
														</button>
														<button type="button" className="md-btn md-btn-sm" disabled={isBusy} onClick={cancelEdit}>
															<XMarkIcon className="md-btn-icon" /> Cancel
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
			</section>

			<section className="md-chart-grid">
				<div className="md-chart-card">
					<div className="md-card-head"><h2>By Extension</h2></div>
					{extensionChart.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<PieChart>
								<Pie data={extensionChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={90}>
									{extensionChart.map((item, idx) => <Cell key={`ext-${idx}`} fill={item.color} />)}
								</Pie>
								<Tooltip />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					) : <p className="md-empty">No data.</p>}
				</div>

				<div className="md-chart-card">
					<div className="md-card-head"><h2>By Document Type</h2></div>
					{typeChart.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<BarChart data={typeChart}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="name" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Bar dataKey="value" radius={[8, 8, 0, 0]}>
									{typeChart.map((item, idx) => <Cell key={`type-${idx}`} fill={item.color} />)}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : <p className="md-empty">No data.</p>}
				</div>
			</section>

			<section className="md-chart-grid">
				<div className="md-chart-card">
					<div className="md-card-head"><h2>Upload Trend</h2></div>
					{uploadTrend.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<LineChart data={uploadTrend}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="month" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Line type="monotone" dataKey="count" stroke="#2f80ed" strokeWidth={2.5} />
							</LineChart>
						</ResponsiveContainer>
					) : <p className="md-empty">No data.</p>}
				</div>

				<div className="md-chart-card">
					<div className="md-card-head"><h2>File Size Distribution</h2></div>
					{sizeChart.length > 0 ? (
						<ResponsiveContainer width="100%" height={260}>
							<BarChart data={sizeChart}>
								<CartesianGrid strokeDasharray="3 3" stroke="#d9e3f1" />
								<XAxis dataKey="name" stroke="#607086" />
								<YAxis allowDecimals={false} stroke="#607086" />
								<Tooltip />
								<Bar dataKey="value" radius={[8, 8, 0, 0]}>
									{sizeChart.map((item, idx) => <Cell key={`size-${idx}`} fill={item.color} />)}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : <p className="md-empty">No data.</p>}
				</div>
			</section>
		</div>
	);
};

export default MedicalDocument;
