import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Chrome,
  Smartphone,
  Plus,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Minimize2,
  Maximize2,
  X,
  Upload,
  QrCode,
  Download,
  Share2,
  FileText,
  Search,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useJobs } from '../../hooks/useJobs.js';

export function CandidateSourcingGuide({
  initialBrand = 'PyjamaHR',
  showHeader = false,
  onCandidateAdded,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: jobsRes } = useJobs();
  const jobs = jobsRes?.data || [];

  const [brandName] = useState(() => {
    return localStorage.getItem('hirebridge_guide_brand') || initialBrand;
  });

  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem('hirebridge_sourcing_completed');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    // Default to all 4 completed as shown in user screenshot
    return {
      'install-extension': true,
      'import-candidate': true,
      'add-candidate': true,
      'download-mobile': true,
    };
  });

  const [openStepId, setOpenStepId] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('hirebridge_sourcing_dismissed') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);

  // Modals
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [showImportDemoModal, setShowImportDemoModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileTab, setMobileTab] = useState('ios');

  // Manual Candidate Form State
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    source: 'Manual Referral',
    notes: '',
  });
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);

  // Save state
  useEffect(() => {
    localStorage.setItem('hirebridge_sourcing_completed', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('hirebridge_sourcing_dismissed', isDismissed.toString());
  }, [isDismissed]);

  const toggleStep = (id, e) => {
    if (e) e.stopPropagation();
    setCompletedSteps((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const nowComplete = next[id];
      if (nowComplete) {
        toast.success('Step Completed', 'Candidate sourcing progress updated.');
      }
      return next;
    });
  };

  const toggleAccordion = (id) => {
    setOpenStepId((prev) => (prev === id ? null : id));
  };

  const markAllComplete = () => {
    const all = {
      'install-extension': true,
      'import-candidate': true,
      'add-candidate': true,
      'download-mobile': true,
    };
    setCompletedSteps(all);
    toast.success('All Steps Completed', 'Candidate sourcing setup is fully complete!');
  };

  const resetAllSteps = () => {
    const none = {
      'install-extension': false,
      'import-candidate': false,
      'add-candidate': false,
      'download-mobile': false,
    };
    setCompletedSteps(none);
    toast.info('Checklist Reset', 'Candidate sourcing steps reset.');
  };

  const stepKeys = ['install-extension', 'import-candidate', 'add-candidate', 'download-mobile'];
  const safeCompletedSteps = completedSteps || {};
  const completedCount = stepKeys.filter((k) => safeCompletedSteps[k]).length;
  const totalCount = stepKeys.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Simulate extension install
  const handleInstallExtension = () => {
    setExtensionInstalled(true);
    setTimeout(() => {
      setCompletedSteps((prev) => ({ ...prev, 'install-extension': true }));
      toast.success(
        'Chrome Extension Active',
        `${brandName} Sourcing Extension is ready in your browser toolbar.`
      );
    }, 600);
  };

  // Submit manual candidate
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
      setCompletedSteps((prev) => ({ ...prev, 'add-candidate': true }));
      toast.success(
        'Candidate Added',
        `${newCandidate.name} has been added to your talent pipeline.`
      );
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
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-indigo-400" />
          <span>Candidate sourcing guide is hidden ({completedCount}/{totalCount} steps completed)</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
        >
          Restore Sourcing Guide
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" aria-label="Candidate Sourcing Guide">
      {showHeader && (
        <div className="mb-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Source &amp; Manage Candidates
          </h2>
        </div>
      )}

      {/* Guide Card Container */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-indigo-200/90 dark:border-white/10 shadow-sm overflow-hidden transition-all">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white dark:bg-slate-900/95 border-b border-transparent">
          {/* Left: UserPlus Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {/* Silhouette users with plus icon */}
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
            {allCompleted ? (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                All steps completed!
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {completedCount} of {totalCount} completed
              </span>
            )}

            {/* Quick Action Menu: Reset / Complete All / Minimize */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={allCompleted ? resetAllSteps : markAllComplete}
                title={allCompleted ? 'Reset checklist' : 'Mark all completed'}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand guide' : 'Minimize guide'}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
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
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Rows (if not minimized) */}
        {!isMinimized && (
          <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/60">
            {/* ITEM 1: Install our Chrome extension */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('install-extension')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('install-extension', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['install-extension'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['install-extension'] ? (
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
                  {openStepId === 'install-extension' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'install-extension' && (
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
                      onClick={(e) => toggleStep('install-extension', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['install-extension'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 2: Import your first candidate using our browser extension */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('import-candidate')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('import-candidate', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['import-candidate'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['import-candidate'] ? (
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
                  {openStepId === 'import-candidate' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'import-candidate' && (
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
                      onClick={(e) => toggleStep('import-candidate', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['import-candidate'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 3: Manually add a candidate */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('add-candidate')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('add-candidate', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['add-candidate'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['add-candidate'] ? (
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
                  {openStepId === 'add-candidate' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'add-candidate' && (
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Have an internal referral, an agency submission, or an offline applicant? Add their details manually or upload a PDF/Word resume to parse immediately.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
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
                      onClick={(e) => toggleStep('add-candidate', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['add-candidate'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 4: Download mobile app */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('download-mobile')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('download-mobile', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['download-mobile'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['download-mobile'] ? (
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
                  {openStepId === 'download-mobile' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'download-mobile' && (
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
                      onClick={(e) => toggleStep('download-mobile', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['download-mobile'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Chrome Extension Modal */}
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

      {/* MODAL 2: Extension Demo Walkthrough */}
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
                setCompletedSteps((prev) => ({ ...prev, 'import-candidate': true }));
                navigate('/candidates');
                toast.success('Demo Complete', 'You can now view imported talent in your candidate database.');
              }}
            >
              Go to Candidate Database &rarr;
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Manually Add Candidate */}
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

          {/* Resume Upload Drag Drop Box */}
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
              icon={Plus}
            >
              Add Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Mobile App Download */}
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
                    setCompletedSteps((prev) => ({ ...prev, 'download-mobile': true }));
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
    </div>
  );
}
