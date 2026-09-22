import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (val, index) => {
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);

      // Auto-focus next input
      if (val && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      toast.success('Email Verified', 'Your email address has been confirmed.');
      navigate('/onboarding');
    }, 600);
  };

  const handleResend = () => {
    setCountdown(45);
    toast.info('Code Sent', 'A fresh 6-digit verification code was sent to your inbox.');
  };

  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-4 shadow-glow-brand">
        <MailCheck className="w-6 h-6" />
      </div>

      <h2 className="text-2xl font-extrabold text-white tracking-tight">Verify your email</h2>
      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
        We have sent a 6-digit security verification code to your organization work email address.
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP digit inputs */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              className="w-11 h-12 text-center text-lg font-bold glass-input rounded-xl border border-white/15 focus:border-brand-400 focus:ring-brand-400"
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isVerifying}
          disabled={otp.some((d) => !d)}
          icon={ArrowRight}
        >
          Confirm & Proceed to Onboarding
        </Button>
      </form>

      <div className="mt-6 text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <span>Didn&apos;t receive the code?</span>
        {countdown > 0 ? (
          <span className="text-slate-400">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resend Code</span>
          </button>
        )}
      </div>
    </div>
  );
}
