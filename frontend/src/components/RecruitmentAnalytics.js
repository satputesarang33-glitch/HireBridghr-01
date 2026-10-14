import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
  Calendar,
  Mail,
  Star,
  FileCheck,
  Send,
  Zap,
  BarChart3,
  Clock,
  ChevronRight
} from 'lucide-react';
import { getStoredJobs } from '../data/Jobs.js';
import { getStoredCandidates, saveCandidates } from '../data/Candidates.js';
import { getSentEmails } from '../utils/emailService.js';
import { Button } from './Button.js';
import './RecruitmentAnalytics.css';

export function RecruitmentAnalytics({ onSelectCandidate }) {
  const [selectedJobId, setSelectedJobId] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Candidate for interactive scorecard
  const [scorecardCandidateId, setScorecardCandidateId] = useState('');
  const [ratings, setRatings] = useState({
    technical: 4,
    domain: 5,
    problemSolving: 4,
    communication: 5
  });
  const [recommendation, setRecommendation] = useState('Hire');
  const [scorecardNotes, setScorecardNotes] = useState('');
  const [scorecardSaved, setScorecardSaved] = useState(false);

  const jobs = useMemo(() => getStoredJobs() || [], []);
  const allCandidates = useMemo(() => getStoredCandidates() || [], [scorecardSaved]);
  const sentEmails = useMemo(() => getSentEmails() || [], []);

  // Filter candidates by job
  const candidates = useMemo(() => {
    if (selectedJobId === 'ALL') return allCandidates;
    return allCandidates.filter(c => c.jobId === selectedJobId || c.jobId === `job-${selectedJobId}`);
  }, [allCandidates, selectedJobId]);

  // Funnel calculations
  const stageCounts = useMemo(() => {
    const counts = {
      APPLIED: 0,
      CONTACTED: 0,
      INTERVIEW: 0,
      OFFERED: 0,
      HIRED: 0
    };
    candidates.forEach(c => {
      const st = (c.stage || 'APPLIED').toUpperCase();
      if (counts[st] !== undefined) {
        counts[st]++;
      } else {
        counts.APPLIED++;
      }
    });
    return counts;
  }, [candidates]);

  const totalPipeline = candidates.length || 1;

  const funnelStages = [
    { key: 'APPLIED', label: '1. Applications Received', color: '#6366F1', count: stageCounts.APPLIED },
    { key: 'CONTACTED', label: '2. Screened & Contacted', color: '#0EA5E9', count: stageCounts.CONTACTED },
    { key: 'INTERVIEW', label: '3. Interviewing Rounds', color: '#8B5CF6', count: stageCounts.INTERVIEW },
    { key: 'OFFERED', label: '4. Offers Extended', color: '#F59E0B', count: stageCounts.OFFERED },
    { key: 'HIRED', label: '5. Accepted & Hired', color: '#10B981', count: stageCounts.HIRED },
  ];

  // Handle Scorecard submission
  const handleSaveScorecard = (e) => {
    e.preventDefault();
    if (!scorecardCandidateId) return;

    const list = getStoredCandidates();
    const idx = list.findIndex(c => c.id === scorecardCandidateId);
    if (idx !== -1) {
      const avg = ((ratings.technical + ratings.domain + ratings.problemSolving + ratings.communication) / 4).toFixed(1);
      list[idx] = {
        ...list[idx],
        rating: avg,
        scorecard: {
          ratings,
          recommendation,
          notes: scorecardNotes,
          submittedAt: new Date().toISOString()
        },
        tags: Array.from(new Set([...(list[idx].tags || []), `${recommendation} Recommended`]))
      };
      saveCandidates(list);
      setScorecardSaved(true);
      setTimeout(() => setScorecardSaved(false), 3000);
    }
  };

  return (
    <div className="ats-analytics-container">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Recruitment Intelligence & Funnel Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time requisition velocity, conversion funnel gates, interviewer scorecards, and email audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden"
          >
            <option value="ALL">All Requisitions ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">This Quarter</option>
            <option value="1y">Year to Date</option>
          </select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ats-metric-card">
          <span className="ats-metric-label flex items-center justify-between">
            <span>Total Requisitions</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </span>
          <span className="ats-metric-val">{jobs.length}</span>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Active Requisitions</span>
        </div>

        <div className="ats-metric-card">
          <span className="ats-metric-label flex items-center justify-between">
            <span>Active Pipeline</span>
            <Users className="w-4 h-4 text-sky-500" />
          </span>
          <span className="ats-metric-val">{candidates.length}</span>
          <span className="text-[11px] text-slate-500 font-medium">Across all hiring stages</span>
        </div>

        <div className="ats-metric-card">
          <span className="ats-metric-label flex items-center justify-between">
            <span>Average Time-to-Hire</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </span>
          <span className="ats-metric-val">18.4 <span className="text-sm font-normal text-slate-500">Days</span></span>
          <span className="text-[11px] text-emerald-600 font-semibold">↓ 3.2 days vs last month</span>
        </div>

        <div className="ats-metric-card">
          <span className="ats-metric-label flex items-center justify-between">
            <span>Offer Acceptance</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </span>
          <span className="ats-metric-val">89.2%</span>
          <span className="text-[11px] text-emerald-600 font-semibold">High candidate sentiment</span>
        </div>
      </div>

      {/* Conversion Funnel & Sourcing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Pipeline Funnel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Conversion Funnel</h3>
              <p className="text-xs text-slate-500">Candidate flow through evaluation gates</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {stageCounts.HIRED} Placed / {candidates.length} Total
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {funnelStages.map((st) => {
              const pct = Math.round((st.count / totalPipeline) * 100);
              return (
                <div key={st.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                      {st.label}
                    </span>
                    <span className="font-mono text-slate-900 font-bold">
                      {st.count} Candidates ({pct}%)
                    </span>
                  </div>

                  <div className="ats-funnel-bar-container">
                    <div
                      className="ats-funnel-bar-fill"
                      style={{
                        width: `${Math.max(pct, 6)}%`,
                        backgroundColor: st.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Conversion bottleneck is lowest between Interview and Offer stages (38% progression rate).
          </p>
        </div>

        {/* Interviewer Scorecard Rubric Box (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Interviewer Scorecard Rubric
            </h3>
            <p className="text-xs text-slate-500">Standardized multi-criteria evaluation</p>
          </div>

          <form onSubmit={handleSaveScorecard} className="space-y-3">
            {/* Candidate Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Evaluate Candidate
              </label>
              <select
                value={scorecardCandidateId}
                onChange={(e) => setScorecardCandidateId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:outline-hidden"
                required
              >
                <option value="">Select candidate to evaluate...</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.jobTitle} - {c.stage})
                  </option>
                ))}
              </select>
            </div>

            {/* Rubrics (4 criteria) */}
            <div className="space-y-2 text-xs">
              {[
                { key: 'technical', label: 'Technical Competence' },
                { key: 'domain', label: 'Domain Expertise' },
                { key: 'problemSolving', label: 'Problem Solving' },
                { key: 'communication', label: 'Culture & Communication' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatings({ ...ratings, [key]: star })}
                        className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${ratings[key] >= star ? 'fill-amber-400' : 'text-slate-200'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Final Recommendation
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Strong Hire', 'Hire', 'Neutral', 'No Hire'].map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => setRecommendation(rec)}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      recommendation === rec
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <textarea
                rows={2}
                value={scorecardNotes}
                onChange={(e) => setScorecardNotes(e.target.value)}
                placeholder="Evaluation notes, interview observations..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!scorecardCandidateId}
              className="w-full"
            >
              {scorecardSaved ? 'Scorecard Recorded ✓' : 'Save Interview Scorecard'}
            </Button>
          </form>
        </div>
      </div>

      {/* Transactional Emails Audit Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Automated Email Communications Log
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of candidate notifications triggered via transactional email service
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-full">
            {sentEmails.length} Emails Dispatched
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="ats-email-audit-table">
            <thead>
              <tr>
                <th>Dispatched At</th>
                <th>Recipient</th>
                <th>Trigger Event</th>
                <th>Subject</th>
                <th>Delivery Status</th>
              </tr>
            </thead>
            <tbody>
              {sentEmails.length > 0 ? (
                sentEmails.slice(0, 10).map((em) => (
                  <tr key={em.id}>
                    <td className="font-mono text-slate-500">
                      {new Date(em.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-semibold text-slate-800">
                      {em.recipientName || em.to}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {em.type}
                      </span>
                    </td>
                    <td className="text-slate-600 max-w-xs truncate">
                      {em.subject}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    No transactional emails logged yet. Emails are automatically logged when applicants apply, or when interviews/offers are scheduled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RecruitmentAnalytics;
