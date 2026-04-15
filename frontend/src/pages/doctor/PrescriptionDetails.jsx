import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { getPrescription } from '../../services/doctor.service';

export default function PrescriptionDetails() {
  const { prescriptionId } = useParams();

  const query = useQuery({
    queryKey: ['prescription', prescriptionId],
    queryFn: () => getPrescription(prescriptionId),
    enabled: Boolean(prescriptionId),
  });

  const medicines = useMemo(() => query.data?.medicines || [], [query.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescription</h1>
          <p className="mt-1 text-sm text-slate-600">Details for prescription #{prescriptionId}</p>
        </div>
        <Link
          to="/doctor/prescriptions"
          className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
        >
          Back
        </Link>
      </div>

      <Card>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : query.error ? (
          <div className="text-sm text-rose-600">Failed to load prescription.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="text-sm">
                <div className="text-xs font-semibold text-slate-600">Doctor</div>
                <div className="mt-1 font-semibold text-slate-900">{query.data?.doctorName || query.data?.doctorId || '—'}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs font-semibold text-slate-600">Patient ID</div>
                <div className="mt-1 font-semibold text-slate-900">{query.data?.patientId || '—'}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs font-semibold text-slate-600">Appointment ID</div>
                <div className="mt-1 font-semibold text-slate-900">{query.data?.appointmentId || '—'}</div>
              </div>
              <div className="text-sm">
                <div className="text-xs font-semibold text-slate-600">Status</div>
                <div className="mt-1 font-semibold text-slate-900">{query.data?.status || '—'}</div>
              </div>
              {query.data?.issuedAt ? (
                <div className="text-sm">
                  <div className="text-xs font-semibold text-slate-600">Issued at</div>
                  <div className="mt-1 font-semibold text-slate-900">{query.data.issuedAt}</div>
                </div>
              ) : null}
              {query.data?.validUntil ? (
                <div className="text-sm">
                  <div className="text-xs font-semibold text-slate-600">Valid until</div>
                  <div className="mt-1 font-semibold text-slate-900">{query.data.validUntil}</div>
                </div>
              ) : null}
            </div>

            <div className="text-sm">
              <div className="text-xs font-semibold text-slate-600">Diagnosis</div>
              <div className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-900 ring-1 ring-slate-200">
                {query.data?.diagnosis || '—'}
              </div>
            </div>

            <div className="text-sm">
              <div className="text-xs font-semibold text-slate-600">Notes</div>
              <div className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-900 ring-1 ring-slate-200">
                {query.data?.notes || '—'}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Medicines</div>
              {medicines.length === 0 ? (
                <div className="mt-2 text-sm text-slate-600">No medicines listed.</div>
              ) : (
                <div className="mt-2 space-y-3">
                  {medicines.map((m, idx) => (
                    <div key={`${m.medicineName || 'med'}-${idx}`} className="rounded-xl border border-slate-200 p-3 text-sm">
                      <div className="font-semibold text-slate-900">{m.medicineName || 'Medicine'}</div>
                      <div className="mt-1 text-slate-700">Dosage: {m.dosage || '—'}</div>
                      <div className="mt-1 text-slate-700">Frequency: {m.frequency || '—'}</div>
                      <div className="mt-1 text-slate-700">Duration: {m.duration || '—'}</div>
                      {m.instructions ? (
                        <div className="mt-1 text-slate-700">Instructions: {m.instructions}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
