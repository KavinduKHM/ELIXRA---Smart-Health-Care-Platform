import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar({ role }) {
  const { logout } = useAuth();

  const baseItems = [{ to: '/notifications', label: 'Notifications' }];

  const roleItems =
    role === 'ADMIN'
      ? [
          { to: '/admin', label: 'Dashboard', end: true },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/verification', label: 'Doctor Verification' },
          { to: '/admin/transactions', label: 'Transactions' },
        ]
      : role === 'DOCTOR'
        ? [
            { to: '/doctor', label: 'Dashboard', end: true },
            { to: '/doctor/requests', label: 'Requests' },
            { to: '/doctor/availability', label: 'Availability' },
            { to: '/doctor/profile', label: 'Profile' },
          ]
        : [
            { to: '/patient', label: 'Dashboard', end: true },
            { to: '/patient/book', label: 'Book' },
            { to: '/patient/appointments', label: 'Appointments' },
            { to: '/patient/documents', label: 'Documents' },
            { to: '/patient/prescriptions', label: 'Prescriptions' },
            { to: '/patient/history', label: 'Medical History' },
            { to: '/patient/profile', label: 'Profile' },
          ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-sky-600" />
          <div>
            <div className="text-sm font-bold leading-tight">ELIXRA</div>
            <div className="text-xs text-slate-500 leading-tight">Smart Healthcare</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {roleItems.map((item) => (
            <NavItem key={item.to} to={item.to} end={item.end}>
              {item.label}
            </NavItem>
          ))}
          {baseItems.map((item) => (
            <NavItem key={item.to} to={item.to}>
              {item.label}
            </NavItem>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
