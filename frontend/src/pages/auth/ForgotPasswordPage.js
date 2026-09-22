import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';
import { authService } from '../../services/authService.js';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto mb-6">
          We have sent a secure password reset link to <strong className="text-white">{email}</strong>. Please follow the instructions to set a new password.
        </p>
        <Link to="/signin">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your account work email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Account Email"
          type="email"
          placeholder="name@company.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center text-xs">
        <Link to="/signin" className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
