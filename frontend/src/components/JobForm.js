import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Sparkles,
  Calendar,
  Users,
  Video,
  Clock,
  Shield,
  Eye,
  Send,
  Building,
  CheckCircle2
} from 'lucide-react';
import { StepIndicator } from './StepIndicator.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { ApplicationForm } from './ApplicationForm.js';
import { HiringFlow } from './HiringFlow.js';
import { TeamMemberModal } from './TeamMemberModal.js';
import { addJob, updateJob } from '../data/Jobs.js';
import { departments } from '../data/Departments.js';
import { locations } from '../data/Locations.js';
import { skillsList } from '../data/Skills.js';
import { initialScreeningQuestions } from '../data/ScreeningQuestions.js';
import { initialHiringStages } from '../data/HiringStages.js';
import './JobForm.css';

const JOB_TITLE_SUGGESTIONS = [
  'Product Manager',
  'Real estate sales manager',
  'Client Acquisition Strategist',
  'Sales',
  'Business Development executive',
  'Customer Support',
  'Customer Success',
  'Senior Full Stack Engineer',
  'Lead DevOps Architect'
];

export function JobForm({
  initialJob = null,
  initialStep = 1,
  onComplete,
  onCancel,
  className = ''
}) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep || 1);

  // Form State: Step 1 (About Job & Employment Details)
  const [title, setTitle] = useState(initialJob?.title || '');
  const [description, setDescription] = useState(
    initialJob?.description ||
      'We are looking for an ambitious and talented professional to join our fast-growing team. You will be responsible for driving key business initiatives, cross-functional execution, and delivering exceptional outcomes.'
  );
  const [department, setDepartment] = useState(initialJob?.department || 'Product');
  const [client, setClient] = useState(initialJob?.client || initialJob?.company || 'Apex Global Tech');
  const [jobType, setJobType] = useState(initialJob?.jobType || 'Full Time');
  const [location, setLocation] = useState(initialJob?.location || 'San Francisco, CA');
  const [skills, setSkills] = useState(
    initialJob?.skills || ['Product Roadmap', 'Analytics', 'Agile', 'SQL']
  );
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Employment Details
  const [salary, setSalary] = useState(initialJob?.salary || '120,000 - 150,000');
  const [currency, setCurrency] = useState(initialJob?.currency || 'USD');
  const [salaryPeriod, setSalaryPeriod] = useState(initialJob?.salaryPeriod || 'Annual');
  const [workExperience, setWorkExperience] = useState(initialJob?.workExperience || '3 - 6 Years');
  const [experienceLevel, setExperienceLevel] = useState(initialJob?.experienceLevel || 'Mid Level');
  const [employmentType, setEmploymentType] = useState(initialJob?.employmentType || 'FULLTIME');

  // Form State: Step 2 (Application Form Builder & Screening Questions)
  const [fieldSettings, setFieldSettings] = useState({
    personalInfo: 'MANDATORY',
    address: 'OPTIONAL',
    resume: 'MANDATORY',
    workExperience: 'MANDATORY',
    education: 'OPTIONAL',
    noticePeriod: 'MANDATORY',
    portfolio: 'OPTIONAL',
    screeningQuestions: 'MANDATORY'
  });
  const [screeningQuestions, setScreeningQuestions] = useState(initialScreeningQuestions);

  // Form State: Step 3 (Hiring Flow Pipeline Stages)
  const [hiringStages, setHiringStages] = useState(initialHiringStages);

  // Form State: Step 4 (Finishing Up & Team Members)
  const [interviewDuration, setInterviewDuration] = useState('45 min');
  const [interviewFormat, setInterviewFormat] = useState('Video Call (Google Meet)');
  const [autoEmailConfirmation, setAutoEmailConfirmation] = useState(true);
  const [defaultStage, setDefaultStage] = useState('APPLIED');
  const [notifyOnApply, setNotifyOnApply] = useState(true);
  const [visibility, setVisibility] = useState('PUBLIC');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [assignedMembers, setAssignedMembers] = useState(
    initialJob?.teamMembers || [
      {
        id: 'usr-3',
        name: 'Elena Rostova',
        email: 'elena.rostova@apextech.com',
        role: 'Lead Recruiter',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        color: '#10B981'
      },
      {
        id: 'usr-2',
        name: 'Marcus Vance',
        email: 'marcus.vance@apextech.com',
        role: 'Hiring Manager',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        color: '#4F46E5'
      }
    ]
  );
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  // Publish success modal
  const [publishedJob, setPublishedJob] = useState(null);

  // Skill management
  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!title.trim()) {
        alert('Please enter or select a Job Title.');
        return false;
      }
      if (!department) {
        alert('Please choose a Department.');
        return false;
      }
      if (!location) {
        alert('Please specify a Location.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelClick = () => {
    if (window.confirm('Discard changes and return to jobs dashboard?')) {
      if (onCancel) onCancel();
      else navigate('/jobs');
    }
  };

  // Final Publish
  const handlePublishJob = () => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    const jobPayload = {
      title,
      company: client,
      client,
      department,
      location,
      jobType,
      employmentType,
      salary,
      currency,
      salaryPeriod,
      workExperience,
      experienceLevel,
      skills,
      description,
      teamMembers: assignedMembers,
      screeningQuestions,
      hiringStages,
      fieldSettings,
      interviewSettings: {
        duration: interviewDuration,
        format: interviewFormat,
        autoEmailConfirmation
      },
      deadline,
      visibility,
      status: 'OPEN'
    };

    let result;
    if (initialJob?.id) {
      result = updateJob(initialJob.id, jobPayload);
    } else {
      result = addJob(jobPayload);
    }

    setPublishedJob(result);
  };

  return (
    <div className={`ats-job-form-container ${className}`}>
      {/* Wizard Topbar */}
      <div className="ats-wizard-topbar">
        <div className="ats-wizard-topbar-left">
          <button
            type="button"
            className="ats-wizard-back-btn"
            onClick={currentStep === 1 ? handleCancelClick : handlePrev}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Go Back' : 'Back'}</span>
          </button>
        </div>

        <div className="ats-wizard-topbar-center">
          <StepIndicator
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep || validateStep(currentStep)) {
                setCurrentStep(step);
              }
            }}
          />
        </div>

        <div className="ats-wizard-topbar-right">
          <Button variant="ghost" size="sm" onClick={handleCancelClick}>
            Cancel
          </Button>

          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={handleNext}
            >
              Preview & Proceed
            </Button>
          ) : (
            <Button
              variant="success"
              size="sm"
              icon={Check}
              onClick={handlePublishJob}
            >
              Publish Job
            </Button>
          )}
        </div>
      </div>

      {/* Wizard Content Step Pages */}
      <div className="ats-wizard-content">
        {/* ======================================================== */}
        {/* STEP 1: ABOUT JOB & EMPLOYMENT DETAILS                   */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-6">
            {/* 1.1 About Job Card */}
            <div className="ats-form-card">
              <div className="ats-form-section-header">
                <h3 className="ats-form-section-title">About Job</h3>
                <span className="ats-form-section-desc">
                  Provide primary role specifics, department, and skill requirements
                </span>
              </div>

              {/* Job Title with Preset Chips */}
              <div className="flex flex-col gap-2">
                <Input
                  label="Job Title"
                  required
                  placeholder="e.g. Product Manager, Sales Manager..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
                  {JOB_TITLE_SUGGESTIONS.slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                      onClick={() => setTitle(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Department, Client, Job Type Grid */}
              <div className="ats-form-grid-3">
                <Select
                  label="Department"
                  required
                  options={departments}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />

                <Select
                  label="Client / Company"
                  required
                  options={[
                    'Apex Global Tech',
                    'ABC',
                    'Enterprise Tech Partners',
                    'Apex Realty Global',
                    'Marketing Division',
                    'Apex Cloud Services',
                    'Enterprise Global'
                  ]}
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />

                <Select
                  label="Job Type"
                  options={['Full Time', 'Part Time', 'Contract', 'Remote', 'Internship']}
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="ats-form-grid-2">
                <Select
                  label="Location"
                  required
                  options={locations}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />

                <Select
                  label="Workplace Setting"
                  options={['Hybrid', 'On-site', 'Remote']}
                  defaultValue="Hybrid"
                />
              </div>

              {/* Skills Required */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-800">
                  Skills Required
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 py-2 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
                    placeholder="Type skill and press Enter (e.g. Product Strategy, React.js, CRM)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSkill();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={handleAddCustomSkill}
                  >
                    Add
                  </Button>
                </div>

                {/* Selected Skills Chips */}
                <div className="ats-skills-chip-list">
                  {skills.map((skill) => (
                    <span key={skill} className="ats-skill-chip">
                      <span>{skill}</span>
                      <X
                        className="w-3.5 h-3.5 ats-skill-chip-remove"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </span>
                  ))}
                </div>

                {/* Popular Skill Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span className="text-[11px] text-slate-400">Popular:</span>
                  {skillsList.slice(0, 8).map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      className="text-[10px] text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
                      onClick={() => {
                        if (!skills.includes(sk)) setSkills([...skills, sk]);
                      }}
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-800">
                  Job Description
                </label>
                <textarea
                  rows={5}
                  className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                  placeholder="Detail the scope of the role, responsibilities, and team expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* 1.2 Employment Details Section */}
            <div className="ats-form-card">
              <div className="ats-form-section-header">
                <h3 className="ats-form-section-title">Employment Details</h3>
                <span className="ats-form-section-desc">
                  Specify compensation brackets, seniority expectations, and work experience criteria
                </span>
              </div>

              <div className="ats-form-grid-3">
                <Input
                  label="Salary Range / Estimate"
                  placeholder="e.g. 120,000 - 150,000"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />

                <Select
                  label="Currency"
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'INR', label: 'INR (₹)' },
                    { value: 'AED', label: 'AED (د.إ)' }
                  ]}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />

                <Select
                  label="Salary Period"
                  options={['Annual', 'Monthly', 'Hourly']}
                  value={salaryPeriod}
                  onChange={(e) => setSalaryPeriod(e.target.value)}
                />
              </div>

              <div className="ats-form-grid-3">
                <Input
                  label="Work Experience"
                  placeholder="e.g. 3 - 6 Years"
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                />

                <Select
                  label="Experience Level"
                  options={['Entry Level', 'Mid Level', 'Senior Level', 'Lead / Executive']}
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                />

                <Select
                  label="Employment Type"
                  options={[
                    { value: 'FULLTIME', label: 'Full Time' },
                    { value: 'PARTTIME', label: 'Part Time' },
                    { value: 'CONTRACT', label: 'Contract' },
                    { value: 'INTERNSHIP', label: 'Internship' }
                  ]}
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: APPLICATION FORM BUILDER & SCREENING QUESTIONS   */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <ApplicationForm
            fieldSettings={fieldSettings}
            onFieldSettingsChange={setFieldSettings}
            screeningQuestions={screeningQuestions}
            onScreeningQuestionsChange={setScreeningQuestions}
            jobTitle={title}
            company={client}
            location={location}
          />
        )}

        {/* ======================================================== */}
        {/* STEP 3: HIRING FLOW PIPELINE                             */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="ats-form-card">
            <HiringFlow
              stages={hiringStages}
              onStagesChange={setHiringStages}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: FINISHING UP & TEAM ASSIGNMENT                   */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-6">
            <div className="ats-form-card">
              <div className="ats-form-section-header">
                <h3 className="ats-form-section-title">Finishing Up & Publication Setup</h3>
                <span className="ats-form-section-desc">
                  Finalize interview workflows, recruiter assignments, and job distribution parameters
                </span>
              </div>

              <div className="ats-finish-settings-grid">
                {/* Box 1: Interview Settings */}
                <div className="ats-finish-box">
                  <h4 className="ats-finish-box-title">
                    <Video className="w-4 h-4 text-indigo-600" />
                    Interview Settings
                  </h4>

                  <Select
                    label="Default Round Duration"
                    options={['30 min', '45 min', '60 min', '90 min']}
                    value={interviewDuration}
                    onChange={(e) => setInterviewDuration(e.target.value)}
                  />

                  <Select
                    label="Interview Format"
                    options={[
                      'Video Call (Google Meet)',
                      'Video Call (Zoom)',
                      'Phone Screen',
                      'In-person / On-site'
                    ]}
                    value={interviewFormat}
                    onChange={(e) => setInterviewFormat(e.target.value)}
                  />

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={autoEmailConfirmation}
                      onChange={(e) => setAutoEmailConfirmation(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">
                      Automatically send interview confirmation & calendar invites to candidates
                    </span>
                  </label>
                </div>

                {/* Box 2: Hiring Flow Settings */}
                <div className="ats-finish-box">
                  <h4 className="ats-finish-box-title">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Hiring Flow Configuration
                  </h4>

                  <Select
                    label="Default Applicant Entry Stage"
                    options={hiringStages.map((s) => ({ value: s.key || s.id, label: s.title }))}
                    value={defaultStage}
                    onChange={(e) => setDefaultStage(e.target.value)}
                  />

                  <Select
                    label="Listing Visibility"
                    options={[
                      { value: 'PUBLIC', label: 'Public (Career Site & Job Boards)' },
                      { value: 'INTERNAL', label: 'Internal Only (Employees)' },
                      { value: 'UNLISTED', label: 'Unlisted (Direct Link Only)' }
                    ]}
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  />

                  <Input
                    label="Application Deadline Date"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {/* Box 3: Team Members & Interviewers Assignment */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Assigned Hiring Team ({assignedMembers.length})
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setTeamModalOpen(true)}
                  >
                    Manage Team Members
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {assignedMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
                        style={{ backgroundColor: m.color || '#4F46E5' }}
                      >
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          m.initial || m.name.charAt(0)
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{m.name}</span>
                        <span className="text-[11px] text-indigo-600 font-semibold">{m.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={() => handlePublishJob(false)}>
                  Save as Draft
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  icon={Send}
                  onClick={handlePublishJob}
                >
                  Publish Job Requisition
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        assignedMembers={assignedMembers}
        onUpdateAssignedMembers={setAssignedMembers}
      />

      {/* ======================================================== */}
      {/* SUCCESS PUBLISHED MODAL                                  */}
      {/* ======================================================== */}
      {publishedJob && (
        <div className="ats-modal-overlay">
          <div className="ats-modal-card text-center p-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Job Successfully Published!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                <strong>{publishedJob.title}</strong> is now live with Job ID #{publishedJob.jobId || publishedJob.id}. Candidates can now view and apply.
              </p>
            </div>

            <div className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-700">
              <span className="font-mono truncate">
                {window.location.origin}/jobs/{publishedJob.jobId || publishedJob.id}
              </span>
              <button
                type="button"
                className="font-bold text-indigo-600 hover:underline shrink-0 ml-2"
                onClick={() => {
                  navigator.clipboard?.writeText(`${window.location.origin}/jobs/${publishedJob.jobId || publishedJob.id}`);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy Link
              </button>
            </div>

            <div className="flex items-center gap-3 w-full">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setPublishedJob(null);
                  if (onComplete) onComplete(publishedJob);
                  else navigate('/jobs');
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setPublishedJob(null);
                  if (onComplete) onComplete(publishedJob);
                  else navigate('/jobs');
                }}
              >
                View Job
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobForm;
