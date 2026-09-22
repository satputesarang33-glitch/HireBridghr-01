import React, { useState, useEffect } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  ExternalLink,
  Linkedin,
  Github,
  Globe,
  Trash2,
} from 'lucide-react';
import { useCandidateProfile, useApplyJob, useCandidateApplications } from '../../hooks/useCandidatePortal.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../ui/Button.js';
import { Input } from '../ui/Input.js';

export function ApplyJobModal({ isOpen, onClose, job }) {
  const toast = useToast();
  const { data: profile } = useCandidateProfile();
  const { data: applications = [] } = useCandidateApplications();
  const applyMutation = useApplyJob();

  const [step, setStep] = useState('form'); // 'form' | 'review' | 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    resumeName: '',
    resumeSize: '',
    resumeUrl: '',
  });

  const [fileError, setFileError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Check if candidate has already applied to this job
  const existingApplication = applications.find(
    (app) => app.jobId === job?.id || app.jobTitle === job?.title
  );
  const isAlreadyApplied = !!existingApplication;

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        fullName: profile.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Alex Rivera',
        email: profile.email || 'alex.candidate@example.com',
        phone: profile.phone || '+1 (555) 234-5678',
        portfolioUrl: profile.portfolioUrl || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        resumeName: profile.resumeName || 'Alex_Rivera_Resume_2026.pdf',
        resumeSize: profile.resumeSize || '1.8 MB',
        resumeUrl: profile.resumeUrl || 'https://hirebridgehr.example.com/resumes/alex-rivera-resume.pdf',
      }));
    }
  }, [profile]);

  if (!isOpen || !job) return null;

  const handleFileUpload = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      setFileError('Invalid file type. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeInBytes) {
      setFileError('File exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setFormData((prev) => ({
      ...prev,
      resumeName: file.name,
      resumeSize: sizeFormatted,
      resumeUrl: URL.createObjectURL(file),
    }));
  };

  const handleRemoveResume = () => {
    setFormData((prev) => ({
      ...prev,
      resumeName: '',
      resumeSize: '',
      resumeUrl: '',
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email address is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.resumeName) errs.resume = 'A resume document (PDF, DOC, or DOCX) is required';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoToReview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('review');
    }
  };

  const handleSubmitApplication = async () => {
    try {
      await applyMutation.mutateAsync({
        jobId: job.id,
        applicationData: {
          jobId: job.id,
          jobTitle: job.title,
          company: job.company || 'ApexTech Global',
          location: job.location,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          resumeName: formData.resumeName,
          resumeSize: formData.resumeSize,
          resumeUrl: formData.resumeUrl,
          coverLetter: formData.coverLetter,
          portfolioUrl: formData.portfolioUrl,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
        },
      });

      toast.success('Application submitted', `You have applied for ${job.title}`);
      setStep('success');
    } catch (err) {
      toast.error('Application failed', err?.message || 'Could not submit application.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/80 dark:border-white/15 p-6 shadow-2xl my-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 mb-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.jobType || 'Full-Time'} &bull; {job.location}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Apply for {job.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {job.company || 'ApexTech Global'} &bull; {job.department || 'Engineering'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Already Applied Alert */}
        {isAlreadyApplied && step !== 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-400/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Already Applied</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                You have already submitted an application for <strong>{job.title}</strong>. You can track your application status in your portal.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  window.location.href = '/candidate/applications';
                }}
              >
                Track in My Applications &rarr;
              </Button>
            </div>
          </div>
        ) : step === 'form' ? (
          /* Step 1: Application Form */
          <form onSubmit={handleGoToReview} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Full Name *"
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Input
                  label="Phone *"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.phone}</p>
                )}
              </div>
              <div>
                <Input
                  label="LinkedIn URL"
                  type="url"
                  placeholder="linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>
              <div>
                <Input
                  label="GitHub / Portfolio"
                  type="url"
                  placeholder="github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                />
              </div>
            </div>

            {/* Resume Upload Box */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resume Document * (PDF, DOC, DOCX up to 10MB)
              </label>
              {formData.resumeName ? (
                <div className="p-3 rounded-xl bg-white/5 border border-cyan-400/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">{formData.resumeName}</p>
                      <p className="text-[10px] text-slate-400">{formData.resumeSize}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveResume}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="resume-dropzone p-5 text-center">
                  <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-200">
                    Drag and drop your resume, or{' '}
                    <label className="text-cyan-400 hover:underline cursor-pointer">
                      <span>browse files</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Accepted: PDF, DOC, DOCX (Max 10MB)</p>
                </div>
              )}
              {fileError && <p className="text-[11px] text-rose-400">{fileError}</p>}
              {fieldErrors.resume && <p className="text-[11px] text-rose-400">{fieldErrors.resume}</p>}
            </div>

            {/* Cover Letter */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cover Letter / Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                className="glass-input w-full rounded-xl p-3 text-xs"
                placeholder="Share why you're a great fit for this position..."
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={ArrowRight}>
                Review Application
              </Button>
            </div>
          </form>
        ) : step === 'review' ? (
          /* Step 2: Review Application */
          <div className="mt-4 space-y-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              Please review your details carefully before submitting your application.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-white/5 border border-white/10">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Applicant Name</p>
                <p className="font-semibold text-white mt-0.5">{formData.fullName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Email Address</p>
                <p className="font-semibold text-white mt-0.5">{formData.email}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Phone</p>
                <p className="font-semibold text-white mt-0.5">{formData.phone}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Attached Resume</p>
                <p className="font-semibold text-cyan-400 mt-0.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {formData.resumeName} ({formData.resumeSize})
                </p>
              </div>
            </div>

            {(formData.linkedinUrl || formData.githubUrl || formData.portfolioUrl) && (
              <div className="text-xs p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Web &amp; Social Profiles</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.linkedinUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded">
                      <Linkedin className="w-3 h-3" /> {formData.linkedinUrl}
                    </span>
                  )}
                  {formData.githubUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded">
                      <Github className="w-3 h-3" /> {formData.githubUrl}
                    </span>
                  )}
                  {formData.portfolioUrl && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded">
                      <Globe className="w-3 h-3" /> {formData.portfolioUrl}
                    </span>
                  )}
                </div>
              </div>
            )}

            {formData.coverLetter && (
              <div className="text-xs p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-[10px] uppercase font-bold">Cover Letter</p>
                <p className="text-slate-200 mt-1 whitespace-pre-wrap text-[11px] leading-relaxed">
                  {formData.coverLetter}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={ArrowLeft}
                onClick={() => setStep('form')}
              >
                Back to Edit
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={applyMutation.isPending}
                icon={CheckCircle2}
                onClick={handleSubmitApplication}
              >
                Submit Application
              </Button>
            </div>
          </div>
        ) : (
          /* Step 3: Success Screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                Application submitted successfully!
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                Your application for <strong>{job.title}</strong> has been transmitted to the recruiting team. You will receive notifications as your status progresses.
              </p>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={onClose}>
                Browse More Jobs
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  window.location.href = '/candidate/applications';
                }}
              >
                Track My Applications &rarr;
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
