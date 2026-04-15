import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { createAppointment, searchDoctorsForAppointments } from '../../services/appointment.service';

export default function PatientBookAppointment() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState(null); // { doctorId, slotStart }

  const searchParams = useMemo(() => {
    const params = {};
    if (specialty.trim()) params.specialty = specialty.trim();
    if (name.trim()) params.name = name.trim();
    if (date) params.date = date;
    return params;
  }, [specialty, name, date]);

  const doctorsQuery = useQuery({
    queryKey: ['doctorSearch', searchParams],
    queryFn: () => searchDoctorsForAppointments(searchParams),
    enabled: Boolean(Object.keys(searchParams).length),
  });

  const doctors = Array.isArray(doctorsQuery.data) ? doctorsQuery.data : doctorsQuery.data?.items || [];

  const createMutation = useMutation({
    mutationFn: (payload) => createAppointment(payload),
    onSuccess: (data) => {
      toast.success(`Appointment booked (ID ${data?.id})`);
      setSelected(null);
      setSymptoms('');
      setNotes('');

      if (data?.id) {
        navigate(`/patient/pay/${data.id}`, {
          state: {
            clientSecret: data.clientSecret,
            paymentIntentId: data.paymentIntentId,
            transactionId: data.transactionId,
          },
        });
      }
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Booking failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Book appointment</h1>
        <p className="mt-1 text-sm text-slate-600">Search doctors and select a time slot.</p>
      </div>

      <Card>
        <div className="text-sm font-bold">Search</div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g., Cardiology" />
          <Input label="Doctor name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John" />
          <Input label="Date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="mt-3 text-xs text-slate-500">Tip: Enter at least specialty or name to search.</div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Results</div>
        <div className="mt-4">
          {!Object.keys(searchParams).length ? (
            <div className="text-sm text-slate-600">Enter search criteria to see doctors.</div>
          ) : doctorsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Searching
            </div>
          ) : doctorsQuery.error ? (
            <div className="text-sm text-rose-600">Search failed.</div>
          ) : doctors.length === 0 ? (
            <div className="text-sm text-slate-600">No matching doctors.</div>
          ) : (
            <div className="space-y-3">
              {doctors.map((d) => (
                <div key={d.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{d.name || `Doctor #${d.id}`}</div>
                      <div className="mt-1 text-sm text-slate-700">{d.specialty || '—'} • {d.qualification || '—'}</div>
                      {d.consultationFee != null ? (
                        <div className="mt-1 text-xs font-semibold text-slate-600">Fee: {d.consultationFee}</div>
                      ) : null}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">{(d.availableSlots || []).length} slots</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(d.availableSlots || []).slice(0, 8).map((s) => {
                      const slotStart = s.startTime;
                      const isSelected = selected?.doctorId === d.id && selected?.slotStart === slotStart;
                      return (
                        <Button
                          key={s.id || slotStart}
                          variant={isSelected ? 'primary' : 'secondary'}
                          onClick={() => setSelected({ doctorId: d.id, slotStart })}
                        >
                          {slotStart?.replace('T', ' ') || 'Slot'}
                        </Button>
                      );
                    })}
                    {(d.availableSlots || []).length === 0 ? (
                      <div className="text-sm text-slate-600">No available slots.</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-bold">Details</div>
        <div className="mt-4">
          <label className="block">
            <div className="mb-1 text-sm font-medium text-slate-700">Symptoms (optional)</div>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </label>
          <label className="mt-4 block">
            <div className="mb-1 text-sm font-medium text-slate-700">Notes (optional)</div>
            <textarea
              className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            disabled={createMutation.isPending}
            onClick={() => {
              if (!userId) {
                toast.error('Missing user ID');
                return;
              }
              if (!selected?.doctorId || !selected?.slotStart) {
                toast.error('Select a slot');
                return;
              }
              createMutation.mutate({
                patientId: Number(userId),
                doctorId: selected.doctorId,
                appointmentTime: selected.slotStart,
                durationMinutes: 30,
                symptoms: symptoms || null,
                notes: notes || null,
              });
            }}
          >
            {createMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Booking
              </span>
            ) : (
              'Book'
            )}
          </Button>
          {createMutation.data?.clientSecret ? (
            <div className="text-xs text-slate-600">Redirecting to payment…</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
