import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobForm } from '../../components/JobForm.js';
import { getStoredJobs } from '../../data/Jobs.js';

export function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const allJobs = getStoredJobs();
  const jobToEdit = allJobs.find((j) => j.id === id || j.jobId === id);

  return (
    <div className="w-full">
      <JobForm
        initialJob={jobToEdit}
        initialStep={1}
        onComplete={() => navigate('/jobs')}
        onCancel={() => navigate('/jobs')}
      />
    </div>
  );
}

export default EditJobPage;
