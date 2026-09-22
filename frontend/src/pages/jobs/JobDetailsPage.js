import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Globe,
  Users,
  Edit,
  Send,
  XCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { useJob, useRequestPublication, useUpdateJob } from '../../hooks/useJobs.js';
import { useApplications } from '../../hooks/useApplications.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { JobStatusBadge, ApplicationStageBadge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useToast } from '../../context/ToastContext.js';

export function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  const { data: jobRes, isLoading } = useJob(id);
  const { data: appsRes } = useApplications({ jobId: id });
  const requestPubMutation = useRequestPublication();
  const updateJobMutation = useUpdateJob();

  const job = jobRes?.data;
  const applications = (appsRes?.data || []).filter((a) => a.jobId === id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-white mb-2">Job Requisition Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested position does not exist or has been removed.</p>
        <Link to="/jobs">
          <Button variant="secondary">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const handleCloseJob = () => {
    updateJobMutation.mutate({
      id: job.id,
      data: { status: 'CLOSED' },
    });
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/jobs/${job.slug}`;
    navigator.clipboard.writeText(url);
    toast.info('Link Copied', 'Public job application URL copied to clipboard.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <Link to="/jobs" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Back to Job Requisitions
          </Link>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {job.client || 'Apex Global Tech'} &bull; {job.department} &bull; {job.location} ({job.workplaceType})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {job.status === 'DRAFT' && (
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              isLoading={requestPubMutation.isPending}
              onClick={() => requestPubMutation.mutate(job.id)}
            >
              Request Admin Publish
            </Button>
          )}

          {job.status === 'PUBLISHED' && (
            <>
              <Button variant="glass" size="sm" icon={Share2} onClick={copyPublicLink}>
                Copy Applicant Link
              </Button>
              <a
                href={`/jobs/${job.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-slate-200 px-3 py-1.5 rounded-lg border border-white/10"
              >
                <span>Live Portal View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Edit}
            onClick={() => navigate(`/jobs/${job.id}/edit`)}
          >
            Edit
          </Button>

          {job.status !== 'CLOSED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCloseJob}
              isLoading={updateJobMutation.isPending}
            >
              Close Position
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview & Specifications', icon: Briefcase },
          { id: 'distribution', label: 'Job Distribution Status', icon: Globe },
          { id: 'applications', label: 'Candidates Applied', icon: Users, badge: applications.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Description Card */}
            <Card className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Job Description</h3>
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
                {job.description}
              </div>
            </Card>

            {/* Required Skills */}
            <Card className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Required Core Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(job.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {/* Requisition Metadata Card */}
            <Card className="p-5 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                Position Details
              </h3>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Salary Range:
                </span>
                <span className="font-mono font-bold text-white">
                  {job.currency} {job.salaryMin?.toLocaleString()} - {job.salaryMax?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Experience Level:
                </span>
                <span className="font-medium text-white">{job.experienceLevel} ({job.experienceMin}-{job.experienceMax} yrs)</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Workplace Type:
                </span>
                <span className="font-medium text-white">{job.workplaceType} ({job.employmentType})</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  Deadline:
                </span>
                <span className="font-mono font-medium text-white">{job.deadline || 'Open until filled'}</span>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Assigned Recruiter</span>
                <p className="font-medium text-white">{job.recruiterName || 'Elena Rostova'}</p>
                <p className="text-[11px] text-slate-400">{job.candidateEmail}</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Job Distribution */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-1">
            <h3 className="text-sm font-bold text-white">Multi-Channel Distribution Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track publication status across supported manual review boards and future-ready job networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MVP Manual Distribution Board */}
            <Card className="p-5 border-l-4 border-l-brand-400">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xs">
                    HB
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">HirebridgeHR Public Portal (MANUAL)</h4>
                    <p className="text-[11px] text-slate-400">Primary ATS Candidate Application Board</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {job.status === 'PUBLISHED' ? 'Active / Published' : job.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform ID:</span>
                  <span className="font-mono text-white">{job.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Review State:</span>
                  <span className="font-semibold text-white">
                    {job.status === 'PENDING_ADMIN_PUBLICATION' ? 'In Admin Review Queue' : 'Completed'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Future-Ready Platform: LinkedIn */}
            <Card className="p-5 opacity-80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0077b5]/20 text-[#0077b5] flex items-center justify-center font-bold text-xs">
                    in
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">LinkedIn Jobs</h4>
                    <p className="text-[11px] text-slate-400">Direct API Integration</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/5">
                  Architecture Ready (V3)
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-white/5 leading-relaxed">
                Connects through automated XML feed or direct recruiter OAuth token in upcoming release.
              </p>
            </Card>

            {/* Future-Ready Platform: Indeed */}
            <Card className="p-5 opacity-80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2164f3]/20 text-[#2164f3] flex items-center justify-center font-bold text-xs">
                    ind
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Indeed Direct</h4>
                    <p className="text-[11px] text-slate-400">Organic & Sponsored Syndication</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-white/5">
                  Architecture Ready (V3)
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-white/5 leading-relaxed">
                Job schema structure matches standard Indeed XML / schema.org JobPosting format.
              </p>
            </Card>

            {/* Google for Jobs */}
            <Card className="p-5 opacity-80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#ea4335]/20 text-[#ea4335] flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Google for Jobs</h4>
                    <p className="text-[11px] text-slate-400">Structured SEO Indexing</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  SEO Active on Public URL
                </span>
              </div>
              <p className="text-xs text-slate-400 pt-2 border-t border-white/5 leading-relaxed">
                Public job pages generate automatic JSON-LD JobPosting metadata for Google search indexing.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Candidates Applied ({applications.length})</h3>
            <Link to="/applications/pipeline" className="text-xs text-brand-400 hover:text-brand-300 font-semibold">
              Open Kanban Pipeline View &rarr;
            </Link>
          </div>

          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No applicants yet for this position.</p>
            </Card>
          ) : (
            <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Stage</th>
                    <th>Applied Date</th>
                    <th>Source</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="font-semibold text-white">{app.candidateName}</div>
                        <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                      </td>
                      <td>
                        <ApplicationStageBadge stage={app.stage} />
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400">{app.source}</span>
                      </td>
                      <td className="text-right">
                        <Button
                          variant="glass"
                          size="sm"
                          onClick={() => navigate(`/candidates/${app.candidateId}`)}
                          className="text-xs"
                        >
                          View Candidate &rarr;
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
