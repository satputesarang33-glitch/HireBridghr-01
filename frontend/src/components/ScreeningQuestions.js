import React, { useState } from 'react';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { Button } from './Button.js';
import { QuestionModal } from './QuestionModal.js';
import './ScreeningQuestions.css';

export function ScreeningQuestions({
  questions = [],
  onChange,
  className = ''
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this screening question?')) {
      const updated = questions.filter((q) => q.id !== id);
      if (onChange) onChange(updated);
    }
  };

  const handleSaveQuestion = (savedQ) => {
    if (editingQuestion) {
      const updated = questions.map((q) => (q.id === savedQ.id ? savedQ : q));
      if (onChange) onChange(updated);
    } else {
      const updated = [...questions, savedQ];
      if (onChange) onChange(updated);
    }
  };

  const formatTypeLabel = (type) => {
    switch (type) {
      case 'YES_NO': return 'Yes / No';
      case 'MULTIPLE_CHOICE': return 'Multiple Choice';
      case 'SHORT_ANSWER': return 'Short Answer';
      case 'LONG_ANSWER': return 'Long Answer';
      case 'NUMBER': return 'Number';
      case 'DROPDOWN': return 'Dropdown';
      default: return type;
    }
  };

  return (
    <div className={`ats-sq-container ${className}`}>
      <div className="ats-sq-header">
        <div className="ats-sq-title-group">
          <h4 className="ats-sq-title">Screening Questions</h4>
          <span className="ats-sq-subtitle">
            Screen candidates automatically with custom qualification criteria
          </span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={handleOpenAdd}
        >
          Add Question
        </Button>
      </div>

      {questions.length > 0 ? (
        <div className="ats-sq-list">
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="ats-sq-item">
              <div className="ats-sq-item-left">
                <span className="ats-sq-number">{idx + 1}.</span>
                <div className="ats-sq-item-content">
                  <span className="ats-sq-item-text">{q.question}</span>
                  <div className="ats-sq-badges">
                    <span className="ats-sq-type-badge">
                      {formatTypeLabel(q.type)}
                    </span>
                    {q.isMandatory ? (
                      <span className="ats-sq-mandatory-badge">Mandatory</span>
                    ) : (
                      <span className="ats-sq-optional-badge">Optional</span>
                    )}
                    {q.options && q.options.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        ({q.options.length} options)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ats-sq-item-actions">
                <button
                  type="button"
                  className="ats-sq-action-btn"
                  title="Edit question"
                  onClick={() => handleOpenEdit(q)}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="ats-sq-action-btn is-delete"
                  title="Delete question"
                  onClick={() => handleDelete(q.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ats-sq-empty">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
          <p>No screening questions configured yet.</p>
          <button
            type="button"
            className="text-xs font-semibold text-indigo-600 hover:underline mt-1"
            onClick={handleOpenAdd}
          >
            + Add your first question
          </button>
        </div>
      )}

      {/* Modal */}
      <QuestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />
    </div>
  );
}

export default ScreeningQuestions;
