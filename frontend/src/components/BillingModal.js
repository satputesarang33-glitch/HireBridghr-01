import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Download,
  X,
  Sparkles,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { Button } from './Button.js';
import { billingService, PLANS } from '../utils/billingService.js';
import './BillingModal.css';

export function BillingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [subscription, setSubscription] = useState(() => billingService.getActiveSubscription());
  const [cycle, setCycle] = useState(subscription.billingCycle || 'monthly'); // 'monthly' | 'annual'
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSelectPlan = (planId) => {
    setIsUpgrading(true);
    setTimeout(() => {
      const updated = billingService.updateSubscriptionPlan(planId, cycle);
      setSubscription(updated);
      setIsUpgrading(false);
      setSuccessMsg(`Successfully subscribed to ${updated.planId.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 600);
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-billing-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Subscription Plans & SaaS Billing</h3>
              <p className="text-[11px] text-slate-500">
                Manage organization seat licenses, active job limits, and Stripe invoices
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ats-modal-close-btn text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {/* Monthly / Annual Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${cycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setCycle(cycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 bg-indigo-600 rounded-full p-0.5 transition-colors relative"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  cycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${cycle === 'annual' ? 'text-slate-900' : 'text-slate-400'} flex items-center gap-1`}>
              Annual Billing
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Save 20%
              </span>
            </span>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {PLANS.map((plan) => {
              const isCurrent = subscription.planId === plan.id;
              const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

              return (
                <div
                  key={plan.id}
                  className={`ats-plan-card ${isCurrent ? 'current' : ''} ${plan.popular ? 'popular' : ''}`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                          Current Plan
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">${price}</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{plan.badge}</p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant={isCurrent ? 'secondary' : 'primary'}
                    size="sm"
                    className="w-full"
                    disabled={isCurrent || isUpgrading}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrent ? 'Active Subscription' : `Switch to ${plan.name}`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Billing Invoices Table */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Recent Stripe Invoices & Receipts
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="text-left p-2.5">Invoice ID</th>
                    <th className="text-left p-2.5">Billing Date</th>
                    <th className="text-left p-2.5">Plan Tier</th>
                    <th className="text-left p-2.5">Amount</th>
                    <th className="text-left p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(subscription.invoices || []).map((inv) => (
                    <tr key={inv.id} className="border-b border-slate-100 last:border-none">
                      <td className="p-2.5 font-mono text-slate-700">{inv.id}</td>
                      <td className="p-2.5 text-slate-600">{inv.date}</td>
                      <td className="p-2.5 font-medium text-slate-900">{inv.plan}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{inv.amount}</td>
                      <td className="p-2.5">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="ats-modal-footer border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-500">
            Powered by Stripe Billing. Payments secured with 256-bit SSL encryption.
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default BillingModal;
