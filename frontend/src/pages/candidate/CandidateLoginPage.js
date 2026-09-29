import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function CandidateLoginPage() {
  const navigate = useNavigate();
  const { candidateLogin } = useAuth();
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
      const res = await candidateLogin(creds);
      if (res.data?.user || res.success) {
        const u = res.data?.user || res.user;
        toast.success('Welcome back', `Signed in as ${u?.name || 'Candidate'}`);
        navigate('/candidate/dashboard');
      } else {
        setError(res.error?.message || res.message || 'Invalid candidate credentials.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during candidate authentication.');
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-3">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Candidate Career Portal</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in as Candidate</h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your job applications, saved listings, and interview schedules.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Demo Persona Quick Access */}
      <div className="mb-5 p-3 rounded-xl bg-slate-900/60 border border-brand-500/20 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
            Demo Persona Quick Access
          </span>
          <span className="text-[10px] text-slate-400">Candidate Test Account</span>
        </div>

        <button
          type="button"
          onClick={() => handleSelectPersona({ email: 'alex.candidate@example.com', password: 'Password123!' }, true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 border border-brand-400/30 text-white text-xs font-semibold transition-all text-left"
        >
          <span>Demo Candidate Alex Rivera</span>
          <span className="text-[10px] text-brand-300 bg-brand-500/20 px-1.5 py-0.5 rounded">Enter Portal &rarr;</span>
        </button>

        <div className="flex items-center flex-wrap gap-1.5 pt-1 text-[11px] text-slate-400">
          <span>Quick fill:</span>
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'alex.candidate@example.com', password: 'Password123!' }, false)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium"
          >
            Demo Candidate
          </button>
          <button
            type="button"
            onClick={() => handleSelectPersona({ email: 'alex.wright@techinnovate.dev', password: 'Password123!' }, false)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-medium"
          >
            Alex Wright
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Candidate Email"
          type="email"
          placeholder="your.name@example.com"
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
            <span>Remember me</span>
          </label>
          <Link to="/candidate/forgot-password" className="text-brand-400 hover:text-brand-300 font-semibold">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} icon={ArrowRight}>
          Sign In
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/candidate/signup" className="text-brand-400 hover:text-brand-300 font-semibold underline">
          Create Candidate Account
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
        Are you an employer or recruiter?{' '}
        <Link to="/signin" className="text-brand-400 hover:text-brand-300 font-medium">
          Sign in to ATS &rarr;
        </Link>
      </div>
    </div>
  );
}
