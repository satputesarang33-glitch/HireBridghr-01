import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";
import { webhookService } from "../Services/webhookService.js";

const PLANS = [
  {
    id: "starter",
    name: "Starter Tier",
    monthlyPrice: 99,
    annualPrice: 79,
    jobsLimit: 3,
    seatsLimit: 2,
    features: [
      "3 Active Job Requisitions",
      "2 Recruiter Team Seats",
      "Core ATS Pipeline & Kanban",
      "Basic Email Notifications",
    ],
  },
  {
    id: "growth",
    name: "Growth & Scaling",
    monthlyPrice: 299,
    annualPrice: 239,
    popular: true,
    jobsLimit: 15,
    seatsLimit: 10,
    features: [
      "15 Active Job Requisitions",
      "10 Recruiter Team Seats",
      "AI Candidate Match Scoring",
      "Direct Messaging & SMS Alerts",
      "Multi-Board Distribution Feeds",
      "Priority Email & Slack Support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Unlimited",
    monthlyPrice: 799,
    annualPrice: 639,
    jobsLimit: "Unlimited",
    seatsLimit: "Unlimited",
    features: [
      "Unlimited Job Requisitions",
      "Unlimited Team Seats",
      "Outbound HRIS Webhooks (BambooHR, Workday, Slack)",
      "Digital Offer Letters & e-Signatures",
      "Custom Careers Domain & Liquid Glass Themes",
      "Dedicated Account Manager",
    ],
  },
];

let activeSubscription = {
  planId: "growth",
  planName: "Growth & Scaling",
  status: "ACTIVE",
  billingCycle: "monthly",
  amount: 299,
  currency: "USD",
  currentPeriodStart: new Date(Date.now() - 10 * 86400000).toISOString(),
  currentPeriodEnd: new Date(Date.now() + 20 * 86400000).toISOString(),
  activeJobsCount: 5,
  jobsLimit: 15,
  activeSeatsCount: 3,
  seatsLimit: 10,
  paymentMethod: {
    brand: "visa",
    last4: "4242",
    expMonth: 12,
    expYear: 2028,
  },
};

let invoiceHistory = [
  {
    id: "inv-2026-03",
    date: "2026-03-01T00:00:00Z",
    amount: 299,
    currency: "USD",
    plan: "Growth & Scaling (Monthly)",
    status: "PAID",
    downloadUrl: "/invoices/inv-2026-03.pdf",
  },
  {
    id: "inv-2026-02",
    date: "2026-02-01T00:00:00Z",
    amount: 299,
    currency: "USD",
    plan: "Growth & Scaling (Monthly)",
    status: "PAID",
    downloadUrl: "/invoices/inv-2026-02.pdf",
  },
];

export const billingController = {
  /**
   * Get all available subscription plans
   */
  async getPlans(req, res) {
    return res.status(200).json({
      success: true,
      data: PLANS,
    });
  },

  /**
   * Get current subscription & usage stats
   */
  async getSubscription(req, res) {
    return res.status(200).json({
      success: true,
      data: activeSubscription,
    });
  },

  /**
   * Create Checkout Session / Upgrade Subscription Plan
   */
  async createCheckout(req, res, next) {
    try {
      const { planId = "enterprise", billingCycle = "monthly" } = req.body;
      const targetPlan = PLANS.find((p) => p.id === planId) || PLANS[1];

      const price = billingCycle === "annual" ? targetPlan.annualPrice * 12 : targetPlan.monthlyPrice;

      // Update current subscription
      activeSubscription = {
        ...activeSubscription,
        planId: targetPlan.id,
        planName: targetPlan.name,
        status: "ACTIVE",
        billingCycle,
        amount: price,
        jobsLimit: targetPlan.jobsLimit,
        seatsLimit: targetPlan.seatsLimit,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      };

      const newInvoice = {
        id: `inv-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        amount: price,
        currency: "USD",
        plan: `${targetPlan.name} (${billingCycle})`,
        status: "PAID",
        downloadUrl: `/invoices/inv-${Date.now()}.pdf`,
      };
      invoiceHistory = [newInvoice, ...invoiceHistory];

      // Broadcast SSE & Webhook
      notificationStreamService.broadcast("SUBSCRIPTION_UPDATED", activeSubscription);
      await webhookService.dispatchEvent("billing.subscription_updated", {
        plan: targetPlan.name,
        amount: price,
        billingCycle,
      });

      return res.status(200).json({
        success: true,
        data: {
          subscription: activeSubscription,
          invoice: newInvoice,
          checkoutUrl: `https://checkout.stripe.com/pay/cs_live_${Date.now()}`,
        },
        message: `Plan updated successfully to ${targetPlan.name}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Stripe Webhook Handler
   */
  async handleWebhook(req, res) {
    const event = req.body || { type: "invoice.payment_succeeded" };
    console.log(`💳 [STRIPE WEBHOOK RECEIVED] Type: "${event.type}"`);

    if (event.type === "invoice.payment_succeeded") {
      const invoice = {
        id: `inv-${Date.now()}`,
        date: new Date().toISOString(),
        amount: event.data?.object?.amount_due ? event.data.object.amount_due / 100 : 299,
        currency: "USD",
        plan: "Growth & Scaling",
        status: "PAID",
      };
      invoiceHistory = [invoice, ...invoiceHistory];
      notificationStreamService.broadcast("INVOICE_PAID", invoice);
    }

    return res.status(200).json({ received: true });
  },

  /**
   * Get invoice history
   */
  async getInvoices(req, res) {
    return res.status(200).json({
      success: true,
      data: invoiceHistory,
    });
  },
};
