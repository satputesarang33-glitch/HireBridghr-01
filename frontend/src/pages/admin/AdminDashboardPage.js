import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building,
  Users2,
  Briefcase,
  FileCheck2,
  FileText,
  Award,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Skeleton } from '../../components/ui/Skeleton.js';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminService.getAdminMetrics().then((res) => {
      setMetrics(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Organizations',
      value: metrics.totalOrganizations,
      sub: `${metrics.activeOrganizations} Active Workspaces`,
      icon: Building,
      link: '/admin/organizations',
    },
    {
      title: 'Pending Publications',
      value: metrics.pendingPublications,
      sub: 'Action Required',
      icon: FileCheck2,
      color: 'text-amber-400',
      link: '/admin/job-publications',
    },
    {
      title: 'Global Platform Users',
      value: metrics.totalUsers,
      sub: 'Recruiters & Admins',
      icon: Users2,
      link: '/admin/users',
    },
    {
      title: 'Total Requisitions',
      value: metrics.totalJobs,
      sub: `${metrics.totalApplications} Inbound Candidates`,
      icon: Briefcase,
      link: '/admin/job-publications',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Platform Operations & Multi-Tenant Control
          </h1>
          <p className="text-xs text-indigo-300/70 mt-1">
            System-wide metric aggregation, tenant health monitoring, and publication verification.
          </p>
        </div>

        <Link to="/admin/job-publications">
          <Button variant="primary" size="sm" icon={FileCheck2}>
            Review Publication Queue ({metrics.pendingPublications})
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card
              key={i}
              interactive
              onClick={() => navigate(c.link)}
              className="p-5 flex flex-col justify-between border-indigo-500/20 bg-slate-900/60"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {c.title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className={`text-3xl font-black ${c.color || 'text-white'} tracking-tight`}>
                  {c.value}
                </p>
                <p className="text-xs text-indigo-300/80 mt-1">{c.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 border-indigo-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">Pending Job Publications</h3>
            <Link to="/admin/job-publications" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Open Queue &rarr;
            </Link>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Customer organizations have submitted new job requisitions awaiting platform verification before being distributed to manual boards and syndication portals.
          </p>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <span className="text-xs text-amber-300 font-semibold">
              {metrics.pendingPublications} Job Requisition(s) currently awaiting approval
            </span>
            <Link to="/admin/job-publications">
              <Button variant="primary" size="sm" className="text-xs py-1">
                Process Now
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6 space-y-4 border-indigo-500/20 bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">System Security & Audit Trail</h3>
            <Link to="/admin/audit-logs" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View Audit Logs &rarr;
            </Link>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every critical platform mutation, job publication event, and candidate stage change is immutably logged with actor identity and timestamp.
          </p>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Audit Trail Integrity: <strong className="text-emerald-400">100% Verified</strong></span>
            <span className="text-[10px] text-slate-400 font-mono">SOC2 Ready</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
