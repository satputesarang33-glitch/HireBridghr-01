import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Briefcase } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { useToast } from "../../context/ToastContext.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";

export function CandidateLoginPage() {
  const navigate = useNavigate();
  const { candidateLogin } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const executeLogin = async (creds) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await candidateLogin(creds);
      if (res.data?.user || res.success) {
        const u = res.data?.user || res.user;
        toast.success("Welcome back", `Signed in as ${u?.name || "Candidate"}`);
        navigate("/candidate/dashboard");
      } else {
        setError(
          res.error?.message || res.message || "Invalid candidate credentials.",
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "An error occurred during candidate authentication.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }
    executeLogin({ email, password });
  };

  return (
    <div>
      {/* Top Segmented Portal Selector: Candidate Active */}
      <div className="auth-segmented-tabs">
        <div className="auth-tab-btn active">
          <Briefcase className="w-4 h-4 flex-shrink-0" />
          <span>Candidate Portal</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 uppercase">
            Active
          </span>
        </div>

        <Link
          to="/signin?role=recruiter"
          className="auth-tab-btn"
        >
          <span>Employer / ATS</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
            ATS
          </span>
        </Link>
      </div>

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

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
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
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
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
            <span>Remember me</span>
          </label>
          <Link
            to="/candidate/forgot-password"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="auth-btn-primary w-full flex items-center justify-center gap-2 mt-2"
        >
          <span>{isLoading ? "Signing in..." : "Sign In"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          to="/candidate/signup"
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          Create Candidate Account
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 text-center text-xs text-slate-500">
        Are you an employer or recruiter?{" "}
        <Link
          to="/signin"
          className="text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          Sign in to ATS &rarr;
        </Link>
      </div>
    </div>
  );
}
