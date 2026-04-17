// src/components/common/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <nav className="topNav">
        <div className="container topNavInner">
          <div className="brand">
            <div className="brandDot" aria-hidden="true" />
            <div>ELIXRA</div>
          </div>
          <div className="topNavLinks">
            <Link to="/patient" className="topNavLink">Patient</Link>
            <Link to="/doctor" className="topNavLink">Doctor</Link>
            <Link to="/admin" className="topNavLink">Admin (Coming Soon)</Link>
          </div>
        </div>
      </nav>
      <main className="layoutMain">
        <div className="container">{children}</div>
      </main>
    </div>
  );
};

export default Layout;