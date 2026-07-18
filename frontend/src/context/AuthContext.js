// src/context/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  role: 'elixra.userRole',
  name: 'elixra.userName',
  email: 'elixra.userEmail',
  patientId: 'patientId',
  patientIdAlt: 'elixra.patientId',
  doctorId: 'doctorId',
  doctorIdAlt: 'elixra.doctorId',
};

const readUserFromStorage = () => {
  const role = (localStorage.getItem(STORAGE_KEYS.role) || '').trim().toLowerCase();
  if (!role) return null;

  const name = localStorage.getItem(STORAGE_KEYS.name) || '';
  const email = localStorage.getItem(STORAGE_KEYS.email) || '';

  if (role === 'patient') {
    const id = localStorage.getItem(STORAGE_KEYS.patientId) || localStorage.getItem(STORAGE_KEYS.patientIdAlt) || '';
    if (!id) return null;
    return { role: 'patient', id, name, email };
  }

  if (role === 'doctor') {
    const id = localStorage.getItem(STORAGE_KEYS.doctorId) || localStorage.getItem(STORAGE_KEYS.doctorIdAlt) || '';
    if (!id) return null;
    return { role: 'doctor', id, name, email };
  }

  if (role === 'admin') {
    return { role: 'admin', id: '', name: name || 'Administrator', email };
  }

  return null;
};

const persistUser = (user) => {
  clearStoredUser();
  if (!user) return;

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  localStorage.setItem(STORAGE_KEYS.role, roleLabel);
  if (user.name) localStorage.setItem(STORAGE_KEYS.name, user.name);
  if (user.email) localStorage.setItem(STORAGE_KEYS.email, user.email);

  if (user.role === 'patient' && user.id) {
    localStorage.setItem(STORAGE_KEYS.patientId, String(user.id));
    localStorage.setItem(STORAGE_KEYS.patientIdAlt, String(user.id));
  }
  if (user.role === 'doctor' && user.id) {
    localStorage.setItem(STORAGE_KEYS.doctorId, String(user.id));
    localStorage.setItem(STORAGE_KEYS.doctorIdAlt, String(user.id));
  }
};

const clearStoredUser = () => {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readUserFromStorage);

  // Keep in sync if another tab logs in/out.
  useEffect(() => {
    const onStorage = () => setUser(readUserFromStorage());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const signIn = useCallback((nextUser) => {
    persistUser(nextUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
