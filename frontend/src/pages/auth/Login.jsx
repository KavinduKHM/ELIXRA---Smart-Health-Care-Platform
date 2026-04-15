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
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, userRole } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'PATIENT',
    },
  });

  const onSubmit = async (values) => {
    try {
      await login(values);
      const role = userRole || values.role;
      if (role === 'ADMIN') navigate('/admin', { replace: true });
      else if (role === 'DOCTOR') navigate('/doctor', { replace: true });
      else navigate('/patient', { replace: true });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-full">
      <div className="mx-auto flex min-h-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-600 p-8 text-white shadow-sm">
            <div className="text-sm font-semibold opacity-90">ELIXRA</div>
            <h1 className="mt-4 text-3xl font-bold leading-tight">Smart Healthcare Platform</h1>
            <p className="mt-4 text-white/90">
              Secure access for patients, doctors, and admins.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/90">
              <li>Appointments, payments, and telemedicine</li>
              <li>Medical documents & prescriptions</li>
              <li>AI symptom checker</li>
            </ul>
          </div>

          <Card className="p-8">
            <h2 className="text-xl font-bold">Sign in</h2>
            <p className="mt-1 text-sm text-slate-600">Use your account credentials.</p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Select label="Role" error={errors.role?.message} {...register('role')}>
                <option value="PATIENT">Patient</option>
                <option value="DOCTOR">Doctor</option>
                <option value="ADMIN">Admin</option>
              </Select>

              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner /> Signing in
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>

              <div className="text-center text-sm text-slate-600">
                No account?{' '}
                <Link className="font-semibold text-sky-700 hover:text-sky-800" to="/register">
                  Create one
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
