import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Copy,
  Check,
  Send,
  Building,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { emailService } from '../utils/emailService.js';
import { updateCandidateStage, getStoredCandidates, saveCandidates } from '../data/Candidates.js';
import { teamMembersList } from '../data/TeamMembers.js';
import './InterviewScheduleModal.css';

export function InterviewScheduleModal({
  isOpen,
  onClose,
  candidate,
  job,
  onScheduled
}) {
  if (!isOpen || !candidate) return null;

  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [roundType, setRoundType] = useState('Technical Assessment');
  const [platform, setPlatform] = useState('Google Meet');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [date, setDate] = useState(defaultDate());
  const [time, setTime] = useState('11:00 AM');
  const [duration, setDuration] = useState('45 min');
  const [interviewer, setInterviewer] = useState('Elena Rostova');
  const [notes, setNotes] = useState(
    'Please prepare to discuss your past projects, architectural decisions, and bring any questions about our product roadmap.'
  );
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate meeting link when platform changes
  useEffect(() => {
    const randomSlug = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    if (platform === 'Google Meet') {
      setMeetingUrl(`https://meet.google.com/hbg-${randomSlug}`);
    } else if (platform === 'Zoom') {
      const zoomId = Math.floor(1000000000 + Math.random() * 9000000000);
      setMeetingUrl(`https://zoom.us/j/${zoomId}?pwd=hbg${randomSlug.substring(0, 4)}`);
    } else if (platform === 'Microsoft Teams') {
      setMeetingUrl(`https://teams.microsoft.com/l/meetup-join/hbg-${randomSlug}`);
    } else {
      setMeetingUrl('Headquarters Conference Room A, Level 4');
    }
  }, [platform]);

  const handleCopyLink = () => {
    if (meetingUrl) {
      navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const interviewData = {
      roundType,
      platform,
      meetingUrl,
      date,
      time,
      duration,
      interviewerName: interviewer,
      notes,
      scheduledAt: new Date().toISOString()
    };

    // 1. Advance candidate stage to INTERVIEW
    updateCandidateStage(candidate.id, 'INTERVIEW');

    // 2. Attach interview data to candidate
    try {
      const cands = getStoredCandidates();
      const idx = cands.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        cands[idx] = {
          ...cands[idx],
          stage: 'INTERVIEW',
          interview: interviewData,
          tags: Array.from(new Set([...(cands[idx].tags || []), roundType]))
        };
        saveCandidates(cands);
      }
    } catch (e) {
      console.error('Failed to attach interview to candidate:', e);
    }

    // 3. Trigger transactional email
    emailService.sendInterviewInvitation({
      candidateName: candidate.name,
      candidateEmail: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      jobTitle: job?.title || candidate.jobTitle || 'Product Manager',
      company: job?.company || job?.client || 'Apex Global Tech',
      date,
      time,
      duration,
      meetUrl: meetingUrl,
      interviewerName: interviewer
    });

    setTimeout(() => {
      setIsSubmitting(false);
      if (onScheduled) {
        onScheduled({
          candidateId: candidate.id,
          interview: interviewData
        });
      }
      onClose();
    }, 400);
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-interview-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Interview</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-700">{candidate.name}</strong> • {job?.title || candidate.jobTitle || 'Requisition'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ats-modal-close-btn text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleScheduleSubmit}>
          <div className="ats-modal-body p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Round & Platform Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Select
                label="Interview Round"
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                options={[
                  { label: 'Screening Call (Recruiter)', value: 'Screening Call' },
                  { label: 'Technical Assessment', value: 'Technical Assessment' },
                  { label: 'System Design / Architecture', value: 'System Design' },
                  { label: 'Leadership & Behavioral', value: 'Leadership & Behavioral' },
                  { label: 'Final Executive Fit', value: 'Final Executive Fit' },
                ]}
              />

              <Select
                label="Video Platform / Location"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                options={[
                  { label: 'Google Meet', value: 'Google Meet' },
                  { label: 'Zoom Video', value: 'Zoom' },
                  { label: 'Microsoft Teams', value: 'Microsoft Teams' },
                  { label: 'Onsite / In-Person Office', value: 'Onsite' },
                ]}
              />
            </div>

            {/* Generated Meeting Link Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Meeting Link / Room ID</span>
                <span className="text-[10px] text-indigo-600 font-normal">Auto-generated</span>
              </label>
              <div className="ats-meet-url-box flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 truncate text-xs text-slate-700 font-mono">
                  <Video className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{meetingUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-2 py-1 rounded text-[11px] font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center gap-1 shrink-0 ml-2 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Date, Time, Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Time *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 11:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                  required
                />
              </div>

              <Select
                label="Duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                options={[
                  { label: '30 Minutes', value: '30 min' },
                  { label: '45 Minutes', value: '45 min' },
                  { label: '60 Minutes', value: '60 min' },
                  { label: '90 Minutes', value: '90 min' },
                ]}
              />
            </div>

            {/* Assign Interviewer */}
            <Select
              label="Lead Interviewer"
              value={interviewer}
              onChange={(e) => setInterviewer(e.target.value)}
              options={teamMembersList.map((tm) => ({
                label: `${tm.name} (${tm.role})`,
                value: tm.name,
              }))}
            />

            {/* Agenda & Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instructions / Notes for Candidate
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                placeholder="Details or preparation tips..."
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
            <span className="text-[11px] text-slate-500">
              Candidate will receive automated invite email.
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
                icon={Send}
              >
                Send Invitation & Schedule
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterviewScheduleModal;
