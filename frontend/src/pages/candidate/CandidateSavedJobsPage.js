import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  useCandidateSavedJobs,
  useRemoveSavedJob,
  useCandidateApplications,
  useCandidateJobs,
} from '../../hooks/useCandidatePortal.js';
import { Button } from '../../components/ui/Button.js';
import { ApplyJobModal } from '../../components/candidate/ApplyJobModal.js';
import { useToast } from '../../context/ToastContext.js';

export function CandidateSavedJobsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { data: savedJobIds = [], isLoading: isSavedLoading } = useCandidateSavedJobs();
  const { data: allJobs = [], isLoading: isJobsLoading } = useCandidateJobs();
  const { data: applications = [] } = useCandidateApplications();
  const removeSavedMutation = useRemoveSavedJob();

  const [selectedJobToApply, setSelectedJobToApply] = useState(null);

  // Match saved IDs against full job objects
  const savedJobs = allJobs.filter((job) =>
    savedJobIds.some((saved) => (typeof saved === 'string' ? saved === job.id : saved.id === job.id))
  );

  const handleRemove = (jobId, jobTitle) => {
    removeSavedMutation.mutate(jobId, {
      onSuccess: () => {
        toast.info('Removed from saved', `Removed "${jobTitle}" from bookmarks.`);
      },
    });
  };

  const isApplied = (jobId) => applications.some((a) => a.jobId === jobId);

  const isLoading = isSavedLoading || isJobsLoading;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Saved Jobs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your bookmarked opportunities. Review requirements and submit your applications.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Briefcase}
            onClick={() => navigate('/candidate/jobs')}
          >
            Explore More Jobs
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading saved jobs...</p>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/80 dark:border-white/10">
          <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No saved jobs</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Bookmark interesting jobs while searching to easily compare requirements and apply later.
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedJobs.map((job) => {
            const applied = isApplied(job.id);

            return (
              <div
                key={job.id}
                className="glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">
                        {job.jobType || 'Full-Time'} &bull; {job.workMode || 'Remote'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {job.company || 'ApexTech Global'} &bull; {job.department || 'Engineering'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(job.id, job.title)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {job.experienceMin || 2}–{job.experienceMax || 5} Years
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {job.salaryRange || '₹14L – ₹24L'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>

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
                    View Job &rarr;
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
      )}

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
