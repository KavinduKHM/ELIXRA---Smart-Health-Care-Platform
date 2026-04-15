import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getAppointment } from '../../services/appointment.service';
import { issuePrescription } from '../../services/doctor.service';

function toLocalDateTimeInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function IssuePrescriptionPage() {
  const { appointmentId } = useParams();
  const { doctorId } = useAuth();
  const navigate = useNavigate();

  const validDefault = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toLocalDateTimeInputValue(d);
  }, []);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState(validDefault);
  const [medicines, setMedicines] = useState([
    { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);

  const apptQuery = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => getAppointment(appointmentId),
    enabled: Boolean(appointmentId),
  });

  const patientId = apptQuery.data?.patientId;

  const submitMut = useMutation({
    mutationFn: () =>
      issuePrescription(doctorId, {
        patientId,
        appointmentId: Number(appointmentId),
        diagnosis: diagnosis || null,
        notes: notes || null,
        validUntil,
        medicines: medicines
          .filter((m) => String(m.medicineName || '').trim())
          .map((m) => ({
            medicineName: m.medicineName.trim(),
            dosage: m.dosage || null,
            frequency: m.frequency || null,
            duration: m.duration || null,
            instructions: m.instructions || null,
          })),
      }),
    onSuccess: () => {
      toast.success('Prescription issued');
      navigate('/doctor/prescriptions');
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Issue failed'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issue Prescription</h1>
          <p className="mt-1 text-sm text-slate-600">Appointment #{appointmentId}</p>
        </div>
        <Link
          to="/doctor/schedule"
          className="rounded-xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
        >
          Back
        </Link>
      </div>

      <Card>
        {apptQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading appointment
          </div>
        ) : apptQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load appointment.</div>
        ) : (
          <div className="text-sm text-slate-700">
            <div>
              <span className="font-semibold">Patient:</span> {apptQuery.data?.patientName || apptQuery.data?.patientId || '—'}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Scheduled:</span> {apptQuery.data?.appointmentTime || '—'}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Valid until"
            type="datetime-local"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
          <div className="text-sm text-slate-600 md:flex md:items-end">
            Ensure it is in the future.
          </div>
        </div>

        <label className="mt-4 block">
          <div className="mb-1 text-sm font-medium text-slate-700">Diagnosis (optional)</div>
          <textarea
            className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
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
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Medicines</div>
            <div className="mt-1 text-sm text-slate-600">At least one medicine name is required.</div>
          </div>
          <Button
            variant="secondary"
            onClick={() =>
              setMedicines((arr) => [
                ...arr,
                { medicineName: '', dosage: '', frequency: '', duration: '', instructions: '' },
              ])
            }
          >
            Add
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          {medicines.map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  label="Medicine name"
                  value={m.medicineName}
                  onChange={(e) =>
                    setMedicines((arr) =>
                      arr.map((x, i) => (i === idx ? { ...x, medicineName: e.target.value } : x))
                    )
                  }
                />
                <Input
                  label="Dosage"
                  value={m.dosage}
                  onChange={(e) =>
                    setMedicines((arr) => arr.map((x, i) => (i === idx ? { ...x, dosage: e.target.value } : x)))
                  }
                />
                <Input
                  label="Frequency"
                  value={m.frequency}
                  onChange={(e) =>
                    setMedicines((arr) =>
                      arr.map((x, i) => (i === idx ? { ...x, frequency: e.target.value } : x))
                    )
                  }
                />
                <Input
                  label="Duration"
                  value={m.duration}
                  onChange={(e) =>
                    setMedicines((arr) =>
                      arr.map((x, i) => (i === idx ? { ...x, duration: e.target.value } : x))
                    )
                  }
                />
                <label className="block md:col-span-2">
                  <div className="mb-1 text-sm font-medium text-slate-700">Instructions</div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    value={m.instructions}
                    onChange={(e) =>
                      setMedicines((arr) =>
                        arr.map((x, i) => (i === idx ? { ...x, instructions: e.target.value } : x))
                      )
                    }
                  />
                </label>
              </div>

              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  disabled={medicines.length === 1}
                  onClick={() => setMedicines((arr) => arr.filter((_, i) => i !== idx))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={submitMut.isPending}
          onClick={() => {
            if (!doctorId) return toast.error('Missing doctor profile');
            if (!appointmentId) return toast.error('Missing appointment');
            if (!patientId) return toast.error('Missing patient ID');
            if (!validUntil) return toast.error('Set valid until');
            const meds = medicines.filter((m) => String(m.medicineName || '').trim());
            if (meds.length === 0) return toast.error('Add at least one medicine');
            submitMut.mutate();
          }}
        >
          {submitMut.isPending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Issuing
            </span>
          ) : (
            'Issue'
          )}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/doctor/schedule')}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
