import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import { Button } from '../components/ui/Button.js';

export function MarketingLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-brand-500/30 selection:text-brand-200 relative overflow-x-hidden">
      {/* Background Liquid Glows */}
      <div className="liquid-glow-brand -top-20 -left-20 opacity-60" />
      <div className="liquid-glow-accent top-1/2 -right-20 opacity-40" />

      {/* Floating Liquid Glass Header */}
      <header className="sticky top-4 z-40 max-w-6xl w-[94%] mx-auto mt-4 px-6 py-3 rounded-2xl glass-panel border border-white/80 dark:border-white/15 shadow-glass-lg flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hirebridge<span className="text-brand-500">HR</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
          <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
        </nav>

        {/* Right CTA Area */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
          </button>
          <Link to="/signin" className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors">
            Sign In
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Get Started Free &rarr;
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-1"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-24 z-50 glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/15 shadow-glass-lg flex flex-col gap-4 animate-scale-in">
          <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-800 dark:text-slate-200">Features</Link>
          <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pricing</Link>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-800 dark:text-slate-200">About</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-800 dark:text-slate-200">Contact</Link>
          <hr className="border-slate-200 dark:border-white/10" />
          <Link to="/signin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sign In</Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="primary" className="w-full">
              Get Started Free &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Comprehensive Footer */}
      <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-950/80 backdrop-blur-md pt-12 pb-8 mt-16 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                Hirebridge<span className="text-brand-500">HR</span>
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The modern multi-tenant ATS and job distribution platform built for high-scale recruiters, staffing enterprises, and growth-stage companies.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Applicant Tracking</Link></li>
              <li><Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Job Distribution</Link></li>
              <li><Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Candidate CRM</Link></li>
              <li><Link to="/features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Analytics & Funnels</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Launch ATS Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">Legal & Trust</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Security & SOC2</span></li>
              <li><span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">Terms of Service</span></li>
              <li><span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">GDPR Compliance</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} HirebridgeHR. Built for recruitment professionals worldwide.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">All Systems Operational</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
