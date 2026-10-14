import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  Send,
  Zap,
  ArrowRight,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { agentService } from '../../services/enterprisePlatformService.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { useToast } from '../../context/ToastContext.js';

export function AutonomousRecruiterAgentCard({ candidateId, candidateName = 'Alexander Rivera' }) {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('screening'); // 'screening' | 'scheduling' | 'sequence'
  const [screeningResult, setScreeningResult] = useState(null);
  const [isScreening, setIsScreening] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [dripSequence, setDripSequence] = useState(null);
  const [isNudging, setIsNudging] = useState(false);

  useEffect(() => {
    // Load availability & drip sequence
    agentService.getAvailability().then((res) => {
      if (res.data) setAvailabilitySlots(res.data);
    });
    agentService.getDripSequence(candidateId).then((res) => {
      if (res.data) setDripSequence(res.data);
    });
  }, [candidateId]);

  const handleRunAiScreening = async () => {
    setIsScreening(true);
    try {
      const res = await agentService.screenCandidate({
        candidateId,
        candidateName,
        jobRole: 'Lead Product Architect',
        answers: {
          compensationExpected: '$155,000',
          noticePeriodWeeks: 2,
          willingToRelocate: true,
          workAuthUs: true,
          primaryTechStack: 'React, Node.js, Cloud Architecture, GraphQL',
          yearsOfExperience: 7,
        },
      });
      setScreeningResult(res.data);
      toast.success(
        'Autonomous Screening Complete',
        `${candidateName} evaluated as ${res.data.decision} (${res.data.qualificationScore}/100).`
      );
    } catch (e) {
      toast.error('Screening Error', 'Failed to run autonomous screening.');
    } finally {
      setIsScreening(false);
    }
  };

  const handleConfirmBooking = async (slotId) => {
    setIsBooking(true);
    try {
      const res = await agentService.autoScheduleInterview({
        candidateId,
        candidateName,
        slotId,
        interviewType: 'Autonomous AI Recruiter Technical Loop',
      });
      setBookingConfirmed(res.data);
      toast.success(
        'Interview Confirmed & Calendar Sent',
        `Scheduled for ${res.data.date} at ${res.data.startTime} via ${res.data.platform}.`
      );
    } catch (e) {
      toast.error('Booking Error', 'Could not confirm autonomous calendar booking.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleTriggerNudge = async () => {
    setIsNudging(true);
    try {
      await agentService.triggerNudge({
        candidateId,
        channel: 'WhatsApp & SMS',
        message: `Hi ${candidateName}, your interview slots with Hirebridge are now open. Click to confirm your time slot!`,
      });
      toast.success('Autonomous Nudge Dispatched', 'Follow-up notification sent via SMS & WhatsApp.');
    } catch (e) {
      toast.error('Nudge Error', 'Unable to trigger nudge.');
    } finally {
      setIsNudging(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 border border-white/10 bg-slate-900/60 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-purple">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">Autonomous AI Recruiter Agent (Ava AI)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                ACTIVE 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conversational candidate qualification, 2-way Google/Outlook calendar auto-booking & drip follow-ups.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('screening')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'screening' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Screening
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('scheduling')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'scheduling' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Auto-Scheduling
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sequence')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'sequence' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drip Follow-ups
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AI Screening */}
      {activeSubTab === 'screening' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <h4 className="text-sm font-bold text-white">Autonomous Compensation & Qualification Check</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates work authorization, salary alignment ($140k-$175k band), and notice period.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              isLoading={isScreening}
              onClick={handleRunAiScreening}
            >
              Run Ava AI Screen
            </Button>
          </div>

          {screeningResult && (
            <div className="p-5 rounded-xl bg-brand-950/40 border border-brand-500/30 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Agent Decision:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {screeningResult.decision}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-brand-300">
                  Match Score: {screeningResult.qualificationScore}/100 &bull; Confidence: {screeningResult.agentConfidence}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {screeningResult.conversationalSummary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(screeningResult.keyHighlights || []).map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 p-2 rounded-lg bg-white/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs text-purple-300 font-semibold">
                <span>Recommendation: {screeningResult.actionRecommendation}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => setActiveSubTab('scheduling')}
                >
                  Proceed to Self-Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Auto-Scheduling Calendar */}
      {activeSubTab === 'scheduling' && (
        <div className="space-y-4">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Live Calendar Availability Slots</h4>
              <p className="text-xs text-slate-400">Synced in real-time with Interviewer Google Meet & Outlook 365</p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Free/Busy Synced
            </span>
          </div>

          {bookingConfirmed && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Autonomous Self-Booking Confirmed!
              </div>
              <p className="text-xs text-slate-300">
                Scheduled with <strong className="text-white">{bookingConfirmed.interviewer}</strong> on{' '}
                <strong className="text-white">{bookingConfirmed.date}</strong> at{' '}
                <strong className="text-white">{bookingConfirmed.startTime}</strong>.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <a
                  href={bookingConfirmed.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-400 underline font-mono flex items-center gap-1"
                >
                  <Video className="w-3.5 h-3.5" />
                  Join Room: {bookingConfirmed.meetingLink}
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availabilitySlots.slice(0, 6).map((slot) => (
              <div
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedSlotId === slot.id
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-brand'
                    : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    {slot.date}
                  </span>
                  <span className="text-[10px] text-slate-400">{slot.platform}</span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 my-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {slot.startTime}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {slot.interviewer}
                </div>
                <div className="mt-2 pt-2 border-t border-white/5 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-[11px]"
                    isLoading={isBooking && selectedSlotId === slot.id}
                    onClick={() => handleConfirmBooking(slot.id)}
                  >
                    Confirm Slot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Drip Follow-ups Sequence */}
      {activeSubTab === 'sequence' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h4 className="text-sm font-bold text-white">Autonomous Candidate Engagement Sequence</h4>
              <p className="text-xs text-slate-400">Automated multi-channel nudges (Email, SMS & WhatsApp)</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={BellRing}
              isLoading={isNudging}
              onClick={handleTriggerNudge}
            >
              Trigger Instant Nudge
            </Button>
          </div>

          <div className="space-y-3">
            {(dripSequence?.stages || []).map((stage) => (
              <div
                key={stage.stage}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      stage.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : stage.status === 'DELIVERED'
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {stage.stage}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{stage.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Channel: <strong className="text-slate-300">{stage.channel}</strong> &bull; Schedule: {stage.scheduledOffset}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    stage.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : stage.status === 'DELIVERED'
                      ? 'bg-brand-500/20 text-brand-300'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {stage.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
