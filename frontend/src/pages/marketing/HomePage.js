import React, { useState } from 'react';
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
  Star,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Globe,
  Sliders,
  DollarSign,
  Check,
  Award,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

export function HomePage() {
  const [activeTab, setActiveTab] = useState('kanban');
  const [openRoles, setOpenRoles] = useState(12);
  const [openFaq, setOpenFaq] = useState(0);

  // Dynamic ROI Calculations
  const hoursSaved = Math.round(openRoles * 3.5);
  const daysFaster = Math.min(22, Math.round(openRoles * 0.8 + 6));
  const costSavings = (openRoles * 2400).toLocaleString();

  const trustCompanies = [
    { name: 'Apex Global Tech', tag: 'Enterprise Cloud' },
    { name: 'Quantum Staffing', tag: 'High-Scale Agency' },
    { name: 'TalentPulse', tag: 'Tech Recruitment' },
    { name: 'CloudScale AI', tag: 'Growth SaaS' },
    { name: 'FinTech Horizon', tag: 'Financial Services' },
    { name: 'Nexus Health', tag: 'Healthcare Talent' },
  ];

  const testimonials = [
    {
      quote:
        'HirebridgeHR consolidated our distributed recruiting workflows into one lightning-fast workspace. Our time-to-hire dropped from 38 days to 17 days in the first quarter alone.',
      name: 'Sarah Connor',
      role: 'Head of Talent Acquisition',
      company: 'Apex Global Tech',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'The Admin Publication Queue and multi-tenant security architecture are game-changers for staffing agencies. Our recruiters manage 40+ concurrent client requisitions with zero friction.',
      name: 'Marcus Vance',
      role: 'Managing Partner',
      company: 'Quantum Staffing Solutions',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      quote:
        'Candidate experience is night-and-day compared to our previous legacy ATS. The candidate portal and structured scorecards eliminated interview bias across engineering hiring.',
      name: 'Elena Rostova',
      role: 'Lead Technical Recruiter',
      company: 'TalentPulse Agency',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const faqs = [
    {
      q: 'How does HirebridgeHR differ from traditional enterprise ATS platforms?',
      a: 'HirebridgeHR is built on modern liquid-glass UI architecture with real-time state management. Unlike monolithic legacy systems, it combines interactive visual Kanban pipelines, automated pre-publication review queues, zero-trust candidate resume vaults, and candidate self-service portals into a unified, lightning-fast platform.',
    },
    {
      q: 'Can we migrate candidate data and existing requisitions easily?',
      a: 'Yes. HirebridgeHR offers automated CSV/JSON bulk ingestion, resume parsing, and native API endpoints. Our migration tools preserve candidate histories, interview notes, and timeline timestamps so you never lose context.',
    },
    {
      q: 'How does the Admin Publication Review Queue work?',
      a: 'When recruiters draft requisitions, they can be submitted to an internal approval queue. Platform administrators review salary bands, compliance disclosures, and job specifications before syndicating the role to job distribution channels and public career sites.',
    },
    {
      q: 'Is HirebridgeHR compliant with GDPR, SOC-2, and data privacy regulations?',
      a: 'Absolutely. We enforce strict multi-tenant isolation, encrypted storage for candidate resumes, authenticated single-use token document retrieval (no public unauthenticated S3 links), and full role-based access control (RBAC).',
    },
    {
      q: 'Can candidates track their own application and interview status?',
      a: 'Yes! HirebridgeHR provides a dedicated Candidate Career Portal where applicants can submit applications, monitor review milestones in real time, view scheduled interview agendas, and manage their career profile.',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* 1. HERO SECTION */}
      <section className="text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-6 pt-8 sm:pt-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-600 dark:text-brand-300 shadow-glow-brand animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
          <span>Next-Gen Enterprise ATS & Job Distribution Platform • v2.4 Live</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Modern Recruitment.{' '}
          <span className="bg-gradient-to-r from-brand-500 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
            One Powerful Platform.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          HirebridgeHR unifies candidate sourcing, multi-channel publication review, interactive Kanban pipelines, and structured interview scorecards into a cohesive, high-velocity workspace.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link to="/signup" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-glow-brand">
              Start Free 14-Day Trial
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="glass" size="lg" className="w-full sm:w-auto border-slate-300 dark:border-white/20">
              Explore Live Recruiter ATS &rarr;
            </Button>
          </Link>
        </div>

        {/* Trust bullet checklist */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Instant interactive sandbox
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            SOC2 & GDPR enterprise ready
          </span>
        </div>

        {/* 2. INTERACTIVE PRODUCT PREVIEW SHOWCASE */}
        <div className="pt-8 sm:pt-12">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-white/15 shadow-glass-lg max-w-5xl mx-auto text-left relative overflow-hidden">
            {/* Window Topbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2">app.hirebridgehr.com/dashboard</span>
              </div>

              {/* Showcase Navigation Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('kanban')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'kanban'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Kanban Pipeline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('distribution')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'distribution'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Job Distribution
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('scorecards')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'scorecards'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Scorecards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: KANBAN PREVIEW */}
            {activeTab === 'kanban' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4">
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Talent Pool</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">28 Candidates</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +18% this month
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Average Time-to-Hire</p>
                    <p className="text-xl sm:text-2xl font-black text-brand-600 dark:text-brand-400 mt-0.5">18.4 Days</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">32% faster than baseline</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-none">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interviews Held</p>
                    <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-accent-400 mt-0.5">42 Rounds</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">92% score submission</p>
                  </div>
                </div>

                {/* Mock Kanban Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Screening</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">6</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Alex Rivera</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Senior Full Stack • 7 yrs</p>
                      <div className="flex items-center gap-1 pt-1">
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300">React</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300">Node</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Interviewing</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">3</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-cyan-500/30 shadow-sm space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Devon Miles</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Staff Architect • Round 2</p>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Scorecard 4.8 / 5.0
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Offer Stage</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300">2</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-500/30 shadow-sm space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Kavita Patel</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">$175k Base • Sent Yesterday</p>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-semibold">
                        Awaiting Signature
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-white/10">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Hired</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">8</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-white">Marcus Vance</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Head of Talent • Onboarded</p>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Placement Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: JOB DISTRIBUTION PREVIEW */}
            {activeTab === 'distribution' && (
              <div className="space-y-4 animate-fade-in p-2">
                <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">Senior Full Stack Engineer</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">PUBLISHED</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Apex Global Tech • $140,000 - $185,000 USD • Hybrid (San Francisco)</p>
                  </div>
                  <Link to="/dashboard">
                    <Button variant="primary" size="sm">Manage Requisition</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" /> LinkedIn Jobs
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Synced &bull; 41 Applicants</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" /> Indeed Syndication
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Active &bull; 26 Applicants</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-500" /> Custom Careers Page
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Live &bull; 19 Direct Applies</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SCORECARDS PREVIEW */}
            {activeTab === 'scorecards' && (
              <div className="space-y-3 animate-fade-in p-2">
                <div className="p-4 rounded-xl bg-slate-50/90 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Technical Architecture & Coding Scorecard</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Interviewer: David Chen (VP of Engineering)</p>
                  </div>
                  <span className="text-sm font-black text-brand-600 dark:text-brand-400 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-500/20">
                    STRONG YES (4.9 / 5.0)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">System Architecture</p>
                    <div className="flex gap-1 text-amber-500 mt-1">★★★★★</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Excellent understanding of event queues.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">React & Performance</p>
                    <div className="flex gap-1 text-amber-500 mt-1">★★★★★</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Strong grasp of rendering optimizations.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">Culture & Team Fit</p>
                    <div className="flex gap-1 text-amber-500 mt-1">★★★★☆</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Collaborative and clear communicator.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: ANALYTICS PREVIEW */}
            {activeTab === 'analytics' && (
              <div className="space-y-4 animate-fade-in p-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Total Applicants</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">142</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Screening Rate</p>
                    <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">38.4%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Interview Rate</p>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">16.2%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Offer Acceptance</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">89.5%</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Top Performing Sourcing Channel: <strong className="text-slate-900 dark:text-white">Custom Careers Portal (48% conversion)</strong></span>
                  <Link to="/reports" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
                    View Full Reports &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. SOCIAL PROOF & LOGO BADGES */}
      <section className="max-w-6xl mx-auto px-6 text-center space-y-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Trusted by forward-thinking recruitment agencies & scaling technology teams
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {trustCompanies.map((c, i) => (
            <div
              key={i}
              className="p-3 rounded-xl glass-card border border-slate-200/80 dark:border-white/10 text-center hover:scale-105 transition-transform"
            >
              <Building2 className="w-5 h-5 text-brand-500 mx-auto mb-1.5 opacity-80" />
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{c.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CORE PLATFORM ARCHITECTURE */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Enterprise Recruitment Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered for high-volume staffing & corporate HR
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate messy email threads, scattered candidate resumes, and uncoordinated interview feedback with purpose-built talent tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Step Job Builder</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured requisitions with multi-currency salary bands, skill chips, custom requirements, and automated pre-publication review.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Interactive Kanban Pipeline</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Progress candidates smoothly across Applied, Screening, Interview, Offer, and Hired with instant stage transition controls.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Structured Scorecards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized interviewer feedback with 1-5 ratings, demonstrated strengths, concerns, and decisive hiring recommendations.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Secure Candidate Vaults</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero public unauthenticated resume links. Authenticated single-use tokens ensure candidate resume documents are strictly safeguarded.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Publication Queue</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Multi-tenant job distribution review system. Platform administrators approve and verify requisitions before going live.
            </p>
          </Card>

          <Card className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hiring Funnel Analytics</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Full funnel conversion rate tracking, sourcing channel ROI, recruiter team activity logs, and one-click CSV report exports.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. INTERACTIVE TIME & ROI SAVINGS CALCULATOR */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-brand-500/40 shadow-glass-lg relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Recruitment ROI Estimator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              See How Much Time & Capital You Save
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Drag the slider to match your team&apos;s average active job openings per month.
            </p>
          </div>

          {/* Interactive Slider */}
          <div className="space-y-4 max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
              <span>Active Open Requisitions / Month:</span>
              <span className="text-lg text-brand-600 dark:text-brand-400 px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-500/20">
                {openRoles} Roles
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="50"
              value={openRoles}
              onChange={(e) => setOpenRoles(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>2 Openings</span>
              <span>25 Openings</span>
              <span>50+ Openings</span>
            </div>
          </div>

          {/* Metrics Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm">
              <Clock className="w-6 h-6 text-brand-500 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">~{hoursSaved} hrs</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Monthly Recruiter Hours Saved</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm">
              <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">-{daysFaster} Days</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Faster Time-to-Hire</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-sm">
              <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">${costSavings}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Estimated Annual Cost Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS & CASE STUDIES */}
      <section className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real Recruiter Results
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by modern talent leaders worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.role} &bull; {t.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      <section className="max-w-4xl mx-auto px-6 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-panel rounded-2xl border border-slate-200/90 dark:border-white/10 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-brand-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/60 dark:border-white/5 pt-3 animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION BANNER */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-brand-500/40 shadow-glass-lg text-center space-y-6 relative overflow-hidden">
          <div className="liquid-glow-brand -bottom-20 -right-20 opacity-40 pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ready to accelerate your recruitment?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Deploy your enterprise ATS workspace in minutes. Join forward-thinking recruitment agencies and scaling enterprises worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={ArrowRight} className="w-full sm:w-auto shadow-glow-brand">
                Get Started Free
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="glass" size="lg" className="w-full sm:w-auto border-slate-300 dark:border-white/20">
                Launch Live ATS Sandbox
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
