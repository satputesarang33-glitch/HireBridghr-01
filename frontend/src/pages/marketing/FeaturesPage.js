import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  GitPullRequest,
  Calendar,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

export function FeaturesPage() {
  const features = [
    {
      title: 'Applicant Tracking System (ATS)',
      desc: 'Centralized candidate database with full-text skill filtering, recruiter assignment, and timeline tracking.',
      icon: Users,
    },
    {
      title: 'Job Requisition & Publishing',
      desc: 'Multi-step job authoring with salary bands in 7 global currencies, rich text formatting, and pre-publish preview.',
      icon: Briefcase,
    },
    {
      title: 'Kanban Recruitment Pipeline',
      desc: 'Intuitive visual board with 6 primary recruitment stages and instant stage transition controls.',
      icon: GitPullRequest,
    },
    {
      title: 'Interview Coordination & Scorecards',
      desc: 'Seamless meeting link registration and structured interviewer scorecards with hiring recommendations.',
      icon: Calendar,
    },
    {
      title: 'Recruitment Analytics & Funnels',
      desc: 'End-to-end conversion funnel reporting, sourcing efficiency charts, and one-click CSV export.',
      icon: BarChart3,
    },
    {
      title: 'Multi-Tenant Security & RBAC',
      desc: 'Strict tenant isolation, role-based access control, and protected candidate resume storage.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16 animate-fade-in">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Hire Top Talent
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          HirebridgeHR combines modern design aesthetics with enterprise-grade productivity. Every tool is crafted to eliminate recruiter busywork and accelerate time-to-hire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <Card key={i} className="p-6 space-y-3 hover:translate-y-[-2px] transition-transform">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-8">
        <Link to="/signup">
          <Button variant="primary" size="lg" icon={ArrowRight}>
            Experience HirebridgeHR Today
          </Button>
        </Link>
      </div>
    </div>
  );
}
