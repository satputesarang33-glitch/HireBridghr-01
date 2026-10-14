import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { JobForm } from '../../components/JobForm.js';
import { getStoredJobs } from '../../data/Jobs.js';

export function CreateJobPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stepParam = parseInt(searchParams.get('step'), 10) || 1;
  const jobIdParam = searchParams.get('jobId');

  const allJobs = getStoredJobs();
  const existingJob = jobIdParam ? allJobs.find(j => j.id === jobIdParam || j.jobId === jobIdParam) : null;

  return (
    <div className="w-full">
      <JobForm
        initialStep={stepParam}
        initialJob={existingJob}
        onComplete={() => navigate('/jobs')}
        onCancel={() => navigate('/jobs')}
      />
    </div>
  );
}

export default CreateJobPage;
