import React from 'react';
import { Building2, ShieldCheck, Users, Target } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12 animate-fade-in text-slate-300">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About HirebridgeHR
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Reinventing the talent acquisition stack for modern recruiters and enterprise organizations.
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-white/10 space-y-6 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-xl font-bold text-white">Our Mission</h2>
        <p>
          Recruitment teams spend up to 40% of their time navigating fragmented spreadsheets, messy candidate email threads, and cumbersome legacy software. HirebridgeHR was conceived to streamline the entire recruitment lifecycle into a single high-velocity SaaS platform.
        </p>
        <p>
          From the moment a job requisition is approved, to syndicating it through our admin review queue, managing applicants on an interactive visual Kanban pipeline, and scoring interviews, HirebridgeHR empowers talent leaders to make informed, data-driven decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center space-y-2">
          <Target className="w-8 h-8 text-brand-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Velocity First</h3>
          <p className="text-xs text-slate-400">Engineered to cut time-to-hire by over 30% through intuitive UX.</p>
        </Card>
        <Card className="p-5 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Uncompromising Security</h3>
          <p className="text-xs text-slate-400">Strict multi-tenancy and protected candidate document vaults.</p>
        </Card>
        <Card className="p-5 text-center space-y-2">
          <Users className="w-8 h-8 text-accent-400 mx-auto" />
          <h3 className="font-bold text-white text-sm">Recruiter Centric</h3>
          <p className="text-xs text-slate-400">Built by recruiting practitioners for high-volume talent operators.</p>
        </Card>
      </div>
    </div>
  );
}
