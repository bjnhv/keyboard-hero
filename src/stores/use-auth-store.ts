'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

interface AuthState {
  user: AuthUser | null;
  sessionToken: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup';

  // Actions
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'signin' | 'signup') => void;
  clearError: () => void;
  initAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY_TOKEN = 'keyboard_hero_auth_token';
const STORAGE_KEY_USER = 'keyboard_hero_auth_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionToken: null,
  isLoading: true,
  error: null,
  isAuthModalOpen: false,
  authModalTab: 'signin',

  openAuthModal: (tab = 'signin') => {
    set({ isAuthModalOpen: true, authModalTab: tab, error: null });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, error: null });
  },

  setAuthModalTab: (tab) => {
    set({ authModalTab: tab, error: null });
  },

  clearError: () => set({ error: null }),

  initAuth: async () => {
    set({ isLoading: true });

    let cachedToken: string | null = null;
    let cachedUser: AuthUser | null = null;

    if (typeof window !== 'undefined') {
      try {
        cachedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) cachedUser = JSON.parse(storedUser);
      } catch {}
    }

    try {
      const headers: Record<string, string> = {};
      if (cachedToken) {
        headers['Authorization'] = `Bearer ${cachedToken}`;
      }

      const res = await fetch('/api/auth/get-session', {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const user: AuthUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name || data.user.email.split('@')[0],
            createdAt: data.user.createdAt,
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          }

          set({
            user,
            sessionToken: cachedToken,
            isLoading: false,
            error: null,
          });
          return;
        }
      }

      // If remote session check returned null or expired
      if (cachedUser) {
        // Fallback to cached profile if present but unconfirmed
        set({ user: cachedUser, sessionToken: cachedToken, isLoading: false });
      } else {
        set({ user: null, sessionToken: null, isLoading: false });
      }
    } catch {
      // Offline fallback: keep cached user if available
      set({
        user: cachedUser,
        sessionToken: cachedToken,
        isLoading: false,
      });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error || (data.code && data.message)) {
        const errorMsg = data.message || data.error || 'Invalid email or password';
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const token = data.token || null;
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0],
        createdAt: data.user.createdAt,
      };

      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }

      set({
        user,
        sessionToken: token,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during sign in';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name: name?.trim() || email.split('@')[0],
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error || (data.code && data.message)) {
        const errorMsg = data.message || data.error || 'Failed to create account';
        set({ isLoading: false, error: errorMsg });
        return { success: false, error: errorMsg };
      }

      const token = data.token || null;
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || email.split('@')[0],
        createdAt: data.user.createdAt,
      };

      if (typeof window !== 'undefined') {
        if (token) localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }

      set({
        user,
        sessionToken: token,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error during registration';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  signOut: async () => {
    const token = get().sessionToken;
    set({ isLoading: true });

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/auth/sign-out', {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
    } catch {
      // Ignore network errors on logout (local clear always succeeds)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
      }

      set({
        user: null,
        sessionToken: null,
        isLoading: false,
        error: null,
        isAuthModalOpen: false,
      });
    }
  },
}));
