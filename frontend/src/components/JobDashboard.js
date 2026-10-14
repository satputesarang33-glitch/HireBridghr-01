import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Briefcase,
  Zap,
  X,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  BarChart3
} from 'lucide-react';
import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { JobCard } from './JobCard.js';
import { JobSyndicationModal } from './JobSyndicationModal.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import {
  getStoredJobs,
  saveJobs,
  deleteJob,
  toggleStarJob,
  updateJob,
  syncJobsWithBackend
} from '../data/Jobs.js';
import { addCandidate } from '../data/Candidates.js';
import { departments } from '../data/Departments.js';
import { locations } from '../data/Locations.js';
import './JobDashboard.css';

export function JobDashboard({
  onCreateJob,
  onEditJob,
  onViewPipeline
}) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(() => getStoredJobs());

  // Background sync with live backend
  useEffect(() => {
    syncJobsWithBackend((synced) => {
      setJobs(synced);
    });
  }, []);

  // Filter States (Matching PyjamaHR / Reference Video Sidebar)
  const [jobStatus, setJobStatus] = useState('OPEN');
  const [selectedDept, setSelectedDept] = useState('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTill, setCreatedTill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [candidateModalJob, setCandidateModalJob] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    phone: '',
    experienceYears: '3',
    resumeFileName: ''
  });

  const [boostModalJob, setBoostModalJob] = useState(null);
  const [boostTier, setBoostTier] = useState('FEATURED');
  const [isBoosting, setIsBoosting] = useState(false);
  const [syndicateModalJob, setSyndicateModalJob] = useState(null);

  // Derive unique clients for filter dropdown
  const clientsList = useMemo(() => {
    const set = new Set();
    jobs.forEach(j => {
      const c = j.client || j.company;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Status Filter
      if (jobStatus === 'OPEN' && job.status === 'CLOSED') return false;
      if (jobStatus === 'CLOSED' && job.status !== 'CLOSED') return false;

      // 2. Department
      if (selectedDept && job.department !== selectedDept) return false;

      // 3. Location
      if (selectedLocation && job.location !== selectedLocation) return false;

      // 4. Client
      if (selectedClient && (job.client !== selectedClient && job.company !== selectedClient)) {
        return false;
      }

      // 5. Date Range
      if (createdFrom && job.createdAt) {
        if (new Date(job.createdAt).getTime() < new Date(createdFrom).getTime()) return false;
      }
      if (createdTill && job.createdAt) {
        const till = new Date(createdTill).getTime() + 86400000;
        if (new Date(job.createdAt).getTime() > till) return false;
      }

      // 6. Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          job.title?.toLowerCase().includes(q) ||
          job.company?.toLowerCase().includes(q) ||
          job.client?.toLowerCase().includes(q) ||
          job.department?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          job.jobId?.toString().includes(q) ||
          job.skills?.some(s => s.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [jobs, jobStatus, selectedDept, selectedLocation, selectedClient, createdFrom, createdTill, searchQuery]);

  // Handlers
  const handleToggleStar = (job) => {
    toggleStarJob(job.id);
    setJobs(getStoredJobs());
  };

  const handleToggleStatus = (job) => {
    const newStatus = job.status === 'OPEN' ? 'CLOSED' : 'OPEN';
    updateJob(job.id, { status: newStatus });
    setJobs(getStoredJobs());
  };

  const handleDeleteJob = (job) => {
    if (window.confirm(`Are you sure you want to delete "${job.title}"?`)) {
      deleteJob(job.id);
      setJobs(getStoredJobs());
    }
  };

  const handleResetFilters = () => {
    setJobStatus('OPEN');
    setSelectedDept('');
    setCreatedFrom('');
    setCreatedTill('');
    setSelectedLocation('');
    setSelectedClient('');
    setSearchQuery('');
  };

  // Add Candidate submit
  const handleAddCandidateSubmit = (e) => {
    e.preventDefault();
    if (!candidateForm.name || !candidateForm.email) {
      alert('Please enter candidate name and email.');
      return;
    }

    addCandidate({
      name: candidateForm.name,
      email: candidateForm.email,
      phone: candidateForm.phone || '+1 (555) 000-0000',
      jobId: candidateModalJob.jobId || candidateModalJob.id,
      jobTitle: candidateModalJob.title,
      experienceYears: Number(candidateForm.experienceYears) || 3,
      stage: 'APPLIED',
      skills: candidateModalJob.skills ? candidateModalJob.skills.slice(0, 3) : ['Communication']
    });

    // Increment count on job
    updateJob(candidateModalJob.id, {
      totalCandidates: (candidateModalJob.totalCandidates || 0) + 1,
      activeCandidates: (candidateModalJob.activeCandidates || 0) + 1
    });

    setJobs(getStoredJobs());
    setCandidateModalJob(null);
    setCandidateForm({ name: '', email: '', phone: '', experienceYears: '3', resumeFileName: '' });
    alert(`Candidate "${candidateForm.name}" successfully added to ${candidateModalJob.title}!`);
  };

  // Boost Job submit
  const handleApplyBoost = () => {
    setIsBoosting(true);
    setTimeout(() => {
      updateJob(boostModalJob.id, { isBoosted: true });
      setJobs(getStoredJobs());
      setIsBoosting(false);
      setBoostModalJob(null);
      alert(`Job "${boostModalJob.title}" has been boosted! It will receive top priority on job portals.`);
    }, 700);
  };

  const handleCreateJobClick = () => {
    if (onCreateJob) {
      onCreateJob();
    } else {
      navigate('/jobs/new');
    }
  };

  const handleEditJobClick = (job) => {
    if (onEditJob) {
      onEditJob(job);
    } else {
      navigate(`/jobs/${job.id}/edit`);
    }
  };

  const handleViewPipelineClick = (job) => {
    if (onViewPipeline) {
      onViewPipeline(job);
    } else {
      navigate(`/jobs/new?step=3&jobId=${job.jobId || job.id}`);
    }
  };

  return (
    <div className="ats-dashboard-container">
      <div className="ats-dashboard-main">
        {/* Left Filter Sidebar */}
        <Sidebar
          jobStatus={jobStatus}
          onJobStatusChange={setJobStatus}
          department={selectedDept}
          onDepartmentChange={setSelectedDept}
          departments={departments}
          createdFrom={createdFrom}
          onCreatedFromChange={setCreatedFrom}
          createdTill={createdTill}
          onCreatedTillChange={setCreatedTill}
          location={selectedLocation}
          onLocationChange={setSelectedLocation}
          locations={locations}
          client={selectedClient}
          onClientChange={setSelectedClient}
          clients={clientsList}
          onCreateJob={handleCreateJobClick}
          onResetFilters={handleResetFilters}
        />

        {/* Right Content Area */}
        <main className="ats-dashboard-content">
          <Header
            title={jobStatus === 'OPEN' ? 'Open Jobs' : 'Closed Jobs'}
            count={filteredJobs.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actions={
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={BarChart3}
                  onClick={() => navigate('/reports')}
                >
                  Analytics & Funnel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleCreateJobClick}
                >
                  Create Job
                </Button>
              </div>
            }
          />

          {/* Cards Grid */}
          {filteredJobs.length > 0 ? (
            <div className="ats-jobs-grid">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id || job.jobId}
                  job={job}
                  onToggleStar={handleToggleStar}
                  onBoost={(j) => setBoostModalJob(j)}
                  onAddCandidate={(j) => setCandidateModalJob(j)}
                  onEditJob={handleEditJobClick}
                  onViewPipeline={handleViewPipelineClick}
                  onToggleStatus={handleToggleStatus}
                  onDeleteJob={handleDeleteJob}
                  onSyndicate={(j) => setSyndicateModalJob(j)}
                />
              ))}
            </div>
          ) : (
            <div className="ats-dashboard-empty">
              <Briefcase className="w-12 h-12 text-slate-300" />
              <h3 className="ats-dashboard-empty-title">No jobs found</h3>
              <p className="ats-dashboard-empty-desc">
                {searchQuery || selectedDept || selectedLocation || selectedClient
                  ? 'No jobs match your current search or filter criteria. Try resetting filters.'
                  : 'There are currently no jobs listed in this section.'}
              </p>
              <Button
                variant="primary"
                onClick={handleCreateJobClick}
                icon={Plus}
              >
                Create New Job
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD CANDIDATE MODAL                               */}
      {/* ======================================================== */}
      {candidateModalJob && (
        <div className="ats-modal-overlay" onClick={() => setCandidateModalJob(null)}>
          <div className="ats-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ats-modal-header">
              <h3 className="ats-modal-title">
                Add Candidate to {candidateModalJob.title}
              </h3>
              <button
                type="button"
                className="ats-modal-close-btn"
                onClick={() => setCandidateModalJob(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidateSubmit}>
              <div className="ats-modal-body">
                <Input
                  label="Candidate Full Name"
                  required
                  placeholder="e.g. Jessica Taylor"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="e.g. jessica.t@example.com"
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                />

                <Select
                  label="Years of Experience"
                  options={['1 Year', '2 Years', '3 Years', '4 Years', '5+ Years', '8+ Years']}
                  value={candidateForm.experienceYears}
                  onChange={(e) => setCandidateForm({ ...candidateForm, experienceYears: e.target.value })}
                />

                {/* Resume Upload Box */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Upload Resume / CV
                  </label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer bg-slate-50 hover:bg-indigo-50/30 transition-all">
                    <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {candidateForm.resumeFileName || 'Click or drag PDF/DOCX to upload'}
                    </span>
                    <span className="text-[11px] text-slate-400">Up to 10MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCandidateForm({ ...candidateForm, resumeFileName: file.name });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="ats-modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setCandidateModalJob(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Add Candidate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BOOST JOB MODAL                                   */}
      {/* ======================================================== */}
      {boostModalJob && (
        <div className="ats-modal-overlay" onClick={() => setBoostModalJob(null)}>
          <div className="ats-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ats-modal-header">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" fill="#F59E0B" />
                <h3 className="ats-modal-title">Boost Job Requisition</h3>
              </div>
              <button
                type="button"
                className="ats-modal-close-btn"
                onClick={() => setBoostModalJob(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="ats-modal-body">
              <p className="text-xs text-slate-600">
                Accelerate applicant flow for <strong>{boostModalJob.title}</strong> by sponsoring across premium job boards (LinkedIn, Indeed, Google for Jobs).
              </p>

              <div className="flex flex-col gap-2.5">
                {[
                  { id: 'STANDARD', title: 'Standard Promotion', multiplier: '2x', desc: 'Highlighted on relevant candidate search results' },
                  { id: 'FEATURED', title: 'Featured Requisition', multiplier: '5x', desc: 'Pinned to category hero slots with instant email alerts' },
                  { id: 'TURBO', title: 'Turbo Recruiter Sponsoring', multiplier: '10x', desc: 'Top tier placement across all partner distribution networks' }
                ].map(tier => (
                  <label
                    key={tier.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      boostTier === tier.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                    onClick={() => setBoostTier(tier.id)}
                  >
                    <input
                      type="radio"
                      name="boostTier"
                      checked={boostTier === tier.id}
                      onChange={() => setBoostTier(tier.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{tier.title}</span>
                        <span className="text-[11px] font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          {tier.multiplier} Reach
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{tier.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="ats-modal-footer">
              <Button
                variant="secondary"
                onClick={() => setBoostModalJob(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={isBoosting}
                onClick={handleApplyBoost}
                icon={Zap}
              >
                Activate Boost
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 6: Job Board Syndication & SEO Modal */}
      <JobSyndicationModal
        isOpen={Boolean(syndicateModalJob)}
        onClose={() => setSyndicateModalJob(null)}
        job={syndicateModalJob}
      />
    </div>
  );
}

export default JobDashboard;
