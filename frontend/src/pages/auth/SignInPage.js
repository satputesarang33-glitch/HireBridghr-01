import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function SignInPage() {
  const navigate = useNavigate();
  const { login, availableUsers } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('sarah.connor@apextech.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success) {
        toast.success('Welcome back', `Signed in as ${res.data.user.name}`);
        if (res.data.user.role === 'CANDIDATE') {
          navigate('/candidate/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error?.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset fills for test evaluation
  const handleQuickFill = (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
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

      {/* Quick Mock Persona Demo Fill Bar */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-400" />
            Quick Demo Logins:
          </span>
          <span className="text-[9px] text-slate-500">Click to fill credentials</span>
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {availableUsers.filter(u => u.role !== 'CANDIDATE').slice(0, 4).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleQuickFill(u.email)}
              className="text-left p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 transition-colors"
            >
              <span className="font-semibold text-white block truncate">{u.role}</span>
              <span className="text-[10px] text-slate-400 block truncate">{u.name.split(' ')[0]}</span>
            </button>
          ))}
          {/* Demo Candidate Persona */}
          <button
            type="button"
            onClick={() => navigate('/candidate/login')}
            className="col-span-2 text-left p-2 rounded bg-brand-500/10 hover:bg-brand-500/20 border border-brand-400/30 text-[11px] text-brand-200 transition-colors flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-brand-300 block">CANDIDATE — Alex Rivera</span>
              <span className="text-[10px] text-slate-400 block">alex.candidate@example.com</span>
            </div>
            <span className="text-[10px] bg-brand-400/20 text-brand-300 px-2 py-0.5 rounded font-medium">
              Demo Candidate Portal &rarr;
            </span>
          </button>
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
