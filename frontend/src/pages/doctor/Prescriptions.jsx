import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { listDoctorPrescriptions } from '../../services/doctor.service';

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export default function DoctorPrescriptions() {
  const { doctorId } = useAuth();

  const rxQuery = useQuery({
    queryKey: ['doctorPrescriptions', doctorId],
    queryFn: () => listDoctorPrescriptions(doctorId),
    enabled: Boolean(doctorId),
  });

  const prescriptions = useMemo(() => normalizeList(rxQuery.data), [rxQuery.data]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <p className="mt-1 text-sm text-slate-600">Review prescriptions you have issued.</p>
      </div>

      <Card>
        {rxQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : rxQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load prescriptions.</div>
        ) : prescriptions.length === 0 ? (
          <div className="text-sm text-slate-600">No prescriptions yet.</div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Prescription #{p.id}</div>
                    <div className="mt-1 text-sm text-slate-700">Patient: {p.patientName || p.patientId || '—'}</div>
                    <div className="mt-1 text-sm text-slate-700">Appointment: {p.appointmentId || '—'}</div>
                    {p.createdAt ? (
                      <div className="mt-1 text-xs font-semibold text-slate-600">Created: {p.createdAt}</div>
                    ) : null}
                  </div>

                  <Link
                    to={`/doctor/prescriptions/${p.id}`}
                    className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
