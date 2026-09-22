import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Eye,
  Send,
  XCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useJobs, useRequestPublication } from '../../hooks/useJobs.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { JobStatusBadge } from '../../components/ui/Badge.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export function JobListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const { data: jobsRes, isLoading } = useJobs({
    search,
    status: statusFilter,
    department: deptFilter,
  });

  const requestPubMutation = useRequestPublication();

  const jobs = jobsRes?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Job Requisitions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active roles, draft specifications, and publication requests across your organization.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/jobs/new">
            <Button variant="primary" size="sm" icon={Plus}>
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search job title, skills, or location..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full sm:w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'ALL' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Pending Admin', value: 'PENDING_ADMIN_PUBLICATION' },
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Closed', value: 'CLOSED' },
              ]}
            />
          </div>

          <div className="w-full sm:w-44">
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              options={[
                { label: 'All Departments', value: 'ALL' },
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Design', value: 'Design' },
                { label: 'DevOps & SRE', value: 'DevOps & SRE' },
                { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
                { label: 'Customer Operations', value: 'Customer Operations' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {isLoading ? (
        <div className="glass-panel rounded-xl border border-white/10">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No job postings found"
          description="We couldn't find any job requisitions matching your current filters."
          actionLabel="Create Your First Job"
          onAction={() => navigate('/jobs/new')}
        />
      ) : (
        <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto shadow-glass-sm">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Job Title & Client</th>
                <th>Department</th>
                <th>Location & Type</th>
                <th>Recruiter</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="font-bold text-white hover:text-brand-300 transition-colors block"
                    >
                      {job.title}
                    </Link>
                    <span className="text-[11px] text-slate-400">{job.client || 'Apex Global Tech'}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300 font-medium">{job.department}</span>
                  </td>
                  <td>
                    <div className="text-xs text-slate-200">{job.location}</div>
                    <span className="text-[10px] text-slate-400 font-semibold">{job.workplaceType} &bull; {job.employmentType}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-300">{job.recruiterName}</span>
                  </td>
                  <td>
                    <Link
                      to={`/applications?jobId=${job.id}`}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-brand-400 hover:text-brand-300"
                    >
                      {job.applicationsCount} applicants &rarr;
                    </Link>
                  </td>
                  <td>
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        title="View Job Details"
                        className="p-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/jobs/${job.id}/edit`)}
                        title="Edit Job"
                        className="p-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      {job.status === 'DRAFT' && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Send}
                          onClick={() => requestPubMutation.mutate(job.id)}
                          className="text-[11px] py-1 px-2"
                        >
                          Request Publish
                        </Button>
                      )}

                      {job.status === 'PUBLISHED' && (
                        <a
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-white p-1.5 rounded hover:bg-white/10"
                          title="Open Applicant View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
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
