import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobDashboard } from '../../components/JobDashboard.js';

export function JobListPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <JobDashboard
        onCreateJob={() => navigate('/jobs/new')}
        onEditJob={(job) => navigate(`/jobs/${job.id || job.jobId}/edit`)}
        onViewPipeline={(job) => navigate(`/jobs/new?step=3&jobId=${job.jobId || job.id}`)}
      />
    </div>
  );
}

export default JobListPage;
