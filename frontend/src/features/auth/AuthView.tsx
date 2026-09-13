import React, { useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { request, ApiError } from '../../lib/api-client';
import { Sparkles, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, authMode, setAuthMode } = useAuthStore();
  const { showToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  const fillDemoCredentials = () => {
    setEmail('admin@taskmanager.dev');
    setPassword('Admin@123456');
    setError('');
    showToast('Demo admin credentials filled!', 'info', 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setIsLoading(true);
      setError('');
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          twoFactorCode: twoFactorCode.trim() || undefined,
        }),
      });

      if (res.requires2FA) {
        setRequires2FA(true);
        setInfoMessage('2FA verification code required. Please check your authenticator.');
        setIsLoading(false);
        return;
      }

      if (res.accessToken) {
        login(res.accessToken, res.user);
        showToast(`Welcome back, ${res.user?.fullName || 'User'}!`, 'success');
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Check your network or credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    try {
      setIsLoading(true);
      setError('');
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      setInfoMessage(
        res.verificationToken
          ? `Registration successful! Verification token: ${res.verificationToken}`
          : 'Registration successful! Please sign in.'
      );
      showToast('Registration successful! Please sign in.', 'success');
      setAuthMode('login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Auth Card */}
      <div className="w-full max-w-md bg-surface-card border border-border/80 rounded-2xl p-8 shadow-modal backdrop-blur-xl relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center shadow-glow mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Task<span className="text-brand-400">Pro</span> Suite
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Enterprise Agile Planning & Finite-State Workflows
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 bg-surface-surface/60 p-1 rounded-xl border border-border/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
              setInfoMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              authMode === 'login'
                ? 'bg-surface-elevated text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError('');
              setInfoMessage('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              authMode === 'register'
                ? 'bg-surface-elevated text-white shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
        </div>

        {/* Form Container */}
        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {requires2FA && (
              <Input
                label="Two-Factor Authentication Code (2FA)"
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            )}

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
            {infoMessage && <p className="text-xs text-brand-300 font-medium">{infoMessage}</p>}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold shadow-glow"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {requires2FA ? 'Verify 2FA & Sign In' : 'Sign In'}
            </Button>

            {/* Demo Credential Quick Fill */}
            <div className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="subtle"
                size="xs"
                onClick={fillDemoCredentials}
                className="w-full text-xs font-medium"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Auto-fill Demo Admin Credentials
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
            {infoMessage && <p className="text-xs text-emerald-400 font-medium">{infoMessage}</p>}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold shadow-glow"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>
        )}
      </div>

      <div className="text-center text-xs text-text-muted mt-6 z-10">
        Task Manager Enterprise Edition · React 18 & Next.js Architecture
      </div>
    </div>
  );
};
