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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await candidateLogin({ email, password });
      if (res.data?.user) {
        toast.success('Welcome back', `Signed in as ${res.data.user.name}`);
        navigate('/candidate/dashboard');
      } else {
        setError(res.error?.message || 'Invalid candidate credentials.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'An error occurred during candidate authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
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
