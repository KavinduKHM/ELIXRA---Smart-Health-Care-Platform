import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { getPatientProfile, updatePatientProfile, uploadPatientProfilePicture } from '../../services/patient.service';

export default function PatientProfile() {
  const { userId } = useAuth();
  const qc = useQueryClient();
  const [profilePicFile, setProfilePicFile] = useState(null);
  const didInitFormRef = useRef(false);

  const profileQuery = useQuery({
    queryKey: ['patientProfile', userId],
    queryFn: () => getPatientProfile(userId),
    enabled: Boolean(userId),
  });

  const initial = useMemo(() => {
    const p = profileQuery.data || {};
    return {
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      middleName: p.middleName || '',
      email: p.email || '',
      phoneNumber: p.phoneNumber || '',
      dateOfBirth: p.dateOfBirth || '',
      gender: p.gender || '',
      bloodGroup: p.bloodGroup || '',
    };
  }, [profileQuery.data]);

  const [form, setForm] = useState(initial);

  useEffect(() => {
    didInitFormRef.current = false;
    // Reset form when user changes
    setForm({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
    });
  }, [userId]);

  useEffect(() => {
    if (didInitFormRef.current) return;
    if (!profileQuery.data) return;
    setForm(initial);
    didInitFormRef.current = true;
  }, [initial, profileQuery.data]);

  const updateMutation = useMutation({
    mutationFn: (payload) => updatePatientProfile(userId, payload),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['patientProfile', userId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Update failed'),
  });

  const uploadPicMutation = useMutation({
    mutationFn: (file) => uploadPatientProfilePicture(userId, file),
    onSuccess: () => {
      toast.success('Profile picture updated');
      setProfilePicFile(null);
      qc.invalidateQueries({ queryKey: ['patientProfile', userId] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || e?.message || 'Upload failed'),
  });

  const isBusy = updateMutation.isPending || uploadPicMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update your basic details.</p>
      </div>

      <Card>
        {profileQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading
          </div>
        ) : profileQuery.error ? (
          <div className="text-sm text-rose-600">Failed to load profile.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                  {profileQuery.data?.profilePictureUrl ? (
                    <img
                      src={profileQuery.data.profilePictureUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="text-sm font-semibold">{profileQuery.data?.fullName || 'Patient'}</div>
                  <div className="text-xs text-slate-600">Patient ID: {profileQuery.data?.id ?? userId}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)}
                  disabled={isBusy}
                />
                <Button
                  variant="secondary"
                  disabled={!profilePicFile || isBusy}
                  onClick={() => uploadPicMutation.mutate(profilePicFile)}
                >
                  {uploadPicMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Uploading
                    </span>
                  ) : (
                    'Upload picture'
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="First name"
                value={form.firstName}
                onChange={(e) => setForm((s) => ({ ...s, firstName: e.target.value }))}
              />
              <Input
                label="Last name"
                value={form.lastName}
                onChange={(e) => setForm((s) => ({ ...s, lastName: e.target.value }))}
              />
            </div>
            <Input
              label="Middle name"
              value={form.middleName}
              onChange={(e) => setForm((s) => ({ ...s, middleName: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
              <Input
                label="Phone (10 digits)"
                value={form.phoneNumber}
                onChange={(e) => setForm((s) => ({ ...s, phoneNumber: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Input
                label="Date of birth"
                type="date"
                value={form.dateOfBirth || ''}
                onChange={(e) => setForm((s) => ({ ...s, dateOfBirth: e.target.value }))}
              />
              <Select
                label="Gender"
                value={form.gender || ''}
                onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}
              >
                <option value="">—</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input
                label="Blood group"
                value={form.bloodGroup}
                onChange={(e) => setForm((s) => ({ ...s, bloodGroup: e.target.value }))}
                placeholder="e.g., O+"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                disabled={isBusy}
                onClick={() => {
                  updateMutation.mutate({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    middleName: form.middleName || null,
                    email: form.email || null,
                    phoneNumber: form.phoneNumber || null,
                    dateOfBirth: form.dateOfBirth || null,
                    gender: form.gender || null,
                    bloodGroup: form.bloodGroup || null,
                  });
                }}
              >
                {updateMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Saving
                  </span>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
