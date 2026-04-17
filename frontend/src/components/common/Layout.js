// src/components/common/Layout.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const pathname = location?.pathname || '';

  const isPatientArea = pathname === '/patient' || pathname.startsWith('/patient/');
  const isDoctorArea = pathname === '/doctor' || pathname.startsWith('/doctor/');

  const isPortalShellRoute = /^\/(patient|doctor)\/[\w-]+(\/|$)/.test(pathname) && pathname !== '/patient/register';
  const containerClassName = isPortalShellRoute ? 'portalContainer' : 'container';

  const [userName, setUserName] = useState(() => {
    const stored = localStorage.getItem('elixra.userName');
    return stored && stored.trim() ? stored : 'Guest';
  });

  const headerLabel = useMemo(() => {
    const role = localStorage.getItem('elixra.userRole');
    const roleText = role && role.trim() ? role.trim() : '';
    const who = userName && userName.trim() ? userName.trim() : 'Guest';
    return roleText ? `${who} (${roleText})` : who;
  }, [userName]);

  useEffect(() => {
    const refresh = () => {
      const stored = localStorage.getItem('elixra.userName');
      setUserName(stored && stored.trim() ? stored.trim() : 'Guest');
    };

    refresh();

    const onStorage = (e) => {
      if (e.key === 'elixra.userName' || e.key === 'elixra.userRole') refresh();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname]);

  return (
    <div>
      <header className="appHeader" role="banner">
        <div className={`${containerClassName} appHeaderInner`}>
          <div className="appBrand" aria-label="ELIXRA">
            <div className="brandDot" aria-hidden="true" />
            <div className="appBrandText">
              <div className="appBrandTitle">ELIXRA</div>
              <div className="appBrandSubtitle">Smart Health Care Platform</div>
            </div>
          </div>

          <nav className="appHeaderNav" aria-label="Primary">
            <Link to="/patient" className={`appHeaderLink ${isPatientArea ? 'appHeaderLinkActive' : ''}`}>Patient</Link>
            <Link to="/doctor" className={`appHeaderLink ${isDoctorArea ? 'appHeaderLinkActive' : ''}`}>Doctor</Link>
            <Link to="/admin" className="appHeaderLink">Admin</Link>
          </nav>

          <div className="appHeaderUser" aria-label="Current user">
            <div className="appUserChip">
              <span className="appUserChipAvatar" aria-hidden="true">
                {(userName || 'G').trim().charAt(0).toUpperCase()}
              </span>
              <span className="appUserChipName" title={headerLabel}>{headerLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className={`layoutMain ${isPortalShellRoute ? 'portalMain' : ''}`}>
        <div className={containerClassName}>{children}</div>
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