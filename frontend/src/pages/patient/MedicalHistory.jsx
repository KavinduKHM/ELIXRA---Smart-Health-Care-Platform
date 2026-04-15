import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import {
  addPatientMedicalHistory,
  deleteMedicalHistory,
  listPatientMedicalHistory,
} from '../../services/patient.service';

export default function PatientMedicalHistory() {
  const { userId } = useAuth();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    historyType: 'GENERAL',
    title: '',
    description: '',
    eventDate: '',
    doctorName: '',
    facilityName: '',
    status: '',
  });

  const query = useQuery({
    queryKey: ['patientMedicalHistory', userId],
    queryFn: () => listPatientMedicalHistory(userId),
    enabled: Boolean(userId),
  });

  const items = Array.isArray(query.data) ? query.data : query.data?.content || query.data?.items || [];

  const addMutation = useMutation({
    mutationFn: (payload) => addPatientMedicalHistory(userId, payload),
    onSuccess: () => {
      toast.success('History entry added');
      setForm((s) => ({ ...s, title: '', description: '', eventDate: '' }));
      qc.invalidateQueries({ queryKey: ['patientMedicalHistory', userId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Failed to add entry'),
  });

  const deleteMutation = useMutation({
    mutationFn: (historyId) => deleteMedicalHistory(historyId),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['patientMedicalHistory', userId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Medical History</h1>
        <p className="mt-1 text-sm text-slate-600">Add and review your medical history entries.</p>
      </div>

      <Card>
        <div className="text-sm font-bold">Add entry</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select
            label="Type"
            value={form.historyType}
            onChange={(e) => setForm((s) => ({ ...s, historyType: e.target.value }))}
          >
            <option value="GENERAL">General</option>
            <option value="ALLERGY">Allergy</option>
            <option value="CONDITION">Condition</option>
            <option value="SURGERY">Surgery</option>
            <option value="VACCINATION">Vaccination</option>
          </Select>
          <Input
            label="Event date"
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => setForm((s) => ({ ...s, eventDate: e.target.value }))}
          />
        </div>
        <Input
          className="mt-4"
          label="Title"
          value={form.title}
          onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
        />
        <label className="mt-4 block">
          <div className="mb-1 text-sm font-medium text-slate-700">Description</div>
          <textarea
            className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </label>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Doctor name (optional)"
            value={form.doctorName}
            onChange={(e) => setForm((s) => ({ ...s, doctorName: e.target.value }))}
          />
          <Input
            label="Facility (optional)"
            value={form.facilityName}
            onChange={(e) => setForm((s) => ({ ...s, facilityName: e.target.value }))}
          />
          <Input
            label="Status (optional)"
            value={form.status}
            onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
          />
        </div>
        <div className="mt-4">
          <Button
            disabled={addMutation.isPending}
            onClick={() => {
              if (!form.title.trim() || !form.eventDate) {
                toast.error('Title and event date are required');
                return;
              }
              addMutation.mutate({
                historyType: form.historyType,
                title: form.title.trim(),
                description: form.description || null,
                eventDate: form.eventDate,
                doctorName: form.doctorName || null,
                facilityName: form.facilityName || null,
                status: form.status || null,
              });
            }}
          >
            {addMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Adding
              </span>
            ) : (
              'Add'
            )}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Entries</div>
        <div className="mt-4">
          {query.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Loading
            </div>
          ) : query.error ? (
            <div className="text-sm text-rose-600">Failed to load history.</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-slate-600">No entries yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((h) => (
                <div key={h.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{h.title}</div>
                      <div className="mt-1 text-xs font-semibold text-slate-600">
                        {h.historyType || '—'} • {h.eventDate || '—'}
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(h.id)}
                    >
                      Delete
                    </Button>
                  </div>
                  {h.description ? <div className="mt-2 text-sm text-slate-700">{h.description}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
