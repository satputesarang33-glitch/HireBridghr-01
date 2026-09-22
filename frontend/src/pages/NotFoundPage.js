import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button.js';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="liquid-glow-brand -top-20 -left-20 opacity-50" />
      <div className="liquid-glow-accent -bottom-20 -right-20 opacity-40" />

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-white/15 shadow-glass-lg text-center space-y-5 relative z-10">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow-brand">
          <HelpCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-4xl font-black text-brand-400 font-mono">404</span>
          <h1 className="text-xl font-bold text-white mt-2">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            The destination URL or requisition page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button variant="primary" size="sm" icon={Home}>
              Go to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" size="sm">
              Platform Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
