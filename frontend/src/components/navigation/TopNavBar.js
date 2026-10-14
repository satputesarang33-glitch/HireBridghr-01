import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Mail,
  PieChart,
  Activity,
  X,
  ExternalLink,
  Clock,
  CheckCircle2,
  Send,
  Bot,
  Zap,
  FileText,
  MessageSquare,
  Users,
  Search,
  Plus,
} from 'lucide-react';
import { Modal } from '../ui/Modal.js';
import { Button } from '../ui/Button.js';
import { useToast } from '../../context/ToastContext.js';

export function TopNavBar({ className = '' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Popover / Drawer States
  const [showCalendarQuick, setShowCalendarQuick] = useState(false);
  const [showMailQuick, setShowMailQuick] = useState(false);
  const [showAnalyticsQuick, setShowAnalyticsQuick] = useState(false);
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [showAIStoreModal, setShowAIStoreModal] = useState(false);
  const [hasUnreadActivity, setHasUnreadActivity] = useState(true);

  // AI Store Agent activation states
  const [activeAgents, setActiveAgents] = useState({
    screener: true,
    sourcing: true,
    jobWriter: true,
    outreach: false,
    interviewCopilot: false,
  });

  const toggleAgent = (key, name) => {
    setActiveAgents((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(
        next[key] ? 'Agent Activated' : 'Agent Paused',
        `${name} is now ${next[key] ? 'running on your pipeline' : 'deactivated'}.`
      );
      return next;
    });
  };

  const isHomeActive = location.pathname === '/dashboard' || location.pathname === '/';
  const isJobsActive = location.pathname.startsWith('/jobs');
  const isTestsActive = location.pathname.startsWith('/tests');
  const isTalentPoolActive =
    location.pathname.startsWith('/candidates') || location.pathname.startsWith('/talent-pool');
  const isAIStoreActive = location.pathname.startsWith('/ai-store');

  return (
    <div className={`bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-white/10 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none ${className}`}>
      {/* Left: Navigation Text Links */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
        {/* 1. Home */}
        <Link
          to="/dashboard"
          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
            isHomeActive
              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          Home
        </Link>

        {/* 2. Jobs */}
        <Link
          to="/jobs"
          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
            isJobsActive
              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          Jobs
        </Link>

        {/* 3. Tests */}
        <Link
          to="/tests"
          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
            isTestsActive
              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          Tests
        </Link>

        {/* 4. Talent Pool */}
        <Link
          to="/candidates"
          className={`px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap ${
            isTalentPoolActive
              ? 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium hover:bg-slate-50 dark:hover:bg-white/5'
          }`}
        >
          Talent Pool
        </Link>

        {/* 5. AI Store */}
        <button
          type="button"
          onClick={() => setShowAIStoreModal(true)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 whitespace-nowrap group ${
            isAIStoreActive || showAIStoreModal
              ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 font-semibold'
              : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:bg-purple-50/60 dark:hover:bg-purple-950/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
          <span>AI Store</span>
        </button>
      </div>

      {/* Right Section: Divider + Utility Action Icons */}
      <div className="flex items-center gap-3 sm:gap-4 relative">
        {/* Vertical Divider */}
        <div className="h-5 w-px bg-slate-300 dark:bg-white/20" />

        {/* Action Icon 1: Calendar (Upcoming Interviews) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCalendarQuick(!showCalendarQuick);
              setShowMailQuick(false);
              setShowAnalyticsQuick(false);
              setShowActivityDrawer(false);
            }}
            title="Interview Schedule Calendar"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Quick Calendar Dropdown */}
          {showCalendarQuick && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Today&apos;s Interviews</span>
                </div>
                <button onClick={() => setShowCalendarQuick(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Alexander Wright</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">2:00 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Technical Round with David Chen</p>
                  <a
                    href="https://meet.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Google Meet Room &rarr;
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Priya Sharma</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">4:30 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Design Portfolio Review with Elena</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowCalendarQuick(false);
                    navigate('/interviews');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Full Calendar &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Icon 2: Mail (Candidate Messages) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowMailQuick(!showMailQuick);
              setShowCalendarQuick(false);
              setShowAnalyticsQuick(false);
              setShowActivityDrawer(false);
            }}
            title="Candidate Messages & Inbox"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <Mail className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Quick Messages Dropdown */}
          {showMailQuick && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Candidate Messages</span>
                </div>
                <button onClick={() => setShowMailQuick(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Chloe Tremblay</span>
                    <span className="text-[10px] text-slate-400">10m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    &quot;I have signed the offer letter and uploaded my documents!&quot;
                  </p>
                </div>

                <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Alexander Wright</span>
                    <span className="text-[10px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                    &quot;Looking forward to our technical round this afternoon.&quot;
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowMailQuick(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View All Messages &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Icon 3: Pie Chart (Analytics & Reports) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAnalyticsQuick(!showAnalyticsQuick);
              setShowCalendarQuick(false);
              setShowMailQuick(false);
              setShowActivityDrawer(false);
            }}
            title="Recruitment Analytics"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <PieChart className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Quick Analytics Dropdown */}
          {showAnalyticsQuick && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Pipeline Snapshot</span>
                </div>
                <button onClick={() => setShowAnalyticsQuick(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-center">
                  <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">18.4d</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Avg Time to Hire</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-center">
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">88%</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Offer Acceptance</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnalyticsQuick(false);
                    navigate('/reports');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open Full Reports &amp; Analytics &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Icon 4: Activity Pulse with Red Notification Dot Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowActivityDrawer(!showActivityDrawer);
              setHasUnreadActivity(false);
              setShowCalendarQuick(false);
              setShowMailQuick(false);
              setShowAnalyticsQuick(false);
            }}
            title="Live Candidate Activity"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors relative"
          >
            <Activity className="w-5 h-5 stroke-[1.8]" />
            {/* Red Notification Dot Badge (from screenshot) */}
            {hasUnreadActivity && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 shadow-sm animate-pulse" />
            )}
          </button>

          {/* Activity Drawer / Popover */}
          {showActivityDrawer && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-xl z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">Live Candidate Stream</span>
                </div>
                <button onClick={() => setShowActivityDrawer(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto text-xs pr-1">
                {[
                  {
                    name: 'Alexander Wright',
                    action: 'submitted resume for Senior Full Stack Engineer',
                    time: '12m ago',
                    stage: 'Applied',
                    color: 'bg-cyan-500',
                  },
                  {
                    name: 'Priya Sharma',
                    action: 'moved to Shortlisted stage by Elena Rostova',
                    time: '1h ago',
                    stage: 'Shortlist',
                    color: 'bg-indigo-500',
                  },
                  {
                    name: 'Alexander Wright',
                    action: 'Technical Interview confirmed for 2:00 PM',
                    time: '3h ago',
                    stage: 'Interview',
                    color: 'bg-purple-500',
                  },
                  {
                    name: 'Chloe Tremblay',
                    action: 'Offer letter signed & accepted',
                    time: '1d ago',
                    stage: 'Hired',
                    color: 'bg-emerald-500',
                  },
                ].map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                    <span className={`w-2 h-2 rounded-full ${act.color} mt-1.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-slate-900 dark:text-white">{act.name}</span> {act.action}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10 mt-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityDrawer(false);
                    navigate('/applications/pipeline');
                  }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Full Candidate Pipeline &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* AI STORE MODAL                                            */}
      {/* ========================================================= */}
      <Modal
        isOpen={showAIStoreModal}
        onClose={() => setShowAIStoreModal(false)}
        title="✨ AI Store & Intelligent Recruitment Agents"
        description="Empower your recruitment team with autonomous AI workflows"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Agent 1 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Resume Screener</h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">94% Accuracy</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeAgents.screener ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                    {activeAgents.screener ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Automatically extracts candidate skills, ranks incoming applicants by relevance, and flags missing requirements.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Processes 100 resumes / min</span>
                <Button
                  variant={activeAgents.screener ? 'glass' : 'primary'}
                  size="sm"
                  onClick={() => toggleAgent('screener', 'AI Resume Screener')}
                >
                  {activeAgents.screener ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>

            {/* Agent 2 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Talent Headhunter</h4>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">Sourcing Copilot</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeAgents.sourcing ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                    {activeAgents.sourcing ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Surfaces matching passive candidates from LinkedIn, GitHub, and talent repositories matching your job specs.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">1-Click Chrome Extension sync</span>
                <Button
                  variant={activeAgents.sourcing ? 'glass' : 'primary'}
                  size="sm"
                  onClick={() => toggleAgent('sourcing', 'AI Talent Headhunter')}
                >
                  {activeAgents.sourcing ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>

            {/* Agent 3 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Job Writer</h4>
                      <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">SEO &amp; Bias Free</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeAgents.jobWriter ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                    {activeAgents.jobWriter ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Generates inclusive, high-converting job posts with salary benchmarks and skill rubrics in under 15 seconds.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Integrated in Job Creation</span>
                <Button
                  variant={activeAgents.jobWriter ? 'glass' : 'primary'}
                  size="sm"
                  onClick={() => toggleAgent('jobWriter', 'AI Job Writer')}
                >
                  {activeAgents.jobWriter ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>

            {/* Agent 4 */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Candidate Outreach</h4>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">68% Open Rate</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeAgents.outreach ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
                    {activeAgents.outreach ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                  Crafts bespoke email and LinkedIn outreach sequences personalized to each candidate&apos;s GitHub or work history.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Automated Follow-ups</span>
                <Button
                  variant={activeAgents.outreach ? 'glass' : 'primary'}
                  size="sm"
                  onClick={() => toggleAgent('outreach', 'AI Candidate Outreach')}
                >
                  {activeAgents.outreach ? 'Pause' : 'Activate'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              3 of 5 AI Agents currently active on your workspace
            </span>
            <Button variant="primary" size="sm" onClick={() => setShowAIStoreModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
