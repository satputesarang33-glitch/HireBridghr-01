import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  DollarSign,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { apiClient } from '../../services/api/apiClient.js';

export function PublicApplyModal({ isOpen, onClose, job }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    portfolioUrl: '',
    experienceYears: 4,
    currentCompany: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '1 Month',
    coverLetter: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMessage('Invalid format. Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Resume file exceeds maximum limit of 5 MB.');
      return;
    }

    setErrorMessage('');
    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName || !formData.email || !resumeFile) {
      setErrorMessage('Please fill in required fields and attach your resume.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create candidate record
      const candRes = await apiClient.post('/api/v1/candidates', {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        currentCompany: formData.currentCompany,
        experienceYears: Number(formData.experienceYears),
        skills: job?.skills || ['Full Stack', 'Software'],
        source: 'Career Page',
        status: 'NEW',
        assignedRecruiterName: job?.recruiterName || 'Elena Rostova',
        resume: {
          fileName: resumeFile.name,
          fileSize: `${Math.round(resumeFile.size / 1024)} KB`,
          uploadedAt: new Date().toISOString(),
        },
        tags: ['New Applicant', 'Career Portal'],
      });

      // 2. Create application record
      if (candRes.success) {
        await apiClient.post('/api/v1/applications', {
          candidateId: candRes.data.id,
          candidateName: formData.fullName,
          candidateEmail: formData.email,
          jobId: job?.id || 'job-101',
          jobTitle: job?.title || 'Position',
          stage: 'NEW',
          source: 'Career Page',
          recruiterName: job?.recruiterName || 'Elena Rostova',
          rating: 4.5,
        });

        // 3. Register in-app notification
        await apiClient.post('/api/v1/notifications', {
          title: `New Candidate Applied: ${formData.fullName}`,
          message: `${formData.fullName} submitted an application for ${job?.title}.`,
          type: 'candidate',
          isRead: false,
          link: `/candidates/${candRes.data.id}`,
        });
      }

      setIsSuccess(true);
    } catch (err) {
      setErrorMessage('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setResumeFile(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? '' : `Apply for ${job?.title}`}
      description={isSuccess ? '' : `${job?.client || 'Apex Global Tech'} • ${job?.location}`}
      maxWidth="max-w-2xl"
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-brand">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Application Submitted Successfully</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Thank you for applying for <strong>{job?.title}</strong>. Our talent acquisition team has received your application and resume. We will contact you if your qualifications match our current requirements.
          </p>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleClose}>
              Return to Career Listings
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name *"
              placeholder="e.g. Elena Rostova"
              icon={User}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="elena@example.com"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Current Location"
              placeholder="e.g. Austin, TX"
              icon={MapPin}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/..."
              icon={Linkedin}
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            />
            <Input
              label="Portfolio / GitHub URL"
              placeholder="https://github.com/..."
              icon={Globe}
              value={formData.portfolioUrl}
              onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            />
            <Input
              label="Years of Experience"
              type="number"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
            <Input
              label="Current Company"
              placeholder="e.g. Acme Tech"
              value={formData.currentCompany}
              onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
            />
            <Input
              label="Expected Compensation"
              placeholder="e.g. $150,000 / year"
              value={formData.expectedSalary}
              onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
            />
            <Select
              label="Notice Period / Availability"
              value={formData.noticePeriod}
              onChange={(e) => setFormData({ ...formData, noticePeriod: e.target.value })}
              options={[
                { label: 'Immediate Joiner', value: 'Immediate Joiner' },
                { label: '1 - 2 Weeks', value: '1-2 Weeks' },
                { label: '1 Month', value: '1 Month' },
                { label: '2 Months', value: '2 Months' },
              ]}
            />
          </div>

          {/* Resume Upload Area */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Resume Document * (PDF, DOC, DOCX - Max 5MB)
            </label>
            <div className="relative border-2 border-dashed border-white/15 rounded-xl p-5 text-center hover:border-brand-400/50 transition-colors bg-white/5">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required={!resumeFile}
              />
              <UploadCloud className="w-8 h-8 text-brand-400 mx-auto mb-2" />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2 text-xs text-white font-semibold">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>{resumeFile.name}</span>
                  <span className="text-slate-400 font-normal">
                    ({Math.round(resumeFile.size / 1024)} KB)
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-200 font-semibold">
                    Click to browse or drag and drop your resume
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supported: PDF, DOC, DOCX</p>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Cover Note / Additional Remarks
            </label>
            <textarea
              rows={3}
              placeholder="Tell us why you are interested in this position..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="glass-input w-full rounded-xl p-3 text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={ArrowRight}
            >
              Submit Application
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
