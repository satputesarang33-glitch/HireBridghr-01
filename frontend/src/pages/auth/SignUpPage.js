import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organizationName: '',
    organizationType: 'COMPANY',
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-cyan-500' };
    return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.organizationName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('You must accept the terms of service and privacy policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup(formData);
      if (res.success) {
        toast.success('Account Created', 'Welcome to HirebridgeHR! Let us configure your workspace.');
        navigate('/onboarding');
      } else {
        setError(res.error?.message || 'Could not register organization.');
      }
    } catch (err) {
      setError('Network error during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Create your workspace</h2>
        <p className="text-xs text-slate-400 mt-1">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Sarah"
            icon={User}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Last Name"
            placeholder="Connor"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>

        <Input
          label="Work Email"
          type="email"
          placeholder="sarah@company.com"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm shadow-sm"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="pt-1.5 space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 text-right">
                Password Strength: <strong className="text-slate-200">{strength.label}</strong>
              </p>
            </div>
          )}
        </div>

        <Input
          label="Organization / Company Name"
          placeholder="Apex Global Tech"
          icon={Building}
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          required
        />

        <Select
          label="Organization Type"
          value={formData.organizationType}
          onChange={(e) => setFormData({ ...formData, organizationType: e.target.value })}
          options={[
            { label: 'Company / Internal HR', value: 'COMPANY' },
            { label: 'Recruitment Agency', value: 'AGENCY' },
            { label: 'Staffing Company', value: 'STAFFING' },
            { label: 'Startup', value: 'STARTUP' },
          ]}
        />

        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="mt-0.5 rounded bg-slate-800 border-white/20 text-brand-500 focus:ring-brand-400 w-3.5 h-3.5"
            />
            <span>
              I agree to the <span className="text-brand-400 underline">Terms of Service</span> and{' '}
              <span className="text-brand-400 underline">Privacy Policy</span>.
            </span>
          </label>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} icon={ArrowRight}>
          Create Workspace
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/signin" className="text-brand-400 hover:text-brand-300 font-semibold">
          Sign In &rarr;
        </Link>
      </div>
    </div>
  );
}
