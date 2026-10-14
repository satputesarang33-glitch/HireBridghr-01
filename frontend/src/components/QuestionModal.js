import React, { useState, useEffect } from 'react';
import {
  X,
  ToggleLeft,
  ListOrdered,
  Type,
  AlignLeft,
  Hash,
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import './QuestionModal.css';

const QUESTION_TYPES = [
  { id: 'YES_NO', label: 'Yes / No', icon: ToggleLeft },
  { id: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: ListOrdered },
  { id: 'SHORT_ANSWER', label: 'Short Answer', icon: Type },
  { id: 'LONG_ANSWER', label: 'Long Answer', icon: AlignLeft },
  { id: 'NUMBER', label: 'Number', icon: Hash },
  { id: 'DROPDOWN', label: 'Dropdown', icon: ChevronDown }
];

export function QuestionModal({
  isOpen,
  onClose,
  onSave,
  initialQuestion = null
}) {
  const [questionText, setQuestionText] = useState('');
  const [selectedType, setSelectedType] = useState('YES_NO');
  const [isMandatory, setIsMandatory] = useState(true);
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [newOptionInput, setNewOptionInput] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question || '');
      setSelectedType(initialQuestion.type || 'YES_NO');
      setIsMandatory(initialQuestion.isMandatory !== false);
      setOptions(initialQuestion.options && initialQuestion.options.length > 0 ? initialQuestion.options : ['Option 1', 'Option 2']);
    } else {
      setQuestionText('');
      setSelectedType('YES_NO');
      setIsMandatory(true);
      setOptions(['Option 1', 'Option 2']);
    }
    setNewOptionInput('');
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (newOptionInput.trim()) {
      setOptions([...options, newOptionInput.trim()]);
      setNewOptionInput('');
    }
  };

  const handleRemoveOption = (indexToRemove) => {
    setOptions(options.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Please enter a question prompt.');
      return;
    }

    const questionData = {
      id: initialQuestion ? initialQuestion.id : `sq-${Date.now()}`,
      question: questionText.trim(),
      type: selectedType,
      isMandatory,
      options: ['MULTIPLE_CHOICE', 'DROPDOWN'].includes(selectedType) ? options : selectedType === 'YES_NO' ? ['Yes', 'No'] : []
    };

    onSave(questionData);
    onClose();
  };

  return (
    <div className="ats-qmodal-overlay" onClick={onClose}>
      <div className="ats-qmodal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ats-qmodal-header">
          <h3 className="ats-qmodal-title">
            {initialQuestion ? 'Edit Screening Question' : 'Add Screening Question'}
          </h3>
          <button type="button" className="ats-modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ats-qmodal-body">
            {/* Question Text */}
            <Input
              label="Question"
              required
              placeholder="e.g. Do you have experience managing cross-functional teams?"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {/* Question Type Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-800">
                Question Type <span className="text-red-500">*</span>
              </label>
              <div className="ats-qmodal-types-grid">
                {QUESTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      className={`ats-qmodal-type-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options Management for Multiple Choice / Dropdown */}
            {['MULTIPLE_CHOICE', 'DROPDOWN'].includes(selectedType) && (
              <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-semibold text-slate-800">
                  Answer Options
                </label>
                <div className="ats-qmodal-options-list">
                  {options.map((opt, idx) => (
                    <div key={idx} className="ats-qmodal-option-row">
                      <span className="w-5 text-center text-xs text-slate-400 font-bold">{idx + 1}.</span>
                      <input
                        type="text"
                        className="flex-1 py-1 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-indigo-500"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx] = e.target.value;
                          setOptions(updated);
                        }}
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          className="ats-qmodal-option-remove"
                          onClick={() => handleRemoveOption(idx)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    className="flex-1 py-1.5 px-3 text-xs bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-indigo-500"
                    placeholder="Add an answer option..."
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    onClick={handleAddOption}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Mandatory Toggle */}
            <label className="ats-qmodal-mandatory-toggle">
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  Mark as mandatory question
                </span>
                <span className="text-[11px] text-slate-500">
                  Candidates cannot submit application without answering this question
                </span>
              </div>
            </label>
          </div>

          <div className="ats-qmodal-footer">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initialQuestion ? 'Save Changes' : 'Add Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuestionModal;
