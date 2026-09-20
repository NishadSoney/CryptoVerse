import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel } from '../types';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  onSuccess
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('BEGINNER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const res = login(email || username, password);
        if (res.success) {
          setIsLoading(false);
          onSuccess();
          onClose();
        } else {
          setError(res.error || 'Login failed.');
          setIsLoading(false);
        }
      } else {
        const res = register(name, username, email, password, experienceLevel);
        if (res.success) {
          setIsLoading(false);
          onSuccess();
          onClose();
        } else {
          setError(res.error || 'Registration failed.');
          setIsLoading(false);
        }
      }
    }, 250);
  };

  const handleFillDemo = () => {
    setEmail('student@cryptoverse.edu');
    setPassword('demo1234');
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-backdrop-enter">
      <div 
        id="auth-modal-card"
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#121722] p-6 shadow-2xl animate-modal-enter"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            {mode === 'signup' ? <Sparkles className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            {mode === 'signup' ? 'Create Your CryptoVerse Account' : 'Welcome Back to CryptoVerse'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'signup' 
              ? 'Includes $100,000 in virtual paper-trading capital & guided learning.'
              : 'Enter your credentials to continue your guided learning roadmap.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="mb-5 flex rounded-lg border border-white/10 bg-black/40 p-1">
          <button
            type="button"
            id="tab-switch-signup"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
              mode === 'signup' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            id="tab-switch-login"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
              mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_crypto"
                    className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {mode === 'signup' ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type={mode === 'signup' ? 'email' : 'text'}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'signup' ? 'student@cryptoverse.edu' : 'student@cryptoverse.edu or cryptostudent'}
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Current Knowledge Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`rounded-md border py-2 px-2 text-[11px] font-semibold transition ${
                      experienceLevel === lvl
                        ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                        : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            id="btn-submit-auth"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Start Learning with $100k Virtual Capital' : 'Log In to System'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Account Helper */}
        <div className="mt-5 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            Testing Phase 2 authentication?{' '}
            <button
              type="button"
              id="btn-fill-demo-credentials"
              onClick={handleFillDemo}
              className="text-blue-400 hover:underline font-semibold"
            >
              Fill Pre-Seeded Student Credentials
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
