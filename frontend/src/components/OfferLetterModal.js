import React, { useState } from 'react';
import {
  X,
  Gift,
  FileText,
  DollarSign,
  Calendar,
  Send,
  CheckCircle2,
  Building,
  UserCheck,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';
import { emailService } from '../utils/emailService.js';
import { updateCandidateStage, getStoredCandidates, saveCandidates } from '../data/Candidates.js';
import './OfferLetterModal.css';

export function OfferLetterModal({
  isOpen,
  onClose,
  candidate,
  job,
  onOfferSent
}) {
  if (!isOpen || !candidate) return null;

  const defaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const defaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [activeTab, setActiveTab] = useState('terms'); // 'terms' | 'preview'
  const [salary, setSalary] = useState(job?.salary ? job.salary.split('-')[1]?.trim() || '135,000' : '135,000');
  const [currency, setCurrency] = useState(job?.currency || 'USD');
  const [period, setPeriod] = useState(job?.salaryPeriod || 'Annual');
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [deadline, setDeadline] = useState(defaultDeadline());
  const [signatory, setSignatory] = useState('Elena Rostova');
  const [signatoryTitle, setSignatoryTitle] = useState('Head of Talent Acquisition');
  const [perks, setPerks] = useState([
    'Comprehensive Health & Dental Coverage',
    'Flexible Hybrid & Remote Work Schedule',
    'Annual Learning & Development Budget ($2,000)',
    'Equity Stock Option Incentive Plan'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyName = job?.company || job?.client || 'Apex Global Tech';
  const jobTitle = job?.title || candidate?.jobTitle || 'Product Manager';

  const handleSendOffer = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const offerData = {
      salary,
      currency,
      period,
      startDate,
      deadline,
      signatory,
      signatoryTitle,
      perks,
      sentAt: new Date().toISOString()
    };

    // 1. Advance candidate stage to OFFERED
    updateCandidateStage(candidate.id, 'OFFERED');

    // 2. Attach offer details to candidate
    try {
      const cands = getStoredCandidates();
      const idx = cands.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        cands[idx] = {
          ...cands[idx],
          stage: 'OFFERED',
          offer: offerData,
          tags: Array.from(new Set([...(cands[idx].tags || []), 'Offer Extended']))
        };
        saveCandidates(cands);
      }
    } catch (err) {
      console.error('Failed to attach offer to candidate:', err);
    }

    // 3. Trigger formal offer email
    emailService.sendOfferLetter({
      candidateName: candidate.name,
      candidateEmail: candidate.email || `${candidate.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      jobTitle,
      company: companyName,
      salary: `${currency} ${salary} (${period})`,
      currency,
      startDate,
      offerDeadline: deadline
    });

    setTimeout(() => {
      setIsSubmitting(false);
      if (onOfferSent) {
        onOfferSent({
          candidateId: candidate.id,
          offer: offerData
        });
      }
      onClose();
    }, 400);
  };

  const handleMarkHired = () => {
    updateCandidateStage(candidate.id, 'HIRED');
    try {
      const cands = getStoredCandidates();
      const idx = cands.findIndex(c => c.id === candidate.id);
      if (idx !== -1) {
        cands[idx] = {
          ...cands[idx],
          stage: 'HIRED',
          tags: Array.from(new Set([...(cands[idx].tags || []), 'Hired & Onboarded']))
        };
        saveCandidates(cands);
      }
    } catch (err) {}

    if (onOfferSent) {
      onOfferSent({ candidateId: candidate.id, stage: 'HIRED' });
    }
    onClose();
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-offer-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Extend Formal Job Offer</h3>
              <p className="text-[11px] text-slate-500">
                Candidate: <strong className="text-slate-700">{candidate.name}</strong> • {jobTitle}
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
            className={`ats-offer-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Offer Parameters
          </button>
          <button
            type="button"
            className={`ats-offer-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Digital Letter Preview
          </button>
        </div>

        {/* Modal Content */}
        {activeTab === 'terms' ? (
          <form onSubmit={handleSendOffer}>
            <div className="ats-modal-body p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Base Compensation"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. 140,000"
                  />
                </div>
                <Select
                  label="Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { label: 'USD ($)', value: 'USD' },
                    { label: 'INR (₹)', value: 'INR' },
                    { label: 'AED (د.إ)', value: 'AED' },
                    { label: 'EUR (€)', value: 'EUR' },
                    { label: 'GBP (£)', value: 'GBP' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proposed Start Date *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Offer Expiration Deadline *
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500 bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Authorized Signatory"
                  value={signatory}
                  onChange={(e) => setSignatory(e.target.value)}
                />
                <Input
                  label="Signatory Designation"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                />
              </div>

              {/* Benefits Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Included Benefits & Perks
                </label>
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  {perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="text-emerald-700 hover:text-emerald-800"
                onClick={handleMarkHired}
              >
                Direct Placement (Mark Hired)
              </Button>

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
                  Send Formal Offer Letter
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Digital Letter Preview Tab */
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="ats-offer-letter-doc">
              <div className="ats-offer-letter-header">
                <div>
                  <span className="text-base font-extrabold text-slate-900 tracking-tight">
                    {companyName}
                  </span>
                  <p className="text-[11px] text-slate-500">Official Employment Requisition</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                <p>
                  Dear <strong>{candidate.name}</strong>,
                </p>
                <p>
                  On behalf of <strong>{companyName}</strong>, we are thrilled to extend a formal offer of employment for the position of <strong>{jobTitle}</strong>. We were thoroughly impressed with your technical capabilities, leadership approach, and cultural alignment throughout our recruitment rounds.
                </p>

                {/* Terms Summary Table */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Position:</span>
                    <strong className="text-slate-800">{jobTitle}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Annual Base:</span>
                    <strong className="text-emerald-700">{currency} {salary}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Start Date:</span>
                    <strong className="text-slate-800">{startDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offer Expiry Deadline:</span>
                    <strong className="text-rose-700">{deadline}</strong>
                  </div>
                </div>

                <p>
                  This position includes full participation in company benefits, comprehensive healthcare coverage, paid time off, and career advancement programs.
                </p>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                  <div>
                    <span className="block font-bold text-slate-900">{signatory}</span>
                    <span className="text-[11px] text-slate-500">{signatoryTitle}</span>
                    <span className="text-[10px] text-slate-400">{companyName}</span>
                  </div>
                  <div className="text-right text-[10px] text-emerald-600 font-semibold border border-emerald-300 rounded px-2 py-1 bg-emerald-50">
                    Digitally Authorized via HirebridgeHR
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('terms')}>
                Edit Parameters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendOffer}
                isLoading={isSubmitting}
                icon={Send}
              >
                Send Formal Offer Letter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfferLetterModal;
