import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Gift,
  Check,
  ArrowRight,
  Clock,
  MessageSquare,
  Copy,
  AtSign,
  Send,
  HelpCircle,
  Award,
  Video
} from 'lucide-react';
import { Button } from './Button.js';
import { calculateAIMatchScore } from '../utils/aiMatcher.js';
import { activityService } from '../utils/activityService.js';
import { aiResumeParser } from '../utils/aiResumeParser.js';
import { CandidateChatModal } from './CandidateChatModal.js';
import { VideoScreeningModal } from './VideoScreeningModal.js';
import { AssessmentReferenceModal } from './AssessmentReferenceModal.js';
import './CandidateDrawer.css';

export function CandidateDrawer({
  isOpen,
  onClose,
  candidate,
  job,
  onUpdateStage,
  onScheduleInterview,
  onExtendOffer
}) {
  if (!isOpen || !candidate) return null;

  const {
    id,
    name,
    email,
    phone,
    avatar,
    location,
    experienceYears = 4,
    skills = ['Product Strategy', 'Analytics', 'SQL'],
    stage = 'APPLIED',
    appliedDate,
    screeningAnswers = []
  } = candidate;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'questions' | 'timeline' | 'notes'
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [copiedQuestionIdx, setCopiedQuestionIdx] = useState(null);

  // Phase 11, 13, 14 modal states
  const [showChatModal, setShowChatModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAssessModal, setShowAssessModal] = useState(false);

  // Load activities on open
  useEffect(() => {
    if (id) {
      setActivities(activityService.getCandidateActivities(id));
    }
  }, [id, activeTab]);

  const jobSkills = job?.skills || ['Product Strategy', 'Analytics', 'Agile', 'SQL'];
  const jobExpLevel = job?.experienceLevel || 'Mid Level';

  // Run AI matching engine (Phase 2)
  const aiResult = calculateAIMatchScore({
    candidateSkills: skills,
    jobSkills,
    candidateExperience: experienceYears,
    jobExperienceLevel: jobExpLevel,
    screeningAnswers,
    screeningQuestions: job?.screeningQuestions || []
  });

  // Run AI Resume Parser & Question Generator (Phase 9)
  const parsedResume = aiResumeParser.parseCandidateResume(candidate, job);
  const tailoredQuestions = aiResumeParser.generateTailoredQuestions(candidate, job);

  // Handle posting recruiter team note with @mentions (Phase 7)
  const handlePostNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    activityService.logCandidateActivity(id, {
      type: 'NOTE',
      actor: 'Elena Rostova (Recruiter)',
      title: 'Internal Team Note Added',
      description: newNote
    });

    setActivities(activityService.getCandidateActivities(id));
    setNewNote('');
  };

  const insertMention = (colleagueName) => {
    setNewNote(prev => `${prev} @${colleagueName} `);
  };

  const handleCopyQuestion = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIdx(idx);
    setTimeout(() => setCopiedQuestionIdx(null), 2000);
  };

  return (
    <div className="ats-drawer-overlay" onClick={onClose}>
      <div className="ats-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-drawer-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center overflow-hidden shrink-0">
              {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{name}</h3>
              <span className="text-[11px] text-slate-400">
                Applied for {job?.title || 'Open Requisition'} • {appliedDate || 'Recent'}
              </span>
            </div>
          </div>

          <button type="button" className="ats-modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-4 bg-slate-50 overflow-x-auto">
          <button
            type="button"
            className={`ats-drawer-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile & AI Fit
          </button>
          <button
            type="button"
            className={`ats-drawer-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            AI Questions & Resume
          </button>
          <button
            type="button"
            className={`ats-drawer-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Activity Timeline
          </button>
          <button
            type="button"
            className={`ats-drawer-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            Team Notes (@mentions)
          </button>
        </div>

        {/* Body */}
        <div className="ats-drawer-body flex-1 overflow-y-auto">
          {activeTab === 'profile' && (
            <>
              {/* AI Score & Intelligence Card */}
              <div className="ats-ai-card">
                <div className="ats-ai-header">
                  <span className="ats-ai-badge">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    AI Candidate Match
                  </span>
                  <span className="ats-ai-score-pill">{aiResult.score}% Fit</span>
                </div>

                <div className="ats-ai-bullets">
                  {aiResult.highlights.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Contact & Details */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{experienceYears} Years Exp</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{location || 'San Francisco, CA'}</span>
                </div>
              </div>

              {/* Engagement & Screening Actions (Phases 11, 13, 14) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShowChatModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Chat / SMS
                </button>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs border border-violet-200 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  AI Video Screen
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssessModal(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  Tests & References
                </button>
              </div>

              {/* Skills Breakdown */}
              <div className="ats-skills-grid">
                <div className="ats-skills-box">
                  <span className="ats-skills-title text-emerald-700">
                    Matched Skills ({aiResult.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.matchedSkills.map((s) => (
                      <span key={s} className="ats-skill-tag ats-skill-matched">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="ats-skills-box">
                  <span className="ats-skills-title text-rose-700">
                    Missing / Unlisted ({aiResult.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {aiResult.missingSkills.length > 0 ? (
                      aiResult.missingSkills.map((s) => (
                        <span key={s} className="ats-skill-tag ats-skill-missing">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">All required matched!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Scheduled Interview Card */}
              {candidate.interview && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      Scheduled: {candidate.interview.roundType || 'Interview'}
                    </span>
                    <span className="text-[10px] text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                      {candidate.interview.duration}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    📅 {candidate.interview.date} at {candidate.interview.time} with <strong>{candidate.interview.interviewerName}</strong>
                  </div>
                  {candidate.interview.meetingUrl && (
                    <div className="font-mono text-[11px] text-indigo-700 truncate pt-1">
                      🔗 <a href={candidate.interview.meetingUrl} target="_blank" rel="noreferrer" className="underline hover:text-indigo-900">
                        {candidate.interview.meetingUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Formal Offer Card */}
              {candidate.offer && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-emerald-600" />
                      Formal Offer Extended
                    </span>
                    <span className="text-emerald-700 font-mono font-bold">
                      {candidate.offer.currency} {candidate.offer.salary}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Proposed Start: <strong>{candidate.offer.startDate}</strong> • Expiry: <strong>{candidate.offer.deadline}</strong>
                  </div>
                </div>
              )}

              {/* Stage Transition Buttons */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pipeline Stage: <span className="text-indigo-600">{stage}</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['CONTACTED', 'INTERVIEW', 'OFFERED', 'HIRED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                        stage === st
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                      onClick={() => onUpdateStage && onUpdateStage(id, st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {/* AI Tailored Interview Questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI Tailored Interview Questions
                  </h4>
                  <span className="text-[10px] text-slate-400">Tailored to CV & role gaps</span>
                </div>

                <div className="space-y-2.5">
                  {tailoredQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          {q.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyQuestion(q.question, idx)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                        >
                          {copiedQuestionIdx === idx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          {copiedQuestionIdx === idx ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-slate-800 font-semibold leading-relaxed">
                        "{q.question}"
                      </p>
                      <p className="text-[10px] text-slate-500 italic">
                        Evaluation focus: {q.focus}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parsed Resume History */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Deep Resume Extraction
                </h4>
                <div className="space-y-3 text-xs">
                  {parsedResume.workHistory.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{w.role}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{w.period}</span>
                      </div>
                      <span className="text-indigo-600 font-medium">{w.company}</span>
                      <ul className="list-disc list-inside text-slate-600 text-[11px] pt-1 space-y-0.5">
                        {w.highlights.map((h, hi) => (
                          <li key={hi}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                Chronological Candidate Audit Trail
              </h4>

              <div className="pt-1">
                {activities.map((act) => (
                  <div key={act.id} className="ats-timeline-item">
                    <div className="ats-timeline-dot" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{act.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">By: {act.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Post Note Form */}
              <form onSubmit={handlePostNote} className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Post Team Evaluation Note
                </label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Leave recruiter feedback, interview thoughts, or tag a colleague with @..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                />

                {/* Quick Mention Pills */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                    <AtSign className="w-3 h-3" /> Quick Tag:
                  </span>
                  {['Marcus', 'Elena', 'David', 'Naveen'].map((colleague) => (
                    <button
                      key={colleague}
                      type="button"
                      onClick={() => insertMention(colleague)}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"
                    >
                      @{colleague}
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" icon={Send} disabled={!newNote.trim()}>
                    Post Internal Note
                  </Button>
                </div>
              </form>

              {/* Notes Stream */}
              <div className="space-y-2.5 pt-2 border-t border-slate-200">
                <h5 className="text-[11px] font-bold uppercase text-slate-500">Recruiter Notes Feed</h5>
                {activities.filter(a => a.type === 'NOTE').length > 0 ? (
                  activities.filter(a => a.type === 'NOTE').map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-800">{note.actor}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{note.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No notes posted for this candidate yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="ats-drawer-footer">
          <Button
            variant="ghost"
            size="sm"
            icon={MessageSquare}
            onClick={() => setShowChatModal(true)}
          >
            Chat
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Calendar}
            onClick={() => {
              if (onScheduleInterview) onScheduleInterview(candidate);
            }}
          >
            Schedule Interview
          </Button>

          <Button
            variant="success"
            size="sm"
            icon={Gift}
            onClick={() => {
              if (onExtendOffer) onExtendOffer(candidate);
            }}
          >
            Extend Offer
          </Button>
        </div>
      </div>

      {/* Two-Way Chat & Multi-Channel Alerts Modal (Phase 11) */}
      <CandidateChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        candidate={candidate}
      />

      {/* AI Video Screening & Speech Transcription Modal (Phase 13) */}
      <VideoScreeningModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        candidate={candidate}
        onScreeningSaved={() => {
          setActivities(activityService.getCandidateActivities(id));
        }}
      />

      {/* Skill Assessments & Automated References Modal (Phase 14) */}
      <AssessmentReferenceModal
        isOpen={showAssessModal}
        onClose={() => setShowAssessModal(false)}
        candidate={candidate}
      />
    </div>
  );
}

export default CandidateDrawer;
