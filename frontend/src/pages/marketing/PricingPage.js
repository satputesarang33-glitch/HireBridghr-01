import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';

export function PricingPage() {
  const tiers = [
    {
      name: 'Starter Recruiter',
      price: '$49',
      period: '/ recruiter / month',
      desc: 'Ideal for small recruiting teams and fast-growing startups.',
      features: [
        'Up to 10 Active Job Requisitions',
        'Unlimited Candidate Records',
        'Visual Hiring Stages Board',
        'Manual Job Distribution Channel',
        'Email & Calendar Integration',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: false,
    },
    {
      name: 'Agency & Scale',
      price: '$129',
      period: '/ recruiter / month',
      desc: 'Built for high-velocity recruitment agencies and staffing firms.',
      features: [
        'Unlimited Active Requisitions',
        'Admin Publication Queue Review',
        'Custom Pipeline Stages & Scorecards',
        'Advanced Funnel Analytics & CSV Exports',
        'Multi-User RBAC & Recruiter Assignment',
        'Priority Technical Support',
      ],
      cta: 'Start 14-Day Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored annual contract',
      desc: 'Dedicated infrastructure for large enterprises with custom compliance.',
      features: [
        'Dedicated Tenant Isolation',
        'Custom SSO & Identity Management',
        'Custom Career Page Domain & Branding',
        'Dedicated Customer Success Manager',
        'Audit Trail & SOC2 Compliance Reporting',
        'Custom SLA Guarantees',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 space-y-16 animate-fade-in">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Scale your hiring operations without hidden fees or per-candidate penalties.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t, i) => (
          <Card
            key={i}
            className={`p-6 sm:p-8 flex flex-col justify-between relative hover:translate-y-[-2px] transition-transform ${
              t.popular ? 'border-brand-500/50 shadow-glow-brand bg-brand-50/40 dark:bg-slate-900/80 ring-1 ring-brand-500/30' : ''
            }`}
          >
            {t.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-white shadow-md">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>

              <div className="flex items-baseline gap-1 py-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{t.price}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.period}</span>
              </div>

              <ul className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link to="/signup">
                <Button
                  variant={t.popular ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full"
                >
                  {t.cta}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
