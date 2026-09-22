import React from 'react';
import { cn } from '../../utils/cn.js';

export function Badge({ children, variant = 'neutral', size = 'md', className, dot = false }) {
  const variants = {
    neutral: 'bg-slate-100/90 text-slate-700 border border-slate-200/90 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60',
    brand: 'bg-cyan-50/90 text-cyan-800 border border-cyan-200/90 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
    accent: 'bg-indigo-50/90 text-indigo-800 border border-indigo-200/90 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
    success: 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/90 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-50/90 text-amber-900 border border-amber-200/90 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    danger: 'bg-rose-50/90 text-rose-800 border border-rose-200/90 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    purple: 'bg-purple-50/90 text-purple-800 border border-purple-200/90 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full tracking-wide', variants[variant], sizes[size], className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// Specialized Job Status Badge
export function JobStatusBadge({ status }) {
  const map = {
    PUBLISHED: { label: 'Published', variant: 'success' },
    PENDING_ADMIN_PUBLICATION: { label: 'Pending Admin', variant: 'warning' },
    PROCESSING: { label: 'Processing', variant: 'brand' },
    DRAFT: { label: 'Draft', variant: 'neutral' },
    CLOSED: { label: 'Closed', variant: 'danger' },
    EXPIRED: { label: 'Expired', variant: 'neutral' },
    FAILED: { label: 'Failed', variant: 'danger' },
  };

  const current = map[status] || { label: status, variant: 'neutral' };

  return (
    <Badge variant={current.variant} dot>
      {current.label}
    </Badge>
  );
}

// Specialized Application Stage Badge
export function ApplicationStageBadge({ stage }) {
  const map = {
    NEW: { label: 'New', variant: 'neutral' },
    SCREENING: { label: 'Screening', variant: 'brand' },
    SHORTLISTED: { label: 'Shortlisted', variant: 'accent' },
    INTERVIEW: { label: 'Interview', variant: 'purple' },
    OFFER: { label: 'Offer', variant: 'warning' },
    HIRED: { label: 'Hired', variant: 'success' },
    REJECTED: { label: 'Rejected', variant: 'danger' },
    WITHDRAWN: { label: 'Withdrawn', variant: 'neutral' },
  };

  const current = map[stage] || { label: stage, variant: 'neutral' };

  return (
    <Badge variant={current.variant}>
      {current.label}
    </Badge>
  );
}
