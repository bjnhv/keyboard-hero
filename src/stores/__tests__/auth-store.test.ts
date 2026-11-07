import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from '../use-auth-store';

describe('Auth Store', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    useAuthStore.setState({
      user: null,
      sessionToken: null,
      isLoading: false,
      error: null,
      isAuthModalOpen: false,
      authModalTab: 'signin',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with logged-out state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.sessionToken).toBeNull();
    expect(state.isAuthModalOpen).toBe(false);
  });

  it('opens and closes auth modal with tabs', () => {
    const store = useAuthStore.getState();

    store.openAuthModal('signup');
    expect(useAuthStore.getState().isAuthModalOpen).toBe(true);
    expect(useAuthStore.getState().authModalTab).toBe('signup');

    store.setAuthModalTab('signin');
    expect(useAuthStore.getState().authModalTab).toBe('signin');

    store.closeAuthModal();
    expect(useAuthStore.getState().isAuthModalOpen).toBe(false);
  });

  it('signs in successfully and saves user to state and localStorage', async () => {
    const mockUser = {
      id: 'usr-123',
      email: 'pilot@speed.com',
      name: 'Pilot',
      createdAt: '2026-11-06T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'mock-token-xyz', user: mockUser }),
    } as unknown as Response);

    const store = useAuthStore.getState();
    const result = await store.signIn('pilot@speed.com', 'ValidPass123!');

    expect(result.success).toBe(true);
    const updated = useAuthStore.getState();
    expect(updated.user?.email).toBe('pilot@speed.com');
    expect(updated.sessionToken).toBe('mock-token-xyz');
    expect(updated.isAuthModalOpen).toBe(false);
  });

  it('handles sign in error response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }),
    } as unknown as Response);

    const store = useAuthStore.getState();
    const result = await store.signIn('pilot@speed.com', 'WrongPass!');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().error).toBe('Invalid credentials');
  });

  it('initiates Google sign in and requests social endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        url: 'https://ep-dry-dream-b9mjiwyf.neonauth.c-7.eu-central-1.aws.neon.tech/neondb/auth/sign-in/social/init?token=test',
        redirect: true,
      }),
    } as unknown as Response);

    const store = useAuthStore.getState();
    await store.signInWithGoogle();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/sign-in/social',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('signs out and purges user state and storage', async () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'test@example.com', name: 'Test' },
      sessionToken: 'token-abc',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as unknown as Response);

    const store = useAuthStore.getState();
    await store.signOut();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.sessionToken).toBeNull();
    expect(state.error).toBeNull();
  });
});
