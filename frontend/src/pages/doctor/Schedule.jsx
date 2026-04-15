import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { createVideoSession } from '../../services/telemedicine.service';
import {
  listUpcomingAppointmentsForDoctor,
  markAppointmentCompleted,
} from '../../services/appointment.service';

function normalizeAppointments(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function DoctorSchedule() {
  const { doctorId } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const upcomingQuery = useQuery({
    queryKey: ['doctorUpcomingAppointments', doctorId],
    queryFn: () => listUpcomingAppointmentsForDoctor(doctorId),
    enabled: Boolean(doctorId),
  });

  const upcoming = useMemo(() => normalizeAppointments(upcomingQuery.data), [upcomingQuery.data]);

  const completeMut = useMutation({
    mutationFn: (appointmentId) => markAppointmentCompleted(appointmentId),
    onSuccess: () => {
      toast.success('Marked as completed');
      qc.invalidateQueries({ queryKey: ['doctorUpcomingAppointments', doctorId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Complete failed'),
  });

  const startVideoMut = useMutation({
    mutationFn: (appointment) =>
      createVideoSession({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId,
        scheduledStartTime: appointment.appointmentTime,
      }),
    onSuccess: (data) => {
      toast.success('Video session created');
      if (data?.id) navigate(`/video/${data.id}`);
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Failed to create video session'),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="mt-1 text-sm text-slate-600">Your confirmed/upcoming appointments.</p>
      </div>

      <Card>
        {upcomingQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading appointments
          </div>
        ) : upcomingQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load schedule.</div>
        ) : upcoming.length === 0 ? (
          <div className="text-sm text-slate-600">No upcoming appointments.</div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{a.patientName || 'Patient'} • Appointment #{a.id}</div>
                    <div className="mt-1 text-sm text-slate-700">{a.appointmentTime || '—'}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-600">Status: {a.status || '—'}</div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/doctor/prescriptions/new/${a.id}`)}
                    >
                      Issue prescription
                    </Button>

                    <Button
                      variant="secondary"
                      disabled={!doctorId || startVideoMut.isPending}
                      onClick={() => {
                        if (!doctorId) return toast.error('Missing doctor profile');
                        if (!a?.id || !a?.patientId || !a?.appointmentTime) {
                          toast.error('Missing appointment details for video session');
                          return;
                        }
                        startVideoMut.mutate(a);
                      }}
                    >
                      {startVideoMut.isPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner /> Starting
                        </span>
                      ) : (
                        'Start video'
                      )}
                    </Button>

                    <Button
                      variant="primary"
                      disabled={completeMut.isPending}
                      onClick={() => {
                        const ok = window.confirm('Mark this appointment as completed?');
                        if (!ok) return;
                        completeMut.mutate(a.id);
                      }}
                    >
                      Complete
                    </Button>
                  </div>
                </div>

                {a.consultationLink ? (
                  <div className="mt-3 text-sm">
                    <span className="font-semibold">Consultation link:</span>{' '}
                    <a className="text-sky-700 hover:underline" href={a.consultationLink} target="_blank" rel="noreferrer">
                      {a.consultationLink}
                    </a>
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
