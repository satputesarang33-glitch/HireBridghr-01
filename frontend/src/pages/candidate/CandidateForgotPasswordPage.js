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
      <div className="mb-6 text-left">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">
          Enter your candidate email address and we will send you instructions to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <div className="flex items-center gap-2 font-semibold text-sm mb-1 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset link dispatched</span>
            </div>
            <p className="text-emerald-700 text-[11px] leading-relaxed">
              If an account with that email exists, we have sent a secure password reset link. Please check your inbox or spam folder.
            </p>
          </div>

          {resetToken && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Password Reset Link:</span>
              <Link
                to={`/candidate/reset-password?token=${resetToken}`}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Click to Reset Password &rarr;
              </Link>
            </div>
          )}

          <div className="pt-3">
            <Link
              to="/candidate/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
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

          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? "Sending..." : "Send Reset Instructions"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <Link
              to="/candidate/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
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
