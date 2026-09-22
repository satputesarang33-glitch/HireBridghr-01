import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Building,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Globe,
  Compass,
} from 'lucide-react';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Button } from '../../components/ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Step 2: Org Type
    orgType: 'COMPANY',
    // Step 3: Company Info
    companyName: user?.organizationName || 'Apex Global Tech',
    website: 'https://apextech.example.com',
    industry: 'Enterprise Software & Cloud',
    companySize: '100-250',
    country: 'United States',
    city: 'San Francisco',
    timeZone: 'America/Los_Angeles (PST)',
    // Step 4: User Info
    fullName: user?.name || 'Sarah Connor',
    jobTitle: user?.jobTitle || 'Head of Talent Acquisition',
    phone: user?.phone || '+1 (415) 890-1234',
    workEmail: user?.email || 'sarah.connor@apextech.com',
    // Step 5: Recruitment Setup
    hiringVolume: '20-50 hires / year',
    typicalRoles: 'Software Engineers, Product Managers, SREs',
    teamSize: '5-10 Recruiters',
    primaryLocation: 'North America & Remote',
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success('Workspace Ready', 'Your organization settings and recruitment pipeline are active.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-brand-500/30 selection:text-brand-200">
      <div className="liquid-glow-brand -top-24 -left-24 opacity-60" />
      <div className="liquid-glow-accent top-1/2 -right-24 opacity-40" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/10 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold tracking-tight">
            Hirebridge<span className="text-brand-400">HR</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Step {currentStep} of {totalSteps}</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? 'w-6 bg-brand-400' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Wizard Content Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-2xl glass-panel rounded-2xl p-6 sm:p-10 border border-white/15 shadow-glass-lg">
          {/* STEP 1: Welcome */}
          {currentStep === 1 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand mb-6">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
                Welcome to HirebridgeHR
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-8">
                Your high-velocity applicant tracking system and multi-channel job distribution platform. Let&apos;s set up your recruitment environment in just 2 minutes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Compass className="w-5 h-5 text-brand-400 mb-2" />
                  <p className="text-xs font-bold text-white">Visual Pipeline</p>
                  <p className="text-[11px] text-slate-400">Drag-and-drop Kanban tracking from application to offer.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Globe className="w-5 h-5 text-accent-400 mb-2" />
                  <p className="text-xs font-bold text-white">Job Distribution</p>
                  <p className="text-[11px] text-slate-400">Structured admin publication queue and multi-platform reach.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <Users className="w-5 h-5 text-emerald-400 mb-2" />
                  <p className="text-xs font-bold text-white">Team Collaboration</p>
                  <p className="text-[11px] text-slate-400">Real-time candidate scorecards and interview coordination.</p>
                </div>
              </div>
              <Button variant="primary" size="lg" onClick={nextStep} icon={ArrowRight}>
                Begin Organization Setup
              </Button>
            </div>
          )}

          {/* STEP 2: Organization Type */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Select your organization type</h3>
                <p className="text-xs text-slate-400 mt-1">
                  We customize your recruitment workflow based on how you hire.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  {
                    id: 'COMPANY',
                    title: 'Company / Internal HR',
                    desc: 'Hiring directly for your own organization and departments.',
                    icon: Building,
                  },
                  {
                    id: 'AGENCY',
                    title: 'Recruitment Agency',
                    desc: 'Managing clients, candidates, client submissions, and placements.',
                    icon: Briefcase,
                  },
                  {
                    id: 'STAFFING',
                    title: 'Staffing Firm',
                    desc: 'High-volume contractor, temporal, and direct-hire staffing.',
                    icon: Users,
                  },
                  {
                    id: 'STARTUP',
                    title: 'Fast-Growing Startup',
                    desc: 'Rapid scaling with lean hiring teams and founders.',
                    icon: Sparkles,
                  },
                ].map((item) => {
                  const isSelected = formData.orgType === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setFormData({ ...formData, orgType: item.id })}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-400 shadow-glow-brand'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-400' : 'text-slate-400'}`} />
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                      </div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={prevStep} icon={ArrowLeft}>
                  Previous
                </Button>
                <Button variant="primary" size="md" onClick={nextStep} icon={ArrowRight}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Company Information */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Company profile details</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your company information to brand public job listings.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
                <Input
                  label="Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  required
                />
                <Input
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                />
                <Select
                  label="Company Size"
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  options={[
                    { label: '1 - 20 employees', value: '1-20' },
                    { label: '20 - 100 employees', value: '20-100' },
                    { label: '100 - 500 employees', value: '100-500' },
                    { label: '500+ employees', value: '500+' },
                  ]}
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Primary Time Zone"
                    value={formData.timeZone}
                    onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={prevStep} icon={ArrowLeft}>
                  Previous
                </Button>
                <Button variant="primary" size="md" onClick={nextStep} icon={ArrowRight}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: User Information */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Your administrator profile</h3>
                <p className="text-xs text-slate-400 mt-1">
                  How candidate correspondence and internal team notifications will appear.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <Input
                  label="Your Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
                <Input
                  label="Job Title"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
                <Input
                  label="Direct Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  label="Work Email"
                  value={formData.workEmail}
                  disabled
                  helperText="Primary workspace administrative owner email"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={prevStep} icon={ArrowLeft}>
                  Previous
                </Button>
                <Button variant="primary" size="md" onClick={nextStep} icon={ArrowRight}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: Recruitment Setup */}
          {currentStep === 5 && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">Recruitment capacity & goals</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Help us calibrate your hiring funnel metrics and pipeline columns.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <Select
                  label="Estimated Annual Hiring Volume"
                  value={formData.hiringVolume}
                  onChange={(e) => setFormData({ ...formData, hiringVolume: e.target.value })}
                  options={[
                    { label: '1 - 10 hires / year', value: '1-10 hires / year' },
                    { label: '10 - 50 hires / year', value: '10-50 hires / year' },
                    { label: '50 - 200 hires / year', value: '50-200 hires / year' },
                    { label: '200+ hires / year', value: '200+ hires / year' },
                  ]}
                />

                <Input
                  label="Typical Roles Hired"
                  placeholder="e.g. Backend Developers, DevOps, Sales Executives"
                  value={formData.typicalRoles}
                  onChange={(e) => setFormData({ ...formData, typicalRoles: e.target.value })}
                />

                <Select
                  label="Recruitment Team Size"
                  value={formData.teamSize}
                  onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                  options={[
                    { label: 'Solo Recruiter / Founder', value: 'Solo Recruiter / Founder' },
                    { label: '2 - 5 Team Members', value: '2-5 Team Members' },
                    { label: '5 - 15 Team Members', value: '5-15 Team Members' },
                    { label: '15+ Enterprise Team', value: '15+ Enterprise Team' },
                  ]}
                />

                <Input
                  label="Primary Hiring Locations"
                  placeholder="e.g. US, UK, Remote Global"
                  value={formData.primaryLocation}
                  onChange={(e) => setFormData({ ...formData, primaryLocation: e.target.value })}
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button variant="ghost" size="sm" onClick={prevStep} icon={ArrowLeft}>
                  Previous
                </Button>
                <Button variant="primary" size="md" onClick={nextStep} icon={ArrowRight}>
                  Review & Finalize
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: Completion */}
          {currentStep === 6 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6 shadow-glow-brand">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Your HirebridgeHR workspace is ready!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
                We have configured <strong className="text-white">{formData.companyName}</strong> with recruitment pipelines, candidate stages, and job distribution channels.
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-left text-xs max-w-md mx-auto mb-8 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Organization:</span>
                  <span className="font-semibold text-white">{formData.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workspace Type:</span>
                  <span className="font-semibold text-brand-300">{formData.orgType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Recruiter:</span>
                  <span className="font-semibold text-white">{formData.fullName} ({formData.jobTitle})</span>
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={handleComplete} icon={ArrowRight}>
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
