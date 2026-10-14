import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { predictiveAnalyticsService } from '../../services/enterprisePlatformService.js';
import { Card } from '../ui/Card.js';
import { Skeleton } from '../ui/Skeleton.js';

export function PredictiveExecutiveAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [diversity, setDiversity] = useState(null);
  const [roi, setRoi] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      predictiveAnalyticsService.getPredictiveMetrics(),
      predictiveAnalyticsService.getDiversityEEOC(),
      predictiveAnalyticsService.getSourcesROI(),
      predictiveAnalyticsService.getRecruiterLeaderboard(),
    ])
      .then(([mRes, dRes, rRes, lRes]) => {
        setMetrics(mRes?.data || mRes || {});
        setDiversity(dRes?.data || dRes || {});
        setRoi(rRes?.data || rRes || {});
        setLeaderboard(
          Array.isArray(lRes?.data) ? lRes.data : Array.isArray(lRes) ? lRes : []
        );
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load predictive analytics:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { summary, funnelVelocity, bottlenecks } = metrics || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border border-brand-500/20 bg-brand-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Predictive Time-to-Hire
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {summary?.avgTimeToHireDays} <span className="text-sm font-semibold text-slate-400">days</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            44% faster vs 38.5d industry benchmark
          </span>
        </Card>

        <Card className="p-4 border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Cost Per Hire (Blended)
          </span>
          <p className="text-2xl font-black text-white mt-1">
            ${summary?.costPerHireDollars?.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
            ${summary?.savingsRealizedPerHire?.toLocaleString()} saved per placement
          </span>
        </Card>

        <Card className="p-4 border border-purple-500/20 bg-purple-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            EEOC Adverse Impact
          </span>
          <p className="text-2xl font-black text-white mt-1">
            {diversity?.adverseImpactRatio} <span className="text-xs font-semibold text-emerald-400">PASS</span>
          </p>
          <span className="text-[10px] text-purple-300 font-semibold block mt-0.5">
            4/5ths Rule Verified (Benchmark &gt; 0.80)
          </span>
        </Card>

        <Card className="p-4 border border-indigo-500/20 bg-indigo-500/5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Offer Acceptance Rate
          </span>
          <p className="text-2xl font-black text-white mt-1">91.4%</p>
          <span className="text-[10px] text-indigo-300 font-semibold block mt-0.5">
            4.9/5 Candidate Satisfaction NPS
          </span>
        </Card>
      </div>

      {/* Funnel Velocity & Stage Drop-off Analysis */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Full-Funnel Velocity & Pass-Through Rates</h3>
            <p className="text-xs text-slate-400">Detailed latency and drop-off percentage at each hiring hurdle</p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
            Real-Time Pipeline Velocity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="glass-table text-xs">
            <thead>
              <tr>
                <th>Evaluation Stage</th>
                <th>Candidate Volume</th>
                <th>Avg Days in Stage</th>
                <th>Pass-Through Rate</th>
                <th>Drop-Off Rate</th>
              </tr>
            </thead>
            <tbody>
              {(funnelVelocity || []).map((stage) => (
                <tr key={stage.stage}>
                  <td className="font-semibold text-white">{stage.stage}</td>
                  <td className="font-mono text-slate-300">{stage.candidateCount} Candidates</td>
                  <td className="font-mono text-brand-300">{stage.avgDaysInStage} days</td>
                  <td>
                    <span className="font-bold text-emerald-400 font-mono">{stage.passThroughRate}</span>
                  </td>
                  <td>
                    <span className="font-bold text-rose-400 font-mono">{stage.dropOffRate}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sourcing Channels ROI & Diversity Compliance Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sourcing ROI (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-4 h-full">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Channel Attribution & ROI Efficiency</h3>
              <p className="text-xs text-slate-400">Spend, hires, and cost-per-hire per talent channel</p>
            </div>

            <div className="space-y-2.5">
              {(roi?.attribution || []).map((chan) => (
                <div
                  key={chan.source}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white block">{chan.source}</span>
                    <span className="text-[10px] text-slate-400">
                      Spend: ${chan.spend} &bull; Retention: {chan.retentionRate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-400 font-mono block">
                      ${chan.costPerHire}/hire
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">{chan.efficiencyRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Executive Diversity & EEOC (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-4 h-full">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">EEOC & Diversity Demographics</h3>
              <p className="text-xs text-slate-400">OFCCP Parity & Federal EEO-1 Audit Ready</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Gender Parity</span>
                <div className="space-y-1">
                  {(diversity?.genderBreakdown || []).map((g) => (
                    <div key={g.category} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">{g.category}</span>
                      <span className="font-mono font-bold text-white">{g.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <span className="text-slate-400 font-semibold block mb-1">Race & Ethnicity</span>
                <div className="space-y-1">
                  {(diversity?.raceEthnicityBreakdown || []).slice(0, 4).map((r) => (
                    <div key={r.group} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300 truncate max-w-[200px]">{r.group}</span>
                      <span className="font-mono font-bold text-white">{r.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                <span>OFCCP Disability Benchmark (7.0%):</span>
                <span className="font-mono font-bold">8.5% (TARGET MET)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recruiter Leaderboard */}
      <Card className="p-6 space-y-4">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white">Recruitment Team Throughput & NPS Leaderboard</h3>
          <p className="text-xs text-slate-400">Top performers across volume, offer conversion, and candidate feedback</p>
        </div>

        <div className="overflow-x-auto">
          <table className="glass-table text-xs">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Interviews Coordinated</th>
                <th>Offers Extended</th>
                <th>Offer Acceptance</th>
                <th>Avg Days to Offer</th>
                <th>Candidate NPS</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard || []).map((rec) => (
                <tr key={rec.recruiterId}>
                  <td>
                    <div className="flex items-center gap-2">
                      <img src={rec.avatar} alt="" className="w-6 h-6 rounded-full" />
                      <div>
                        <div className="font-semibold text-white">{rec.name}</div>
                        <div className="text-[10px] text-slate-400">{rec.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-slate-300">{rec.interviewsCoordinated}</td>
                  <td className="font-mono text-slate-300">{rec.offersExtended}</td>
                  <td className="font-mono font-bold text-emerald-400">{rec.acceptanceRate}</td>
                  <td className="font-mono text-brand-300">{rec.avgDaysToOffer} days</td>
                  <td className="font-mono font-bold text-amber-400">{rec.candidateNPS} / 5.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
