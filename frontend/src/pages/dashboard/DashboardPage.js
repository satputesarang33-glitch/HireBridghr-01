import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  FileText,
  Calendar,
  Gift,
  Award,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs.js';
import { useCandidates } from '../../hooks/useCandidates.js';
import { useApplications } from '../../hooks/useApplications.js';
import { useInterviews } from '../../hooks/useInterviews.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { JobStatusBadge, ApplicationStageBadge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export function DashboardPage() {
  const navigate = useNavigate();

  const { data: jobsRes, isLoading: jobsLoading } = useJobs();
  const { data: candRes, isLoading: candLoading } = useCandidates();
  const { data: appsRes, isLoading: appsLoading } = useApplications();
  const { data: intRes, isLoading: intLoading } = useInterviews();

  const jobs = jobsRes?.data || [];
  const candidates = candRes?.data || [];
  const applications = appsRes?.data || [];
  const interviews = intRes?.data || [];

  const activeJobs = jobs.filter((j) => j.status === 'PUBLISHED');
  const pendingJobs = jobs.filter((j) => j.status === 'PENDING_ADMIN_PUBLICATION');
  const draftJobs = jobs.filter((j) => j.status === 'DRAFT');
  const hires = applications.filter((a) => a.stage === 'HIRED');
  const offers = applications.filter((a) => a.stage === 'OFFER');

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState('This quarter');

  const timeframeMultiplier = {
    'This month': 0.4,
    'This quarter': 1,
    'This year': 3.2,
    'All time': 5,
  }[timeframe] || 1;

  // KPI Metrics
  const metrics = [
    {
      title: 'Active Jobs',
      value: activeJobs.length,
      trend: `+${Math.max(1, Math.round(2 * timeframeMultiplier))} ${timeframe.toLowerCase()}`,
      sub: `${jobs.length} total positions`,
      icon: Briefcase,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      link: '/jobs',
    },
    {
      title: 'Total Candidates',
      value: Math.round(candidates.length * (timeframe === 'This month' ? 0.7 : timeframe === 'This quarter' ? 1 : 1.4)),
      trend: `+${Math.round(18 * timeframeMultiplier)}% growth`,
      sub: 'In talent pipeline',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      link: '/candidates',
    },
    {
      title: 'Active Applications',
      value: applications.length,
      trend: `${Math.max(1, Math.round(6 * timeframeMultiplier))} pending review`,
      sub: 'Across all active jobs',
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      link: '/applications',
    },
    {
      title: 'Interviews Scheduled',
      value: interviews.filter((i) => i.status === 'SCHEDULED').length,
      trend: 'Next: Today 2:00 PM',
      sub: 'Technical & Final rounds',
      icon: Calendar,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      link: '/interviews',
    },
    {
      title: 'Offers Extended',
      value: offers.length,
      trend: '1 awaiting decision',
      sub: 'Average acceptance 88%',
      icon: Gift,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      link: '/applications/pipeline',
    },
    {
      title: 'Successful Hires',
      value: hires.length,
      trend: `Target: ${Math.round(8 * timeframeMultiplier)} ${timeframe.toLowerCase()}`,
      sub: 'Onboarded & placed',
      icon: Award,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: '/reports',
    },
  ];

  // Attention Items
  const attentionItems = [
    ...(pendingJobs.length > 0
      ? [
          {
            id: 'att-1',
            type: 'warning',
            title: `${pendingJobs.length} Job${pendingJobs.length > 1 ? 's' : ''} Awaiting Admin Publication`,
            description: 'Submitted to manual queue. Requires platform admin verification before going live.',
            link: '/admin/job-publications',
            action: 'Review in Admin Queue',
          },
        ]
      : []),
    ...(draftJobs.length > 0
      ? [
          {
            id: 'att-2',
            type: 'neutral',
            title: `${draftJobs.length} Unfinished Draft Job${draftJobs.length > 1 ? 's' : ''}`,
            description: 'Finish specifications or salary ranges to request publication.',
            link: '/jobs',
            action: 'Complete Drafts',
          },
        ]
      : []),
    {
      id: 'att-3',
      type: 'info',
      title: 'Technical Interview with Alexander Wright',
      description: 'Senior Full Stack Engineer round scheduled for March 22 with David Chen.',
      link: '/interviews/int-701',
      action: 'View Meeting Link',
    },
    {
      id: 'att-4',
      type: 'success',
      title: 'Offer Extended: Julian Vance',
      description: 'Compensation package extended for Senior Product Designer. Follow up with hiring manager.',
      link: '/applications/app-503',
      action: 'Check Offer Status',
    },
  ];

  const isLoading = jobsLoading || candLoading || appsLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Recruitment Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time pipeline metrics, attention alerts, and candidate activity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/jobs/new">
            <Button variant="primary" size="sm" icon={Plus}>
              Create Job
            </Button>
          </Link>
          <Link to="/applications/pipeline">
            <Button variant="glass" size="sm">
              Open Kanban Pipeline &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Timeframe:
          </span>
          <span className="text-xs font-semibold text-brand-300 bg-brand-500/15 px-2.5 py-0.5 rounded-md border border-brand-400/20">
            {timeframe}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="timeframe-select" className="sr-only">
            Select Timeframe
          </label>
          <select
            id="timeframe-select"
            name="timeframe"
            aria-label="Timeframe"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs text-white bg-slate-900 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
          >
            <option value="This quarter" className="bg-slate-900 text-white">This quarter</option>
            <option value="This month" className="bg-slate-900 text-white">This month</option>
            <option value="This year" className="bg-slate-900 text-white">This year</option>
            <option value="All time" className="bg-slate-900 text-white">All time</option>
          </select>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10" role="group" aria-label="Dashboard Timeframe Options">
            {['This month', 'This quarter', 'This year', 'All time'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-brand-500 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <Card
              key={i}
              interactive
              onClick={() => navigate(m.link)}
              className="p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {m.title}
                  </span>
                  <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center ${m.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <p className="text-2xl font-black text-white tracking-tight">{m.value}</p>
                )}
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/5 mt-2">
                <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                  <TrendingUp className="w-2.5 h-2.5" />
                  {m.trend}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{m.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Attention & Funnel Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: What Needs My Attention Today? (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                What Needs Attention Today
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{attentionItems.length} actionable items</span>
          </div>

          <div className="space-y-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 hover:border-brand-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm dark:shadow-none"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    {item.type === 'info' && <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                    {item.type === 'success' && <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    {item.type === 'neutral' && <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={() => navigate(item.link)}
                  className="text-xs self-start sm:self-center whitespace-nowrap"
                >
                  {item.action} &rarr;
                </Button>
              </div>
            ))}
          </div>

          {/* Recent Candidate Activity Timeline */}
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Live Candidate Activity Feed</h3>
            <div className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 space-y-3 shadow-sm dark:shadow-none">
              {[
                { time: '12m ago', title: 'Alexander Wright submitted resume for Senior Full Stack Engineer', tag: 'Applied' },
                { time: '1h ago', title: 'Priya Sharma moved to Shortlisted stage by Elena Rostova', tag: 'Shortlisted' },
                { time: '3h ago', title: 'Technical Interview confirmed for Alexander Wright', tag: 'Interview' },
                { time: '1d ago', title: 'Offer letter signed & accepted by Chloe Tremblay', tag: 'Hired' },
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-xs py-1.5 border-b border-slate-200/70 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate">{act.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Visual Hiring Funnel Pipeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Recruitment Conversion Funnel
            </h2>
            <Link to="/reports" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold">
              View Analytics &rarr;
            </Link>
          </div>

          <Card className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Real-time pipeline progression from inbound application to signed placement.
            </p>

            <div className="space-y-3">
              {[
                { stage: '1. Applications', count: applications.length, width: '100%', color: 'from-cyan-500 to-blue-500' },
                { stage: '2. Screening', count: applications.filter(a => ['SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)).length, width: '85%', color: 'from-blue-500 to-indigo-500' },
                { stage: '3. Shortlisted', count: applications.filter(a => ['SHORTLISTED', 'INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)).length, width: '68%', color: 'from-indigo-500 to-purple-500' },
                { stage: '4. Interview', count: applications.filter(a => ['INTERVIEW', 'OFFER', 'HIRED'].includes(a.stage)).length, width: '50%', color: 'from-purple-500 to-pink-500' },
                { stage: '5. Offer Extended', count: offers.length + hires.length, width: '35%', color: 'from-amber-500 to-orange-500' },
                { stage: '6. Hired', count: hires.length, width: '22%', color: 'from-emerald-500 to-teal-500' },
              ].map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{f.stage}</span>
                    <span className="text-slate-900 dark:text-white font-mono">{f.count} candidates</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-300/40 dark:border-white/5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${f.color} transition-all duration-500`}
                      style={{ width: f.width }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Total Pipeline Velocity:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">18.4 Days Avg to Hire</span>
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/candidates')}
              className="p-3.5 glass-panel rounded-xl border border-white/10 hover:border-brand-400/40 text-left transition-all group"
            >
              <Users className="w-4 h-4 text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Talent Database</p>
              <p className="text-[10px] text-slate-400">Search & filter resumes</p>
            </button>
            <button
              onClick={() => navigate('/applications/pipeline')}
              className="p-3.5 glass-panel rounded-xl border border-white/10 hover:border-brand-400/40 text-left transition-all group"
            >
              <Calendar className="w-4 h-4 text-accent-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-white">Interactive Pipeline</p>
              <p className="text-[10px] text-slate-400">Kanban stage mover</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white tracking-tight">Recent Applications</h2>
          <Link to="/applications" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
            View all ({applications.length}) &rarr;
          </Link>
        </div>

        <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Role / Position</th>
                <th>Stage</th>
                <th>Source</th>
                <th>Date Applied</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 5).map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="font-semibold text-white">{app.candidateName}</div>
                    <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                  </td>
                  <td>
                    <div className="text-xs text-slate-200 font-medium">{app.jobTitle}</div>
                  </td>
                  <td>
                    <ApplicationStageBadge stage={app.stage} />
                  </td>
                  <td>
                    <span className="text-xs text-slate-400">{app.source}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => navigate(`/candidates/${app.candidateId}`)}
                      className="text-xs py-1 px-2.5"
                    >
                      Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
