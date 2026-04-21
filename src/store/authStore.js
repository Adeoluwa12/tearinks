import { create } from 'zustand';
import { authApi } from '@/api';

const TOKEN_KEY = 'tearinks_token';

export const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  error:   null,

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.register(payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.forgotPassword(email);
      set({ loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to send reset email' });
      throw err;
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await authApi.resetPassword(token, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      set({ token: data.token, user: data.user, loading: false });
      return data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Reset failed' });
      throw err;
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const { data } = await authApi.me();
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, error: null });
    window.location.href = '/';
  },

  clearError: () => set({ error: null }),
}));
