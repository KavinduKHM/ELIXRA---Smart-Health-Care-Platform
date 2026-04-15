import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getDoctorProfile, updateDoctorProfile } from '../../services/doctor.service';

export default function DoctorProfile() {
  const { userId, doctorId } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['doctorProfile', doctorId],
    queryFn: () => getDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  const [form, setForm] = useState({
    userId: userId ? Number(userId) : null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialty: '',
    qualification: '',
    experienceYears: '',
    bio: '',
    consultationFee: '',
    averageConsultationDuration: '',
  });

  useEffect(() => {
    if (!query.data) return;

    const fullName = String(query.data.fullName || '').trim();
    const [firstName = '', ...rest] = fullName ? fullName.split(' ') : [''];
    const lastName = rest.join(' ');

    setForm((f) => ({
      ...f,
      userId: query.data.userId ?? (userId ? Number(userId) : null),
      firstName: query.data.firstName ?? firstName,
      lastName: query.data.lastName ?? lastName,
      email: query.data.email ?? '',
      phoneNumber: query.data.phoneNumber ?? '',
      specialty: query.data.specialty ?? '',
      qualification: query.data.qualification ?? '',
      experienceYears: query.data.experienceYears ?? '',
      bio: query.data.bio ?? '',
      consultationFee: query.data.consultationFee ?? '',
      averageConsultationDuration: query.data.averageConsultationDuration ?? '',
    }));
  }, [query.data, userId]);

  const saveMut = useMutation({
    mutationFn: (payload) => updateDoctorProfile(query.data.id, payload),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['doctorProfile', doctorId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Update failed'),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update your doctor profile.</p>
      </div>

      <Card>
        {query.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : query.error ? (
          <div className="text-sm text-rose-600">Failed to load profile.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input label="First name" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            <Input label="Last name" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Input label="Phone" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
            <Input label="Specialty" value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} />
            <Input
              label="Experience (years)"
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => setForm((f) => ({ ...f, experienceYears: e.target.value }))}
            />
            <Input
              label="Consultation fee"
              type="number"
              min={0}
              step={0.01}
              value={form.consultationFee}
              onChange={(e) => setForm((f) => ({ ...f, consultationFee: e.target.value }))}
            />
            <Input
              label="Avg consultation duration (minutes)"
              type="number"
              min={1}
              value={form.averageConsultationDuration}
              onChange={(e) => setForm((f) => ({ ...f, averageConsultationDuration: e.target.value }))}
            />

            <label className="block md:col-span-2">
              <div className="mb-1 text-sm font-medium text-slate-700">Bio</div>
              <textarea
                className="min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </label>

            <div className="md:col-span-2">
              <Button
                disabled={saveMut.isPending}
                onClick={() => {
                  if (!query.data?.id) return toast.error('Missing doctor id');
                  if (!form.userId) return toast.error('Missing user id');
                  if (!String(form.firstName || '').trim()) return toast.error('First name is required');
                  if (!String(form.lastName || '').trim()) return toast.error('Last name is required');
                  if (!String(form.email || '').trim()) return toast.error('Email is required');
                  if (!String(form.specialty || '').trim()) return toast.error('Specialty is required');

                  saveMut.mutate({
                    userId: Number(form.userId),
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber || null,
                    specialty: form.specialty.trim(),
                    qualification: form.qualification || null,
                    experienceYears: form.experienceYears === '' ? null : Number(form.experienceYears),
                    bio: form.bio || null,
                    consultationFee: form.consultationFee === '' ? null : Number(form.consultationFee),
                    averageConsultationDuration:
                      form.averageConsultationDuration === '' ? null : Number(form.averageConsultationDuration),
                  });
                }}
              >
                {saveMut.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Saving
                  </span>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
