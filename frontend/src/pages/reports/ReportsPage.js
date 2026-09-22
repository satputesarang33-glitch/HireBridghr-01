import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Briefcase,
  Award,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { reportService } from '../../services/reportService.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { Select } from '../../components/ui/Select.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { useToast } from '../../context/ToastContext.js';

export function ReportsPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    reportService.getAnalyticsOverview().then((res) => {
      setData(res.data);
      setIsLoading(false);
    });
  }, []);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      await reportService.exportCSV();
      toast.success('CSV Exported', 'Candidate & recruitment metrics report downloaded successfully.');
    } catch (e) {
      toast.error('Export Error', 'Unable to generate CSV report.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Recruitment Intelligence & Reports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hiring velocity, candidate conversion funnel, sourcing channel efficiency, and team activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-40">
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { label: 'Past 30 Days', value: '30d' },
                { label: 'This Quarter', value: 'quarter' },
                { label: 'Year to Date', value: 'ytd' },
              ]}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            isLoading={isExporting}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Applications</span>
          <p className="text-2xl font-black text-white mt-1">{data?.totalApplications || 0}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+14% vs last period</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interviews Held</span>
          <p className="text-2xl font-black text-white mt-1">{data?.scheduledInterviews || 0}</p>
          <span className="text-[10px] text-brand-400 font-semibold">92% completion rate</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offers Extended</span>
          <p className="text-2xl font-black text-white mt-1">{data?.offersCount || 0}</p>
          <span className="text-[10px] text-purple-400 font-semibold">88% acceptance</span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Successful Hires</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{data?.totalHires || 0}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Avg 18 days to hire</span>
        </Card>
      </div>

      {/* Funnel & Sourcing Channels Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Pipeline Funnel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Conversion Funnel Progression</h3>
                <p className="text-xs text-slate-400">Percentage retention across each evaluation gate</p>
              </div>
              <span className="text-xs font-mono font-bold text-brand-400">
                {data?.totalApplications ? Math.round(((data.totalHires || 1) / data.totalApplications) * 100) : 15}% Overall Conversion
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {(data?.funnel || []).map((f) => (
                <div key={f.stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{f.stage}</span>
                    <span className="font-mono text-white">{f.count} Candidates</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((f.count / (data.totalApplications || 1)) * 100, 10)}%`,
                        backgroundColor: f.fill,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Candidate Sourcing Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 space-y-4">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Sourcing Channels Efficiency</h3>
              <p className="text-xs text-slate-400">Where top candidates originate</p>
            </div>

            <div className="space-y-3 pt-2">
              {(data?.sources || []).map((src) => (
                <div key={src.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <span className="font-semibold text-white">{src.name}</span>
                  <span className="font-mono font-bold text-brand-400">{src.value} Candidates</span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed">
              Referrals and Direct Sourcing yield the highest offer-to-hire ratio across engineering roles.
            </div>
          </Card>
        </div>
      </div>

      {/* Recruiter Activity Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Recruitment Team Productivity</h3>
        <div className="glass-panel rounded-xl border border-white/10 overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Candidates Sourced</th>
                <th>Interviews Facilitated</th>
                <th>Placements Completed</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recruiterActivity || []).map((rec) => (
                <tr key={rec.name}>
                  <td className="font-semibold text-white">{rec.name}</td>
                  <td className="font-mono text-slate-300">{rec.sourced}</td>
                  <td className="font-mono text-slate-300">{rec.interviews}</td>
                  <td className="font-mono font-bold text-emerald-400">{rec.hires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
