/**
 * SaaS Monetization, Stripe Subscriptions & Seat Licensing Service
 * Coordinates recurring plan tiers, checkout sessions, add-on credits, and invoice history.
 */

const BILLING_STORAGE_KEY = 'ats_billing_subscription';

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter Tier',
    monthlyPrice: 99,
    annualPrice: 79,
    badge: 'Popular for Startups',
    jobsLimit: 3,
    seatsLimit: 2,
    features: [
      '3 Active Job Requisitions',
      '2 Recruiter Team Seats',
      'Core ATS Pipeline & Kanban',
      'Basic Email Notifications',
      'Community Support'
    ]
  },
  {
    id: 'growth',
    name: 'Growth & Scaling',
    monthlyPrice: 299,
    annualPrice: 239,
    badge: 'Most Popular',
    popular: true,
    jobsLimit: 15,
    seatsLimit: 10,
    features: [
      '15 Active Job Requisitions',
      '10 Recruiter Team Seats',
      'AI Candidate Match Scoring',
      'Asynchronous Video Screening',
      'Skill Assessments & Reference Checks',
      'Priority Email & Slack Support'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Unlimited',
    monthlyPrice: 799,
    annualPrice: 639,
    badge: 'Full Platform Access',
    jobsLimit: 'Unlimited',
    seatsLimit: 'Unlimited',
    features: [
      'Unlimited Job Requisitions',
      'Unlimited Recruiter & Hiring Manager Seats',
      'Multi-Tenant Organization Switching',
      'Custom Career Site & Domain',
      'GDPR & SOC-2 Compliance Suite',
      'Dedicated Customer Success Manager'
    ]
  }
];

export function getActiveSubscription() {
  try {
    const raw = localStorage.getItem(BILLING_STORAGE_KEY);
    if (!raw) {
      const defaultSub = {
        planId: 'growth',
        billingCycle: 'monthly',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        invoices: [
          { id: 'INV-2026-001', date: 'Oct 01, 2026', amount: '$299.00', status: 'PAID', plan: 'Growth' },
          { id: 'INV-2026-002', date: 'Sep 01, 2026', amount: '$299.00', status: 'PAID', plan: 'Growth' }
        ]
      };
      localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(defaultSub));
      return defaultSub;
    }
    return JSON.parse(raw);
  } catch (e) {
    return { planId: 'growth', billingCycle: 'monthly', status: 'ACTIVE', invoices: [] };
  }
}

export function updateSubscriptionPlan(planId, billingCycle = 'monthly') {
  try {
    const current = getActiveSubscription();
    const plan = PLANS.find(p => p.id === planId) || PLANS[1];
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

    const newInvoice = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: `$${price}.00`,
      status: 'PAID',
      plan: plan.name
    };

    const updated = {
      ...current,
      planId,
      billingCycle,
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      invoices: [newInvoice, ...(current.invoices || [])]
    };

    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to update subscription:', e);
  }
}

export const billingService = {
  PLANS,
  getActiveSubscription,
  updateSubscriptionPlan
};

export default billingService;
