import { create } from 'zustand';
import { User } from '../types';
import { setOnUnauthorized } from '../lib/api-client';

interface AuthState {
  token: string;
  user: User | null;
  authMode: 'login' | 'register' | 'forgot' | 'verify' | 'reset';
  authMessage: string;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  setAuthMode: (mode: 'login' | 'register' | 'forgot' | 'verify' | 'reset') => void;
  setAuthMessage: (msg: string) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = typeof localStorage !== 'undefined' ? localStorage.getItem('tm_token') || '' : '';

  return {
    token: initialToken,
    user: null,
    authMode: 'login',
    authMessage: '',

    setToken: (token: string) => {
      if (token) localStorage.setItem('tm_token', token);
      else localStorage.removeItem('tm_token');
      set({ token });
    },

    setUser: (user: User | null) => set({ user }),

    setAuthMode: (authMode) => set({ authMode, authMessage: '' }),

    setAuthMessage: (authMessage: string) => set({ authMessage }),

    login: (token: string, user: User) => {
      localStorage.setItem('tm_token', token);
      localStorage.removeItem('tm_org');
      localStorage.removeItem('tm_project');
      set({ token, user, authMode: 'login', authMessage: '' });
    },

    logout: () => {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_org');
      localStorage.removeItem('tm_project');
      set({ token: '', user: null, authMode: 'login', authMessage: '' });
    },
  };
});

// Register unauthorized handler
setOnUnauthorized(() => {
  useAuthStore.getState().logout();
});
