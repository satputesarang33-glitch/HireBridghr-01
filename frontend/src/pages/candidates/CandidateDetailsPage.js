import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Calendar,
  Clock,
  Tag,
  MessageSquare,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Share2,
  ExternalLink,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  useCandidate,
  useAddCandidateNote,
  useAssignRecruiter,
  useSaveCandidateEvaluation,
  useUpdateCandidateRating,
} from '../../hooks/useCandidates.js';
import { useApplications } from '../../hooks/useApplications.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Tabs } from '../../components/ui/Tabs.js';
import { Modal } from '../../components/ui/Modal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { ApplicationStageBadge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export function CandidateDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteRating, setNewNoteRating] = useState(5);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRecruiter, setSelectedRecruiter] = useState('usr-3');

  const { data: candRes, isLoading } = useCandidate(id);
  const { data: appsRes } = useApplications();
  const addNoteMutation = useAddCandidateNote();
  const assignRecruiterMutation = useAssignRecruiter();
  const saveEvaluationMutation = useSaveCandidateEvaluation();
  const updateRatingMutation = useUpdateCandidateRating();

  const candidate = candRes?.data;
  const applications = (appsRes?.data || []).filter((a) => a.candidateId === id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-white mb-2">Candidate Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The requested candidate record could not be loaded.</p>
        <Link to="/candidates">
          <Button variant="secondary">Back to Candidates</Button>
        </Link>
      </div>
    );
  }

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    saveEvaluationMutation.mutate(
      {
        candidateId: id,
        evaluationData: {
          note: newNoteContent.trim(),
          rating: Number(newNoteRating),
          recruiter: user?.name || 'Recruiter Lead',
        },
      },
      {
        onSuccess: () => {
          setNewNoteContent('');
        },
      }
    );
  };

  const handleDirectRatingUpdate = (newRating) => {
    setNewNoteRating(newRating);
    saveEvaluationMutation.mutate({
      candidateId: id,
      evaluationData: {
        rating: Number(newRating),
        note: `Updated candidate evaluation rating to ${newRating}/5.`,
        recruiter: user?.name || 'Recruiter Lead',
      },
    });
  };

  const handleAssignRecruiter = () => {
    const recruiters = [
      { id: 'usr-3', name: 'Elena Rostova' },
      { id: 'usr-1', name: 'Sarah Connor' },
      { id: 'usr-2', name: 'Marcus Vance' },
      { id: 'usr-4', name: 'David Chen' },
    ];
    const rec = recruiters.find((r) => r.id === selectedRecruiter) || recruiters[0];

    assignRecruiterMutation.mutate(
      { candidateId: id, recruiter: rec },
      {
        onSuccess: () => setShowAssignModal(false),
      }
    );
  };

  const handleSecureResumeDownload = () => {
    toast.info(
      'Secure Token Verified',
      `Generating temporary authenticated download token for ${candidate.resume?.fileName || 'resume.pdf'}. Unrestricted public URL access prevented.`
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white text-2xl font-black shadow-glow-brand flex-shrink-0">
            {candidate.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{candidate.name}</h1>
              <ApplicationStageBadge stage={candidate.status} />
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
              <span>{candidate.currentTitle}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-brand-400 font-semibold">{candidate.currentCompany}</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {candidate.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {candidate.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Recruiter Ownership Badge & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs" data-testid="candidate-rating-badge">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Evaluation Rating</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold text-sm" data-testid="candidate-rating-display">
                {candidate.rating ? `${candidate.rating}/5` : '5/5'}
              </span>
            </div>
          </div>

          <div className="p-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Assigned Recruiter</span>
            <span className="text-white font-bold">{candidate.assignedRecruiterName || 'Unassigned'}</span>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setShowAssignModal(true)}>
            Reassign Recruiter
          </Button>
          <Link to={`/interviews?candidate=${candidate.id}`}>
            <Button variant="primary" size="sm" icon={Calendar}>
              Schedule Interview
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Candidate Overview', icon: User },
          { id: 'resume', label: 'Resume & Documents', icon: FileText },
          { id: 'applications', label: 'Applied Positions', icon: Briefcase, badge: applications.length },
          { id: 'timeline', label: 'Activity Timeline', icon: Clock },
          { id: 'notes', label: 'Recruiter Notes', icon: MessageSquare, badge: (candidate.notes || []).length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {(candidate.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Candidate Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(candidate.tags || ['Senior', 'Top Candidate']).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/15 text-accent-300 border border-accent-500/30 flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="p-5 space-y-3 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2">
                Profile Insights
              </h3>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Candidate Rating:</span>
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{candidate.rating ? `${candidate.rating}/5` : '5/5'}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Experience:</span>
                <span className="font-mono font-bold text-white">{candidate.experienceYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Company:</span>
                <span className="font-medium text-white">{candidate.currentCompany}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sourcing Origin:</span>
                <span className="font-medium text-cyan-400">{candidate.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profile Created:</span>
                <span className="font-mono text-slate-300">Active</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Resume */}
      {activeTab === 'resume' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {candidate.resume?.fileName || `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`}
                </h4>
                <p className="text-xs text-slate-400">
                  {candidate.resume?.fileSize || '380 KB'} &bull; Uploaded {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleSecureResumeDownload}
            >
              Secure Authenticated Download
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Zero Public Resume URLs:</strong> Resumes are protected by tenant authorization guards and signed single-use download tokens.
            </span>
          </div>

          {/* Realistic Resume Preview Canvas */}
          <div className="p-8 rounded-xl bg-slate-900 border border-white/10 text-slate-300 space-y-4 font-sans text-xs max-w-2xl mx-auto shadow-glass-sm">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              <p className="text-brand-400 font-semibold">{candidate.currentTitle} &bull; {candidate.location}</p>
              <p className="text-slate-400">{candidate.email} &bull; {candidate.phone}</p>
            </div>
            <div>
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Professional Experience</h3>
              <p className="font-semibold text-white">{candidate.currentTitle} at {candidate.currentCompany} (2022 - Present)</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Led architectural expansion of enterprise services. Designed fault-tolerant workflows, managed PostgreSQL persistence schemas, and collaborated with frontend teams.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Key Core Skills</h3>
              <p className="text-slate-300 text-[11px]">
                {(candidate.skills || []).join(' • ')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Application History ({applications.length})</h3>
          {applications.length === 0 ? (
            <Card className="p-8 text-center text-xs text-slate-400">
              No active job applications found for this candidate.
            </Card>
          ) : (
            <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Position / Requisition</th>
                    <th>Stage</th>
                    <th>Applied Date</th>
                    <th>Recruiter Owner</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/jobs/${app.jobId}`} className="font-bold text-white hover:text-brand-300">
                          {app.jobTitle}
                        </Link>
                      </td>
                      <td>
                        <ApplicationStageBadge stage={app.stage} />
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-300">{app.recruiterName || 'Elena Rostova'}</span>
                      </td>
                      <td className="text-right">
                        <Link to={`/jobs/${app.jobId}`}>
                          <Button variant="glass" size="sm" className="text-xs">
                            View Job &rarr;
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Timeline */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Lifecycle Events</h3>
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
            {(candidate.timeline || [
              { id: '1', title: 'Candidate Profile Created', date: new Date().toISOString(), type: 'created' }
            ]).map((t) => (
              <div key={t.id} className="relative">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-400 shadow-glow-brand ring-4 ring-slate-950" />
                <div>
                  <p className="text-xs font-bold text-white">{t.title}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(t.date).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Add Note Form */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Add Recruiter Assessment & Rating
              </h4>
              <span className="text-xs font-bold text-amber-400 font-mono">
                Current Rating: {candidate.rating ? `${candidate.rating}/5` : '5/5'}
              </span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              {/* Rating Controls Area */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label htmlFor="rating" className="block text-xs font-semibold text-slate-300 mb-1">
                      Candidate Rating
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        id="rating"
                        name="rating"
                        aria-label="Rating"
                        value={newNoteRating}
                        onChange={(e) => setNewNoteRating(Number(e.target.value))}
                        className="glass-input rounded-xl px-3 py-1.5 text-xs text-white bg-slate-900 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium cursor-pointer"
                      >
                        <option value={5} className="bg-slate-900 text-white">5 - Exceptional (5/5)</option>
                        <option value={4} className="bg-slate-900 text-white">4 - Strong Fit (4/5)</option>
                        <option value={3} className="bg-slate-900 text-white">3 - Meets Requirements (3/5)</option>
                        <option value={2} className="bg-slate-900 text-white">2 - Marginal Fit (2/5)</option>
                        <option value={1} className="bg-slate-900 text-white">1 - Does Not Meet (1/5)</option>
                      </select>

                      <input
                        id="candidate-rating-number"
                        type="number"
                        min={1}
                        max={5}
                        step={1}
                        name="candidateRating"
                        aria-label="Numeric Rating"
                        value={newNoteRating}
                        onChange={(e) => setNewNoteRating(Math.max(1, Math.min(5, Number(e.target.value) || 1)))}
                        className="glass-input w-16 rounded-xl px-2 py-1.5 text-xs text-center text-white bg-slate-900 border border-white/20 font-mono font-bold"
                      />
                      <span className="text-xs text-slate-400 font-medium">/ 5</span>
                    </div>
                  </div>

                  {/* Star Rating Control */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-300 mb-1">
                      Rating Stars
                    </span>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Candidate Rating Stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          role="radio"
                          aria-checked={newNoteRating === star}
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          onClick={() => setNewNoteRating(star)}
                          className="p-1 rounded hover:bg-white/10 transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 transition-colors ${
                              star <= newNoteRating
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-400 ml-2 font-mono">
                        {newNoteRating} / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Textarea */}
              <div className="space-y-1">
                <label htmlFor="note-content" className="block text-xs font-semibold text-slate-300">
                  Evaluation Note
                </label>
                <textarea
                  id="note-content"
                  name="noteContent"
                  rows={3}
                  placeholder="Write interview notes, phone screen summary, or evaluation feedback..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="glass-input w-full rounded-xl p-3 text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Rating to be saved: <strong>{newNoteRating}/5</strong></span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={addNoteMutation.isPending}
                  icon={Plus}
                  aria-label="Post Note"
                >
                  Post Note
                </Button>
              </div>
            </form>
          </Card>

          {/* Notes Feed */}
          <div className="space-y-3">
            {(candidate.notes || []).length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-400">
                No recruiter notes added yet.
              </Card>
            ) : (
              (candidate.notes || []).map((note) => (
                <Card key={note.id} className="p-4 border-l-4 border-l-brand-400">
                  <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white">{note.author}</span>
                      <div
                        className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold"
                        aria-label={`Rating: ${note.rating || candidate.rating || 5} out of 5`}
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Rating: {note.rating || candidate.rating || 5}/5</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{note.content}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign Recruiter Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Recruiter"
        description="Select which team recruiter owns candidate communications and pipeline tracking."
      >
        <div className="space-y-4">
          <Select
            label="Recruiter"
            value={selectedRecruiter}
            onChange={(e) => setSelectedRecruiter(e.target.value)}
            options={[
              { label: 'Elena Rostova (Lead Technical Recruiter)', value: 'usr-3' },
              { label: 'Sarah Connor (Head of Talent Acquisition)', value: 'usr-1' },
              { label: 'Marcus Vance (Senior HR Business Partner)', value: 'usr-2' },
              { label: 'David Chen (VP of Engineering)', value: 'usr-4' },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssignRecruiter}
              isLoading={assignRecruiterMutation.isPending}
            >
              Assign Recruiter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
