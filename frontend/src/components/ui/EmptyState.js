import React from 'react';
import { Button } from './Button.js';
import { cn } from '../../utils/cn.js';

export function EmptyState({
  icon: Icon,
  title = 'No records found',
  description = 'There are no items matching your criteria or currently available.',
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-card border border-white/5 my-6', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 shadow-glow-brand">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
