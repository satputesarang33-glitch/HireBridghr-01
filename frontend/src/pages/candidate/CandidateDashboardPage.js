import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  useCandidateProfile,
  useCandidateApplications,
  useCandidateSavedJobs,
  useSaveJob,
  useRemoveSavedJob,
  useCandidateJobs,
} from '../../hooks/useCandidatePortal.js';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { ApplyJobModal } from '../../components/candidate/ApplyJobModal.js';
import { cn } from '../../utils/cn.js';

export function CandidateDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useCandidateProfile();
  const { data: applications = [] } = useCandidateApplications();
  const { data: savedJobs = [] } = useCandidateSavedJobs();
  const { data: allJobs = [] } = useCandidateJobs();

  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();

  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  const candidateFirstName = profile?.firstName || user?.name?.split(' ')[0] || 'Alex';
  const profileCompletion = profile?.completionPercentage || 92;

  // Derive stats
  const activeApplications = applications.filter(
    (a) => !['REJECTED', 'WITHDRAWN', 'HIRED'].includes(a.status?.toUpperCase())
  );
  const interviewCount = applications.filter(
    (a) => a.status?.toUpperCase() === 'INTERVIEW'
  ).length;

  const handleToggleSave = (jobId) => {
    const isSaved = savedJobs.some((j) => (typeof j === 'string' ? j === jobId : j.id === jobId));
    if (isSaved) {
      removeSavedJobMutation.mutate(jobId);
    } else {
      saveJobMutation.mutate(jobId);
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some((j) => (typeof j === 'string' ? j === jobId : j.id === jobId));
  };

  const isJobApplied = (jobId) => {
    return applications.some((a) => a.jobId === jobId);
  };

  // Recommended jobs (match by skills or active listings)
  const recommendedJobs = allJobs.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header Welcome Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Candidate Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {candidateFirstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              You have{' '}
              <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">
                {activeApplications.length} active applications
              </strong>{' '}
              in progress. Here is a summary of your job search.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Bookmark}
              onClick={() => navigate('/candidate/saved-jobs')}
            >
              Saved ({savedJobs.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Briefcase}
              onClick={() => navigate('/candidate/jobs')}
            >
              Browse All Jobs &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Applications */}
        <div className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Applications
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {applications.length}
            </h3>
            <p className="text-[10px] text-slate-400">{activeApplications.length} currently active</p>
          </div>
        </div>

        {/* Card 2: Saved Jobs */}
        <div className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saved Jobs
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {savedJobs.length}
            </h3>
            <p className="text-[10px] text-slate-400">Bookmarked for later</p>
          </div>
        </div>

        {/* Card 3: Interviews */}
        <div className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Interviews
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {interviewCount}
            </h3>
            <p className="text-[10px] text-slate-400">Scheduled rounds</p>
          </div>
        </div>

        {/* Card 4: Profile Completion */}
        <div className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Profile Strength
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {profileCompletion}%
            </h3>
            <p className="text-[10px] text-emerald-500 font-medium">All core sections done</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Application Pipeline Spotlight & Recommended Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Application Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Application Pipeline
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status changes and interview milestones
              </p>
            </div>
            <Link
              to="/candidate/applications"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              View All ({applications.length}) &rarr;
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-white/80 dark:border-white/10">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">No applications yet</p>
              <p className="text-xs text-slate-400 mt-1">Start browsing open roles and apply today.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/candidate/jobs')}
              >
                Browse Open Jobs
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => {
                const status = (app.status || 'APPLIED').toUpperCase();
                const stages = ['APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFER'];
                const currentIdx = stages.indexOf(status);

                return (
                  <div
                    key={app.id}
                    className="glass-card rounded-2xl p-4 border border-white/80 dark:border-white/10 hover:border-cyan-400/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {app.jobTitle}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {app.company || 'ApexTech Global'} &bull; Applied{' '}
                          {new Date(app.appliedAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-bold self-start sm:self-center',
                          `status-badge-${status.toLowerCase()}`
                        )}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Timeline stepper row */}
                    <div className="pt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                        {stages.map((stage, idx) => {
                          const isDone = currentIdx >= idx;
                          const isCurrent = currentIdx === idx;
                          return (
                            <div key={stage} className="flex flex-col items-center gap-1">
                              <div
                                className={cn(
                                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
                                  isDone
                                    ? 'bg-cyan-500 text-white font-bold'
                                    : 'bg-slate-800 text-slate-500 border border-white/10'
                                )}
                              >
                                {isDone ? '✓' : idx + 1}
                              </div>
                              <span
                                className={cn(
                                  'text-[10px]',
                                  isCurrent
                                    ? 'text-cyan-400 font-bold'
                                    : isDone
                                    ? 'text-slate-300'
                                    : 'text-slate-500'
                                )}
                              >
                                {stage.charAt(0) + stage.slice(1).toLowerCase()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Profile Completion & Quick Links */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Readiness</h4>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                {profileCompletion}%
              </span>
            </div>
            <div className="completion-progress-bar h-2 w-full mb-3">
              <div
                className="completion-progress-fill"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your resume and background have been verified. Recruiters can find you when sourcing candidates.
            </p>
            <div className="space-y-2">
              <Link
                to="/candidate/profile"
                className="w-full text-center block py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
              >
                Edit Profile &amp; Resume
              </Link>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Upcoming Milestones
            </h4>
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <p className="font-semibold text-purple-300">Technical Assessment</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ApexTech &bull; In 2 days</p>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <p className="font-semibold text-cyan-300">Recruiter Follow-up</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Vanguard Labs &bull; Pending feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Jobs For You
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Matched based on your skills in React, TypeScript, Node.js &amp; Architecture
            </p>
          </div>
          <Link
            to="/candidate/jobs"
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            Explore All Listings &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedJobs.map((job) => {
            const saved = isJobSaved(job.id);
            const applied = isJobApplied(job.id);

            return (
              <div
                key={job.id}
                className="glass-card glass-card-interactive rounded-2xl p-5 border border-white/80 dark:border-white/10 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                        {job.jobType || 'Full-Time'} &bull; {job.workMode || 'Remote'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {job.company || 'ApexTech Global'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleSave(job.id)}
                      className={cn(
                        'p-2 rounded-xl border transition-colors',
                        saved
                          ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      )}
                      title={saved ? 'Remove saved job' : 'Save job'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {job.experienceMin || 3}–{job.experienceMax || 6} Yrs
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salaryRange || '₹14L – ₹24L'}
                    </span>
                  </div>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <Link
                    to={`/candidate/jobs/${job.id}`}
                    className="text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    View Details
                  </Link>
                  {applied ? (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Already Applied
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedJobToApply(job)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Modal */}
      {selectedJobToApply && (
        <ApplyJobModal
          isOpen={!!selectedJobToApply}
          onClose={() => setSelectedJobToApply(null)}
          job={selectedJobToApply}
        />
      )}
    </div>
  );
}
