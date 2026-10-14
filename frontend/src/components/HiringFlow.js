import React, { useState } from 'react';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Palette,
  Check
} from 'lucide-react';
import { CandidateCard } from './CandidateCard.js';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { CandidateDrawer } from './CandidateDrawer.js';
import { InterviewScheduleModal } from './InterviewScheduleModal.js';
import { OfferLetterModal } from './OfferLetterModal.js';
import { initialHiringStages } from '../data/HiringStages.js';
import { getStoredCandidates, addCandidate, updateCandidateStage, deleteCandidate } from '../data/Candidates.js';
import { getStoredJobs } from '../data/Jobs.js';
import './HiringFlow.css';

const STAGE_COLORS = [
  '#6366F1', // Indigo
  '#0EA5E9', // Sky
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#EF4444', // Red
  '#14B8A6'  // Teal
];

export function HiringFlow({
  stages: customStages,
  onStagesChange,
  jobId,
  className = ''
}) {
  const [stages, setStages] = useState(customStages || initialHiringStages);
  const [candidates, setCandidates] = useState(() => getStoredCandidates());

  // Candidate Inspection & Action Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [offerCandidate, setOfferCandidate] = useState(null);

  // Retrieve matching job for context
  const currentJob = React.useMemo(() => {
    const all = getStoredJobs() || [];
    return all.find(j => j.id === jobId || j.jobId === jobId) || all[0];
  }, [jobId]);

  // Stage editing modal state
  const [editingStage, setEditingStage] = useState(null);
  const [stageForm, setStageForm] = useState({ title: '', color: '#6366F1' });
  const [isAddingStage, setIsAddingStage] = useState(false);

  // Quick add candidate modal state
  const [quickAddStage, setQuickAddStage] = useState(null);
  const [candName, setCandName] = useState('');
  const [candEmail, setCandEmail] = useState('');

  const syncStages = (newStages) => {
    setStages(newStages);
    if (onStagesChange) onStagesChange(newStages);
  };

  // Reorder stages: move left
  const handleMoveStageLeft = (index) => {
    if (index === 0) return;
    const reordered = [...stages];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    syncStages(reordered);
  };

  // Reorder stages: move right
  const handleMoveStageRight = (index) => {
    if (index === stages.length - 1) return;
    const reordered = [...stages];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    syncStages(reordered);
  };

  // Move candidate between stages
  const handleMoveCandidate = (candId, newStageKey) => {
    updateCandidateStage(candId, newStageKey);
    setCandidates(getStoredCandidates());
  };

  // Delete candidate
  const handleDeleteCand = (candId) => {
    deleteCandidate(candId);
    setCandidates(getStoredCandidates());
  };

  // Open Edit Stage
  const handleOpenEditStage = (stage) => {
    setEditingStage(stage);
    setStageForm({ title: stage.title, color: stage.color || '#6366F1' });
    setIsAddingStage(false);
  };

  // Open Add Stage
  const handleOpenAddStage = () => {
    setEditingStage(null);
    setStageForm({ title: '', color: '#6366F1' });
    setIsAddingStage(true);
  };

  // Save Stage (Create or Update)
  const handleSaveStage = (e) => {
    e.preventDefault();
    if (!stageForm.title.trim()) return;

    if (isAddingStage) {
      const newKey = stageForm.title.trim().toUpperCase().replace(/\s+/g, '_');
      const newStageObj = {
        id: newKey,
        key: newKey,
        title: stageForm.title.trim(),
        color: stageForm.color,
        description: `Custom stage for ${stageForm.title}`
      };
      syncStages([...stages, newStageObj]);
    } else if (editingStage) {
      const updated = stages.map((s) =>
        s.id === editingStage.id || s.key === editingStage.key
          ? { ...s, title: stageForm.title.trim(), color: stageForm.color }
          : s
      );
      syncStages(updated);
    }

    setEditingStage(null);
    setIsAddingStage(false);
  };

  // Delete Stage
  const handleDeleteStage = (stageToDelete) => {
    if (stages.length <= 2) {
      alert('Pipeline must have at least 2 stages.');
      return;
    }
    if (window.confirm(`Delete stage "${stageToDelete.title}"?`)) {
      const updated = stages.filter(
        (s) => s.id !== stageToDelete.id && s.key !== stageToDelete.key
      );
      syncStages(updated);
      setEditingStage(null);
    }
  };

  // Quick Add Candidate Submit
  const handleQuickAddCandidate = (e) => {
    e.preventDefault();
    if (!candName.trim() || !candEmail.trim()) return;

    addCandidate({
      name: candName.trim(),
      email: candEmail.trim(),
      stage: quickAddStage.key || quickAddStage.id,
      jobId: jobId || '142850',
      jobTitle: 'Product Manager'
    });

    setCandidates(getStoredCandidates());
    setQuickAddStage(null);
    setCandName('');
    setCandEmail('');
  };

  return (
    <div className={`ats-flow-container ${className}`}>
      <div className="ats-flow-header">
        <div className="ats-flow-title-group">
          <h3 className="ats-flow-title">Hiring Pipeline Flow</h3>
          <span className="ats-flow-subtitle">
            Configure recruitment stages, reorder steps, and manage candidate progression
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleOpenAddStage}
        >
          Add Stage
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="ats-kanban-board">
        {stages.map((st, index) => {
          const stageKey = st.key || st.id;
          const stageCandidates = candidates.filter((c) => c.stage === stageKey);

          return (
            <div key={stageKey} className="ats-kanban-column">
              {/* Column Header */}
              <div className="ats-kanban-col-header">
                <div className="ats-kanban-col-title-area">
                  <span
                    className="ats-kanban-dot"
                    style={{ backgroundColor: st.color || '#6366F1' }}
                  />
                  <span className="ats-kanban-col-title">{st.title}</span>
                  <span className="ats-kanban-col-count">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="ats-kanban-col-controls">
                  <button
                    type="button"
                    className="ats-kanban-ctrl-btn"
                    title="Move left"
                    disabled={index === 0}
                    onClick={() => handleMoveStageLeft(index)}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="ats-kanban-ctrl-btn"
                    title="Move right"
                    disabled={index === stages.length - 1}
                    onClick={() => handleMoveStageRight(index)}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    className="ats-kanban-ctrl-btn"
                    title="Edit stage"
                    onClick={() => handleOpenEditStage(st)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Candidate Cards List */}
              <div className="ats-kanban-cards-list">
                {stageCandidates.length > 0 ? (
                  stageCandidates.map((cand) => (
                    <CandidateCard
                      key={cand.id}
                      candidate={cand}
                      stages={stages}
                      onMoveStage={handleMoveCandidate}
                      onDelete={handleDeleteCand}
                      onSelect={(c) => setSelectedCandidate(c)}
                      onSchedule={(c) => setInterviewCandidate(c)}
                      onOffer={(c) => setOfferCandidate(c)}
                    />
                  ))
                ) : (
                  <div className="ats-kanban-empty">
                    No candidates in this stage
                  </div>
                )}
              </div>

              {/* Quick Add Candidate */}
              <button
                type="button"
                className="ats-kanban-add-cand-btn"
                onClick={() => setQuickAddStage(st)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Candidate</span>
              </button>
            </div>
          );
        })}

        {/* Add Stage Column CTA */}
        <div className="ats-kanban-add-stage-col" onClick={handleOpenAddStage}>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-700">Add New Stage</span>
          <span className="text-[11px] text-slate-400 text-center">
            Extend your hiring pipeline
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT STAGE                                  */}
      {/* ======================================================== */}
      {(isAddingStage || editingStage) && (
        <div
          className="ats-modal-overlay"
          onClick={() => {
            setIsAddingStage(false);
            setEditingStage(null);
          }}
        >
          <div className="ats-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ats-modal-header">
              <h3 className="ats-modal-title">
                {isAddingStage ? 'Add New Hiring Stage' : `Edit Stage: ${editingStage?.title}`}
              </h3>
              <button
                type="button"
                className="ats-modal-close-btn"
                onClick={() => {
                  setIsAddingStage(false);
                  setEditingStage(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStage}>
              <div className="ats-modal-body">
                <Input
                  label="Stage Name"
                  required
                  placeholder="e.g. Technical Assessment"
                  value={stageForm.title}
                  onChange={(e) => setStageForm({ ...stageForm, title: e.target.value })}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-800">
                    Stage Color Tag
                  </label>
                  <div className="flex items-center gap-2">
                    {STAGE_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ backgroundColor: c }}
                        onClick={() => setStageForm({ ...stageForm, color: c })}
                      >
                        {stageForm.color === c && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ats-modal-footer">
                {!isAddingStage && editingStage && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteStage(editingStage)}
                    className="mr-auto"
                  >
                    Delete Stage
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAddingStage(false);
                    setEditingStage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isAddingStage ? 'Create Stage' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: QUICK ADD CANDIDATE TO STAGE                      */}
      {/* ======================================================== */}
      {quickAddStage && (
        <div className="ats-modal-overlay" onClick={() => setQuickAddStage(null)}>
          <div className="ats-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ats-modal-header">
              <h3 className="ats-modal-title">
                Add Candidate to "{quickAddStage.title}"
              </h3>
              <button
                type="button"
                className="ats-modal-close-btn"
                onClick={() => setQuickAddStage(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCandidate}>
              <div className="ats-modal-body">
                <Input
                  label="Candidate Name"
                  required
                  placeholder="e.g. Jonathan Morris"
                  value={candName}
                  onChange={(e) => setCandName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="e.g. j.morris@example.com"
                  value={candEmail}
                  onChange={(e) => setCandEmail(e.target.value)}
                />
              </div>

              <div className="ats-modal-footer">
                <Button variant="secondary" onClick={() => setQuickAddStage(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add to {quickAddStage.title}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over Candidate Drawer (Phase 2) */}
      <CandidateDrawer
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        job={currentJob}
        onUpdateStage={(candId, newSt) => {
          handleMoveCandidate(candId, newSt);
          if (selectedCandidate && selectedCandidate.id === candId) {
            setSelectedCandidate({ ...selectedCandidate, stage: newSt });
          }
        }}
        onScheduleInterview={(cand) => {
          setInterviewCandidate(cand);
        }}
        onExtendOffer={(cand) => {
          setOfferCandidate(cand);
        }}
      />

      {/* Interview Scheduling Modal (Phase 3) */}
      <InterviewScheduleModal
        isOpen={Boolean(interviewCandidate)}
        onClose={() => setInterviewCandidate(null)}
        candidate={interviewCandidate}
        job={currentJob}
        onScheduled={() => {
          setCandidates(getStoredCandidates());
          if (selectedCandidate && interviewCandidate && selectedCandidate.id === interviewCandidate.id) {
            setSelectedCandidate({ ...selectedCandidate, stage: 'INTERVIEW' });
          }
        }}
      />

      {/* Offer Letter Generator Modal (Phase 4) */}
      <OfferLetterModal
        isOpen={Boolean(offerCandidate)}
        onClose={() => setOfferCandidate(null)}
        candidate={offerCandidate}
        job={currentJob}
        onOfferSent={(res) => {
          setCandidates(getStoredCandidates());
          if (selectedCandidate && offerCandidate && selectedCandidate.id === offerCandidate.id) {
            setSelectedCandidate({ ...selectedCandidate, stage: res.stage || 'OFFERED' });
          }
        }}
      />
    </div>
  );
}

export default HiringFlow;
