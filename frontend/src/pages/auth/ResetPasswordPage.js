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
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Set new password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Create a new secure password for your HirebridgeHR account.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm"
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

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type="password"
              className="glass-input w-full rounded-lg pl-9 pr-3 py-2 text-sm"
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

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} icon={ArrowRight}>
          Reset Password
        </Button>
      </form>
    </div>
  );
}
