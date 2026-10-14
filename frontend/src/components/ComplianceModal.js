import React, { useState } from 'react';
import {
  Shield,
  Download,
  Trash2,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Database
} from 'lucide-react';
import { Button } from './Button.js';
import { rbacService } from '../utils/rbacService.js';
import { getStoredCandidates } from '../data/Candidates.js';
import './ComplianceModal.css';

export function ComplianceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [candidates, setCandidates] = useState(() => getStoredCandidates() || []);
  const [selectedCandidateToAnonymize, setSelectedCandidateToAnonymize] = useState('');
  const [anonymizedSuccess, setAnonymizedSuccess] = useState(false);

  const handleExportData = () => {
    rbacService.exportAllComplianceData();
  };

  const handleAnonymize = (e) => {
    e.preventDefault();
    if (!selectedCandidateToAnonymize) return;

    rbacService.anonymizeCandidateData(selectedCandidateToAnonymize);
    setCandidates(getStoredCandidates() || []);
    setAnonymizedSuccess(true);
    setTimeout(() => setAnonymizedSuccess(false), 3000);
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-compliance-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">GDPR & SOC-2 Compliance Suite</h3>
              <p className="text-[11px] text-slate-500">
                Data privacy, cryptographic audit logs, and candidate right to be forgotten
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

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Data Portability Export */}
          <div className="ats-compliance-box">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  GDPR Article 20: Full Data Portability Export
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Download complete machine-readable JSON archive containing all requisitions, candidates, scorecards, and email audit trails.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleExportData}
              >
                Export JSON
              </Button>
            </div>
          </div>

          {/* Right to be Forgotten (Anonymization) */}
          <div className="ats-compliance-box">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              GDPR Article 17: Right to Erasure (Anonymization)
            </h4>
            <p className="text-[11px] text-slate-500">
              Permanently scrub candidate personally identifiable information (PII) including name, email, phone, and resumes.
            </p>

            <form onSubmit={handleAnonymize} className="space-y-2 pt-2">
              <select
                value={selectedCandidateToAnonymize}
                onChange={(e) => setSelectedCandidateToAnonymize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="">Select candidate to scrub PII...</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400">Action is irreversible.</span>
                <Button
                  type="submit"
                  variant="danger"
                  size="sm"
                  disabled={!selectedCandidateToAnonymize}
                  icon={Trash2}
                >
                  {anonymizedSuccess ? 'PII Scrubbed ✓' : 'Anonymize PII'}
                </Button>
              </div>
            </form>
          </div>

          {/* SOC-2 Audit Status */}
          <div className="ats-compliance-box">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              SOC-2 Type II Security Standard
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Encryption at Rest</span>
                <span className="font-semibold text-emerald-600">AES-256 Enabled</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">TLS In-Transit</span>
                <span className="font-semibold text-emerald-600">TLS 1.3 Strict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500 font-mono">
            Compliance Version: 2026.4-LTS
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ComplianceModal;
