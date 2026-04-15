import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { listAppointmentsForPatient } from '../../services/appointment.service';
import { listPatientPrescriptions } from '../../services/patient.service';

export default function PatientDashboard() {
  const { userId } = useAuth();

  const appointmentsQuery = useQuery({
    queryKey: ['patientAppointments', userId],
    queryFn: () => listAppointmentsForPatient(userId),
    enabled: Boolean(userId),
  });

  const prescriptionsQuery = useQuery({
    queryKey: ['patientPrescriptions', userId],
    queryFn: () => listPatientPrescriptions(userId),
    enabled: Boolean(userId),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Appointments, prescriptions, and quick actions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to="/patient/book">
            Book appointment
          </Button>
          <Button variant="secondary" as={Link} to="/patient/symptoms">
            AI Symptom checker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Upcoming appointments</div>
            <Link className="text-sm font-semibold text-sky-700 hover:text-sky-800" to="/patient/appointments">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {appointmentsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Spinner /> Loading
              </div>
            ) : appointmentsQuery.error ? (
              <div className="text-sm text-rose-600">Failed to load appointments.</div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(appointmentsQuery.data) ? appointmentsQuery.data : appointmentsQuery.data?.items || [])
                  .slice(0, 5)
                  .map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{a.doctorName || a.doctor?.name || 'Doctor'}</div>
                        <div className="text-xs font-semibold text-slate-600">{a.status || 'UNKNOWN'}</div>
                      </div>
                      <div className="mt-1 text-sm text-slate-700">{a.date || a.appointmentDate || a.startTime || '—'}</div>
                    </div>
                  ))}
                {(Array.isArray(appointmentsQuery.data) ? appointmentsQuery.data : appointmentsQuery.data?.items || [])
                  .length === 0 ? <div className="text-sm text-slate-600">No appointments yet.</div> : null}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Recent prescriptions</div>
            <Link className="text-sm font-semibold text-sky-700 hover:text-sky-800" to="/patient/prescriptions">
              View all
            </Link>
          </div>
          <div className="mt-4">
            {prescriptionsQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Spinner /> Loading
              </div>
            ) : prescriptionsQuery.error ? (
              <div className="text-sm text-rose-600">Failed to load prescriptions.</div>
            ) : (
              <div className="space-y-3">
                {(Array.isArray(prescriptionsQuery.data) ? prescriptionsQuery.data : prescriptionsQuery.data?.items || [])
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="text-sm font-semibold">{p.title || `Prescription #${p.id}`}</div>
                      <div className="mt-1 text-sm text-slate-700">
                        {(p.medicines || p.medications || []).length
                          ? (p.medicines || p.medications).map((m) => m.name || m).join(', ')
                          : '—'}
                      </div>
                    </div>
                  ))}
                {(Array.isArray(prescriptionsQuery.data) ? prescriptionsQuery.data : prescriptionsQuery.data?.items || [])
                  .length === 0 ? <div className="text-sm text-slate-600">No prescriptions yet.</div> : null}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-bold">Quick actions</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" as={Link} to="/patient/documents">
            Manage documents
          </Button>
          <Button variant="secondary" as={Link} to="/patient/history">
            Medical history
          </Button>
        </div>
      </Card>
    </div>
  );
}
