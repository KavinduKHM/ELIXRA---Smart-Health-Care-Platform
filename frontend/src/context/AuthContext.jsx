import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { storage } from '../lib/storage';
import { login as loginApi, refreshToken as refreshTokenApi } from '../services/auth.service';
import { setOnUnauthorized, setRefreshHandler } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState(storage.getAccessToken());
  const [userRole, setUserRole] = useState(storage.getUserRole());
  const [userId, setUserId] = useState(storage.getUserId());

  const isAuthenticated = Boolean(accessToken && userRole && userId);

  const logout = useCallback(
    (opts = {}) => {
      storage.clearAll();
      setAccessToken(null);
      setUserRole(null);
      setUserId(null);
      if (!opts.silent) toast.success('Logged out');
      navigate('/login', { replace: true });
    },
    [navigate]
  );

  const refresh = useCallback(async () => {
    try {
      const result = await refreshTokenApi();
      if (!result?.accessToken) return false;

      setAccessToken(storage.getAccessToken());
      setUserRole(storage.getUserRole());
      setUserId(storage.getUserId());
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

      toast.success('Welcome back');
    },
    []
  );

  useEffect(() => {
    setOnUnauthorized(() => logout({ silent: true }));
    setRefreshHandler(() => refresh());
  }, [logout, refresh]);

  const value = useMemo(
    () => ({
      accessToken,
      userRole,
      userId,
      isAuthenticated,
      login,
      logout,
      refresh,
    }),
    [accessToken, userRole, userId, isAuthenticated, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
