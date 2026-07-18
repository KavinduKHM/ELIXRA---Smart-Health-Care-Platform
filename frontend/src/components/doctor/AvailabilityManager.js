// src/components/doctor/AvailabilityManager.js
import React, { useEffect, useMemo, useState } from 'react';
import { getDoctorAvailability, setAvailability, deleteAvailability } from '../../services/doctorService';

const PRESETS = [
  { key: 'morning', label: 'Morning', start: '09:00', end: '13:00' },
  { key: 'afternoon', label: 'Afternoon', start: '14:00', end: '18:00' },
  { key: 'evening', label: 'Evening', start: '18:00', end: '21:00' },
  { key: 'fullday', label: 'Full day', start: '09:00', end: '17:00' },
];

const BASE_DURATIONS = [15, 20, 30, 45, 60];

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm || '').split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const normalizeTime = (hhmm) => {
  const parts = String(hhmm || '').split(':');
  if (parts.length === 2) return `${hhmm}:00`;
  return hhmm;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const prettyTime = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':');
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AvailabilityManager = ({ doctorId, isVerified = false, defaultDuration }) => {
  const initialDuration = defaultDuration && defaultDuration > 0 ? Number(defaultDuration) : 30;
  const DURATIONS = BASE_DURATIONS.includes(initialDuration)
    ? BASE_DURATIONS
    : [...BASE_DURATIONS, initialDuration].sort((a, b) => a - b);

  const [availabilities, setAvailabilities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: initialDuration,
  });

  const today = new Date().toISOString().split('T')[0];

  const loadAvailabilities = async () => {
    try {
      const res = await getDoctorAvailability(doctorId);
      setAvailabilities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAvailabilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  useEffect(() => {
    if (!toast.text) return undefined;
    const timer = setTimeout(() => setToast({ type: '', text: '' }), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const slotPreview = useMemo(() => {
    const start = toMinutes(formData.startTime);
    const end = toMinutes(formData.endTime);
    const dur = Number(formData.slotDuration);
    if (start == null || end == null || !dur) return { count: 0, valid: false, span: 0 };
    const span = end - start;
    if (span <= 0) return { count: 0, valid: false, span };
    return { count: Math.floor(span / dur), valid: true, span };
  }, [formData]);

  const activePreset = useMemo(
    () => PRESETS.find((p) => p.start === formData.startTime && p.end === formData.endTime)?.key || '',
    [formData.startTime, formData.endTime]
  );

  const applyPreset = (preset) => {
    setFormData((prev) => ({ ...prev, startTime: preset.start, endTime: preset.end }));
  };

  const handleSubmit = async () => {
    if (!isVerified) {
      setToast({ type: 'error', text: 'Only verified doctors can set availability.' });
      return;
    }
    if (!formData.date) {
      setToast({ type: 'error', text: 'Please choose a date.' });
      return;
    }
    if (!slotPreview.valid) {
      setToast({ type: 'error', text: 'End time must be after the start time.' });
      return;
    }
    setSaving(true);
    try {
      await setAvailability(doctorId, {
        date: formData.date,
        startTime: normalizeTime(formData.startTime),
        endTime: normalizeTime(formData.endTime),
        slotDuration: Number(formData.slotDuration),
      });
      setToast({ type: 'success', text: `Availability added — ${slotPreview.count} slots created.` });
      await loadAvailabilities();
      setShowForm(false);
      setFormData({ date: '', startTime: '09:00', endTime: '17:00', slotDuration: initialDuration });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: err?.response?.data?.message || 'Failed to add availability.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (availabilityId) => {
    if (!window.confirm('Remove this availability window?')) return;
    try {
      await deleteAvailability(doctorId, availabilityId);
      setToast({ type: 'success', text: 'Availability removed.' });
      loadAvailabilities();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', text: 'Delete failed.' });
    }
  };

  const computeSlotCount = (a) => {
    const start = toMinutes(a.startTime);
    const end = toMinutes(a.endTime);
    const dur = Number(a.slotDuration);
    if (start == null || end == null || !dur || end <= start) return null;
    return Math.floor((end - start) / dur);
  };

  const grouped = useMemo(() => {
    const map = new Map();
    availabilities.forEach((a) => {
      const key = a.availableDate || 'Unscheduled';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return Array.from(map.entries()).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
  }, [availabilities]);

  return (
    <div className="doctor-ui-card doctor-availability">
      <div className="doctor-ui-card-header">
        <div>
          <h2 className="doctor-ui-card-title">Availability Schedule</h2>
          <p className="doctor-ui-card-subtitle">Define working windows and slot length — patients book the generated slots.</p>
          {!isVerified && <p className="doctor-ui-card-subtitle">Only verified doctors can create availability slots.</p>}
        </div>
        <button type="button" className="doctor-ui-btn" onClick={() => setShowForm((v) => !v)} disabled={!isVerified}>
          {showForm ? 'Close' : '+ Add Availability'}
        </button>
      </div>

      {toast.text && (
        <div className={`avail-toast ${toast.type === 'success' ? 'is-success' : 'is-error'}`}>{toast.text}</div>
      )}

      {showForm && (
        <div className="avail-form">
          <div className="avail-form-row">
            <div className="avail-field">
              <label>Date</label>
              <input
                type="date"
                min={today}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="avail-field">
              <label>Slot duration (per consultation)</label>
              <select
                value={formData.slotDuration}
                onChange={(e) => setFormData({ ...formData, slotDuration: e.target.value })}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} minutes{defaultDuration && Number(d) === initialDuration ? ' (your default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="avail-field">
            <label>Quick presets</label>
            <div className="avail-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`avail-preset ${activePreset === p.key ? 'is-active' : ''}`}
                  onClick={() => applyPreset(p)}
                >
                  {p.label}
                  <span>{prettyTime(p.start)}–{prettyTime(p.end)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="avail-form-row">
            <div className="avail-field">
              <label>Start time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="avail-field">
              <label>End time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className={`avail-preview ${slotPreview.valid ? '' : 'is-invalid'}`}>
            {slotPreview.valid ? (
              <>
                <span className="avail-preview-count">{slotPreview.count}</span>
                <span>
                  bookable slot{slotPreview.count === 1 ? '' : 's'} of {formData.slotDuration} min
                  {' '}between {prettyTime(formData.startTime)} and {prettyTime(formData.endTime)}
                </span>
              </>
            ) : (
              <span>Set an end time later than the start time to preview slots.</span>
            )}
          </div>

          <button type="button" className="doctor-ui-btn avail-save" onClick={handleSubmit} disabled={saving || !slotPreview.valid}>
            {saving ? 'Saving…' : 'Save Availability'}
          </button>
        </div>
      )}

      {availabilities.length === 0 ? (
        <p className="doctor-empty">No availability set yet. Add your first working window to start receiving bookings.</p>
      ) : (
        <div className="avail-schedule">
          {grouped.map(([date, items]) => (
            <div key={date} className="avail-day">
              <div className="avail-day-head">
                <span className="avail-day-date">{formatDate(date)}</span>
                <span className="avail-day-count">{items.length} window{items.length === 1 ? '' : 's'}</span>
              </div>
              <div className="avail-day-items">
                {items.map((a) => {
                  const count = computeSlotCount(a);
                  return (
                    <div key={a.id} className="avail-window">
                      <div className="avail-window-info">
                        <div className="avail-window-time">{prettyTime(a.startTime)} – {prettyTime(a.endTime)}</div>
                        <div className="avail-window-meta">
                          {a.slotDuration} min slots{count != null ? ` · ${count} slots` : ''}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="avail-delete"
                        onClick={() => handleDelete(a.id)}
                        aria-label="Delete availability"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
