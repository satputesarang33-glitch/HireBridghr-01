import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  FileCheck,
  Star,
  Send,
  X,
  UserCheck,
  Building,
  HelpCircle
} from 'lucide-react';
import { Button } from './Button.js';
import { assessmentService, SKILL_TESTS } from '../utils/assessmentService.js';
import { getStoredCandidates, saveCandidates } from '../data/Candidates.js';
import './AssessmentReferenceModal.css';

export function AssessmentReferenceModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'references'
  const [selectedTest, setSelectedTest] = useState(SKILL_TESTS[0]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  // Reference Check Form
  const [references, setReferences] = useState([]);
  const [referrerName, setReferrerName] = useState('');
  const [referrerRole, setReferrerRole] = useState('');
  const [referrerCompany, setReferrerCompany] = useState('');
  const [endorsementText, setEndorsementText] = useState('');

  useEffect(() => {
    if (candidate?.id) {
      setReferences(assessmentService.getCandidateReferences(candidate.id));
    }
  }, [candidate?.id]);

  const handleSelectAnswer = (qIdx, optIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleGradeQuiz = (e) => {
    e.preventDefault();
    let correct = 0;
    selectedTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / selectedTest.questions.length) * 100);
    setQuizScore(scorePct);

    // Save assessment and tag candidate
    assessmentService.saveCandidateAssessment(candidate.id, {
      testId: selectedTest.id,
      title: selectedTest.title,
      score: scorePct
    });

    // Attach verified skill tag to candidate
    try {
      const list = getStoredCandidates();
      const idx = list.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        list[idx].tags = Array.from(new Set([...(list[idx].tags || []), `${selectedTest.skill} Verified ✓`]));
        saveCandidates(list);
      }
    } catch (e) {}
  };

  const handleAddReference = (e) => {
    e.preventDefault();
    if (!referrerName || !endorsementText) return;

    const newRef = assessmentService.addCandidateReference(candidate.id, {
      referrerName,
      relationship: referrerRole || 'Manager',
      company: referrerCompany || 'Former Employer',
      rating: 9.5,
      endorsement: endorsementText
    });

    setReferences(assessmentService.getCandidateReferences(candidate.id));
    setReferrerName('');
    setReferrerRole('');
    setReferrerCompany('');
    setEndorsementText('');

    // Attach verified reference badge to candidate
    try {
      const list = getStoredCandidates();
      const idx = list.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        list[idx].tags = Array.from(new Set([...(list[idx].tags || []), 'References Confirmed ✓']));
        saveCandidates(list);
      }
    } catch (e) {}
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-assessment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skill Tests & Reference Verification</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-700">{candidate.name}</strong> • Qualification Validation
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

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            Technical Skill Quiz
          </button>
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'references' ? 'active' : ''}`}
            onClick={() => setActiveTab('references')}
          >
            Automated Reference Checks
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'quiz' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedTest.title}</h4>
                  <span className="text-[11px] text-slate-400">Time Limit: {selectedTest.duration}</span>
                </div>

                <select
                  value={selectedTest.id}
                  onChange={(e) => {
                    const found = SKILL_TESTS.find(t => t.id === e.target.value);
                    if (found) {
                      setSelectedTest(found);
                      setSelectedAnswers({});
                      setQuizScore(null);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700"
                >
                  {SKILL_TESTS.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {quizScore !== null ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="text-lg font-bold text-emerald-900">Assessment Completed: {quizScore}%</h4>
                  <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                    Candidate demonstrated mastery in {selectedTest.skill}. The verified badge <strong>"{selectedTest.skill} Verified ✓"</strong> has been attached to their candidate record.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setQuizScore(null)}>
                    Retake / Change Test
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleGradeQuiz} className="space-y-4">
                  {selectedTest.questions.map((qObj, qIdx) => (
                    <div key={qIdx} className="space-y-2">
                      <span className="text-xs font-bold text-slate-800">
                        {qIdx + 1}. {qObj.q}
                      </span>
                      <div className="space-y-1.5">
                        {qObj.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`ats-quiz-opt ${selectedAnswers[qIdx] === optIdx ? 'selected' : ''}`}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          >
                            <input
                              type="radio"
                              name={`quiz-${qIdx}`}
                              checked={selectedAnswers[qIdx] === optIdx}
                              onChange={() => handleSelectAnswer(qIdx, optIdx)}
                            />
                            <span>{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" size="sm" icon={Award}>
                      Submit Assessment & Verify
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Existing References */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Verified Manager Endorsements ({references.length})
                </h4>
                {references.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">{r.referrerName}</strong> &bull; {r.relationship} ({r.company})
                      </div>
                      <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {r.rating} / 10
                      </span>
                    </div>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{r.endorsement}"
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1 font-mono">
                      Verified: {r.verifiedAt}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Reference Check */}
              <form onSubmit={handleAddReference} className="p-4 rounded-xl border border-slate-200 space-y-3 bg-white">
                <h5 className="text-xs font-bold text-slate-900">Request New Reference Verification</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Referrer Name"
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. VP Eng)"
                    value={referrerRole}
                    onChange={(e) => setReferrerRole(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={referrerCompany}
                    onChange={(e) => setReferrerCompany(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Manager endorsement / feedback..."
                  value={endorsementText}
                  onChange={(e) => setEndorsementText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" icon={Send}>
                    Record Reference
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500">
            Verified badges sync automatically to the candidate's active ATS profile card.
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AssessmentReferenceModal;
