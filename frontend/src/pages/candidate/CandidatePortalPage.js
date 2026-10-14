import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  Gift,
  Building,
  Video,
  FileText,
  PenTool,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Download,
  Award,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { getStoredCandidates, saveCandidates, updateCandidateStage } from '../../data/Candidates.js';
import { getStoredJobs } from '../../data/Jobs.js';
import { activityService } from '../../utils/activityService.js';
import { Button } from '../../components/Button.js';
import { CandidateChatModal } from '../../components/CandidateChatModal.js';
import { VideoScreeningModal } from '../../components/VideoScreeningModal.js';
import { AssessmentReferenceModal } from '../../components/AssessmentReferenceModal.js';
import './CandidatePortalPage.css';

export function CandidatePortalPage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [job, setJob] = useState(null);

  // E-Signature state
  const [sigMode, setSigMode] = useState('type'); // 'type' | 'draw'
  const [typedSig, setTypedSig] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  // Interactive self-service modals
  const [showChatModal, setShowChatModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAssessModal, setShowAssessModal] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const allCands = getStoredCandidates() || [];
    const found = allCands.find(c => c.id === id) || allCands[0];
    setCandidate(found);

    if (found) {
      setTypedSig(found.name || '');
      const allJobs = getStoredJobs() || [];
      const foundJob = allJobs.find(j => j.id === found.jobId || j.jobId === found.jobId) || allJobs[0];
      setJob(foundJob);

      if (found.stage === 'HIRED' || found.signatureData) {
        setSignedSuccess(true);
      }
    }
  }, [id]);

  // Stepper calculations
  const stages = [
    { key: 'APPLIED', label: 'Application Submitted' },
    { key: 'CONTACTED', label: 'Recruiter Screening' },
    { key: 'INTERVIEW', label: 'Technical Rounds' },
    { key: 'OFFERED', label: 'Formal Offer' },
    { key: 'HIRED', label: 'Onboarded & Placed' },
  ];

  const currentStageIndex = stages.findIndex(s => s.key === candidate?.stage) !== -1
    ? stages.findIndex(s => s.key === candidate?.stage)
    : 0;

  // Drawing signature handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Submit Digital Signature & Accept Offer
  const handleAcceptOffer = (e) => {
    e.preventDefault();
    if (!agreed || !candidate) return;

    setIsSigning(true);

    setTimeout(() => {
      // 1. Advance candidate to HIRED
      updateCandidateStage(candidate.id, 'HIRED');

      const signatureData = {
        signedBy: typedSig || candidate.name,
        signedAt: new Date().toISOString(),
        method: sigMode === 'type' ? 'Cryptographic Type Sign' : 'Digital Draw Stroke',
        ipAddress: '127.0.0.1 (Verified Candidate Session)'
      };

      // 2. Attach signature to candidate
      const list = getStoredCandidates();
      const idx = list.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          stage: 'HIRED',
          signatureData,
          tags: Array.from(new Set([...(list[idx].tags || []), 'Offer Signed ✓']))
        };
        saveCandidates(list);
        setCandidate(list[idx]);
      }

      // 3. Log event to timeline
      activityService.logCandidateActivity(candidate.id, {
        type: 'STAGE_MOVE',
        actor: candidate.name,
        title: 'Offer Digitally Accepted & Signed',
        description: `Candidate digitally executed the employment agreement on ${new Date().toLocaleDateString()}. Status moved to HIRED.`
      });

      setIsSigning(false);
      setSignedSuccess(true);
    }, 600);
  };

  if (!candidate) {
    return (
      <div className="ats-portal-container items-center text-center">
        <p className="text-sm text-slate-400">Loading Candidate Portal...</p>
      </div>
    );
  }

  return (
    <div className="ats-portal-container selection:bg-brand-500/30 selection:text-brand-200">
      <div className="ats-portal-card animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand font-bold text-lg">
              {candidate.avatar ? (
                <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                candidate.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">{candidate.name}</h1>
              <p className="text-xs text-slate-400">
                Application: <span className="text-brand-300 font-semibold">{job?.title || candidate.jobTitle}</span> &bull; {job?.company || 'Apex Global Tech'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200 border border-white/15">
              Ref #{candidate.id}
            </span>
            <Link to="/">
              <Button variant="ghost" size="sm">
                Jobs Home
              </Button>
            </Link>
          </div>
        </div>

        {/* 5-Stage Live Recruitment Stepper */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Application Progress Tracker
          </h3>
          <div className="ats-portal-stepper">
            {stages.map((st, idx) => {
              const isPassed = idx < currentStageIndex || signedSuccess;
              const isCurrent = idx === currentStageIndex && !signedSuccess;
              return (
                <div key={st.key} className="ats-step-item">
                  <div
                    className={`ats-step-pill ${
                      isPassed ? 'completed' : isCurrent ? 'active' : 'pending'
                    }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-semibold leading-tight ${
                      isPassed || isCurrent ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Candidate Interactive Suite (Phases 11, 13, 14) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-brand-400 font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
                <span>Recruiter Messaging</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct two-way chat and multi-channel SMS updates with your hiring team.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowChatModal(true)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 font-semibold text-xs border border-brand-500/30 transition-colors cursor-pointer"
            >
              Open Recruiter Chat
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                <Video className="w-4 h-4" />
                <span>Async Video Screening</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Record your 60-second video response for AI speech transcription.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 font-semibold text-xs border border-violet-500/30 transition-colors cursor-pointer"
            >
              Start Video Screening
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>Skill Quiz & References</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Complete technical verification quizzes and submit manager endorsements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAssessModal(true)}
              className="mt-3 w-full py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-colors cursor-pointer"
            >
              Take Quiz / Add Refs
            </button>
          </div>
        </div>

        {/* Scheduled Interview Card (if active) */}
        {candidate.interview && (
          <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Scheduled: {candidate.interview.roundType || 'Technical Interview'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Lead Interviewer: {candidate.interview.interviewerName}
                  </span>
                </div>
              </div>

              {candidate.interview.meetingUrl && (
                <a
                  href={candidate.interview.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-brand transition-all"
                >
                  <Video className="w-4 h-4" />
                  Join Video Session
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-white/5">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                <span className="font-semibold text-white">{candidate.interview.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Time & Duration</span>
                <span className="font-semibold text-white">{candidate.interview.time} ({candidate.interview.duration})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Format</span>
                <span className="font-semibold text-white">{candidate.interview.platform || 'Google Meet'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formal Offer & Digital E-Signature Section */}
        {candidate.offer && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Formal Offer of Employment Extended
                    </h3>
                    <p className="text-xs text-slate-400">
                      From {job?.company || 'Apex Global Tech'} &bull; Valid Until {candidate.offer.deadline}
                    </p>
                  </div>
                </div>

                <span className="font-mono text-base font-extrabold text-emerald-400">
                  {candidate.offer.currency} {candidate.offer.salary}
                </span>
              </div>

              {/* Offer Terms */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-white/10">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Proposed Start</span>
                  <span className="font-semibold text-white">{candidate.offer.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Acceptance Deadline</span>
                  <span className="font-semibold text-rose-300">{candidate.offer.deadline}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized By</span>
                  <span className="font-semibold text-white">{candidate.offer.signatory || 'Elena Rostova'}</span>
                </div>
              </div>
            </div>

            {/* Signed Confirmation OR Digital E-Signature Pad */}
            {signedSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Employment Agreement Executed!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Congratulations! You have digitally accepted and executed your formal offer with {job?.company || 'Apex Global Tech'}. Our onboarding team will send your welcome pack and workspace details shortly.
                </p>
                <div className="pt-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Digitally Authorized: {candidate.signatureData?.signedBy} on {new Date(candidate.signatureData?.signedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAcceptOffer} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-brand-400" />
                    Digital Signature & Formal Acceptance
                  </h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSigMode('type')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sigMode === 'type' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Type Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSigMode('draw')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        sigMode === 'draw' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Draw Signature
                    </button>
                  </div>
                </div>

                {sigMode === 'type' ? (
                  <div>
                    <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                      Legal Full Name (Cryptographic Signature)
                    </label>
                    <input
                      type="text"
                      value={typedSig}
                      onChange={(e) => setTypedSig(e.target.value)}
                      placeholder="Type your full legal name..."
                      className="glass-input w-full rounded-xl p-3 text-sm font-serif italic text-brand-200"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs text-slate-300 font-medium">Draw Signature Below</label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[10px] text-slate-400 hover:text-rose-400"
                      >
                        Clear Canvas
                      </button>
                    </div>
                    <div className="ats-signature-canvas-box">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        className="w-full cursor-crosshair"
                      />
                    </div>
                  </div>
                )}

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-brand-500 focus:ring-brand-400"
                    required
                  />
                  <span>
                    I hereby accept the position of <strong>{job?.title || candidate.jobTitle}</strong> with all stipulated terms and compensation. I acknowledge that my electronic signature holds full legal validity under applicable digital transaction legislation.
                  </span>
                </label>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSigning}
                    disabled={!agreed}
                    icon={ShieldCheck}
                  >
                    Accept & Digitally Execute Offer
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Two-Way Chat & SMS Modal */}
      <CandidateChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        candidate={candidate}
      />

      {/* AI Video Screening & Speech Transcription Modal */}
      <VideoScreeningModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        candidate={candidate}
      />

      {/* Skill Assessments & Automated References Modal */}
      <AssessmentReferenceModal
        isOpen={showAssessModal}
        onClose={() => setShowAssessModal(false)}
        candidate={candidate}
      />
    </div>
  );
}

export default CandidatePortalPage;
