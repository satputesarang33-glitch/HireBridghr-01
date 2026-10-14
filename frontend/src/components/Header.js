import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Bell,
  Shield,
  Building,
  UserCheck,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import { NotificationCenterModal } from './NotificationCenterModal.js';
import { ComplianceModal } from './ComplianceModal.js';
import { BillingModal } from './BillingModal.js';
import { rbacService, ENTERPRISE_ORGS, RBAC_ROLES } from '../utils/rbacService.js';
import './Header.css';

export function Header({
  title = 'Open Jobs',
  count,
  searchQuery = '',
  onSearchChange,
  actions,
  className = ''
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [activeOrg, setActiveOrg] = useState(() => rbacService.getActiveOrganization());
  const [activeRole, setActiveRole] = useState(() => rbacService.getActiveRole());

  const handleOrgChange = (e) => {
    const org = ENTERPRISE_ORGS.find(o => o.id === e.target.value) || ENTERPRISE_ORGS[0];
    rbacService.setActiveOrganization(org);
    setActiveOrg(org);
  };

  const handleRoleChange = (e) => {
    rbacService.setActiveRole(e.target.value);
    setActiveRole(e.target.value);
  };

  return (
    <header className={`ats-header ${className}`}>
      <div className="ats-header-left">
        <h1 className="ats-header-title">
          <span>{title}</span>
          {count !== undefined && <span className="ats-header-count">({count})</span>}
        </h1>

        {/* Multi-Tenant Organization Switcher (Phase 10) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={activeOrg.id}
            onChange={handleOrgChange}
            className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer text-xs"
          >
            {ENTERPRISE_ORGS.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.industry})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="ats-header-right relative">
        {onSearchChange && (
          <div className="ats-header-search">
            <Search className="w-4 h-4 ats-header-search-icon" />
            <input
              type="text"
              className="ats-header-search-input"
              placeholder="Search jobs, skills, ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="ats-header-search-clear"
                onClick={() => onSearchChange('')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* RBAC Role Switcher Pill (Phase 10) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-700">
          <UserCheck className="w-3.5 h-3.5" />
          <select
            value={activeRole}
            onChange={handleRoleChange}
            className="bg-transparent font-bold focus:outline-hidden cursor-pointer text-xs text-indigo-700"
          >
            {RBAC_ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.badge}: {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* SaaS Billing & Subscriptions Trigger (Phase 15) */}
        <button
          type="button"
          onClick={() => setShowBilling(true)}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          title="SaaS Subscriptions, Stripe & Seat Licensing"
        >
          <CreditCard className="w-4 h-4" />
        </button>

        {/* Compliance Suite Trigger (Phase 10) */}
        <button
          type="button"
          onClick={() => setShowCompliance(true)}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          title="GDPR & SOC-2 Compliance Suite"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Real-time Notification Bell (Phase 7) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative"
            title="Team Notifications & Mentions"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* Notification Center Dropdown */}
          <NotificationCenterModal
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {actions}
      </div>

      {/* GDPR & SOC-2 Compliance Suite Modal */}
      <ComplianceModal
        isOpen={showCompliance}
        onClose={() => setShowCompliance(false)}
      />

      {/* SaaS Subscription & Stripe Checkout Modal (Phase 15) */}
      <BillingModal
        isOpen={showBilling}
        onClose={() => setShowBilling(false)}
      />
    </header>
  );
}

export default Header;
