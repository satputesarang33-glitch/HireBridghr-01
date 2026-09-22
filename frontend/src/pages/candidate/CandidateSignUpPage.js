import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function CandidateSignUpPage() {
  const navigate = useNavigate();
  const { candidateSignup } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    const phoneDigits = formData.phone.replace(/[^0-9+]/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (phoneDigits.length < 8) {
      errs.phone = 'Please enter a valid phone number (minimum 8 digits)';
    }

    if (!formData.location.trim()) errs.location = 'Location is required';

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must accept the Terms & Conditions to register';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await candidateSignup(formData);
      if (res.data?.user) {
        toast.success('Account Created', `Welcome to HirebridgeHR, ${res.data.user.name}!`);
        navigate('/candidate/dashboard');
      } else {
        setServerError(res.error?.message || 'Failed to create candidate account.');
      }
    } catch (err) {
      setServerError(
        err?.response?.data?.message || err?.message || 'An error occurred during account creation. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Create your candidate account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Create your profile and start applying for jobs.
        </p>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="First Name"
              type="text"
              placeholder="Sarah"
              icon={User}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
            />
            {errors.firstName && <p className="text-[11px] text-rose-400 mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Input
              label="Last Name"
              type="text"
              placeholder="Connor"
              icon={User}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
            />
            {errors.lastName && <p className="text-[11px] text-rose-400 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <Input
            label="Email Address"
            type="email"
            placeholder="sarah.connor@example.com"
            icon={Mail}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />
          {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 019-2834"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              required
            />
            {errors.phone && <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Input
              label="Location"
              type="text"
              placeholder="San Francisco, CA"
              icon={MapPin}
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />
            {errors.location && <p className="text-[11px] text-rose-400 mt-1">{errors.location}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="glass-input w-full rounded-lg pl-9 pr-10 py-2 text-sm shadow-sm"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
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
          {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className="glass-input w-full rounded-lg pl-9 pr-10 py-2 text-sm shadow-sm"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-300">
            <input
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
              className="mt-0.5 rounded bg-slate-800 border-white/20 text-brand-500 focus:ring-brand-400 w-4 h-4 shrink-0"
            />
            <span>
              I agree to the{' '}
              <span className="text-brand-400 underline hover:text-brand-300">Terms &amp; Conditions</span> and{' '}
              <span className="text-brand-400 underline hover:text-brand-300">Privacy Policy</span>.
            </span>
          </label>
          {errors.agreeTerms && <p className="text-[11px] text-rose-400 mt-1">{errors.agreeTerms}</p>}
        </div>

        <Button type="submit" variant="primary" className="w-full mt-3" isLoading={isLoading} icon={ArrowRight}>
          Create Account
        </Button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link to="/candidate/login" className="text-brand-400 hover:text-brand-300 font-semibold underline">
          Sign In
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 text-center text-xs text-slate-400">
        Are you an employer or recruiter?{' '}
        <Link to="/signin" className="text-brand-400 hover:text-brand-300 font-medium">
          ATS Login &rarr;
        </Link>
      </div>
    </div>
  );
}
