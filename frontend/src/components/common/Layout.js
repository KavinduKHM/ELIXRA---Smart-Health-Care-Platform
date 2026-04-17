import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

const getStoredUser = () => ({
  userName: localStorage.getItem('elixra.userName') || '',
  userRole: localStorage.getItem('elixra.userRole') || '',
  patientId: localStorage.getItem('patientId') || localStorage.getItem('elixra.patientId') || '',
  doctorId: localStorage.getItem('doctorId') || localStorage.getItem('elixra.doctorId') || '',
});

const getDashboardPath = (user) => {
  const role = String(user.userRole || '').trim().toLowerCase();
  const patientId = String(user.patientId || '').trim();
  const doctorId = String(user.doctorId || '').trim();

  if (role === 'patient') {
    return patientId ? `/patient/${encodeURIComponent(patientId)}/appointments` : '/patient';
  }

  if (role === 'doctor') {
    return doctorId ? `/doctor/${encodeURIComponent(doctorId)}/appointments` : '/doctor';
  }

  if (role === 'admin') {
    return '/admin';
  }

  return '/';
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location?.pathname || '';

  const isPortalShellRoute = /^\/(patient|doctor)\/[^/]+(\/|$)/.test(pathname) && pathname !== '/patient/register';
  const containerClassName = isPortalShellRoute ? 'portalContainer' : 'container';

  const [user, setUser] = useState(getStoredUser);

  const headerLabel = useMemo(() => {
    const name = String(user.userName || '').trim() || 'Guest';
    const role = String(user.userRole || '').trim();
    return role ? `${name} (${role})` : name;
  }, [user]);

  const dashboardPath = useMemo(() => getDashboardPath(user), [user]);

  useEffect(() => {
    const refresh = () => setUser(getStoredUser());

    refresh();

    const onStorage = (event) => {
      if (
        event.key === 'elixra.userName' ||
        event.key === 'elixra.userRole' ||
        event.key === 'patientId' ||
        event.key === 'doctorId' ||
        event.key === 'elixra.patientId' ||
        event.key === 'elixra.doctorId'
      ) {
        refresh();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  return (
    <div>
      <header className="appHeader" role="banner">
        <div className={`${containerClassName} appHeaderInner`}>
          <Link to="/" className="appBrand" aria-label="ELIXRA home">
            <div className="brandDot" aria-hidden="true" />
            <div className="appBrandText">
              <div className="appBrandTitle">ELIXRA</div>
              <div className="appBrandSubtitle">Smart Health Care Platform</div>
            </div>
          </Link>

          <nav className="appHeaderNav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/patient" className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}>
              Patient
            </NavLink>
            <NavLink to="/doctor" className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}>
              Doctor
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}>
              Admin
            </NavLink>
          </nav>

          <div className="appHeaderUser" aria-label="Current user">
            <button
              type="button"
              className="appUserChip appUserChipLink"
              onClick={() => navigate(dashboardPath)}
              aria-label={`Open ${headerLabel} dashboard`}
              title={headerLabel}
            >
              <span className="appUserChipAvatar" aria-hidden="true">
                {(user.userName || 'G').trim().charAt(0).toUpperCase()}
              </span>
              <span className="appUserChipName">{headerLabel}</span>
            </button>
          </div>
        </div>
      </header>

      <main className={`layoutMain ${isPortalShellRoute ? 'portalMain' : ''}`}>
        <div className={containerClassName}>
          {children}
        </div>
      </main>

      <footer className="appFooter" role="contentinfo">
        <div className={`${containerClassName} appFooterInner`}>
          <div className="appFooterBrand">
            <div className="brandDot" aria-hidden="true" />
            <div>
              <div className="appFooterTitle">ELIXRA</div>
              <div className="appFooterSubtitle">© {new Date().getFullYear()} ELIXRA. All rights reserved.</div>
            </div>
          </div>

          <div className="appFooterLinks" aria-label="Footer">
            <span className="appFooterLink">Privacy</span>
            <span className="appFooterDot" aria-hidden="true">•</span>
            <span className="appFooterLink">Terms</span>
            <span className="appFooterDot" aria-hidden="true">•</span>
            <span className="appFooterLink">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
