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
    fullName: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
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
      await registerApi({
        role: values.role,
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created. Please sign in.');
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

            <Input label="Full name" error={errors.fullName?.message} {...register('fullName')} />
            <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
            <Input
              label="Confirm password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

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
