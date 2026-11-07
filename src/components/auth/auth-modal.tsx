'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { Mail, Lock, User, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    setAuthModalTab,
    signIn,
    signUp,
    signInWithGoogle,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalValidation(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setLocalValidation('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setLocalValidation('Password must be at least 8 characters');
      return;
    }

    if (authModalTab === 'signup') {
      const result = await signUp(trimmedEmail, password, name);
      if (result.success) {
        setEmail('');
        setPassword('');
        setName('');
      }
    } else {
      const result = await signIn(trimmedEmail, password);
      if (result.success) {
        setEmail('');
        setPassword('');
      }
    }
  };

  const activeError = localValidation || error;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="relative w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-2xl text-card-foreground overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Keyboard Hero Cloud</h2>
            <p className="text-xs text-muted-foreground">
              Sync stats, high scores, and key confidence across devices
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-secondary/80 p-1 mt-4 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('signin');
              setLocalValidation(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
              authModalTab === 'signin'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('signup');
              setLocalValidation(null);
            }}
            className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
              authModalTab === 'signup'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-secondary/60 hover:bg-secondary text-foreground text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-sm mb-3.5"
        >
          <GoogleIcon className="w-4 h-4 shrink-0" />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative mb-3.5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[10px] sm:text-[11px] uppercase">
            <span className="bg-card px-2.5 text-muted-foreground font-medium">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Display Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="SpeedDemon"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Password (min. 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : authModalTab === 'signup' ? (
              'Create Free Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 text-center">
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-xs text-muted-foreground hover:text-foreground transition cursor-pointer underline-offset-2 hover:underline"
          >
            Stay Offline / Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
