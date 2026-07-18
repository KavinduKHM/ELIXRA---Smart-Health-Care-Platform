// src/components/common/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards a route by authentication + role.
 *
 * Props:
 * - role: required role ('patient' | 'doctor' | 'admin')
 * - matchParam: optional route param name (e.g. 'patientId') that must equal the
 *   logged-in user's own id, preventing users from viewing another account's portal.
 */
const ProtectedRoute = ({ role, matchParam, children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const params = useParams();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location, requiredRole: role }} />;
  }

  if (role && user.role !== role) {
    // Logged in but wrong portal — send them to their own home.
    const fallback =
      user.role === 'patient'
        ? `/patient/${user.id}/appointments`
        : user.role === 'doctor'
        ? `/doctor/${user.id}/appointments`
        : '/';
    return <Navigate to={fallback} replace />;
  }

  if (matchParam && params[matchParam] && String(params[matchParam]) !== String(user.id)) {
    const own =
      user.role === 'patient'
        ? `/patient/${user.id}/appointments`
        : `/doctor/${user.id}/appointments`;
    return <Navigate to={own} replace />;
  }

  return children;
};

export default ProtectedRoute;
