import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Share2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useJobs } from '../../hooks/useJobs.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { PublicApplyModal } from './PublicApplyModal.js';
import { useToast } from '../../context/ToastContext.js';

export function PublicJobPage() {
  const { slug } = useParams();
  const toast = useToast();
  const { data: jobsRes, isLoading } = useJobs();

  const [showApplyModal, setShowApplyModal] = useState(false);

  const jobs = jobsRes?.data || [];
  const job = jobs.find((j) => j.slug === slug || j.id === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center">
        <div className="max-w-3xl w-full space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-xl font-bold text-white">Position Not Found</h2>
          <p className="text-xs text-slate-400">
            This position may have expired or been fulfilled.
          </p>
          <Link to="/">
            <Button variant="primary" size="sm">
              Explore Open Careers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Link Copied', 'Job requisition URL copied to clipboard.');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500/30 selection:text-brand-200 relative overflow-x-hidden">
      {/* Liquid background glow */}
      <div className="liquid-glow-brand -top-24 -left-24 opacity-60" />
      <div className="liquid-glow-accent top-1/2 -right-24 opacity-40" />

      {/* Public Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            Hirebridge<span className="text-brand-400">HR</span> Careers
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={Share2} onClick={handleShare}>
            Share Job
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowApplyModal(true)}>
            Apply for Position &rarr;
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8 relative z-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Open Roles</span>
        </Link>

        {/* Hero Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/15 shadow-glass-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                {job.department}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {job.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {job.client || 'Apex Global Tech'} &bull; {job.location}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowApplyModal(true)}
              className="sm:self-center"
            >
              Apply Now &rarr;
            </Button>
          </div>

          {/* Quick Details Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Compensation</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Workplace</span>
              <span className="font-semibold text-white">{job.workplaceType} ({job.employmentType})</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Experience</span>
              <span className="font-semibold text-white">{job.experienceMin} - {job.experienceMax} Years</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deadline</span>
              <span className="font-mono text-slate-300">{job.deadline || 'Rolling'}</span>
            </div>
          </div>
        </div>

        {/* Core Skills */}
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Required Core Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(job.skills || []).map((s) => (
              <span
                key={s}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30"
              >
                {s}
              </span>
            ))}
          </div>
        </Card>

        {/* Detailed Description */}
        <Card className="p-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Position Description & Scope</h3>
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-3 font-sans">
            {job.description}
          </div>
        </Card>

        {/* Bottom Sticky Apply CTA Banner */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Interested in joining our team?</h3>
            <p className="text-xs text-slate-400 mt-0.5">Submit your resume and background for direct evaluation.</p>
          </div>
          <Button variant="primary" size="md" onClick={() => setShowApplyModal(true)}>
            Apply for this Role &rarr;
          </Button>
        </div>
      </main>

      {/* Public Apply Modal */}
      <PublicApplyModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        job={job}
      />
    </div>
  );
}
