import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { register as registerApi } from '../../services/auth.service';

const schema = z
  .object({
    role: z.enum(['PATIENT', 'DOCTOR']),
    userId: z.preprocess((v) => Number(v), z.number().int().positive('User ID is required')),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email'),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    specialty: z.string().optional(),
    consultationFee: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().positive().optional()),
    qualification: z.string().optional(),
  })
  .refine((v) => (v.role === 'DOCTOR' ? Boolean(v.specialty) : true), {
    message: 'Specialty is required for doctors',
    path: ['specialty'],
  });

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: 'PATIENT' },
  });

  const onSubmit = async (values) => {
    try {
      await registerApi(values);
      toast.success('Profile created. Please sign in.');
      navigate('/login', { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-full max-w-xl items-center px-4 py-10">
        <Card className="w-full p-8">
          <h2 className="text-xl font-bold">Create account</h2>
          <p className="mt-1 text-sm text-slate-600">Patients and doctors can register.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Select label="Role" error={errors.role?.message} {...register('role')}>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </Select>

            <Input label="User ID" type="number" error={errors.userId?.message} {...register('userId')} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Phone" placeholder="0712345678" error={errors.phoneNumber?.message} {...register('phoneNumber')} />

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-semibold">Doctor fields</div>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input label="Specialty" error={errors.specialty?.message} {...register('specialty')} />
                <Input label="Consultation fee" type="number" step="0.01" error={errors.consultationFee?.message} {...register('consultationFee')} />
              </div>
              <Input className="mt-4" label="Qualification" error={errors.qualification?.message} {...register('qualification')} />
              <div className="mt-2 text-xs text-slate-500">Only required if you choose Doctor role.</div>
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Creating
                </span>
              ) : (
                'Create account'
              )}
            </Button>

            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link className="font-semibold text-sky-700 hover:text-sky-800" to="/login">
                Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
