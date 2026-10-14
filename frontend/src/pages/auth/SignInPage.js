import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  UserCheck,
  Building2,
  Briefcase,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function SignInPage() {
  const navigate = useNavigate();
  const { login, candidateLogin } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query parameter determines role, defaults to 'candidate' FIRST as requested
  const roleQuery = searchParams.get('role');
  const [activeRole, setActiveRole] = useState(
    roleQuery === 'recruiter' ? 'recruiter' : 'candidate'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync role when URL search params change
  useEffect(() => {
    if (roleQuery === 'recruiter') {
      setActiveRole('recruiter');
    } else if (roleQuery === 'candidate') {
      setActiveRole('candidate');
    }
  }, [roleQuery]);

  const handleRoleSwitch = (newRole) => {
    setActiveRole(newRole);
    setSearchParams({ role: newRole });
    setError('');
    setEmail('');
    setPassword('');
  };

  const executeLogin = async (creds, targetRole = activeRole) => {
    setIsLoading(true);
    setError('');
    try {
      let res;
      if (targetRole === 'candidate') {
        res = await candidateLogin(creds);
        if (res.data?.user || res.success) {
          const u = res.data?.user || res.user;
          toast.success('Welcome back', `Signed in as ${u?.name || 'Candidate'}`);
          navigate('/candidate/dashboard');
          return;
        }
      } else {
        res = await login(creds);
        if (res.success || res.data?.user) {
          const u = res.data?.user || res.user;
          toast.success('Welcome back', `Signed in as ${u?.name || 'User'}`);
          if (u?.role === 'CANDIDATE' && !u?.organizationId) {
            navigate('/candidate/dashboard');
          } else {
            navigate('/dashboard');
          }
          return;
        }
      }

      // Smart Fallback: Attempt alternate method in case user clicked wrong tab
      if (targetRole === 'candidate') {
        try {
          const fallbackRes = await login(creds);
          if (fallbackRes.success || fallbackRes.data?.user) {
            const u = fallbackRes.data?.user || fallbackRes.user;
            toast.success('Welcome back', `Signed in as ${u?.name || 'User'}`);
            if (u?.role === 'CANDIDATE') {
              navigate('/candidate/dashboard');
            } else {
              navigate('/dashboard');
            }
            return;
          }
        } catch {
          // Ignore and show original error
        }
      } else {
        try {
          const fallbackRes = await candidateLogin(creds);
          if (fallbackRes.data?.user || fallbackRes.success) {
            const u = fallbackRes.data?.user || fallbackRes.user;
            toast.success('Welcome back', `Signed in as ${u?.name || 'Candidate'}`);
            navigate('/candidate/dashboard');
            return;
          }
        } catch {
          // Ignore and show original error
        }
      }

      setError(res?.error?.message || res?.message || 'Invalid credentials.');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'An error occurred during authentication. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    executeLogin({ email, password }, activeRole);
  };

  return (
    <div>
      {/* Top Segmented Portal Selector: Candidate First */}
      <div className="auth-segmented-tabs">
        <button
          type="button"
          onClick={() => handleRoleSwitch('candidate')}
          className={`auth-tab-btn ${activeRole === 'candidate' ? 'active' : ''}`}
        >
          <UserCheck className="w-4 h-4 flex-shrink-0" />
          <span>Candidate Portal</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
            Applicant
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleRoleSwitch('recruiter')}
          className={`auth-tab-btn ${activeRole === 'recruiter' ? 'active' : ''}`}
        >
          <Building2 className="w-4 h-4 flex-shrink-0" />
          <span>Employer / ATS</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
            Workspace
          </span>
        </button>
      </div>

      {/* Heading Details */}
      {activeRole === 'candidate' ? (
        <div className="mb-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Candidate Career Portal</span>
          </div>
          <h2 className="auth-title">
            Sign in as Candidate
          </h2>
          <p className="auth-subtitle">
            Access your job applications, saved listings, and interview schedules.
          </p>
        </div>
      ) : (
        <div className="mb-5 text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>Organization ATS Workspace</span>
          </div>
          <h2 className="auth-title">
            Sign in to your ATS
          </h2>
          <p className="auth-subtitle">
            Enter your credentials to access your organization workspace.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={activeRole === 'candidate' ? 'Candidate Email' : 'Work Email'}
          type="email"
          placeholder={
            activeRole === 'candidate'
              ? 'candidate@example.com'
              : 'name@company.com'
          }
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-xl pl-9 pr-10 py-2 text-sm border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 shadow-xs"
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
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
            />
            <span>Remember for 30 days</span>
          </label>
          <Link
            to={
              activeRole === 'candidate'
                ? '/candidate/forgot-password'
                : '/forgot-password'
            }
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="auth-btn-primary w-full mt-2"
          disabled={isLoading}
        >
          <span>{activeRole === 'candidate' ? 'Sign In as Candidate' : 'Sign In to Workspace'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Prominent Candidate Sign Up / Registration Box */}
      {activeRole === 'candidate' ? (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                New candidate? Create free profile
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Apply to curated roles and track status in real time.
              </p>
            </div>
            <Link
              to="/candidate/signup"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            >
              Sign Up Free &rarr;
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Are you an employer or recruiter?{' '}
            <button
              type="button"
              onClick={() => handleRoleSwitch('recruiter')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
            >
              Switch to ATS Login &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Don&apos;t have an organization account?
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Start a 14-day trial for your recruiting team.
              </p>
            </div>
            <Link
              to="/signup"
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all whitespace-nowrap"
            >
              Create Workspace &rarr;
            </Link>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
            Looking for jobs?{' '}
            <button
              type="button"
              onClick={() => handleRoleSwitch('candidate')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
            >
              Switch to Candidate Portal &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
