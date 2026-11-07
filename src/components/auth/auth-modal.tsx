'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/stores/use-auth-store';
import { Mail, Lock, User, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    closeAuthModal,
    setAuthModalTab,
    signIn,
    signUp,
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
