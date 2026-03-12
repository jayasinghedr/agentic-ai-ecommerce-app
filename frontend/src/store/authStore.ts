import { create } from 'zustand';
import axios from 'axios';
import api, { setAccessToken } from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  tryRestoreSession: () => Promise<void>;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user, token) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  guestLogin: async () => {
    const { data } = await api.post<AuthResponse>('/auth/guest');
    setAccessToken(data.accessToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore errors on logout
    }
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  // Uses raw axios (NOT the api instance) to bypass the refresh interceptor.
  // This prevents an infinite refresh loop on app load.
  tryRestoreSession: async () => {
    try {
      const { data } = await axios.post<AuthResponse>(
        '/api/auth/refresh',
        {},
        { withCredentials: true },
      );
      setAccessToken(data.accessToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // No valid refresh token — treat as unauthenticated (not an error)
      setAccessToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
