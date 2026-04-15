import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { cancelAppointment, listAppointmentsForPatient, rescheduleAppointment } from '../../services/appointment.service';

export default function PatientAppointments() {
  const { patientId } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [reschedule, setReschedule] = useState({ id: null, newAppointmentTime: '', reason: '' });

  const query = useQuery({
    queryKey: ['patientAppointments', patientId],
    queryFn: () => listAppointmentsForPatient(patientId),
    enabled: Boolean(patientId),
  });

  const appointments = useMemo(() => {
    if (Array.isArray(query.data)) return query.data;
    return query.data?.content || query.data?.items || [];
  }, [query.data]);

  const cancelMutation = useMutation({
    mutationFn: (appointmentId) => cancelAppointment(appointmentId),
    onSuccess: () => {
      toast.success('Cancelled');
      qc.invalidateQueries({ queryKey: ['patientAppointments', patientId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Cancel failed'),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, payload }) => rescheduleAppointment(id, payload),
    onSuccess: () => {
      toast.success('Rescheduled');
      setReschedule({ id: null, newAppointmentTime: '', reason: '' });
      qc.invalidateQueries({ queryKey: ['patientAppointments', patientId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Reschedule failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your booked appointments.</p>
      </div>

      <Card>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : query.error ? (
          <div className="text-sm text-rose-600">Failed to load appointments.</div>
        ) : appointments.length === 0 ? (
          <div className="text-sm text-slate-600">No appointments yet.</div>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{a.doctorName || 'Doctor'} • {a.doctorSpecialty || '—'}</div>
                    <div className="mt-1 text-sm text-slate-700">{a.appointmentTime || '—'}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">Status: {a.status || '—'}</div>
                    {a.paymentStatus ? (
                      <div className="mt-1 text-xs font-semibold text-slate-600">Payment: {a.paymentStatus}</div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {String(a.paymentStatus || '').toLowerCase() !== 'succeeded' ? (
                      <Button variant="primary" onClick={() => navigate(`/patient/pay/${a.id}`)}>
                        Pay
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={() => setReschedule({ id: a.id, newAppointmentTime: '', reason: '' })}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="danger"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(a.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>

                {reschedule.id === a.id ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div className="text-sm font-semibold">Reschedule appointment</div>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input
                        label="New date/time"
                        type="datetime-local"
                        value={reschedule.newAppointmentTime}
                        onChange={(e) => setReschedule((s) => ({ ...s, newAppointmentTime: e.target.value }))}
                      />
                      <Input
                        label="Reason (optional)"
                        value={reschedule.reason}
                        onChange={(e) => setReschedule((s) => ({ ...s, reason: e.target.value }))}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        disabled={rescheduleMutation.isPending}
                        onClick={() => {
                          if (!reschedule.newAppointmentTime) {
                            toast.error('Choose a new date/time');
                            return;
                          }
                          rescheduleMutation.mutate({
                            id: a.id,
                            payload: {
                              newAppointmentTime: reschedule.newAppointmentTime,
                              reason: reschedule.reason || null,
                            },
                          });
                        }}
                      >
                        {rescheduleMutation.isPending ? (
                          <span className="inline-flex items-center gap-2">
                            <Spinner /> Saving
                          </span>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button variant="secondary" onClick={() => setReschedule({ id: null, newAppointmentTime: '', reason: '' })}>
                        Close
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
