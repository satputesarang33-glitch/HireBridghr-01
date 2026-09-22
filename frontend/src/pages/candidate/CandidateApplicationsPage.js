import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Ban,
  Filter,
} from 'lucide-react';
import {
  useCandidateApplications,
  useWithdrawApplication,
} from '../../hooks/useCandidatePortal.js';
import { Button } from '../../components/ui/Button.js';
import { useToast } from '../../context/ToastContext.js';
import { cn } from '../../utils/cn.js';

export function CandidateApplicationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: applications = [], isLoading } = useCandidateApplications();
  const withdrawMutation = useWithdrawApplication();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAppModal, setSelectedAppModal] = useState(null);

  const STAGES = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SCREENING', label: 'Screening' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'ASSESSMENT', label: 'Assessment' },
    { key: 'OFFER', label: 'Offer' },
  ];

  const handleWithdraw = async (appId, jobTitle) => {
    if (window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      try {
        await withdrawMutation.mutateAsync(appId);
        toast.info('Application Withdrawn', 'Your application has been withdrawn.');
      } catch (err) {
        toast.error('Withdraw failed', err?.message || 'Could not withdraw application.');
      }
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return !['REJECTED', 'WITHDRAWN', 'HIRED'].includes(app.status?.toUpperCase());
    }
    return app.status?.toUpperCase() === statusFilter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              My Job Applications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track your hiring stages, recruiter evaluations, and interview progress.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Briefcase}
            onClick={() => navigate('/candidate/jobs')}
          >
            Browse More Jobs
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-white/10">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          {[
            { label: 'All Applications', value: 'ALL' },
            { label: 'Active Pipeline', value: 'ACTIVE' },
            { label: 'Screening', value: 'SCREENING' },
            { label: 'Shortlisted', value: 'SHORTLISTED' },
            { label: 'Interview', value: 'INTERVIEW' },
            { label: 'Offers', value: 'OFFER' },
            { label: 'Hired', value: 'HIRED' },
            { label: 'Archived', value: 'WITHDRAWN' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all',
                statusFilter === tab.value
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading submitted applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/80 dark:border-white/10">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No applications in this view
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Browse our open positions to submit an application and begin your interview journey.
          </p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => navigate('/candidate/jobs')}
          >
            Find Open Jobs
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const status = (app.status || 'APPLIED').toUpperCase();
            const isTerminal = ['REJECTED', 'WITHDRAWN', 'HIRED'].includes(status);
            const activeStageIndex = STAGES.findIndex((s) => s.key === status);

            return (
              <div
                key={app.id}
                className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4 transition-all"
              >
                {/* Top Row: Title, Company, Applied Date, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {app.jobTitle}
                      </h3>
                      {app.jobId && (
                        <Link
                          to={`/candidate/jobs/${app.jobId}`}
                          className="text-slate-400 hover:text-cyan-400 p-1"
                          title="View Job Post"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {app.company || 'ApexTech Global'} &bull; Applied on{' '}
                      <strong>{new Date(app.appliedAt || Date.now()).toLocaleDateString()}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                        `status-badge-${status.toLowerCase()}`
                      )}
                    >
                      {status}
                    </span>

                    {!isTerminal && (
                      <button
                        onClick={() => handleWithdraw(app.id, app.jobTitle)}
                        className="text-xs text-slate-400 hover:text-rose-400 font-medium transition-colors"
                        title="Withdraw your application"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual Timeline Stepper */}
                <div className="py-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Application Progress Timeline
                  </p>
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-4 left-4 right-4 h-1 bg-white/10 -z-0">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                        style={{
                          width:
                            activeStageIndex >= 0
                              ? `${(activeStageIndex / (STAGES.length - 1)) * 100}%`
                              : status === 'HIRED'
                              ? '100%'
                              : '0%',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                      {STAGES.map((stg, idx) => {
                        const isPassed = activeStageIndex > idx || status === 'HIRED';
                        const isCurrent = activeStageIndex === idx;

                        return (
                          <div key={stg.key} className="flex flex-col items-center">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md',
                                isCurrent
                                  ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-400/30 scale-110'
                                  : isPassed
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-500 border border-white/10'
                              )}
                            >
                              {isPassed ? '✓' : idx + 1}
                            </div>
                            <span
                              className={cn(
                                'text-[11px] mt-2 font-medium',
                                isCurrent
                                  ? 'text-cyan-400 font-bold'
                                  : isPassed
                                  ? 'text-slate-200'
                                  : 'text-slate-500'
                              )}
                            >
                              {stg.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Application Metadata & Resume Pill */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Resume: <strong>{app.resumeName || 'Resume_Submitted.pdf'}</strong>
                    </span>
                    {app.portfolioUrl && (
                      <a
                        href={app.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 italic">
                    Status updates are maintained by the hiring manager
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
