import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfile } from '../../services/doctor.service';
import {
  acceptAppointment,
  rejectAppointment,
  listPendingAppointmentsForDoctor,
} from '../../services/appointment.service';

function normalizeAppointments(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function DoctorRequests() {
  const { doctorId } = useAuth();
  const qc = useQueryClient();

  const doctorQuery = useQuery({
    queryKey: ['doctorProfile', doctorId],
    queryFn: () => getDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  const pendingQuery = useQuery({
    queryKey: ['doctorPendingAppointments', doctorId],
    queryFn: () => listPendingAppointmentsForDoctor(doctorId),
    enabled: Boolean(doctorId),
  });

  const pending = useMemo(() => normalizeAppointments(pendingQuery.data), [pendingQuery.data]);

  const acceptMut = useMutation({
    mutationFn: (appointmentId) => acceptAppointment(appointmentId),
    onSuccess: () => {
      toast.success('Appointment confirmed');
      qc.invalidateQueries({ queryKey: ['doctorPendingAppointments', doctorId] });
      qc.invalidateQueries({ queryKey: ['doctorUpcomingAppointments', doctorId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Confirm failed'),
  });

  const rejectMut = useMutation({
    mutationFn: ({ appointmentId, reason }) => rejectAppointment(appointmentId, { reason }),
    onSuccess: () => {
      toast.success('Appointment rejected');
      qc.invalidateQueries({ queryKey: ['doctorPendingAppointments', doctorId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Reject failed'),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Appointment Requests</h1>
        <p className="mt-1 text-sm text-slate-600">Confirm or reject pending appointment requests.</p>
      </div>

      {doctorQuery.isLoading ? (
        <Card>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading doctor profile
          </div>
        </Card>
      ) : doctorQuery.error ? (
        <Card>
          <div className="text-sm text-rose-600">Failed to load doctor profile.</div>
        </Card>
      ) : null}

      <Card>
        {pendingQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading requests
          </div>
        ) : pendingQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load pending appointments.</div>
        ) : pending.length === 0 ? (
          <div className="text-sm text-slate-600">No pending requests.</div>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">Appointment #{a.id}</div>
                    <div className="mt-1 text-sm text-slate-700">
                      Patient: {a.patientName || a.patientFullName || a.patientId || '—'}
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      Date/Time: {a.appointmentDate || a.date || '—'} {a.appointmentTime || a.time || ''}
                    </div>
                    {a.reason && <div className="mt-1 text-sm text-slate-600">Reason: {a.reason}</div>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      disabled={acceptMut.isPending || rejectMut.isPending}
                      onClick={() => {
                        const ok = window.confirm('Confirm this appointment?');
                        if (!ok) return;
                        acceptMut.mutate(a.id);
                      }}
                    >
                      Confirm
                    </Button>
                    <Button
                      variant="danger"
                      disabled={acceptMut.isPending || rejectMut.isPending}
                      onClick={() => {
                        const reason = window.prompt('Reject reason (optional):', '');
                        rejectMut.mutate({ appointmentId: a.id, reason: reason || null });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
