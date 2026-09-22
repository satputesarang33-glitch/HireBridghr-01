import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  Building2,
  Bookmark,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Award,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  useCandidateJobDetails,
  useCandidateSavedJobs,
  useSaveJob,
  useRemoveSavedJob,
  useCandidateApplications,
} from '../../hooks/useCandidatePortal.js';
import { Button } from '../../components/ui/Button.js';
import { ApplyJobModal } from '../../components/candidate/ApplyJobModal.js';
import { useToast } from '../../context/ToastContext.js';
import { cn } from '../../utils/cn.js';

export function CandidateJobDetailsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: job, isLoading, isError } = useCandidateJobDetails(jobId);
  const { data: savedJobs = [] } = useCandidateSavedJobs();
  const { data: applications = [] } = useCandidateApplications();

  const saveJobMutation = useSaveJob();
  const removeSavedJobMutation = useRemoveSavedJob();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const isSaved = savedJobs.some(
    (j) => (typeof j === 'string' ? j === jobId : j.id === jobId)
  );

  const existingApplication = applications.find(
    (app) => app.jobId === jobId || app.jobTitle === job?.title
  );
  const isApplied = !!existingApplication;

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedJobMutation.mutate(jobId);
      toast.info('Removed from saved jobs', 'You unbookmarked this listing.');
    } else {
      saveJobMutation.mutate(jobId);
      toast.success('Job saved', 'You can review this job anytime under Saved Jobs.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied', 'Job link copied to your clipboard.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Loading job specifications...</p>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center border border-white/10 max-w-lg mx-auto">
        <Briefcase className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Job Not Found</h3>
        <p className="text-xs text-slate-400 mt-1">
          The listing you are searching for might have been closed or is no longer available.
        </p>
        <Button
          variant="primary"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/candidate/jobs')}
        >
          Browse All Openings
        </Button>
      </div>
    );
  }

  // Fallback defaults if mock fields are minimal
  const responsibilities = job.responsibilities || [
    'Architect and implement highly responsive, accessible web components and features.',
    'Collaborate with cross-functional product, UX design, and QA teams in fast-paced sprints.',
    'Optimize web performance, maintain code quality standards, and conduct peer reviews.',
    'Participate in system design discussions and technical roadmaps.',
  ];

  const requirements = job.requirements || [
    'Strong professional experience with modern JavaScript / TypeScript frameworks.',
    'Proven track record building enterprise SaaS web interfaces and REST/GraphQL integrations.',
    'Solid understanding of state management, responsive CSS architectures, and browser performance.',
    'Excellent communication skills and eagerness to take ownership.',
  ];

  const benefits = job.benefits || [
    'Comprehensive medical, dental, and health coverage',
    'Flexible remote / hybrid work policies with home office stipend',
    'Generous paid time off, mental health days, and parental leave',
    'Continuous learning budget and conference sponsorship',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/candidate/jobs')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          title="Share job link"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Job</span>
        </button>
      </div>

      {/* Main Header Glass Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                {job.jobType || 'Full-Time'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {job.workMode || 'Remote'}
              </span>
              {job.department && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                  {job.department}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {job.title}
            </h1>

            <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {job.company || 'ApexTech Global'}
            </p>

            {/* Core Job Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs text-slate-300 border-t border-white/10">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Location</p>
                <p className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {job.location}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Experience</p>
                <p className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {job.experienceMin || 2}–{job.experienceMax || 5} Years
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Compensation</p>
                <p className="font-semibold text-cyan-400 mt-0.5 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {job.salaryRange || '₹14L – ₹24L'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Application Deadline</p>
                <p className="font-semibold text-white mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {job.applicationDeadline || 'Open until filled'}
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex sm:flex-col items-center gap-3 shrink-0">
            {isApplied ? (
              <span className="w-full text-center px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Already Applied
              </span>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full shadow-glow-brand"
                onClick={() => setIsApplyModalOpen(true)}
              >
                Apply Now
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              className={cn('w-full', isSaved && 'border-amber-400 text-amber-400')}
              icon={Bookmark}
              onClick={handleToggleSave}
            >
              {isSaved ? 'Saved' : 'Save Job'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Body Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Description */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              About The Role
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3">
              <p>{job.description}</p>
              <p>
                As a core member of our product engineering team, you will design and ship scalable frontend architectures and collaborate with cross-functional talent.
              </p>
            </div>
          </div>

          {/* Section: Responsibilities */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Key Responsibilities
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Requirements */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Requirements &amp; Experience
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section: Benefits & Perks */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Benefits &amp; Perks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sidebar Info & Skills */}
        <div className="space-y-6">
          {/* Skills Required */}
          <div className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Required Skills &amp; Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills && job.skills.length > 0 ? (
                job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">React, TypeScript, CSS, Node.js</span>
              )}
            </div>
          </div>

          {/* Hiring Company Info */}
          <div className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              About the Company
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {job.company || 'ApexTech Global'} is a premier technology organization building next-generation enterprise SaaS solutions. We empower engineering talent to innovate and shape industry standards.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Industry:</span>
                <span className="font-semibold">Software &amp; Cloud SaaS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Company Size:</span>
                <span className="font-semibold">250–500 Employees</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hiring Openings:</span>
                <span className="font-semibold text-cyan-400">{job.openings || 2} Positions</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-600/10 to-transparent border border-cyan-500/30 text-center space-y-3">
            <h4 className="text-sm font-bold text-white">Interested in this role?</h4>
            <p className="text-xs text-slate-300">
              Submit your application in under 2 minutes using your profile resume.
            </p>
            {isApplied ? (
              <span className="w-full block py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                Already Applied
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setIsApplyModalOpen(true)}
              >
                Apply Now &rarr;
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <ApplyJobModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          job={job}
        />
      )}
    </div>
  );
}
