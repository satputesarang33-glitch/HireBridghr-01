import React from 'react';
import { cn } from '../../utils/cn.js';

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn('flex items-center gap-1.5 p-1 glass-panel rounded-2xl border border-white/80 dark:border-white/10 w-fit overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-gradient-to-r from-brand-500/15 via-cyan-500/10 to-accent-600/15 text-brand-700 dark:text-brand-300 border border-brand-400/40 shadow-sm dark:shadow-glow-brand'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-white/5'
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-1',
                  isActive ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
