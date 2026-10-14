import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserSearch,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  Star,
  FileCheck2,
  Mail,
  RotateCcw,
  Minimize2,
  Maximize2,
  X,
  Clock,
  Video,
  ThumbsUp,
  ThumbsDown,
  CalendarCheck,
  Send,
  Sparkles,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useCandidates } from '../../hooks/useCandidates.js';

export function ScreenAssessGuide({
  initialBrand = 'PyjamaHR',
  showHeader = false,
  onInterviewScheduled,
  onFeedbackAdded,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: candRes } = useCandidates();
  const candidates = candRes?.data || [];

  const [brandName] = useState(() => {
    return localStorage.getItem('hirebridge_guide_brand') || initialBrand;
  });

  // Load saved state or default to 3/4 completed matching user screenshot
  const [completedSteps, setCompletedSteps] = useState(() => {
    const saved = localStorage.getItem('hirebridge_screen_assess_completed');
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
    // Step 1, 2, 3 completed; Step 4 incomplete ("1 step left · About 2 min")
    return {
      'schedule-interview': true,
      'add-feedback': true,
      'send-test': true,
      'integrate-calendar': false,
    };
  });

  const [openStepId, setOpenStepId] = useState(null);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('hirebridge_screen_assess_dismissed') === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(false);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  // Interview Form State
  const [interviewForm, setInterviewForm] = useState({
    candidateName: 'Alexander Wright',
    roundType: 'TECHNICAL',
    dateTime: '2026-10-15T14:00',
    interviewer: 'David Chen',
    meetingLink: 'https://meet.google.com/hbg-rec-meet',
  });
  const [isScheduling, setIsScheduling] = useState(false);

  // Feedback Form State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackRecommendation, setFeedbackRecommendation] = useState('STRONG_HIRE');
  const [feedbackNotes, setFeedbackNotes] = useState('Excellent problem solving, deep domain knowledge in distributed systems.');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Test Form State
  const [selectedTest, setSelectedTest] = useState('Senior Full-Stack Engineering Assessment');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Integration State
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('hirebridge_screen_assess_completed', JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem('hirebridge_screen_assess_dismissed', isDismissed.toString());
  }, [isDismissed]);

  const toggleStep = (id, e) => {
    if (e) e.stopPropagation();
    setCompletedSteps((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const nowComplete = next[id];
      if (nowComplete) {
        toast.success('Step Completed', 'Candidate assessment progress updated.');
      }
      return next;
    });
  };

  const toggleAccordion = (id) => {
    setOpenStepId((prev) => (prev === id ? null : id));
  };

  const markAllComplete = () => {
    const all = {
      'schedule-interview': true,
      'add-feedback': true,
      'send-test': true,
      'integrate-calendar': true,
    };
    setCompletedSteps(all);
    toast.success('All Steps Completed', 'Screen and assess candidates setup is 100% complete!');
  };

  const resetAllSteps = () => {
    const none = {
      'schedule-interview': false,
      'add-feedback': false,
      'send-test': false,
      'integrate-calendar': false,
    };
    setCompletedSteps(none);
    toast.info('Checklist Reset', 'Screen and assess candidate steps reset.');
  };

  const stepKeys = ['schedule-interview', 'add-feedback', 'send-test', 'integrate-calendar'];
  const safeCompletedSteps = completedSteps || {};
  const completedCount = stepKeys.filter((k) => safeCompletedSteps[k]).length;
  const totalCount = stepKeys.length;
  const stepsLeft = totalCount - completedCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  // Handler: Schedule Interview
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setIsScheduling(true);
    setTimeout(() => {
      setIsScheduling(false);
      setShowScheduleModal(false);
      setCompletedSteps((prev) => ({ ...prev, 'schedule-interview': true }));
      toast.success(
        'Interview Scheduled',
        `${interviewForm.roundType} interview with ${interviewForm.candidateName} confirmed.`
      );
      if (onInterviewScheduled) onInterviewScheduled(interviewForm);
    }, 600);
  };

  // Handler: Submit Feedback
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setTimeout(() => {
      setIsSubmittingFeedback(false);
      setShowFeedbackModal(false);
      setCompletedSteps((prev) => ({ ...prev, 'add-feedback': true }));
      toast.success('Feedback Recorded', 'Scorecard evaluation saved to candidate profile.');
      if (onFeedbackAdded) onFeedbackAdded();
    }, 600);
  };

  // Handler: Send Test
  const handleSendTestSubmit = (e) => {
    e.preventDefault();
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      setShowTestModal(false);
      setCompletedSteps((prev) => ({ ...prev, 'send-test': true }));
      toast.success('Assessment Sent', `Candidate test "${selectedTest}" has been emailed.`);
    }, 600);
  };

  // Handler: Connect Calendar
  const handleConnectGoogle = () => {
    setGoogleConnected(true);
    setCompletedSteps((prev) => ({ ...prev, 'integrate-calendar': true }));
    toast.success('Google Workspace Connected', 'Two-way calendar & email synchronization is active.');
  };

  const handleConnectOutlook = () => {
    setOutlookConnected(true);
    setCompletedSteps((prev) => ({ ...prev, 'integrate-calendar': true }));
    toast.success('Microsoft 365 Connected', 'Outlook calendar & email synchronization is active.');
  };

  if (isDismissed) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <UserSearch className="w-4 h-4 text-indigo-400" />
          <span>Screen &amp; assess candidates guide is hidden ({completedCount}/{totalCount} steps completed)</span>
        </div>
        <button
          onClick={() => setIsDismissed(false)}
          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors"
        >
          Restore Assessment Guide
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" aria-label="Screen and Assess Candidates Guide">
      {showHeader && (
        <div className="mb-3">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Screen &amp; Assess Candidates
          </h2>
        </div>
      )}

      {/* Guide Card Container */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-indigo-200/90 dark:border-white/10 shadow-sm overflow-hidden transition-all">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-white dark:bg-slate-900/95 border-b border-transparent">
          {/* Left: UserSearch Icon + Title */}
          <div className="flex items-center gap-3">
            <div className="text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UserSearch className="w-5 h-5 stroke-[1.8]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100">
              Screen and assess candidates
            </h3>
          </div>

          {/* Right: Status text & Actions */}
          <div className="flex items-center gap-3">
            {allCompleted ? (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                All steps completed!
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {stepsLeft} {stepsLeft === 1 ? 'step' : 'steps'} left &middot; About {stepsLeft * 2} min
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

        {/* Progress Bar (Matching screenshot: 75% green line, remaining track light grey) */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist Rows (if not minimized) */}
        {!isMinimized && (
          <div className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/60">
            {/* ITEM 1: Schedule an interview with a candidate */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('schedule-interview')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('schedule-interview', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['schedule-interview'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['schedule-interview'] ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-400 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold">
                        1
                      </div>
                    )}
                  </button>
                  <span
                    className={`text-sm sm:text-base ${
                      completedSteps['schedule-interview']
                        ? 'font-medium text-slate-700 dark:text-slate-300'
                        : 'font-bold text-slate-900 dark:text-white'
                    }`}
                  >
                    Schedule an interview with a candidate
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                  {openStepId === 'schedule-interview' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'schedule-interview' && (
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Set up 1-on-1 or panel interview rounds. Sync interviewer availability, auto-generate Google Meet or Zoom video links, and send instant calendar invitations to candidates.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Calendar}
                      onClick={() => setShowScheduleModal(true)}
                    >
                      Schedule Interview Now
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      icon={Clock}
                      onClick={() => navigate('/interviews')}
                    >
                      View Interviews Calendar
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => toggleStep('schedule-interview', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['schedule-interview'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 2: Add your first candidate feedback */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('add-feedback')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('add-feedback', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['add-feedback'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['add-feedback'] ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-400 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold">
                        2
                      </div>
                    )}
                  </button>
                  <span
                    className={`text-sm sm:text-base ${
                      completedSteps['add-feedback']
                        ? 'font-medium text-slate-700 dark:text-slate-300'
                        : 'font-bold text-slate-900 dark:text-white'
                    }`}
                  >
                    Add your first candidate feedback
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                  {openStepId === 'add-feedback' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'add-feedback' && (
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Evaluate candidates using structured hiring scorecards. Rate key skills, tag communication &amp; culture alignment, and submit hiring recommendations.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Star}
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      Submit Candidate Scorecard
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => toggleStep('add-feedback', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['add-feedback'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 3: Send your first candidate test */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('send-test')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('send-test', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['send-test'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['send-test'] ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-400 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold">
                        3
                      </div>
                    )}
                  </button>
                  <span
                    className={`text-sm sm:text-base ${
                      completedSteps['send-test']
                        ? 'font-medium text-slate-700 dark:text-slate-300'
                        : 'font-bold text-slate-900 dark:text-white'
                    }`}
                  >
                    Send your first candidate test
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                  {openStepId === 'send-test' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'send-test' && (
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Validate technical skills early. Dispatch skill assessments, coding assignments, or case studies with automated grading and anti-plagiarism protection.
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={FileCheck2}
                      onClick={() => setShowTestModal(true)}
                    >
                      Dispatch Candidate Test
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => toggleStep('send-test', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['send-test'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ITEM 4: Integrate your email and calendar (Step 4 from screenshot) */}
            <div className="transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5">
              <div
                className="flex items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none group"
                onClick={() => toggleAccordion('integrate-calendar')}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={(e) => toggleStep('integrate-calendar', e)}
                    className="focus:outline-none"
                    aria-label="Toggle completed"
                    title={completedSteps['integrate-calendar'] ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {completedSteps['integrate-calendar'] ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-400 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-semibold">
                        4
                      </div>
                    )}
                  </button>
                  <span
                    className={`text-sm sm:text-base ${
                      completedSteps['integrate-calendar']
                        ? 'font-medium text-slate-700 dark:text-slate-300'
                        : 'font-bold text-slate-900 dark:text-white'
                    }`}
                  >
                    Integrate your email and calendar
                  </span>
                </div>
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                  {openStepId === 'integrate-calendar' ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>

              {/* Accordion Detail Panel */}
              {openStepId === 'integrate-calendar' && (
                <div className="px-5 sm:px-6 pb-5 pt-1 pl-12 text-sm text-slate-600 dark:text-slate-300 space-y-3 animate-fade-in">
                  <p className="leading-relaxed">
                    Connect Google Calendar or Microsoft Outlook for automatic interviewer free/busy detection, seamless invite dispatching, and email candidate threading.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xs">
                          G
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Google Workspace</p>
                          <p className="text-[11px] text-slate-400">Gmail &amp; Google Calendar</p>
                        </div>
                      </div>
                      <Button
                        variant={googleConnected ? 'glass' : 'primary'}
                        size="sm"
                        onClick={handleConnectGoogle}
                      >
                        {googleConnected ? 'Connected ✓' : 'Connect'}
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                          M
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">Microsoft 365</p>
                          <p className="text-[11px] text-slate-400">Outlook &amp; MS Teams</p>
                        </div>
                      </div>
                      <Button
                        variant={outlookConnected ? 'glass' : 'primary'}
                        size="sm"
                        onClick={handleConnectOutlook}
                      >
                        {outlookConnected ? 'Connected ✓' : 'Connect'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="glass"
                      size="sm"
                      icon={CalendarCheck}
                      onClick={() => setShowIntegrationModal(true)}
                    >
                      Manage All Integrations
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => toggleStep('integrate-calendar', e)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {completedSteps['integrate-calendar'] ? 'Mark Incomplete' : 'Mark as Completed'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Interview Round"
        description="Select candidate, round type, and interviewer"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Candidate
              </label>
              <select
                value={interviewForm.candidateName}
                onChange={(e) => setInterviewForm({ ...interviewForm, candidateName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="Alexander Wright">Alexander Wright (Senior Full Stack Engineer)</option>
                <option value="Priya Sharma">Priya Sharma (Lead Product Designer)</option>
                <option value="Chloe Tremblay">Chloe Tremblay (Senior DevOps Engineer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Interview Round
              </label>
              <select
                value={interviewForm.roundType}
                onChange={(e) => setInterviewForm({ ...interviewForm, roundType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="INITIAL_SCREEN">Initial Recruiter Screen (30m)</option>
                <option value="TECHNICAL">Technical Deep Dive (60m)</option>
                <option value="SYSTEM_DESIGN">System Design &amp; Architecture (60m)</option>
                <option value="HIRING_MANAGER">Hiring Manager Round (45m)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={interviewForm.dateTime}
                onChange={(e) => setInterviewForm({ ...interviewForm, dateTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                Interviewer(s)
              </label>
              <select
                value={interviewForm.interviewer}
                onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="David Chen">David Chen (Staff Engineer)</option>
                <option value="Elena Rostova">Elena Rostova (Lead Recruiter)</option>
                <option value="Sarah Connor">Sarah Connor (Engineering Director)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isScheduling}
              icon={Calendar}
            >
              Confirm &amp; Send Invite
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Scorecard Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Candidate Interview Scorecard"
        description="Structured evaluation for Alexander Wright"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className={`p-2 rounded-xl border transition-all ${
                    star <= feedbackRating
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                      : 'border-slate-200 dark:border-white/10 text-slate-400'
                  }`}
                >
                  <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-500' : ''}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                {feedbackRating}/5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Hiring Recommendation
            </label>
            <select
              value={feedbackRecommendation}
              onChange={(e) => setFeedbackRecommendation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              <option value="STRONG_HIRE">Strong Hire (High Priority)</option>
              <option value="HIRE">Hire (Meets All Standards)</option>
              <option value="LEAN_HIRE">Lean Hire</option>
              <option value="NO_HIRE">No Hire</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
              Feedback Notes &amp; Observations
            </label>
            <textarea
              rows={3}
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Candidate demonstrated clean architectural thinking..."
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowFeedbackModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmittingFeedback}
              icon={ThumbsUp}
            >
              Submit Scorecard
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Send Candidate Test Modal */}
      <Modal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        title="Send Assessment Challenge"
        description="Select pre-employment challenge to email candidate"
      >
        <form onSubmit={handleSendTestSubmit} className="space-y-4">
          <div className="space-y-2">
            {[
              {
                title: 'Senior Full-Stack Engineering Assessment',
                time: '90 mins',
                tags: 'React, Node, Postgres, System Design',
              },
              {
                title: 'Product Design & UX Figma Challenge',
                time: '60 mins',
                tags: 'Design System, Flow Optimization, Wireframing',
              },
              {
                title: 'DevOps & Cloud Infrastructure Test',
                time: '45 mins',
                tags: 'Kubernetes, Terraform, AWS, Docker',
              },
            ].map((test, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTest === test.title
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="assessment"
                  checked={selectedTest === test.title}
                  onChange={() => setSelectedTest(test.title)}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs">{test.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{test.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{test.tags}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowTestModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSendingTest}
              icon={Send}
            >
              Send Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Integrations Modal */}
      <Modal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        title="Email & Calendar Integrations"
        description="Connect company calendars and email providers"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Google Calendar Sync</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${googleConnected ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-600'}`}>
                {googleConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronizes scheduled interviews with interviewer calendars and creates Google Meet links automatically.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-white">Microsoft Outlook 365</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${outlookConnected ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-slate-200 text-slate-600'}`}>
                {outlookConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Integrates with Microsoft Teams for interview video rooms and Outlook calendar availability.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setGoogleConnected(true);
                setCompletedSteps((prev) => ({ ...prev, 'integrate-calendar': true }));
                setShowIntegrationModal(false);
                toast.success('Calendar Connected', 'Two-way calendar sync is now active.');
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
