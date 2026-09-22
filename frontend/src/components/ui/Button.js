import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-brand-500 via-cyan-500 to-accent-600 hover:from-brand-400 hover:to-accent-500 text-white shadow-glow-brand focus:ring-brand-400 border border-white/25 shadow-[0_4px_20px_-2px_rgba(6,182,212,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]',
    secondary: 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04),inset_0_1px_1.5px_rgba(255,255,255,1)] dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-200 dark:border-white/15 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus:ring-slate-500',
    outline: 'border border-brand-500/50 hover:border-brand-600 text-brand-700 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 dark:border-brand-500/40 focus:ring-brand-400',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 focus:ring-slate-500',
    danger: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm focus:ring-rose-500 border border-rose-500/30',
    glass: 'glass-panel hover:bg-white/90 text-slate-800 dark:text-white border-white/80 dark:border-white/20 shadow-glass-sm focus:ring-brand-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
