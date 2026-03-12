import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from memory store to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401: try silent refresh once, then retry the original request.
// Auth endpoints (/auth/*) are excluded to prevent infinite loops.
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const isAuthEndpoint = original?.url?.includes('/auth/');
    const is401 = error.response?.status === 401;

    // Only attempt refresh for non-auth endpoints that haven't been retried yet
    if (is401 && !isAuthEndpoint && !original._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // Use raw axios to bypass this interceptor for the refresh call
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true },
        );
        setAccessToken(data.accessToken);
        onRefreshed(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        // Refresh failed — clear token. ProtectedRoute will redirect to /login.
        setAccessToken(null);
        refreshSubscribers = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── In-memory token store ─────────────────────────────────────────────────
let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export default api;
