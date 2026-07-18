import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from './BrandLogo';

const PUBLIC_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const getNavLinks = (user) => {
  if (!user) return [];

  if (user.role === 'patient') {
    const base = `/patient/${user.id}`;
    return [
      { to: `${base}/appointments`, label: 'Appointments' },
      { to: `${base}/book`, label: 'Book' },
      { to: `${base}/prescriptions`, label: 'Prescriptions' },
      { to: `${base}/history-documents`, label: 'Reports' },
      { to: `${base}/profile`, label: 'Profile' },
    ];
  }

  if (user.role === 'doctor') {
    const base = `/doctor/${user.id}`;
    return [
      { to: `${base}/appointments`, label: 'Appointments' },
      { to: `${base}/prescriptions`, label: 'Prescriptions' },
      { to: `${base}/profile`, label: 'Profile' },
    ];
  }

  return [];
};

const getHomePath = (user) => {
  if (!user) return '/';
  if (user.role === 'patient') return `/patient/${user.id}/appointments`;
  if (user.role === 'doctor') return `/doctor/${user.id}/appointments`;
  return '/';
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const pathname = location?.pathname || '';

  const isPortalShellRoute = /^\/(patient|doctor)\/[^/]+(\/|$)/.test(pathname) && pathname !== '/patient/register';
  const containerClassName = isPortalShellRoute ? 'portalContainer' : 'container';

  const [confirmLogout, setConfirmLogout] = useState(false);

  const navLinks = useMemo(() => getNavLinks(user), [user]);
  const homePath = useMemo(() => getHomePath(user), [user]);

  const roleLabel = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '';
  const displayName = (user?.name || '').trim() || 'Account';

  const handleLogout = () => {
    setConfirmLogout(false);
    signOut();
    navigate('/', { replace: true });
  };

  return (
    <div>
      <header className="appHeader" role="banner">
        <div className={`${containerClassName} appHeaderInner`}>
          <Link to={homePath} className="appBrand" aria-label="ELIXRA home">
            <BrandLogo size={42} />
            <div className="appBrandText">
              <div className="appBrandTitle">ELIXRA</div>
              <div className="appBrandSubtitle">Smart Health Care Platform</div>
            </div>
          </Link>

          <nav className="appHeaderNav" aria-label="Primary">
            {user
              ? navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}
                  >
                    {link.label}
                  </NavLink>
                ))
              : PUBLIC_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `appHeaderLink ${isActive ? 'appHeaderLinkActive' : ''}`}
                  >
                    {link.label}
                  </NavLink>
                ))}
          </nav>

          <div className="appHeaderUser" aria-label="Account">
            {user ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="appUserChip appUserChipLink"
                  onClick={() => navigate(homePath)}
                  title={`${displayName} (${roleLabel})`}
                >
                  <span className="appUserChipAvatar" aria-hidden="true">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  <span className="appUserChipName">
                    {displayName} · {roleLabel}
                  </span>
                </button>
                <button type="button" className="appHeaderLogout" onClick={() => setConfirmLogout(true)}>
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                <NavLink to="/login" className="appHeaderLink">
                  Sign in
                </NavLink>
                <button type="button" className="appHeaderCta" onClick={() => navigate('/register')}>
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={`layoutMain ${isPortalShellRoute ? 'portalMain' : ''}`}>
        <div className={containerClassName}>{children}</div>
      </main>

      <footer className="appFooter" role="contentinfo">
        <div className={`${containerClassName} appFooterInner`}>
          <div className="appFooterBrand">
            <BrandLogo size={38} />
            <div>
              <div className="appFooterTitle">ELIXRA</div>
              <div className="appFooterSubtitle">© {new Date().getFullYear()} ELIXRA. All rights reserved.</div>
            </div>
          </div>

          <div className="appFooterLinks" aria-label="Footer">
            <Link to="/services" className="appFooterLink">Services</Link>
            <span className="appFooterDot" aria-hidden="true">•</span>
            <Link to="/about" className="appFooterLink">About</Link>
            <span className="appFooterDot" aria-hidden="true">•</span>
            <Link to="/contact" className="appFooterLink">Contact</Link>
          </div>
        </div>
      </footer>

      {confirmLogout && (
        <div className="app-logout-overlay" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="app-logout-modal">
            <div className="app-logout-icon" aria-hidden="true">⏻</div>
            <h3>Sign out of ELIXRA?</h3>
            <p>You’ll need to sign in again to access your portal.</p>
            <div className="app-logout-actions">
              <button type="button" className="register-btn-secondary" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button type="button" onClick={handleLogout}>
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
