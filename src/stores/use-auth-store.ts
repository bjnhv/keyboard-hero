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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEY_TOKEN = 'keyboard_hero_auth_token';
const STORAGE_KEY_USER = 'keyboard_hero_auth_user';

let authInitPromise: Promise<void> | null = null;
let lastConsumedVerifier: string | null = null;

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
    // Deduplicate concurrent calls (e.g. React StrictMode mounting twice)
    if (authInitPromise) {
      return authInitPromise;
    }

    authInitPromise = (async () => {
      set({ isLoading: true });

      let cachedToken: string | null = null;
      let cachedUser: AuthUser | null = null;
      let verifierToExchange: string | null = null;

      if (typeof window !== 'undefined') {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const queryToken = urlParams.get('token') || urlParams.get('session_token');
          const errorParam = urlParams.get('error');
          const verifier = urlParams.get('neon_auth_session_verifier');

          // 1. One-time verifier handling
          if (verifier && verifier !== lastConsumedVerifier) {
            lastConsumedVerifier = verifier;
            verifierToExchange = verifier;
            // Immediately strip from URL so it is never re-submitted
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }

          // 2. Error handling from OAuth
          if (errorParam) {
            let errorMsg = 'Authentication error occurred.';
            if (errorParam === 'account_not_linked') {
              errorMsg =
                'This email already exists via Email/Password. Please sign in with your password, or reset/link your account.';
            } else {
              errorMsg = `Login failed: ${errorParam.replace(/_/g, ' ')}`;
            }
            set({
              error: errorMsg,
              isAuthModalOpen: true,
              authModalTab: 'signin',
              isLoading: false,
            });
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            return;
          }

          // 3. Token handling
          if (queryToken) {
            localStorage.setItem(STORAGE_KEY_TOKEN, queryToken);
            cachedToken = queryToken;
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          } else {
            cachedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
          }

          const storedUser = localStorage.getItem(STORAGE_KEY_USER);
          if (storedUser) {
            cachedUser = JSON.parse(storedUser);
            // Eagerly set user so UI renders immediately without waiting for network
            set({
              user: cachedUser,
              sessionToken: cachedToken,
              isLoading: true,
            });
          }
        } catch {}
      }

      try {
        const headers: Record<string, string> = {};
        if (cachedToken) {
          headers['Authorization'] = `Bearer ${cachedToken}`;
        }

        const getSessionUrl = verifierToExchange
          ? `/api/auth/get-session?neon_auth_session_verifier=${encodeURIComponent(verifierToExchange)}`
          : '/api/auth/get-session';

        let res = await fetch(getSessionUrl, {
          headers,
        });

        // If a verifier exchange failed with 400 (e.g. already redeemed in a parallel request),
        // fallback to standard get-session to check if the session cookie is already set
        if (!res.ok && verifierToExchange) {
          res = await fetch('/api/auth/get-session', { headers });
        }

        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            const user: AuthUser = {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name || data.user.email.split('@')[0],
              createdAt: data.user.createdAt,
            };

            const sessionToken = data.token || data.session?.token || cachedToken;

            if (typeof window !== 'undefined') {
              if (sessionToken) localStorage.setItem(STORAGE_KEY_TOKEN, sessionToken);
              localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
            }

            set({
              user,
              sessionToken,
              isLoading: false,
              error: null,
            });
            return;
          }
        }

        // If remote session check returned null or expired
        if (cachedUser) {
          // Keep cached profile if offline
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
      } finally {
        authInitPromise = null;
      }
    })();

    return authInitPromise;
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

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const callbackURL =
        typeof window !== 'undefined'
          ? window.location.href.split('?')[0]
          : 'http://localhost:3000';

      const res = await fetch('/api/auth/sign-in/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          callbackURL,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        const errorMsg = data.message || data.error || 'Failed to initialize Google login';
        set({ isLoading: false, error: errorMsg });
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in error';
      set({ isLoading: false, error: msg });
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
