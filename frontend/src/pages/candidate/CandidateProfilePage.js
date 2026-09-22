import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FolderGit2,
  FileText,
  UploadCloud,
  Download,
  Linkedin,
  Github,
  Globe,
  Edit3,
  Save,
  Plus,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useCandidateProfile, useUpdateCandidateProfile, useUploadResume } from '../../hooks/useCandidatePortal.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { cn } from '../../utils/cn.js';

export function CandidateProfilePage() {
  const toast = useToast();
  const { data: profile, isLoading } = useCandidateProfile();
  const updateProfileMutation = useUpdateCandidateProfile();
  const uploadResumeMutation = useUploadResume();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (isLoading || !formData) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-2">Loading candidate profile...</p>
      </div>
    );
  }

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const currentSkills = formData.skills || [];
    if (!currentSkills.includes(newSkillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...currentSkills, newSkillInput.trim()],
      }));
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skillToRemove),
    }));
  };

  // Education list management
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Computer Science',
      institution: 'University',
      startYear: 2020,
      endYear: 2024,
    };
    setFormData((prev) => ({ ...prev, education: [...(prev.education || []), newEdu] }));
  };

  const handleRemoveEducation = (eduId) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((e) => e.id !== eduId),
    }));
  };

  // Experience list management
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: 'Tech Company',
      title: 'Software Engineer',
      startDate: '2023',
      endDate: 'Present',
      description: 'Built customer-facing features and distributed cloud microservices.',
    };
    setFormData((prev) => ({ ...prev, experience: [...(prev.experience || []), newExp] }));
  };

  const handleRemoveExperience = (expId) => {
    setFormData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((e) => e.id !== expId),
    }));
  };

  // Project list management
  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: 'New Cloud Project',
      description: 'Full-stack application with real-time updates and clean design.',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      url: 'https://github.com',
    };
    setFormData((prev) => ({ ...prev, projects: [...(prev.projects || []), newProj] }));
  };

  const handleRemoveProject = (projId) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((p) => p.id !== projId),
    }));
  };

  // Resume upload handling
  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Invalid format', 'Please upload a PDF, DOC, or DOCX document.');
      return;
    }

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    uploadResumeMutation.mutate(
      {
        resumeName: file.name,
        resumeSize: sizeFormatted,
        resumeUrl: URL.createObjectURL(file),
      },
      {
        onSuccess: () => {
          toast.success('Resume updated', 'Your profile resume has been replaced.');
        },
      }
    );
  };

  const handleSaveAllChanges = async () => {
    try {
      const updatedPayload = {
        ...formData,
        fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      };
      await updateProfileMutation.mutateAsync(updatedPayload);
      setIsEditing(false);
      toast.success('Profile updated', 'Your candidate profile changes have been saved.');
    } catch (err) {
      toast.error('Update failed', err?.message || 'Could not save profile changes.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner with Profile Photo & Headline */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={formData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={formData.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-cyan-400/50 object-cover shadow-xl"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-[10px] text-cyan-300 font-semibold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud className="w-4 h-4 mb-1" />
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFieldChange('profilePhoto', URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  CANDIDATE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-400 font-medium mt-0.5">
                {formData.headline || 'Full Stack Engineer'}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {formData.location || 'San Francisco, CA'} &bull;{' '}
                <Mail className="w-3.5 h-3.5 text-slate-500 ml-1" />
                {formData.email}
              </p>
            </div>
          </div>

          {/* Edit / Save Action Buttons */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Save}
                  isLoading={updateProfileMutation.isPending}
                  onClick={handleSaveAllChanges}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Edit3}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Strength Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-slate-300 font-semibold">
              Profile Completeness: <strong>{formData.completionPercentage || 92}%</strong>
            </span>
          </div>
          <div className="completion-progress-bar h-1.5 w-full sm:w-64">
            <div
              className="completion-progress-fill"
              style={{ width: `${formData.completionPercentage || 92}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid Layout: Main Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Experience, Education, Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Professional Summary & Headline */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-400" />
              Professional Overview
            </h3>

            {isEditing ? (
              <div className="space-y-3">
                <Input
                  label="Professional Headline"
                  value={formData.headline || ''}
                  onChange={(e) => handleFieldChange('headline', e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Current Job Title"
                    value={formData.currentTitle || ''}
                    onChange={(e) => handleFieldChange('currentTitle', e.target.value)}
                    placeholder="e.g. Lead Frontend Architect"
                  />
                  <Input
                    label="Years of Experience"
                    value={formData.yearsOfExperience || ''}
                    onChange={(e) => handleFieldChange('yearsOfExperience', e.target.value)}
                    placeholder="e.g. 5 Years"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Headline</p>
                  <p className="font-semibold text-white mt-1">{formData.headline}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Current Role</p>
                  <p className="font-semibold text-white mt-1">
                    {formData.currentTitle || 'Senior Software Engineer'} &bull; {formData.yearsOfExperience || 5}+ Yrs
                  </p>
                </div>
              </div>
            )}

            {/* Skills Badges */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Skills &amp; Technologies
              </label>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300"
                  >
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-cyan-300 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <form onSubmit={handleAddSkill} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Add a new skill (e.g. GraphQL)..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="glass-input text-xs rounded-xl px-3 py-1.5 flex-1"
                  />
                  <Button type="submit" variant="outline" size="sm" icon={Plus}>
                    Add
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Section 2: Work Experience */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                Work Experience
              </h3>
              {isEditing && (
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddExperience}>
                  Add Position
                </Button>
              )}
            </div>

            <div className="space-y-4">
              {((formData.experience && formData.experience.length > 0)
                ? formData.experience
                : (formData.workExperience || [])
              ).map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 relative"
                >
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-bold text-white text-sm">{exp.title}</h4>
                    <span className="text-slate-400">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-cyan-400">{exp.company}</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Education */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                Education
              </h3>
              {isEditing && (
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddEducation}>
                  Add Education
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {(formData.education || []).map((edu, index) => (
                <div
                  key={edu.id || index}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs relative"
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{edu.degree}</h4>
                    <p className="text-slate-400 mt-0.5">
                      {edu.institution} &bull; {edu.startYear} – {edu.endYear}
                    </p>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Projects */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                Featured Projects
              </h3>
              {isEditing && (
                <Button variant="outline" size="sm" icon={Plus} onClick={handleAddProject}>
                  Add Project
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(formData.projects || []).map((proj, index) => (
                <div
                  key={proj.id || index}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 relative"
                >
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveProject(proj.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <h4 className="font-bold text-white text-xs">{proj.name}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(Array.isArray(proj.technologies)
                      ? proj.technologies
                      : typeof proj.technologies === 'string'
                      ? proj.technologies.split(',').map((t) => t.trim()).filter(Boolean)
                      : []
                    ).map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Resume, Personal Info, Social Links */}
        <div className="space-y-6">
          {/* Resume Management */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Resume Document
            </h3>

            <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-6 h-6 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {formData.resumeName || 'Alex_Rivera_Resume.pdf'}
                  </p>
                  <p className="text-[10px] text-slate-400">{formData.resumeSize || '1.8 MB'}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={formData.resumeUrl || '#'}
                download={formData.resumeName || 'Resume.pdf'}
                className="w-full text-center py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Resume
              </a>

              <label className="w-full text-center py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                <UploadCloud className="w-3.5 h-3.5" />
                Replace Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleResumeFileChange}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 text-center">PDF, DOC, DOCX up to 10MB</p>
          </div>

          {/* Personal Information */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Personal Details
            </h3>

            {isEditing ? (
              <div className="space-y-3">
                <Input
                  label="First Name"
                  value={formData.firstName || ''}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={formData.lastName || ''}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                />
                <Input
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Email</p>
                  <p className="font-semibold text-white mt-0.5">{formData.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Phone</p>
                  <p className="font-semibold text-white mt-0.5">{formData.phone}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase font-bold text-[10px]">Location</p>
                  <p className="font-semibold text-white mt-0.5">{formData.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="glass-card rounded-2xl p-6 border border-white/80 dark:border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Online Presence
            </h3>

            {isEditing ? (
              <div className="space-y-3">
                <Input
                  label="LinkedIn URL"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => handleFieldChange('linkedinUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
                <Input
                  label="GitHub URL"
                  value={formData.githubUrl || ''}
                  onChange={(e) => handleFieldChange('githubUrl', e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Input
                  label="Portfolio Website"
                  value={formData.portfolioUrl || ''}
                  onChange={(e) => handleFieldChange('portfolioUrl', e.target.value)}
                  placeholder="https://myportfolio.dev"
                />
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {formData.linkedinUrl && (
                  <a
                    href={formData.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {formData.githubUrl && (
                  <a
                    href={formData.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Github className="w-4 h-4" /> GitHub
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
                {formData.portfolioUrl && (
                  <a
                    href={formData.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-cyan-400 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <Globe className="w-4 h-4" /> Portfolio
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
