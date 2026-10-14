import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Users,
  UserPlus,
  UserSearch,
  Compass,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Minimize2,
  Maximize2,
  X,
  Play,
  Mail,
  Chrome,
  Smartphone,
  Upload,
  QrCode,
  Download,
  Eye,
  Sliders,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useJobs } from '../../hooks/useJobs.js';
import { ScreenAssessGuide } from './ScreenAssessGuide.js';
import { CandidateSourcingGuide } from './CandidateSourcingGuide.js';

export function QuickStartGuide({
  initialBrand = 'PyjamaHR',
  onJobCreate,
  onTeamInvite,
  onCandidateAdded,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: jobsRes } = useJobs();
  const jobs = jobsRes?.data || [];

  // ==========================================
  // SHARED STATE & BRAND SETTINGS
  // ==========================================
  const [brandName, setBrandName] = useState(() => {
    return localStorage.getItem('hirebridge_guide_brand') || initialBrand;
  });

  const [activeGuideTab, setActiveGuideTab] = useState(() => {
    return localStorage.getItem('hirebridge_guide_active_tab') || 'all';
  });

  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('hirebridge_guide_dismissed') === 'true';
  });

  // ==========================================
  // CARD 1: "YOUR QUICK START GUIDE" STATE
  // ==========================================
  const [quickStartCompleted, setQuickStartCompleted] = useState(() => {
    const saved = localStorage.getItem('hirebridge_guide_completed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    // Default to all 4 completed as shown in user screenshot 1
    return {
      'get-to-know': true,
      'see-how-it-works': true,
      'create-first-job': true,
      'invite-team': true,
    };
  });
  const [openQuickStartStepId, setOpenQuickStartStepId] = useState(null);
  const [isQuickStartMinimized, setIsQuickStartMinimized] = useState(false);

  // Card 1 Modals
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('RECRUITER');
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // ==========================================
  // CARD 2: "SOURCE AND MANAGE CANDIDATES" STATE
  // ==========================================
  const [sourcingCompleted, setSourcingCompleted] = useState(() => {
    const saved = localStorage.getItem('hirebridge_sourcing_completed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    // Default to all 4 completed as shown in user screenshot 2
    return {
      'install-extension': true,
      'import-candidate': true,
      'add-candidate': true,
      'download-mobile': true,
    };
  });
  const [openSourcingStepId, setOpenSourcingStepId] = useState(null);
  const [isSourcingMinimized, setIsSourcingMinimized] = useState(false);

  // Card 2 Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [showImportDemoModal, setShowImportDemoModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileTab, setMobileTab] = useState('ios');
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    source: 'Manual Referral',
    notes: '',
  });
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);

  // ==========================================
  // PERSISTENCE EFFECT
  // ==========================================
  useEffect(() => {
    localStorage.setItem('hirebridge_guide_completed', JSON.stringify(quickStartCompleted));
  }, [quickStartCompleted]);

  useEffect(() => {
    localStorage.setItem('hirebridge_sourcing_completed', JSON.stringify(sourcingCompleted));
  }, [sourcingCompleted]);

  useEffect(() => {
    localStorage.setItem('hirebridge_guide_brand', brandName);
  }, [brandName]);

  useEffect(() => {
    localStorage.setItem('hirebridge_guide_active_tab', activeGuideTab);
  }, [activeGuideTab]);

  useEffect(() => {
    localStorage.setItem('hirebridge_guide_dismissed', isDismissed.toString());
  }, [isDismissed]);

  // ==========================================
  // CARD 1 HANDLERS
  // ==========================================
  const toggleQuickStartStep = (id, e) => {
    if (e) e.stopPropagation();
    setQuickStartCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) toast.success('Step Completed', 'Quick start progress updated.');
      return next;
    });
  };

  const markAllQuickStartComplete = () => {
    setQuickStartCompleted({
      'get-to-know': true,
      'see-how-it-works': true,
      'create-first-job': true,
      'invite-team': true,
    });
    toast.success('All Steps Completed', 'Quick start guide is 100% complete!');
  };

  const resetAllQuickStartSteps = () => {
    setQuickStartCompleted({
      'get-to-know': false,
      'see-how-it-works': false,
      'create-first-job': false,
      'invite-team': false,
    });
    toast.info('Checklist Reset', 'Quick start steps reset.');
  };

  const qsStepKeys = ['get-to-know', 'see-how-it-works', 'create-first-job', 'invite-team'];
  const safeQsCompleted = quickStartCompleted || {};
  const qsCompletedCount = qsStepKeys.filter((k) => safeQsCompleted[k]).length;
  const qsProgressPercent = Math.round((qsCompletedCount / qsStepKeys.length) * 100);
  const qsAllCompleted = qsCompletedCount === qsStepKeys.length;

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmails.trim()) {
      toast.error('Email Required', 'Please enter at least one team email address.');
      return;
    }
    setIsSendingInvite(true);
    setTimeout(() => {
      setIsSendingInvite(false);
      setShowInviteModal(false);
      setInviteEmails('');
      setQuickStartCompleted((prev) => ({ ...prev, 'invite-team': true }));
      toast.success(
        'Invitations Sent',
        `Team invitations have been emailed with the ${inviteRole.toLowerCase()} role.`
      );
      if (onTeamInvite) onTeamInvite();
    }, 700);
  };

  // ==========================================
  // CARD 2 HANDLERS
  // ==========================================
  const toggleSourcingStep = (id, e) => {
    if (e) e.stopPropagation();
    setSourcingCompleted((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) toast.success('Step Completed', 'Candidate sourcing progress updated.');
      return next;
    });
  };

  const markAllSourcingComplete = () => {
    setSourcingCompleted({
      'install-extension': true,
      'import-candidate': true,
      'add-candidate': true,
      'download-mobile': true,
    });
    toast.success('All Steps Completed', 'Candidate sourcing setup is 100% complete!');
  };

  const resetAllSourcingSteps = () => {
    setSourcingCompleted({
      'install-extension': false,
      'import-candidate': false,
      'add-candidate': false,
      'download-mobile': false,
    });
    toast.info('Checklist Reset', 'Candidate sourcing steps reset.');
  };

  const srcStepKeys = ['install-extension', 'import-candidate', 'add-candidate', 'download-mobile'];
  const safeSrcCompleted = sourcingCompleted || {};
  const srcCompletedCount = srcStepKeys.filter((k) => safeSrcCompleted[k]).length;
  const srcProgressPercent = Math.round((srcCompletedCount / srcStepKeys.length) * 100);
  const srcAllCompleted = srcCompletedCount === srcStepKeys.length;

  const handleInstallExtension = () => {
    setExtensionInstalled(true);
    setTimeout(() => {
      setSourcingCompleted((prev) => ({ ...prev, 'install-extension': true }));
      toast.success(
        'Chrome Extension Active',
        `${brandName} Sourcing Extension is ready in your browser toolbar.`
      );
    }, 600);
  };

  const handleSaveCandidate = (e) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.email) {
      toast.error('Required Fields', 'Please enter candidate name and email.');
      return;
    }
    setIsSavingCandidate(true);
    setTimeout(() => {
      setIsSavingCandidate(false);
      setShowAddCandidateModal(false);
      setSourcingCompleted((prev) => ({ ...prev, 'add-candidate': true }));
      toast.success('Candidate Added', `${newCandidate.name} has been added to your pipeline.`);
      if (onCandidateAdded) onCandidateAdded(newCandidate);
      setNewCandidate({
        name: '',
        email: '',
        phone: '',
        role: '',
        source: 'Manual Referral',
        notes: '',
      });
    }, 700);
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Quick start and candidate sourcing guides are hidden</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-brand-400 hover:text-brand-300 font-semibold underline underline-offset-2 transition-colors"
        >
          Restore Onboarding Guides
        </button>
      </div>
    );
  }

  return (
    <section className="mb-6 animate-fade-in" aria-label="Get Started Guide">
      {/* ========================================================= */}
      {/* TOP HEADER: Title on Left, Avatar + Speech Bubble on Right */}
      {/* ========================================================= */}
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Get Started
          </h2>
        </div>

        {/* Floating Guide Avatar with Speech Bubble */}
        <div className="flex items-center gap-3">
          {/* Speech Bubble */}
          <div className="relative hidden sm:flex items-center bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
            <span>get set up with {brandName}. Let&apos;s go!</span>
            {/* Pointer arrow pointing to avatar */}
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white dark:bg-slate-800 border-t border-r border-slate-200 dark:border-white/10 rotate-45 pointer-events-none" />
          </div>

          {/* Avatar Image with Cyan circular backdrop */}
          <div className="relative group cursor-pointer" title={`Guide Assistant for ${brandName}`}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-cyan-400 ring-2 ring-cyan-400/80 shadow-md flex-shrink-0 transition-transform group-hover:scale-105">
              <img
                src="/assets/guide-avatar.jpg"
                alt="Quick Start Guide Assistant"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'font-bold');
                  e.target.parentNode.innerText = 'HR';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* GUIDE SELECTION TABS */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 mb-3.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveGuideTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeGuideTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <span>All Guides</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
              activeGuideTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
            }`}
          >
            3
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('quick-start')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeGuideTab === 'quick-start'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your Quick Start Guide</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('sourcing')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeGuideTab === 'sourcing'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Source and Manage Candidates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveGuideTab('screen-assess')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeGuideTab === 'screen-assess'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
          }`}
        >
          <UserSearch className="w-3.5 h-3.5" />
          <span>Screen and Assess Candidates</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* METHOD 1: CARD 1 — "YOUR QUICK START GUIDE"               */}
      {/* ========================================================= */}
      {(activeGuideTab === 'all' || activeGuideTab === 'quick-start') && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-indigo-200/90 dark:border-white/10 shadow-sm overflow-hidden transition-all mb-4">
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white dark:bg-slate-900/95 border-b border-transparent">
            {/* Left: Star Sparkles Icon + Title */}
            <div className="flex items-center gap-3">
              <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 stroke-[1.8]" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                Your quick start guide
              </h3>
            </div>

            {/* Right: Status text & Actions */}
            <div className="flex items-center gap-3">
              {qsAllCompleted ? (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  All steps completed!
                </span>
              ) : (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {qsCompletedCount} of {qsStepKeys.length} completed
                </span>
              )}

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setBrandName((b) => (b === 'PyjamaHR' ? 'HirebridgeHR' : 'PyjamaHR'))}
                  title={`Switch brand name (Current: ${brandName})`}
                  className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {brandName}
                </button>

                <button
                  type="button"
                  onClick={qsAllCompleted ? resetAllQuickStartSteps : markAllQuickStartComplete}
                  title={qsAllCompleted ? 'Reset checklist' : 'Mark all completed'}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickStartMinimized(!isQuickStartMinimized)}
                  title={isQuickStartMinimized ? 'Expand guide' : 'Minimize guide'}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {isQuickStartMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  title="Dismiss guide"
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar (Green line matching screenshot) */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${qsProgressPercent}%` }}
            />
          </div>

          {/* Checklist Rows */}
          {!isQuickStartMinimized && (
            <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/60">
              {/* ITEM 1: Get to know Brand */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenQuickStartStepId((prev) => (prev === 'get-to-know' ? null : 'get-to-know'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleQuickStartStep('get-to-know', e)}
                      className="focus:outline-none"
                    >
                      {quickStartCompleted['get-to-know'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Get to know {brandName}
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openQuickStartStepId === 'get-to-know' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openQuickStartStepId === 'get-to-know' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Explore your modern applicant tracking system. From AI-assisted resume parsing to candidate pipeline scoring, learn how {brandName} speeds up hiring by 3x.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">⚡ AI Resume Screening</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Automated candidate matching</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">🌐 Job Distribution</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Broadcast across 15+ job boards</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">📊 Kanban Pipeline</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Drag-and-drop candidate stages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        onClick={() => {
                          setShowTourModal(true);
                          setTourStep(0);
                        }}
                      >
                        Start 2-Min Platform Tour
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleQuickStartStep('get-to-know', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {quickStartCompleted['get-to-know'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 2: See how it works */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenQuickStartStepId((prev) => (prev === 'see-how-it-works' ? null : 'see-how-it-works'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleQuickStartStep('see-how-it-works', e)}
                      className="focus:outline-none"
                    >
                      {quickStartCompleted['see-how-it-works'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      See how it works
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openQuickStartStepId === 'see-how-it-works' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openQuickStartStepId === 'see-how-it-works' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Watch candidates transition seamlessly through hiring stages: Sourced &rarr; Screening &rarr; Shortlist &rarr; Interviews &rarr; Offers &rarr; Hires.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 py-1">
                      {['1. Sourced', '2. Screening', '3. Shortlisted', '4. Interview', '5. Offer', '6. Hired'].map((stage, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/40"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Compass}
                        onClick={() => navigate('/applications/pipeline')}
                      >
                        Open Hiring Stages Board
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        icon={Eye}
                        onClick={() => setShowWorkflowModal(true)}
                      >
                        Interactive Pipeline Demo
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleQuickStartStep('see-how-it-works', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {quickStartCompleted['see-how-it-works'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 3: Create your first job */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenQuickStartStepId((prev) => (prev === 'create-first-job' ? null : 'create-first-job'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleQuickStartStep('create-first-job', e)}
                      className="focus:outline-none"
                    >
                      {quickStartCompleted['create-first-job'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Create your first job
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openQuickStartStepId === 'create-first-job' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openQuickStartStepId === 'create-first-job' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Set up your open requisition in minutes. Customize role description, department, location, compensation bracket, and screening questionnaires.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Briefcase}
                        onClick={() => {
                          if (onJobCreate) {
                            onJobCreate();
                          } else {
                            navigate('/jobs/new');
                          }
                        }}
                      >
                        Create Job Now
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleQuickStartStep('create-first-job', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {quickStartCompleted['create-first-job'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 4: Invite your hiring team */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenQuickStartStepId((prev) => (prev === 'invite-team' ? null : 'invite-team'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleQuickStartStep('invite-team', e)}
                      className="focus:outline-none"
                    >
                      {quickStartCompleted['invite-team'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Invite your hiring team
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openQuickStartStepId === 'invite-team' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openQuickStartStepId === 'invite-team' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Collaborate with hiring managers, recruiters, and interviewers. Assign roles and share candidate scorecards and interview feedback in real time.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => setShowInviteModal(true)}
                      >
                        Invite Team Members
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        icon={Users}
                        onClick={() => navigate('/settings')}
                      >
                        Manage Team in Settings
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleQuickStartStep('invite-team', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {quickStartCompleted['invite-team'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* METHOD 2: CARD 2 — "SOURCE AND MANAGE CANDIDATES"         */}
      {/* ========================================================= */}
      {(activeGuideTab === 'all' || activeGuideTab === 'sourcing') && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-indigo-200/90 dark:border-white/10 shadow-sm overflow-hidden transition-all">
          {/* Card Header Bar */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white dark:bg-slate-900/95 border-b border-transparent">
            {/* Left: Outline icon of users with a plus badge + Title */}
            <div className="flex items-center gap-3">
              <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <div className="relative flex items-center">
                  <Users className="w-5 h-5 stroke-[1.8]" />
                  <span className="absolute -bottom-1 -right-1.5 w-3 h-3 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black leading-none">
                    +
                  </span>
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 dark:text-indigo-300">
                Source and manage candidates
              </h3>
            </div>

            {/* Right: Status text & Actions */}
            <div className="flex items-center gap-3">
              {srcAllCompleted ? (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  All steps completed!
                </span>
              ) : (
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {srcCompletedCount} of {srcStepKeys.length} completed
                </span>
              )}

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={srcAllCompleted ? resetAllSourcingSteps : markAllSourcingComplete}
                  title={srcAllCompleted ? 'Reset checklist' : 'Mark all completed'}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsSourcingMinimized(!isSourcingMinimized)}
                  title={isSourcingMinimized ? 'Expand guide' : 'Minimize guide'}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
                >
                  {isSourcingMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar (Green line matching screenshot) */}
          <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${srcProgressPercent}%` }}
            />
          </div>

          {/* Checklist Rows */}
          {!isSourcingMinimized && (
            <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/60">
              {/* ITEM 1: Install our Chrome extension */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenSourcingStepId((prev) => (prev === 'install-extension' ? null : 'install-extension'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleSourcingStep('install-extension', e)}
                      className="focus:outline-none"
                    >
                      {sourcingCompleted['install-extension'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Install our Chrome extension
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openSourcingStepId === 'install-extension' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openSourcingStepId === 'install-extension' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Source candidates directly while browsing LinkedIn, GitHub, AngelList, or Indeed. With one click, extract contact details, work history, and skills straight into your pipeline.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Chrome}
                        onClick={() => setShowExtensionModal(true)}
                      >
                        Install Chrome Extension
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleSourcingStep('install-extension', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {sourcingCompleted['install-extension'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 2: Import your first candidate using our browser extension */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenSourcingStepId((prev) => (prev === 'import-candidate' ? null : 'import-candidate'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleSourcingStep('import-candidate', e)}
                      className="focus:outline-none"
                    >
                      {sourcingCompleted['import-candidate'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Import your first candidate using our browser extension
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openSourcingStepId === 'import-candidate' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openSourcingStepId === 'import-candidate' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Navigate to any public LinkedIn or professional profile and tap the extension icon. The candidate is automatically parsed, duplicate-checked, and added to your selected job requisition.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Sparkles}
                        onClick={() => setShowImportDemoModal(true)}
                      >
                        Watch 1-Minute Extension Demo
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        icon={Users}
                        onClick={() => navigate('/candidates')}
                      >
                        View Candidate Pool
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleSourcingStep('import-candidate', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {sourcingCompleted['import-candidate'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 3: Manually add a candidate */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenSourcingStepId((prev) => (prev === 'add-candidate' ? null : 'add-candidate'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleSourcingStep('add-candidate', e)}
                      className="focus:outline-none"
                    >
                      {sourcingCompleted['add-candidate'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Manually add a candidate
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openSourcingStepId === 'add-candidate' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openSourcingStepId === 'add-candidate' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Have an internal referral, an agency submission, or an offline applicant? Add their details manually or upload a PDF/Word resume to parse immediately.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={UserPlus}
                        onClick={() => setShowAddCandidateModal(true)}
                      >
                        Manually Add Candidate
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        icon={Users}
                        onClick={() => navigate('/candidates')}
                      >
                        All Candidates
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleSourcingStep('add-candidate', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {sourcingCompleted['add-candidate'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ITEM 4: Download mobile app */}
              <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
                <div
                  className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                  onClick={() => setOpenSourcingStepId((prev) => (prev === 'download-mobile' ? null : 'download-mobile'))}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={(e) => toggleSourcingStep('download-mobile', e)}
                      className="focus:outline-none"
                    >
                      {sourcingCompleted['download-mobile'] ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors" />
                      )}
                    </button>
                    <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                      Download mobile app
                    </span>
                  </div>
                  <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {openSourcingStepId === 'download-mobile' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

                {openSourcingStepId === 'download-mobile' && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                    <p className="leading-relaxed">
                      Review incoming applications, grade candidates on scorecards, and approve hiring offers from anywhere on iOS and Android.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Smartphone}
                        onClick={() => setShowMobileModal(true)}
                      >
                        Get Mobile App (iOS &amp; Android)
                      </Button>
                      <button
                        type="button"
                        onClick={(e) => toggleSourcingStep('download-mobile', e)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {sourcingCompleted['download-mobile'] ? 'Mark Incomplete' : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* METHOD 3: CARD 3 — "SCREEN AND ASSESS CANDIDATES"         */}
      {/* ========================================================= */}
      {(activeGuideTab === 'all' || activeGuideTab === 'screen-assess') && (
        <div className={activeGuideTab === 'all' ? 'mt-4 sm:mt-5' : ''}>
          <ScreenAssessGuide initialBrand={brandName} />
        </div>
      )}

      {/* ========================================================= */}
      {/* ALL MODALS (CARD 1 & CARD 2)                              */}
      {/* ========================================================= */}

      {/* MODAL 1: Platform Tour Modal (Card 1) */}
      <Modal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        title={`Get to know ${brandName}`}
        description="A 2-minute tour of core recruiting features"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40">
            {tourStep === 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">Step 1 of 3</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">AI-Powered Resume Matching</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Incoming resumes are automatically parsed and scored against your job criteria. Candidates are ranked with match percentages so your team reviews the strongest talent first.
                </p>
              </div>
            )}
            {tourStep === 1 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">Step 2 of 3</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Multi-Channel Distribution</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Post once, distribute everywhere. Connect directly with LinkedIn, Indeed, Glassdoor, and your branded career site with one-click admin approval queues.
                </p>
              </div>
            )}
            {tourStep === 2 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">Step 3 of 3</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Collaborative Hiring & Offers</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sync Google/Outlook calendars, collect structured interview evaluations, generate offer letters, and onboard selected candidates in seconds.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="glass"
              size="sm"
              disabled={tourStep === 0}
              onClick={() => setTourStep((s) => Math.max(0, s - 1))}
            >
              Previous
            </Button>
            {tourStep < 2 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTourStep((s) => s + 1)}
              >
                Next Step &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowTourModal(false);
                  setQuickStartCompleted((prev) => ({ ...prev, 'get-to-know': true }));
                  toast.success('Tour Completed', `You are ready to recruit on ${brandName}!`);
                }}
              >
                Complete Tour
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Interactive Pipeline Workflow Modal (Card 1) */}
      <Modal
        isOpen={showWorkflowModal}
        onClose={() => setShowWorkflowModal(false)}
        title="Recruitment Pipeline Workflow"
        description="How candidates move from application to signed hire"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">1. Sourced & Applied</p>
              <p className="text-slate-500 dark:text-slate-400">Applications land instantly from job boards, employee referrals, or direct career portal submissions.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">2. AI Screening & Shortlist</p>
              <p className="text-slate-500 dark:text-slate-400">Recruiters review AI scorecards, qualification highlights, and add custom tags.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">3. Interview Rounds</p>
              <p className="text-slate-500 dark:text-slate-400">Automated scheduling links sent to candidates with meeting links and scorecards.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">4. Offer & Onboarding</p>
              <p className="text-slate-500 dark:text-slate-400">Send offer letters, track e-signatures, and hand over to HR onboarding.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowWorkflowModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowWorkflowModal(false);
                setQuickStartCompleted((prev) => ({ ...prev, 'see-how-it-works': true }));
                navigate('/applications/pipeline');
              }}
            >
              Go to Kanban Pipeline
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Invite Team Modal (Card 1) */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Your Hiring Team"
        description="Add teammates to collaborate on job postings and evaluations"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
              Work Email Address(es)
            </label>
            <input
              type="text"
              required
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
              placeholder="e.g. sarah@company.com, alex@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">Separate multiple emails with commas</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="HIRING_MANAGER">Hiring Manager</option>
                <option value="RECRUITER">Recruiter</option>
                <option value="INTERVIEWER">Interviewer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                Department
              </label>
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="People & HR">People & HR</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowInviteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSendingInvite}
              icon={Mail}
            >
              Send Invitations
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Chrome Extension Modal (Card 2) */}
      <Modal
        isOpen={showExtensionModal}
        onClose={() => setShowExtensionModal(false)}
        title="Chrome Web Store Extension"
        description="Talent Clipper & 1-Click Candidate Sourcing"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Chrome className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {brandName} Candidate Sourcing Assistant
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Offered by {brandName} Inc. • ★★★★★ 4.9 (480 ratings) • 12,000+ recruiters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">⚡ LinkedIn &amp; GitHub</p>
              <p className="text-slate-500 dark:text-slate-400">Capture name, email, skills, experience, and education in 1-click.</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
              <p className="font-bold text-slate-900 dark:text-white mb-1">🛡️ Anti-Duplicate Check</p>
              <p className="text-slate-500 dark:text-slate-400">Warns you immediately if a candidate is already active in your ATS.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowExtensionModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Chrome}
              onClick={handleInstallExtension}
            >
              {extensionInstalled ? 'Extension Installed ✓' : 'Add to Chrome'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 5: Extension Demo Walkthrough (Card 2) */}
      <Modal
        isOpen={showImportDemoModal}
        onClose={() => setShowImportDemoModal(false)}
        title="How Candidate Import Works"
        description="Extract and synchronize profiles into your talent pipeline"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-400 ml-2">linkedin.com/in/alex-turner</span>
              </div>
              <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded font-mono">
                {brandName} Active
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                AT
              </div>
              <div>
                <h5 className="font-bold text-sm text-white">Alex Turner</h5>
                <p className="text-xs text-slate-300">Staff Distributed Systems Engineer @ Stripe</p>
                <p className="text-[11px] text-slate-400">San Francisco, CA • Go, Kubernetes, Rust, gRPC</p>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Profile Extracted &amp; Enriched
              </span>
              <span className="text-slate-400">Matches 94% with Staff Backend Role</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowImportDemoModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShowImportDemoModal(false);
                setSourcingCompleted((prev) => ({ ...prev, 'import-candidate': true }));
                navigate('/candidates');
                toast.success('Demo Complete', 'You can now view imported talent in your candidate database.');
              }}
            >
              Go to Candidate Database &rarr;
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 6: Manually Add Candidate (Card 2) */}
      <Modal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        title="Manually Add a Candidate"
        description="Enter applicant information or attach a resume"
      >
        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={newCandidate.name}
                onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                placeholder="e.g. Jessica Morales"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={newCandidate.email}
                onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                placeholder="jessica.m@example.com"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Target Role
              </label>
              <select
                value={newCandidate.role}
                onChange={(e) => setNewCandidate({ ...newCandidate, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="">Select an open job...</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.title}>
                    {j.title} ({j.department})
                  </option>
                ))}
                <option value="Senior Full Stack Engineer">Senior Full Stack Engineer</option>
                <option value="Lead Product Designer">Lead Product Designer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Sourcing Channel
              </label>
              <select
                value={newCandidate.source}
                onChange={(e) => setNewCandidate({ ...newCandidate, source: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="Employee Referral">Employee Referral</option>
                <option value="Direct Outreach">Direct Outreach</option>
                <option value="Agency Sourced">Agency Sourced</option>
                <option value="Career Fair / Event">Career Fair / Event</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Resume Document (PDF, DOCX)
            </label>
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/15 text-center bg-slate-50/50 dark:bg-white/5 hover:border-brand-500 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Click or drag &amp; drop candidate resume
              </p>
              <p className="text-[10px] text-slate-400">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowAddCandidateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSavingCandidate}
              icon={UserPlus}
            >
              Add Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 7: Mobile App Download (Card 2) */}
      <Modal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
        title="Download Mobile App"
        description="Recruit on the move with iOS & Android apps"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
            <button
              type="button"
              onClick={() => setMobileTab('ios')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mobileTab === 'ios'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Apple iOS (App Store)
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('android')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mobileTab === 'android'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Android (Google Play)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center">
              <QrCode className="w-20 h-20 text-slate-900" />
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase">Scan QR Code</span>
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                {mobileTab === 'ios' ? `${brandName} for iPhone & iPad` : `${brandName} for Android`}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive real-time push alerts when candidates apply, conduct on-the-spot scorecard reviews, and send offer approval replies in seconds.
              </p>
              <div className="pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => {
                    setSourcingCompleted((prev) => ({ ...prev, 'download-mobile': true }));
                    toast.success('Mobile App Download Link', 'Download link simulated for your device.');
                    setShowMobileModal(false);
                  }}
                >
                  {mobileTab === 'ios' ? 'Open in App Store' : 'Open in Google Play'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setShowMobileModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export { CandidateSourcingGuide } from './CandidateSourcingGuide.js';
export { ScreenAssessGuide } from './ScreenAssessGuide.js';
