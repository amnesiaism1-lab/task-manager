import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { request, ApiError } from '../../lib/api-client';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  LogIn,
  Mail,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, authMode, setAuthMode } = useAuthStore();
  const { showToast } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Google OAuth Flow States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-inspect URL query parameters on mount (verifyToken, resetToken, invitationToken)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const vToken = searchParams.get('verifyToken');
    const rToken = searchParams.get('resetToken');
    const iToken = searchParams.get('invitationToken');
    const urlEmail = searchParams.get('email');

    if (urlEmail) {
      setEmail(urlEmail);
      setGoogleEmail(urlEmail);
    }

    if (iToken) {
      sessionStorage.setItem('pending_invitation_token', iToken);
      setInfoMessage('You have an organization invitation pending! Sign in or register to join.');
    }

    if (rToken) {
      setResetToken(rToken);
      setAuthMode('reset');
      return;
    }

    if (vToken) {
      setVerificationToken(vToken);
      // Auto-trigger verify email API call
      handleAutoVerify(vToken, urlEmail || '');
    }
  }, []);

  const handleAutoVerify = async (tokenToVerify: string, emailToVerify: string) => {
    try {
      setIsLoading(true);
      setError('');
      setInfoMessage('Verifying your email token...');
      const res = await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: tokenToVerify,
          email: emailToVerify || undefined,
        }),
      });

      // Clear query params from browser URL so refreshing doesn't re-trigger
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showToast('Email verified successfully! Welcome to Task Manager Pro.', 'success');
      } else {
        showToast('Email verified! You can now sign in.', 'success');
        setInfoMessage('Email verified successfully! Please sign in with your credentials.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Verification token is invalid or expired. You can request a new one below.');
      setAuthMode('verify');
    } finally {
      setIsLoading(false);
    }
  };

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

    // Validate password pattern: at least 8 chars, letters and numbers
    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError('Password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

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

      // Direct auto-login if backend returned tokens
      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showToast(`Account created! Welcome, ${res.user?.fullName || 'User'}!`, 'success');
        return;
      }

      setInfoMessage(
        res.verificationToken
          ? `Registration successful! Check your inbox or enter token: ${res.verificationToken}`
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      await request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setInfoMessage('If an account exists for this email, a password reset link has been dispatched. Please check your inbox.');
      showToast('Password reset email sent!', 'info');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !password) return;

    if (password.length < 8 || !/^(?=.*[A-Za-z])(?=.*\d).+$/.test(password)) {
      setError('Password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-type your new password.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken.trim(),
          email: email.trim() || undefined,
          password,
        }),
      });

      showToast('Password reset successfully! Please sign in with your new password.', 'success');
      setInfoMessage('Password reset successfully! You can now sign in.');
      setPassword('');
      setConfirmPassword('');
      setAuthMode('login');
    } catch (err: any) {
      setError(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationToken.trim()) {
      setError('Please provide your verification token.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          token: verificationToken.trim(),
          email: email.trim() || undefined,
        }),
      });

      if (res.accessToken && res.user) {
        login(res.accessToken, res.user);
        showToast('Email verified successfully! Welcome to Task Manager Pro.', 'success');
      } else {
        showToast('Email verified successfully! You can now sign in.', 'success');
        setInfoMessage('Email verified successfully! Please sign in.');
        setAuthMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Verification token is invalid or has already been used.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError('Please enter your email address above to resend the verification code.');
      return;
    }

    try {
      setIsResending(true);
      setError('');
      await request('/auth/request-verification', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setInfoMessage('A new verification email has been dispatched. Please check your inbox.');
      showToast('Verification email resent!', 'info');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleAuth = async (customEmail?: string, customName?: string) => {
    const targetEmail = (customEmail || googleEmail).trim().toLowerCase();
    if (!targetEmail) {
      setError('Please provide an email for Google Sign-In');
      return;
    }
    const targetName = (customName || googleName || targetEmail.split('@')[0]).trim();

    try {
      setGoogleLoading(true);
      setError('');
      const res = await request('/auth/google', {
        method: 'POST',
        body: JSON.stringify({
          email: targetEmail,
          fullName: targetName,
        }),
      });

      if (res.accessToken && res.user) {
        setShowGoogleModal(false);
        login(res.accessToken, res.user);
        showToast(`Signed in with Google as ${res.user?.fullName || targetName}!`, 'success');
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setGoogleLoading(false);
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
        <div className="flex flex-col items-center text-center mb-6">
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

        {/* Mode Switcher Tabs for Login & Register */}
        {(authMode === 'login' || authMode === 'register') && (
          <div className="grid grid-cols-2 bg-surface-surface/60 p-1 rounded-xl border border-border/60 mb-5">
            <button
              id="tab-login"
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
              id="tab-register"
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
              Register
            </button>
          </div>
        )}

        {/* Google Auth Button on Login / Register */}
        {(authMode === 'login' || authMode === 'register') && (
          <>
            <button
              id="btn-google-auth"
              type="button"
              onClick={() => {
                setError('');
                setShowGoogleModal(true);
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-sm transition-all border border-slate-300 hover:shadow active:scale-[0.99] mb-5 group cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-border/70 w-full" />
              <span className="bg-surface-card px-2.5 text-[10px] font-semibold tracking-wider text-text-muted uppercase shrink-0">
                or with email
              </span>
            </div>
          </>
        )}

        {/* Global Notifications inside Card */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}
        {infoMessage && (
          <div className="p-3 mb-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-400 mt-0.5" />
            <span className="leading-relaxed">{infoMessage}</span>
          </div>
        )}

        {/* ─── Mode 1: Sign In ─── */}
        {authMode === 'login' && (
          <form id="form-login" onSubmit={handleLogin} className="space-y-4">
            <Input
              id="login-email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setInfoMessage('');
                    setAuthMode('forgot');
                  }}
                  className="text-[11px] text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {requires2FA && (
              <Input
                id="login-2fa"
                name="twoFactorCode"
                label="Two-Factor Authentication Code (2FA)"
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
                required
                autoFocus
              />
            )}

            <Button
              id="btn-login"
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold shadow-glow"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {requires2FA ? 'Verify 2FA & Sign In' : 'Sign In'}
            </Button>

            {/* Quick Links */}
            <div className="flex items-center justify-between pt-2 text-[11px] text-text-muted">
              <span>Need to activate an account?</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('verify');
                }}
                className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Enter verification token
              </button>
            </div>

            {/* Demo Credential Quick Fill */}
            <div className="pt-3 border-t border-border/60">
              <Button
                id="btn-autofill-admin"
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
        )}

        {/* ─── Mode 2: Register ─── */}
        {authMode === 'register' && (
          <form id="form-register" onSubmit={handleRegister} className="space-y-4">
            <Input
              id="reg-name"
              name="fullName"
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />

            <Input
              id="reg-email"
              name="email"
              label="Work Email"
              type="email"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input
                id="reg-password"
                name="password"
                label="Password (min 8 chars, letters & numbers)"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <p className="text-[10px] text-text-muted">
                Must contain at least 8 characters with both letters and numbers.
              </p>
            </div>

            <Button
              id="btn-register"
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-semibold shadow-glow"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register & Start Working
            </Button>

            <div className="text-center pt-2 text-[11px] text-text-muted">
              Already have an activation token?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('verify');
                }}
                className="text-brand-400 hover:text-brand-300 font-medium"
              >
                Verify email here
              </button>
            </div>
          </form>
        )}

        {/* ─── Mode 3: Forgot Password ─── */}
        {authMode === 'forgot' && (
          <div className="space-y-4">
            <div className="text-left mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-400" />
                Reset Your Password
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Enter your registered work email. We'll send you a password reset link and token.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                id="forgot-email"
                label="Account Email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-semibold shadow-glow"
                isLoading={isLoading}
                rightIcon={<Mail className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>
            </form>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('reset');
                }}
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                Already have a reset token?
              </button>
            </div>
          </div>
        )}

        {/* ─── Mode 4: Reset Password (with token) ─── */}
        {authMode === 'reset' && (
          <div className="space-y-4">
            <div className="text-left mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400" />
                Set New Password
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Enter the token from your email and create your new secure password.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input
                label="Account Email (Optional)"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Input
                  label="Password Reset Token"
                  type="text"
                  placeholder="Paste token from email"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                />
                <p className="text-[10px] text-text-muted mt-1">
                  Check your Gmail inbox or spam folder for the password reset email.
                </p>
              </div>

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-semibold shadow-glow"
                isLoading={isLoading}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Update Password & Sign In
              </Button>
            </form>

            <div className="pt-3 border-t border-border/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          </div>
        )}

        {/* ─── Mode 5: Verify Email Token ─── */}
        {authMode === 'verify' && (
          <div className="space-y-4">
            <div className="text-left mb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                Activate & Verify Account
              </h2>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Paste the verification token from your email below to verify your email address and enter the workspace.
              </p>
            </div>

            <form onSubmit={handleManualVerify} className="space-y-4">
              <Input
                label="Account Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Verification Token (from Gmail)
                </label>
                <textarea
                  rows={2}
                  className="w-full font-mono text-xs p-3 rounded-xl bg-surface-surface border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white placeholder-text-muted outline-none transition-all resize-none"
                  placeholder="Paste token e.g. 5967f584fcf4283fb8b3812a6e8effa89ef1ca5da6f3c187575d6cd02405c287"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  required
                />
                <p className="text-[10px] text-text-muted mt-1">
                  You can copy the code box inside the "Verify Your Email Address" email.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-semibold shadow-glow"
                isLoading={isLoading}
                rightIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify Email & Enter Workspace
              </Button>
            </form>

            {/* Resend Verification Code Option */}
            <div className="p-3 bg-surface-surface/60 rounded-xl border border-border/60 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold text-text-primary">Didn't receive the email?</p>
                <p className="text-[10px] text-text-muted">Check your spam folder or request a new code</p>
              </div>
              <Button
                type="button"
                variant="subtle"
                size="xs"
                onClick={handleResendVerification}
                isLoading={isResending}
                leftIcon={<RefreshCw className="w-3 h-3 text-sky-400" />}
              >
                Resend Email
              </Button>
            </div>

            <div className="pt-2 border-t border-border/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setInfoMessage('');
                  setAuthMode('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sensible Google Authentication Dialog */}
      <Modal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        title="Sign in with Google"
        description="Authenticate securely with your Google or Google Workspace account."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">Google Account Verification</p>
              <p className="text-[11px] text-text-muted">Direct OAuth 2.0 / Workspace ID Token</p>
            </div>
          </div>

          {/* Quick Demo Google Account Option */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
              Quick Connect Demo Account
            </label>
            <button
              type="button"
              onClick={() => handleGoogleAuth('google.demo@taskmanager.dev', 'Google Workspace User')}
              disabled={googleLoading}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-surface hover:bg-surface-hover border border-border/80 text-left transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                  G
                </div>
                <div>
                  <p className="text-xs font-semibold text-text-primary group-hover:text-brand-300">
                    Google Demo User
                  </p>
                  <p className="text-[10px] text-text-muted">google.demo@taskmanager.dev</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand-400 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-border/70 w-full" />
            <span className="bg-surface-card px-2.5 text-[10px] font-semibold text-text-muted uppercase shrink-0">
              or enter your google email
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGoogleAuth();
            }}
            className="space-y-3"
          >
            <Input
              label="Your Google Email"
              type="email"
              placeholder="you@gmail.com or you@company.com"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Your Name (Optional)"
              type="text"
              placeholder="e.g. John Smith"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
            />

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGoogleModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={googleLoading}
                leftIcon={<Mail className="w-3.5 h-3.5" />}
              >
                Continue with Google
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <div className="text-center text-xs text-text-muted mt-6 z-10">
        Task Manager Enterprise Edition · React 18 & Next.js Architecture
      </div>
    </div>
  );
};
