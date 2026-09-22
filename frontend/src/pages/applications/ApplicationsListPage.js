import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  GitPullRequest,
  Search,
  Filter,
  Columns,
  Eye,
  Star,
  Calendar,
} from 'lucide-react';
import { useApplications, useUpdateApplicationStage } from '../../hooks/useApplications.js';
import { useJobs } from '../../hooks/useJobs.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { ApplicationStageBadge } from '../../components/ui/Badge.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export function ApplicationsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'ALL';

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [jobFilter, setJobFilter] = useState(initialJobId);

  const { data: appsRes, isLoading } = useApplications({
    search,
    stage: stageFilter,
    jobId: jobFilter,
  });

  const { data: jobsRes } = useJobs();
  const updateStageMutation = useUpdateApplicationStage();

  const applications = appsRes?.data || [];
  const jobs = jobsRes?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Job Applications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review candidate submissions, update pipeline stages, and track applicant evaluations.
          </p>
        </div>
        <Link to="/applications/pipeline">
          <Button variant="primary" size="sm" icon={Columns}>
            Switch to Kanban Board View
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search candidate name, job title..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              options={[
                { label: 'All Stages', value: 'ALL' },
                { label: 'New', value: 'NEW' },
                { label: 'Screening', value: 'SCREENING' },
                { label: 'Shortlisted', value: 'SHORTLISTED' },
                { label: 'Interview', value: 'INTERVIEW' },
                { label: 'Offer', value: 'OFFER' },
                { label: 'Hired', value: 'HIRED' },
                { label: 'Rejected', value: 'REJECTED' },
              ]}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              options={[
                { label: 'All Requisitions', value: 'ALL' },
                ...jobs.map((j) => ({ label: j.title, value: j.id })),
              ]}
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="glass-panel rounded-xl border border-white/10">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No applications found"
          description="There are currently no candidate applications matching your active filters."
        />
      ) : (
        <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto shadow-glass-sm">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Target Job Requisition</th>
                <th>Stage</th>
                <th>Score</th>
                <th>Applied Date</th>
                <th>Recruiter</th>
                <th className="text-right">Stage Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <Link
                      to={`/candidates/${app.candidateId}`}
                      className="font-bold text-white hover:text-brand-300 transition-colors block"
                    >
                      {app.candidateName}
                    </Link>
                    <span className="text-[11px] text-slate-400">{app.candidateEmail}</span>
                  </td>
                  <td>
                    <Link to={`/jobs/${app.jobId}`} className="text-xs text-slate-200 hover:text-white font-medium">
                      {app.jobTitle}
                    </Link>
                    <span className="block text-[10px] text-slate-400">Source: {app.source}</span>
                  </td>
                  <td>
                    <ApplicationStageBadge stage={app.stage} />
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {app.rating || '4.5'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{app.recruiterName || 'Elena Rostova'}</span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Select
                        className="py-1 text-xs w-32"
                        value={app.stage}
                        onChange={(e) =>
                          updateStageMutation.mutate({ id: app.id, stage: e.target.value })
                        }
                        options={[
                          { label: 'New', value: 'NEW' },
                          { label: 'Screening', value: 'SCREENING' },
                          { label: 'Shortlisted', value: 'SHORTLISTED' },
                          { label: 'Interview', value: 'INTERVIEW' },
                          { label: 'Offer', value: 'OFFER' },
                          { label: 'Hired', value: 'HIRED' },
                          { label: 'Rejected', value: 'REJECTED' },
                        ]}
                      />
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => navigate(`/candidates/${app.candidateId}`)}
                        className="p-1.5"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
