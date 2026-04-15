import axios from 'axios';
import toast from 'react-hot-toast';
import { storage } from '../lib/storage';

let onUnauthorized = null;
let refreshHandler = null;

export function setOnUnauthorized(handler) {
  onUnauthorized = handler;
}

export function setRefreshHandler(handler) {
  refreshHandler = handler;
}

export function createApiClient(baseURL) {
  const api = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const status = error?.response?.status;
      const originalRequest = error?.config;

      if (status === 401 && originalRequest && !originalRequest.__isRetryRequest) {
        originalRequest.__isRetryRequest = true;

        try {
          if (typeof refreshHandler === 'function') {
            const refreshed = await refreshHandler();
            if (refreshed) {
              return api.request(originalRequest);
            }
          }
        } catch {
          // swallow and fallback to unauthorized flow
        }

        toast.error('Session expired. Please log in again.');
        if (typeof onUnauthorized === 'function') onUnauthorized();
      }

      return Promise.reject(error);
    }
  );

  return api;
}
