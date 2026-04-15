import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { listPatientPrescriptions } from '../../services/patient.service';

export default function PatientPrescriptions() {
  const { patientId } = useAuth();

  const query = useQuery({
    queryKey: ['patientPrescriptions', patientId],
    queryFn: () => listPatientPrescriptions(patientId),
    enabled: Boolean(patientId),
  });

  const prescriptions = Array.isArray(query.data) ? query.data : query.data?.content || query.data?.items || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <p className="mt-1 text-sm text-slate-600">Your prescriptions issued by doctors.</p>
      </div>

      <Card>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : query.error ? (
          <div className="text-sm text-rose-600">Failed to load prescriptions.</div>
        ) : prescriptions.length === 0 ? (
          <div className="text-sm text-slate-600">No prescriptions found.</div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm font-semibold">Prescription #{p.id}</div>
                  <div className="text-xs font-semibold text-slate-600">{p.prescriptionDate || '—'}</div>
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">Doctor:</span> {p.doctorName || '—'}
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold">Diagnosis:</span> {p.diagnosis || '—'}
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  <span className="font-semibold">Medications:</span>{' '}
                  {(p.medications || []).length
                    ? p.medications
                        .map((m) =>
                          [m.medicationName || m.name, m.dosage, m.frequency].filter(Boolean).join(' ')
                        )
                        .join(', ')
                    : '—'}
                </div>
                {p.notes ? <div className="mt-2 text-sm text-slate-700">{p.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
