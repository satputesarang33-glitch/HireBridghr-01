import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (creds) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await login(creds);
      if (res.success || res.data?.user) {
        const u = res.data?.user || res.user;
        toast.success('Welcome back', `Signed in as ${u?.name || 'User'}`);
        if (u?.role === 'CANDIDATE' && !u?.organizationId) {
          navigate('/candidate/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error?.message || res.message || 'Invalid credentials.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (creds, autoLogin = false) => {
    setEmail(creds.email);
    setPassword(creds.password);
    if (autoLogin) {
      executeLogin(creds);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    executeLogin({ email, password });
  };

  return (
    <div>
      <div className="mb-5 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your ATS</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your credentials to access your organization workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Demo Persona Quick Access - Enhanced High-Contrast Glassmorphism */}
      <div className="mb-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-cyan-500/30 shadow-xl shadow-black/40 backdrop-blur-xl relative overflow-hidden space-y-2.5 sm:space-y-3">
        {/* Ambient background glows */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
              Demo Personas &amp; Quick Access
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 flex-shrink-0">
            ⚡ 1-Click Access
          </span>
        </div>

        {/* 1-Click Direct Launch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'elena.rostova@apextech.com', password: 'Password123!' }, true)}
            className="group p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 transition-all duration-200 shadow-md hover:shadow-cyan-500/20 text-left flex items-center justify-between gap-2 touch-manipulation cursor-pointer w-full"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-cyan-400 truncate">
                Lead Recruiter
              </span>
              <span className="block text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                Elena Rostova
              </span>
            </div>
            <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow group-hover:scale-105 transition-transform flex-shrink-0">
              Enter <ArrowRight className="w-3 h-3" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'sarah.connor@apextech.com', password: 'Password123!' }, true)}
            className="group p-2 sm:p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-purple-500/40 hover:border-purple-400 transition-all duration-200 shadow-md hover:shadow-purple-500/20 text-left flex items-center justify-between gap-2 touch-manipulation cursor-pointer w-full"
          >
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-400 truncate">
                Workspace Owner
              </span>
              <span className="block text-xs font-bold text-white group-hover:text-purple-200 transition-colors truncate">
                Sarah Connor
              </span>
            </div>
            <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 shadow group-hover:scale-105 transition-transform flex-shrink-0">
              Enter <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>

        {/* Quick Fill Form Row */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-white/10 relative z-10 text-xs">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-300">Quick fill:</span>
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'elena.rostova@apextech.com', password: 'Password123!' }, false)}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/95 hover:bg-cyan-950/70 text-cyan-200 hover:text-white border border-cyan-500/35 hover:border-cyan-400 font-semibold text-[10px] sm:text-[11px] transition-all flex items-center gap-1 shadow-sm touch-manipulation cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Elena <span className="text-[9px] sm:text-[10px] text-cyan-400 font-normal">(Recruiter)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'sarah.connor@apextech.com', password: 'Password123!' }, false)}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/95 hover:bg-purple-950/70 text-purple-200 hover:text-white border border-purple-500/35 hover:border-purple-400 font-semibold text-[10px] sm:text-[11px] transition-all flex items-center gap-1 shadow-sm touch-manipulation cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Sarah <span className="text-[9px] sm:text-[10px] text-purple-400 font-normal">(Owner)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'marcus.vance@apextech.com', password: 'Password123!' }, false)}
            className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800/95 hover:bg-amber-950/70 text-amber-200 hover:text-white border border-amber-500/35 hover:border-amber-400 font-semibold text-[10px] sm:text-[11px] transition-all flex items-center gap-1 shadow-sm touch-manipulation cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Marcus <span className="text-[9px] sm:text-[10px] text-amber-400 font-normal">(Admin)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="glass-input w-full rounded-lg pl-9 pr-10 py-2 text-sm shadow-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded bg-slate-800 border-white/20 text-brand-500 focus:ring-brand-400 w-3.5 h-3.5"
            />
            <span>Remember for 30 days</span>
          </label>
          <Link to="/forgot-password" className="text-brand-400 hover:text-brand-300 font-semibold">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} icon={ArrowRight}>
          Sign In
        </Button>
      </form>

      {/* Candidate Portal Bridge Card */}
      <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-brand-500/10 via-accent-500/10 to-transparent border border-brand-400/20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Are you a candidate?</p>
            <p className="text-[11px] text-slate-400">Looking for jobs and tracking applications?</p>
          </div>
          <Link
            to="/candidate/login"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-accent-600 hover:from-brand-400 hover:to-accent-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            Sign in as Candidate &rarr;
          </Link>
        </div>
        <div className="mt-2 pt-2 border-t border-white/10 text-center text-[11px] text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/candidate/signup" className="text-brand-400 hover:text-brand-300 font-medium underline">
            Create Candidate Account
          </Link>
        </div>
      </div>

      <div className="mt-5 text-center text-xs text-slate-400">
        Don&apos;t have an organization account?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold">
          Create Workspace &rarr;
        </Link>
      </div>
    </div>
  );
}
