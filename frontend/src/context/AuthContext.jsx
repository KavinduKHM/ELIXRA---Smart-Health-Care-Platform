import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storage } from '../lib/storage';
import { login as loginApi, refreshToken as refreshTokenApi } from '../services/auth.service';
import { setOnUnauthorized, setRefreshHandler } from '../services/api';
import { getPatientByUserId } from '../services/patient.service';
import { getDoctorByUserId } from '../services/doctor.service';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState(storage.getAccessToken());
  const [userRole, setUserRole] = useState(storage.getUserRole());
  const [userId, setUserId] = useState(storage.getUserId());
  const [patientId, setPatientId] = useState(storage.getPatientId());
  const [doctorId, setDoctorId] = useState(storage.getDoctorId());

  const isAuthenticated = Boolean(accessToken && userRole && userId);

  const logout = useCallback(
    (opts = {}) => {
      storage.clearAll();
      setAccessToken(null);
      setUserRole(null);
      setUserId(null);
      setPatientId(null);
      setDoctorId(null);
      if (!opts.silent) toast.success('Logged out');
      navigate('/login', { replace: true });
    },
    [navigate]
  );

  const hydrateEntityIds = useCallback(async ({ role, userId: rawUserId }) => {
    if (!role || !rawUserId) return;

    if (role === 'PATIENT') {
      try {
        const patient = await getPatientByUserId(rawUserId);
        if (patient?.id !== undefined && patient?.id !== null) {
          storage.setPatientId(patient.id);
          setPatientId(String(patient.id));
        }
      } catch {
        storage.clearPatientId();
        setPatientId(null);
      }

      storage.clearDoctorId();
      setDoctorId(null);
    }

    if (role === 'DOCTOR') {
      try {
        const doctor = await getDoctorByUserId(rawUserId);
        if (doctor?.id !== undefined && doctor?.id !== null) {
          storage.setDoctorId(doctor.id);
          setDoctorId(String(doctor.id));
        }
      } catch {
        storage.clearDoctorId();
        setDoctorId(null);
      }

      storage.clearPatientId();
      setPatientId(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const result = await refreshTokenApi();
      if (!result?.accessToken) return false;

      setAccessToken(storage.getAccessToken());
      setUserRole(storage.getUserRole());
      setUserId(storage.getUserId());
      setPatientId(storage.getPatientId());
      setDoctorId(storage.getDoctorId());
      return true;
    } catch {
      return false;
    }
  }, []);

  const login = useCallback(
    async ({ email, password, role }) => {
      const result = await loginApi({ email, password, role });
      if (!result?.accessToken) throw new Error('Login failed');

      storage.setAccessToken(result.accessToken);
      if (result.refreshToken) storage.setRefreshToken(result.refreshToken);
      storage.setUserRole(result.role);
      storage.setUserId(result.userId);

      setAccessToken(result.accessToken);
      setUserRole(result.role);
      setUserId(String(result.userId));

      await hydrateEntityIds({ role: result.role, userId: result.userId });

      toast.success('Welcome back');
    },
    [hydrateEntityIds]
  );

  useEffect(() => {
    setOnUnauthorized(() => logout({ silent: true }));
    setRefreshHandler(() => refresh());
  }, [logout, refresh]);

  useEffect(() => {
    if (!isAuthenticated || !userRole || !userId) return;

    if (userRole === 'PATIENT' && !patientId) {
      hydrateEntityIds({ role: 'PATIENT', userId });
    }

    if (userRole === 'DOCTOR' && !doctorId) {
      hydrateEntityIds({ role: 'DOCTOR', userId });
    }
  }, [doctorId, hydrateEntityIds, isAuthenticated, patientId, userId, userRole]);

  const value = useMemo(() => {
    const actorId =
      userRole === 'PATIENT'
        ? patientId
        : userRole === 'DOCTOR'
          ? doctorId
          : null;

    return {
      accessToken,
      userRole,
      userId,
      patientId,
      doctorId,
      actorId,
      isAuthenticated,
      login,
      logout,
      refresh,
    };
  }, [accessToken, doctorId, isAuthenticated, login, logout, patientId, refresh, userId, userRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
