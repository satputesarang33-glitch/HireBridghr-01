import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Send,
  Save,
  Plus,
  X,
  Eye,
  Building,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useCreateJob } from '../../hooks/useJobs.js';
import { useAuth } from '../../context/AuthContext.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { JobStatusBadge } from '../../components/ui/Badge.js';

export function CreateJobPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createJobMutation = useCreateJob();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    client: user?.organizationName || 'Apex Global Tech',
    department: 'Engineering',
    workplaceType: 'Hybrid',
    employmentType: 'Full-time',
    location: 'San Francisco, CA',
    description: `### Role Overview\nWe are looking for a skilled professional to join our team...\n\n### Key Responsibilities\n- Deliver high-quality software features.\n- Partner cross-functionally with team members.\n\n### Requirements\n- Proven track record and proficiency with modern stacks.`,
    skills: ['React.js', 'Node.js', 'TypeScript'],
    currency: 'USD',
    salaryMin: 120000,
    salaryMax: 160000,
    experienceMin: 3,
    experienceMax: 6,
    experienceLevel: 'Mid-Senior',
    deadline: '2026-11-30',
    candidateEmail: 'careers@apextech.example.com',
    contactPerson: `${user?.name || 'Elena Rostova'} (${user?.email || 'recruiter@apextech.com'})`,
    isPublic: true,
    isResumeRequired: true,
  });

  const [newSkill, setNewSkill] = useState('');
  const [validationError, setValidationError] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillToRemove) });
  };

  const validateStep = (step) => {
    setValidationError('');
    if (step === 1) {
      if (!formData.title || !formData.department || !formData.location) {
        setValidationError('Please fill in job title, department, and location.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.description || formData.skills.length === 0) {
        setValidationError('Please provide a job description and at least 1 required skill.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async (status) => {
    // When submitting for publication, directly mark status as PUBLISHED
    const effectiveStatus = (status === 'PENDING_ADMIN_PUBLICATION' || status === 'PUBLISHED')
      ? 'PUBLISHED'
      : status;

    const jobPayload = {
      ...formData,
      status: effectiveStatus,
      recruiterId: user?.id || 'usr-3',
      recruiterName: user?.name || 'Recruiter Lead',
    };

    createJobMutation.mutate(jobPayload, {
      onSuccess: () => {
        navigate('/jobs');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <Link to="/jobs" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Back to Job Requisitions
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Create Job Requisition
          </h1>
        </div>

        {/* Step tracker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Step {currentStep} of {totalSteps}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? 'w-5 bg-brand-400' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {validationError}
        </div>
      )}

      {/* STEP 1: Basic Information */}
      {currentStep === 1 && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Step 1: Role Overview & Location</h3>
            <p className="text-xs text-slate-400 mt-0.5">Specify basic role parameters and department allocation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Job Title"
                placeholder="e.g. Senior Full Stack Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <Input
              label="Client / Division"
              placeholder="e.g. Core Banking Platform"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            />

            <Select
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={[
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Design', value: 'Design' },
                { label: 'DevOps & SRE', value: 'DevOps & SRE' },
                { label: 'Artificial Intelligence', value: 'Artificial Intelligence' },
                { label: 'Product Management', value: 'Product Management' },
                { label: 'Customer Operations', value: 'Customer Operations' },
              ]}
            />

            <Select
              label="Workplace Type"
              value={formData.workplaceType}
              onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
              options={[
                { label: 'Hybrid', value: 'Hybrid' },
                { label: 'Remote', value: 'Remote' },
                { label: 'On-site', value: 'On-site' },
              ]}
            />

            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA or Remote (US)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button variant="primary" onClick={nextStep} icon={ArrowRight}>
              Next: Description & Skills
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Description & Skills */}
      {currentStep === 2 && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Step 2: Job Description & Skill Requirements</h3>
            <p className="text-xs text-slate-400 mt-0.5">Detail responsibilities, requirements, and required skills tags.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Job Description (Markdown Supported)
            </label>
            <textarea
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input w-full rounded-xl p-3.5 text-xs font-mono leading-relaxed"
              placeholder="Provide a detailed job description..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Required Skills
            </label>
            <div className="flex items-center gap-2 mb-3">
              <Input
                placeholder="Add skill tag (e.g. FastAPI, Docker, GraphQL)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button variant="secondary" size="sm" onClick={addSkill} icon={Plus}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={prevStep} icon={ArrowLeft}>
              Previous
            </Button>
            <Button variant="primary" onClick={nextStep} icon={ArrowRight}>
              Next: Compensation Details
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Compensation & Experience */}
      {currentStep === 3 && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Step 3: Compensation & Experience Criteria</h3>
            <p className="text-xs text-slate-400 mt-0.5">Set salary bands, currency, and years of experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'INR (₹)', value: 'INR' },
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'AED (د.إ)', value: 'AED' },
                { label: 'SAR (﷼)', value: 'SAR' },
                { label: 'CAD ($)', value: 'CAD' },
              ]}
            />

            <Input
              label="Minimum Salary"
              type="number"
              value={formData.salaryMin}
              onChange={(e) => setFormData({ ...formData, salaryMin: Number(e.target.value) })}
            />

            <Input
              label="Maximum Salary"
              type="number"
              value={formData.salaryMax}
              onChange={(e) => setFormData({ ...formData, salaryMax: Number(e.target.value) })}
            />

            <Select
              label="Employment Type"
              value={formData.employmentType}
              onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
              options={[
                { label: 'Full-time', value: 'Full-time' },
                { label: 'Contract', value: 'Contract' },
                { label: 'Part-time', value: 'Part-time' },
                { label: 'Internship', value: 'Internship' },
              ]}
            />

            <Input
              label="Min Experience (Years)"
              type="number"
              value={formData.experienceMin}
              onChange={(e) => setFormData({ ...formData, experienceMin: Number(e.target.value) })}
            />

            <Input
              label="Max Experience (Years)"
              type="number"
              value={formData.experienceMax}
              onChange={(e) => setFormData({ ...formData, experienceMax: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={prevStep} icon={ArrowLeft}>
              Previous
            </Button>
            <Button variant="primary" onClick={nextStep} icon={ArrowRight}>
              Next: Application Settings
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Application Settings */}
      {currentStep === 4 && (
        <Card className="p-6 space-y-6">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Step 4: Application Settings & Compliance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control candidate submission deadlines and contact points.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Application Deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />

            <Input
              label="Internal Recruiter Contact"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />

            <div className="sm:col-span-2">
              <Input
                label="Receiving Notification Email"
                type="email"
                value={formData.candidateEmail}
                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2 pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded bg-slate-800 border-white/20 text-brand-500 focus:ring-brand-400 w-4 h-4"
                />
                <span>Publish to Public Careers Portal (`/jobs/:slug`)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.isResumeRequired}
                  onChange={(e) => setFormData({ ...formData, isResumeRequired: e.target.checked })}
                  className="rounded bg-slate-800 border-white/20 text-brand-500 focus:ring-brand-400 w-4 h-4"
                />
                <span>Resume upload is strictly mandatory (PDF / DOC / DOCX)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={prevStep} icon={ArrowLeft}>
              Previous
            </Button>
            <Button variant="primary" onClick={nextStep} icon={Eye}>
              Review Live Job Preview
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: Live Job Preview & Publication Actions */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-brand-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Live Applicant Preview</h4>
                <p className="text-[11px] text-slate-400">Review exactly how candidates will view this job requisition.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-brand-300 bg-brand-500/20 px-2.5 py-1 rounded-full border border-brand-500/30">
              Pre-Publication Check
            </span>
          </div>

          {/* Job Preview Card */}
          <div className="glass-panel rounded-2xl p-8 border border-white/15 shadow-glass-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">{formData.department}</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">{formData.title || 'Untitled Job'}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  {formData.client} &bull; {formData.location} &bull; {formData.workplaceType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-emerald-400">
                  {formData.currency} {formData.salaryMin.toLocaleString()} - {formData.salaryMax.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-400">{formData.employmentType} &bull; {formData.experienceMin}-{formData.experienceMax} Yrs Exp</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Required Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Job Description</h4>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs leading-relaxed text-slate-300 whitespace-pre-line font-sans">
                {formData.description}
              </div>
            </div>

            {/* Distribution Workflow Information Alert */}
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
              <strong className="text-cyan-300 block mb-1">HirebridgeHR Publication Pipeline:</strong>
              When you click <strong>&quot;Submit for Publication Request&quot;</strong>, the job requisition is published immediately with status <code>Published</code> and made live on career portals.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={prevStep} icon={ArrowLeft}>
              Back to Edit
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                icon={Save}
                isLoading={createJobMutation.isPending}
                onClick={() => handleSave('DRAFT')}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                icon={Send}
                isLoading={createJobMutation.isPending}
                onClick={() => handleSave('PUBLISHED')}
                aria-label="Submit for Publication Request"
              >
                Submit for Publication Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
