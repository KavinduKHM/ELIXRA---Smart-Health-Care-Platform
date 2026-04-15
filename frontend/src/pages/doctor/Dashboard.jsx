import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfile } from '../../services/doctor.service';
import {
  listPendingAppointmentsForDoctor,
  listUpcomingAppointmentsForDoctor,
} from '../../services/appointment.service';

function toCount(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.content)) return data.content.length;
  if (Array.isArray(data.items)) return data.items.length;
  return 0;
}

export default function DoctorDashboard() {
  const { doctorId } = useAuth();

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

  const upcomingQuery = useQuery({
    queryKey: ['doctorUpcomingAppointments', doctorId],
    queryFn: () => listUpcomingAppointmentsForDoctor(doctorId),
    enabled: Boolean(doctorId),
  });

  const pendingCount = toCount(pendingQuery.data);
  const upcomingCount = toCount(upcomingQuery.data);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Manage appointment requests, schedule, availability, and prescriptions.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          {doctorQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Spinner /> Loading profile
            </div>
          ) : doctorQuery.error ? (
            <div className="text-sm text-rose-600">Failed to load doctor profile.</div>
          ) : (
            <div>
              <div className="text-sm font-semibold">{doctorQuery.data?.fullName || 'Doctor'}</div>
              <div className="mt-1 text-sm text-slate-700">{doctorQuery.data?.specialty || '—'}</div>
              <div className="mt-2 text-xs font-semibold text-slate-600">Status: {doctorQuery.data?.status || '—'}</div>
            </div>
          )}
        </Card>

        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Appointment Requests</div>
                <div className="mt-1 text-sm text-slate-600">Pending: {pendingQuery.isLoading ? '…' : pendingCount}</div>
              </div>
              <Link
                to="/doctor/requests"
                className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                View
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Upcoming Schedule</div>
                <div className="mt-1 text-sm text-slate-600">Confirmed: {upcomingQuery.isLoading ? '…' : upcomingCount}</div>
              </div>
              <Link
                to="/doctor/schedule"
                className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                View
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Prescriptions</div>
                <div className="mt-1 text-sm text-slate-600">Issue and review prescriptions</div>
              </div>
              <Link
                to="/doctor/prescriptions"
                className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
              >
                Open
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {(pendingQuery.error || upcomingQuery.error) && (
        <Card>
          <div className="text-sm text-rose-600">Some dashboard data failed to load. Try again.</div>
        </Card>
      )}
    </div>
  );
}
