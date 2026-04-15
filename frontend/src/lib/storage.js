const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ROLE_KEY = 'userRole';
const USER_ID_KEY = 'userId';

export const storage = {
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token) {
    if (!token) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clearAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token) {
    if (!token) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearRefreshToken() {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY);
  },
  setUserRole(role) {
    if (!role) return;
    localStorage.setItem(USER_ROLE_KEY, role);
  },
  clearUserRole() {
    localStorage.removeItem(USER_ROLE_KEY);
  },

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  },
  setUserId(id) {
    if (id === undefined || id === null) return;
    localStorage.setItem(USER_ID_KEY, String(id));
  },
  clearUserId() {
    localStorage.removeItem(USER_ID_KEY);
  },

  clearAll() {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearUserRole();
    this.clearUserId();
  },
};
