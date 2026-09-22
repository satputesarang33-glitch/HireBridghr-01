import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService.js';
import { Input } from '../../components/ui/Input.js';
import { Button } from '../../components/ui/Button.js';

export function CandidateForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      // In development/mock mode, provide a convenience token link
      if (res?.token) {
        setResetToken(res.token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your candidate email address and we will send you instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Reset link dispatched</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              If an account with that email exists, we have sent a secure password reset link. Please check your inbox or spam folder.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Demo Reset Link:</span>
            <Link
              to={`/candidate/reset-password?token=${resetToken || 'demo-reset-token-cand'}`}
              className="text-brand-400 hover:text-brand-300 font-semibold"
            >
              Click to Reset Password &rarr;
            </Link>
          </div>

          <div className="pt-3">
            <Link
              to="/candidate/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Candidate Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
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

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading} icon={ArrowRight}>
            Send Reset Instructions
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/candidate/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Candidate Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
