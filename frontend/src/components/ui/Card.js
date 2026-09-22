import React from 'react';
import { cn } from '../../utils/cn.js';

export function Card({ children, className, interactive = false, ...props }) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 border border-white/80 dark:border-white/10 overflow-hidden relative',
        interactive && 'glass-card-interactive cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-base font-bold text-slate-900 dark:text-white tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('text-sm text-slate-700 dark:text-slate-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10', className)} {...props}>
      {children}
    </div>
  );
}
