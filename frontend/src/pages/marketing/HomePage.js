import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Briefcase,
  GitPullRequest,
  BarChart3,
  Calendar,
  CheckCircle2,
  Building2,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

export function HomePage() {
  return (
    <div className="space-y-24 py-8">
      {/* HERO SECTION */}
      <section className="text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-6 pt-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-300 shadow-glow-brand animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Next-Generation Applicant Tracking System & Job Distribution</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Modern Recruitment.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-cyan-300 to-accent-400 bg-clip-text text-transparent">
            One Powerful Platform.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          HirebridgeHR unifies candidate sourcing, multi-channel publication review, interactive Kanban pipelines, and structured interview scorecards into a cohesive liquid-glass workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link to="/signup">
            <Button variant="primary" size="lg" icon={ArrowRight}>
              Start Free 14-Day Trial
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="glass" size="lg">
              Explore Live Recruiter ATS &rarr;
            </Button>
          </Link>
        </div>

        {/* Liquid Glass Showcase Mockup */}
        <div className="pt-10">
          <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-white/15 shadow-glass-lg max-w-4xl mx-auto text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">app.hirebridgehr.com/dashboard</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300">
                Live ATS Command Center
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
                <p className="text-[11px] font-bold uppercase text-slate-400">Active Pipeline</p>
                <p className="text-2xl font-black text-white mt-1">28 Candidates</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">+18% this month</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
                <p className="text-[11px] font-bold uppercase text-slate-400">Time-to-Hire</p>
                <p className="text-2xl font-black text-brand-400 mt-1">18.4 Days</p>
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">32% faster than baseline</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10">
                <p className="text-[11px] font-bold uppercase text-slate-400">Interviews Held</p>
                <p className="text-2xl font-black text-accent-400 mt-1">42 Rounds</p>
                <p className="text-[10px] text-emerald-400 mt-1 font-semibold">92% attendance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM CAPABILITIES */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Enterprise Recruitment Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for high-volume staffing & corporate HR
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Step Job Builder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured requisitions with multi-currency salary bands, skill chips, and automated pre-publication preview.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Kanban Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Progress candidates smoothly across Screening, Shortlisted, Interview, Offer, and Hired with instant stage controls.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Structured Scorecards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized interviewer feedback with 1-5 ratings, demonstrated strengths, concerns, and hiring recommendations.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Secure Candidate Vaults</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero public resume URLs. Authenticated single-use tokens ensure candidate resume documents are strictly safeguarded.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Admin Publication Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-tenant job distribution review system. Platform administrators approve and verify requisitions before going live.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hiring Funnel Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Conversion rate tracking, sourcing channel ROI, recruiter team activity, and one-click CSV report exports.
            </p>
          </Card>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-brand-500/40 shadow-glass-lg text-center space-y-6 relative overflow-hidden">
          <div className="liquid-glow-brand -bottom-20 -right-20 opacity-40" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to accelerate your recruitment?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Deploy your enterprise ATS workspace in minutes. Join forward-thinking recruitment agencies and scaling enterprises.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="lg" icon={ArrowRight}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/signin">
              <Button variant="glass" size="lg">
                Sign In to Existing Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
