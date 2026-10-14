import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        toast.success('Password Updated', 'Your password has been reset successfully.');
        navigate('/signin');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="auth-title">Set new password</h2>
        <p className="auth-subtitle">
          Create a new secure password for your HirebridgeHR account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              className="w-full rounded-xl pl-9 pr-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 shadow-xs"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              className="w-full rounded-xl pl-9 pr-3 py-2 text-sm border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 shadow-xs"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="auth-btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? "Updating..." : "Reset Password"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
