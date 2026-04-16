// src/components/common/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div>
      <nav style={{ background: '#2c3e50', padding: '1rem', color: 'white', display: 'flex', gap: '1rem' }}>
        <Link to="/patient" style={{ color: 'white', textDecoration: 'none' }}>Patient Dashboard</Link>
        <Link to="/doctor" style={{ color: 'white', textDecoration: 'none' }}>Doctor Dashboard (Coming Soon)</Link>
        <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Dashboard (Coming Soon)</Link>
      </nav>
      <main style={{ padding: '2rem' }}>{children}</main>
    </div>
  );
};

export default Layout;