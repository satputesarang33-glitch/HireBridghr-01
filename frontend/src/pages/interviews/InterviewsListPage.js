import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import {
  useInterviews,
  useScheduleInterview,
  useSubmitInterviewFeedback,
} from '../../hooks/useInterviews.js';
import { useCandidates } from '../../hooks/useCandidates.js';
import { useJobs } from '../../hooks/useJobs.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Card } from '../../components/ui/Card.js';
import { Modal } from '../../components/ui/Modal.js';
import { TableSkeleton } from '../../components/ui/Skeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export function InterviewsListPage() {
  const [searchParams] = useSearchParams();
  const prefillCandId = searchParams.get('candidate');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeFeedbackInterview, setActiveFeedbackInterview] = useState(null);

  const { data: intRes, isLoading } = useInterviews({ search, status: statusFilter });
  const { data: candRes } = useCandidates();
  const { data: jobsRes } = useJobs();

  const scheduleMutation = useScheduleInterview();
  const feedbackMutation = useSubmitInterviewFeedback();

  const interviews = intRes?.data || [];
  const candidates = candRes?.data || [];
  const jobs = jobsRes?.data || [];

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    candidateId: prefillCandId || (candidates[0]?.id || 'cand-1'),
    jobId: jobs[0]?.id || 'job-101',
    interviewerName: 'David Chen (VP of Engineering)',
    date: '2026-03-25',
    time: '14:30',
    timeZone: 'PST (UTC-8)',
    type: 'Technical',
    meetingLink: 'https://meet.google.com/hb-recruitment-call',
    notes: 'In-depth distributed systems and database indexing evaluation.',
  });

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    recommendation: 'STRONG_YES',
    strengths: '',
    concerns: '',
    privateNotes: '',
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    const candidate = candidates.find((c) => c.id === scheduleForm.candidateId);
    const job = jobs.find((j) => j.id === scheduleForm.jobId);

    scheduleMutation.mutate(
      {
        ...scheduleForm,
        candidateName: candidate?.name || 'Candidate',
        jobTitle: job?.title || 'Position',
      },
      {
        onSuccess: () => setShowScheduleModal(false),
      }
    );
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!activeFeedbackInterview) return;

    feedbackMutation.mutate(
      {
        id: activeFeedbackInterview.id,
        feedback: feedbackForm,
      },
      {
        onSuccess: () => {
          setActiveFeedbackInterview(null);
          setFeedbackForm({
            rating: 5,
            recommendation: 'STRONG_YES',
            strengths: '',
            concerns: '',
            privateNotes: '',
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Interview Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Coordinate video interviews, sync meeting links, and submit structured feedback scorecards.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowScheduleModal(true)}>
          Schedule New Interview
        </Button>
      </div>

      {/* Filters */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Search candidate, job, interviewer..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Scheduled', value: 'SCHEDULED' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
        </div>
      </div>

      {/* Interviews Grid / List */}
      {isLoading ? (
        <div className="glass-panel rounded-xl border border-white/10">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No interviews scheduled"
          description="There are currently no interviews on the calendar matching your criteria."
          actionLabel="Schedule Interview"
          onAction={() => setShowScheduleModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interviews.map((item) => (
            <Card key={item.id} className="p-5 space-y-4 border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    {item.type} Round
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{item.candidateName}</h3>
                  <p className="text-xs text-brand-400 font-semibold">{item.jobTitle}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {item.date} at {item.time} ({item.timeZone})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Interviewer: <strong>{item.interviewerName}</strong></span>
                </div>
              </div>

              {item.notes && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
                  <strong>Notes:</strong> {item.notes}
                </div>
              )}

              {/* Feedback Record If Completed */}
              {item.feedback && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                      Scorecard: {item.feedback.recommendation}
                    </span>
                    <span className="font-mono text-emerald-400">{item.feedback.rating}/5 Rating</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{item.feedback.strengths}</p>
                </div>
              )}

              {/* Card Action Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500">No meeting link provided</span>
                )}

                {item.status === 'SCHEDULED' && (
                  <Button
                    variant="glass"
                    size="sm"
                    icon={MessageSquare}
                    onClick={() => setActiveFeedbackInterview(item)}
                    className="text-xs"
                  >
                    Submit Scorecard
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Interview Round"
        description="Book calendar meeting and notify hiring managers."
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          <Select
            label="Candidate"
            value={scheduleForm.candidateId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, candidateId: e.target.value })}
            options={candidates.map((c) => ({ label: `${c.name} (${c.email})`, value: c.id }))}
          />

          <Select
            label="Job Requisition"
            value={scheduleForm.jobId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, jobId: e.target.value })}
            options={jobs.map((j) => ({ label: j.title, value: j.id }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
              required
            />
            <Input
              label="Time"
              type="time"
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Interview Type"
              value={scheduleForm.type}
              onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
              options={[
                { label: 'Technical', value: 'Technical' },
                { label: 'Phone Screen', value: 'Phone' },
                { label: 'Video Call', value: 'Video' },
                { label: 'HR / Culture', value: 'HR' },
                { label: 'Managerial', value: 'Managerial' },
                { label: 'Final Panel', value: 'Final' },
              ]}
            />
            <Input
              label="Time Zone"
              value={scheduleForm.timeZone}
              onChange={(e) => setScheduleForm({ ...scheduleForm, timeZone: e.target.value })}
            />
          </div>

          <Input
            label="Meeting Video URL"
            placeholder="https://meet.google.com/..."
            value={scheduleForm.meetingLink}
            onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Interviewer Notes / Instructions
            </label>
            <textarea
              rows={2}
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={scheduleMutation.isPending}>
              Confirm Interview
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Scorecard Modal */}
      <Modal
        isOpen={!!activeFeedbackInterview}
        onClose={() => setActiveFeedbackInterview(null)}
        title={`Interview Scorecard: ${activeFeedbackInterview?.candidateName}`}
        description="Provide comprehensive interviewer evaluation and hiring recommendation."
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Hiring Recommendation"
              value={feedbackForm.recommendation}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
              options={[
                { label: 'Strong Yes (Hire)', value: 'STRONG_YES' },
                { label: 'Yes', value: 'YES' },
                { label: 'Maybe / Borderline', value: 'MAYBE' },
                { label: 'No', value: 'NO' },
                { label: 'Strong No', value: 'STRONG_NO' },
              ]}
            />

            <Select
              label="Overall Rating (1 - 5)"
              value={feedbackForm.rating}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
              options={[
                { label: '5 - Exceptional candidate', value: 5 },
                { label: '4 - Strong competencies', value: 4 },
                { label: '3 - Meets baseline expectations', value: 3 },
                { label: '2 - Below requirements', value: 2 },
                { label: '1 - Major concerns', value: 1 },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Demonstrated Strengths
            </label>
            <textarea
              rows={2}
              placeholder="What did the candidate excel at during the conversation?"
              value={feedbackForm.strengths}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, strengths: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Identified Concerns (if any)
            </label>
            <textarea
              rows={2}
              placeholder="Any gaps or follow-ups needed in future rounds..."
              value={feedbackForm.concerns}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, concerns: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Private Hiring Manager Notes
            </label>
            <textarea
              rows={2}
              placeholder="Confidential notes for the recruitment team..."
              value={feedbackForm.privateNotes}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, privateNotes: e.target.value })}
              className="glass-input w-full rounded-xl p-2.5 text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setActiveFeedbackInterview(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={feedbackMutation.isPending}>
              Submit Scorecard
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
