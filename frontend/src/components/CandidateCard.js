import React from 'react';
import { Mail, Phone, ArrowRight, ArrowLeft, Trash2, Calendar, Gift, Sparkles } from 'lucide-react';
import './CandidateCard.css';

export function CandidateCard({
  candidate,
  stages = [],
  onMoveStage,
  onDelete,
  onSelect,
  onSchedule,
  onOffer,
  className = ''
}) {
  const {
    id,
    name,
    email,
    phone,
    avatar,
    matchScore,
    rating,
    experienceYears,
    location,
    appliedDate,
    stage,
    skills = [],
    tags = []
  } = candidate;

  const currentStageIndex = stages.findIndex((s) => (s.key || s.id) === stage);

  return (
    <div
      className={`ats-cand-card cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all ${className}`}
      onClick={() => onSelect && onSelect(candidate)}
    >
      <div className="ats-cand-card-header">
        <div className="flex items-center gap-2 min-w-0">
          <div className="ats-cand-avatar">
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              <span>{name ? name.charAt(0) : 'C'}</span>
            )}
          </div>
          <div className="min-w-0">
            <h5 className="ats-cand-name truncate">{name}</h5>
            <span className="text-[11px] text-slate-400">{appliedDate || 'Recent'}</span>
          </div>
        </div>

        {matchScore && (
          <span className="ats-cand-score flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            {matchScore}% match
          </span>
        )}
      </div>

      <div className="ats-cand-details">
        {email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="w-3 h-3 shrink-0 text-slate-400" />
            <span className="truncate">{email}</span>
          </div>
        )}
        {experienceYears && (
          <span className="text-slate-500 font-medium">
            {experienceYears} yrs experience • {location || 'Remote'}
          </span>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="ats-cand-tags">
          {tags.map((t, i) => (
            <span key={i} className="ats-cand-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Stage mover and quick actions bar */}
      <div
        className="ats-cand-footer flex items-center justify-between gap-1 pt-2 border-t border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Move stage selector */}
        <select
          className="ats-cand-move-select flex-1"
          value={stage}
          onChange={(e) => onMoveStage && onMoveStage(id, e.target.value)}
        >
          {stages.map((st) => (
            <option key={st.key || st.id} value={st.key || st.id}>
              Move: {st.title}
            </option>
          ))}
        </select>

        {/* Quick actions */}
        <div className="flex items-center gap-1">
          {onSchedule && (
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
              title="Schedule Interview"
              onClick={() => onSchedule(candidate)}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          )}

          {onOffer && (
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-emerald-600 rounded hover:bg-slate-100"
              title="Extend Offer"
              onClick={() => onOffer(candidate)}
            >
              <Gift className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100"
              title="Remove candidate"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateCard;

