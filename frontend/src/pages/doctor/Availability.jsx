import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import {
  deleteDoctorAvailability,
  getDoctorAvailability,
  getDoctorAvailableSlots,
  getDoctorProfile,
  updateDoctorAvailability,
} from '../../services/doctor.service';

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function DoctorAvailability() {
  const { doctorId } = useAuth();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
  });

  const [slotsDate, setSlotsDate] = useState('');

  const doctorQuery = useQuery({
    queryKey: ['doctorProfile', doctorId],
    queryFn: () => getDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  const availabilityQuery = useQuery({
    queryKey: ['doctorAvailability', doctorId],
    queryFn: () => getDoctorAvailability(doctorId),
    enabled: Boolean(doctorId),
  });

  const availabilityList = useMemo(
    () => normalizeList(availabilityQuery.data),
    [availabilityQuery.data]
  );

  const addMut = useMutation({
    mutationFn: (payload) => updateDoctorAvailability(doctorId, payload),
    onSuccess: () => {
      toast.success('Availability saved');
      qc.invalidateQueries({ queryKey: ['doctorAvailability', doctorId] });
      if (slotsDate) qc.invalidateQueries({ queryKey: ['doctorSlots', doctorId, slotsDate] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Save failed'),
  });

  const delMut = useMutation({
    mutationFn: (availabilityId) => deleteDoctorAvailability(doctorId, availabilityId),
    onSuccess: () => {
      toast.success('Availability deleted');
      qc.invalidateQueries({ queryKey: ['doctorAvailability', doctorId] });
      if (slotsDate) qc.invalidateQueries({ queryKey: ['doctorSlots', doctorId, slotsDate] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Delete failed'),
  });

  const slotsQuery = useQuery({
    queryKey: ['doctorSlots', doctorId, slotsDate],
    queryFn: () => getDoctorAvailableSlots(doctorId, slotsDate),
    enabled: Boolean(doctorId && slotsDate),
  });

  const slots = useMemo(() => normalizeList(slotsQuery.data), [slotsQuery.data]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Availability</h1>
        <p className="mt-1 text-sm text-slate-600">Define working hours and view generated slots.</p>
      </div>

      <Card>
        {doctorQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading doctor profile
          </div>
        ) : doctorQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load doctor profile.</div>
        ) : (
          <div className="text-sm text-slate-700">
            Doctor: <span className="font-semibold">{doctorQuery.data?.fullName || doctorQuery.data?.email || doctorQuery.data?.id}</span>
          </div>
        )}
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Input
            label="Start time"
            type="time"
            value={form.startTime}
            onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          />
          <Input
            label="End time"
            type="time"
            value={form.endTime}
            onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          />
          <Input
            label="Slot duration (minutes)"
            type="number"
            min={5}
            step={5}
            value={form.slotDuration}
            onChange={(e) => setForm((f) => ({ ...f, slotDuration: Number(e.target.value) }))}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            disabled={!doctorId || addMut.isPending}
            onClick={() => {
              if (!doctorId) return toast.error('Missing doctor profile');
              if (!form.date) return toast.error('Choose a date');
              if (!form.startTime || !form.endTime) return toast.error('Choose a start/end time');
              if (!form.slotDuration || form.slotDuration < 5) return toast.error('Slot duration must be at least 5 minutes');
              if (form.startTime >= form.endTime) return toast.error('Start time must be before end time');
              addMut.mutate({
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                slotDuration: form.slotDuration,
              });
            }}
          >
            Save availability
          </Button>

          {addMut.isPending ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Saving…
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Existing availability</div>
            <div className="mt-1 text-sm text-slate-600">Entries: {availabilityQuery.isLoading ? '…' : availabilityList.length}</div>
          </div>
          <Button
            variant="secondary"
            disabled={!doctorId || availabilityQuery.isFetching}
            onClick={() => qc.invalidateQueries({ queryKey: ['doctorAvailability', doctorId] })}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-4">
          {availabilityQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Loading availability
            </div>
          ) : availabilityQuery.error ? (
            <div className="text-sm text-rose-600">Failed to load availability.</div>
          ) : availabilityList.length === 0 ? (
            <div className="text-sm text-slate-600">No availability added yet.</div>
          ) : (
            <div className="space-y-3">
              {availabilityList.map((av) => (
                <div key={av.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-slate-800">
                      <div className="font-semibold">{av.date || av.dayOfWeek || 'Availability'}</div>
                      <div className="mt-1 text-slate-700">
                        {av.startTime || '—'} – {av.endTime || '—'} ({av.slotDuration || '—'} min)
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      disabled={delMut.isPending}
                      onClick={() => {
                        const ok = window.confirm('Delete this availability entry?');
                        if (!ok) return;
                        delMut.mutate(av.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <Input
            label="Preview slots for date"
            type="date"
            value={slotsDate}
            onChange={(e) => setSlotsDate(e.target.value)}
            className="md:max-w-xs"
          />
          <Button
            variant="secondary"
            disabled={!doctorId || !slotsDate}
            onClick={() => qc.invalidateQueries({ queryKey: ['doctorSlots', doctorId, slotsDate] })}
          >
            Load slots
          </Button>
        </div>

        <div className="mt-4">
          {slotsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Loading slots
            </div>
          ) : slotsQuery.error ? (
            <div className="text-sm text-rose-600">Failed to load slots.</div>
          ) : slotsDate && slots.length === 0 ? (
            <div className="text-sm text-slate-600">No slots available for this date.</div>
          ) : slotsDate ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {slots.map((s, idx) => (
                <div key={s.id || `${s}-${idx}`} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-800">
                  {s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : String(s)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-600">Pick a date to preview generated slots.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
