import { webhookService } from "../Services/webhookService.js";
import { db } from "../Config/connetdb.js";

let registeredWebhooks = [
  {
    id: "wh-slack-1",
    name: "Slack #hiring-announcements",
    url: "https://api.hirebridgehr.com/webhooks/slack-hiring-channel",
    platform: "SLACK",
    events: ["candidate.hired", "offer.signed", "interview.scheduled", "job.published"],
    secret: "whsec_hirebridge_slack_secret_123",
    isActive: true,
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "wh-bamboohr-1",
    name: "BambooHR Employee Sync",
    url: "https://api.bamboohr.com/api/gateway.php/hirebridge/v1/employees",
    platform: "BAMBOOHR",
    events: ["candidate.hired", "offer.signed"],
    secret: "whsec_bamboohr_sync_987",
    isActive: true,
    createdAt: "2026-03-05T14:30:00Z",
  },
  {
    id: "wh-workday-1",
    name: "Workday Enterprise HCM Connector",
    url: "https://wd2-impl-services1.workday.com/ccx/service/customreport2/hirebridge/Worker_Sync",
    platform: "WORKDAY",
    events: ["candidate.hired"],
    secret: "whsec_workday_secure_456",
    isActive: true,
    createdAt: "2026-03-08T09:15:00Z",
  },
];

let webhookLogs = [
  {
    id: "log-1",
    webhookName: "Slack #hiring-announcements",
    platform: "SLACK",
    eventType: "job.published",
    status: "DELIVERED",
    statusCode: 200,
    deliveredAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "log-2",
    webhookName: "BambooHR Employee Sync",
    platform: "BAMBOOHR",
    eventType: "candidate.hired",
    status: "DELIVERED",
    statusCode: 200,
    deliveredAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Validates target URL against SSRF attack vectors
 */
const isValidWebhookUrl = (targetUrl) => {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    // Block internal metadata services and private loopbacks in production
    if (process.env.NODE_ENV === "production") {
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "169.254.169.254" ||
        hostname.startsWith("10.") ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("172.16.")
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

/**
 * Helper to mask sensitive webhook secrets
 */
const maskSecret = (secret) => {
  if (!secret) return "";
  if (secret.length <= 8) return "••••••••";
  return `${secret.slice(0, 6)}••••••••`;
};

export const webhookController = {
  /**
   * Get all registered webhooks with masked secrets
   */
  async getWebhooks(req, res) {
    const safeWebhooks = registeredWebhooks.map((h) => ({
      ...h,
      secret: maskSecret(h.secret),
    }));

    return res.status(200).json({
      success: true,
      data: safeWebhooks,
    });
  },

  /**
   * Register a new webhook (with SSRF defense)
   */
  async createWebhook(req, res) {
    const { name, url, platform = "CUSTOM", events = ["*"], secret } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: { message: "Webhook name and target URL are required." },
      });
    }

    if (!isValidWebhookUrl(url)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid webhook URL. Must be a valid public HTTP or HTTPS endpoint." },
      });
    }

    const rawSecret = secret || `whsec_${Math.random().toString(36).substr(2, 12)}`;

    const newHook = {
      id: `wh-${Date.now()}`,
      name: String(name).slice(0, 80),
      url: String(url),
      platform,
      events: Array.isArray(events) ? events : [events],
      secret: rawSecret,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    registeredWebhooks = [newHook, ...registeredWebhooks];

    if (db) {
      try {
        await db.collection("webhooks").doc(newHook.id).set(newHook);
      } catch (e) {
        // non-blocking
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        ...newHook,
        secret: maskSecret(newHook.secret),
      },
      message: "Webhook registered successfully.",
    });
  },

  /**
   * Send a test ping event
   */
  async testWebhook(req, res, next) {
    try {
      const {
        eventType = "test.ping",
        payload = { message: "Test integration ping from HireBridgeHR" },
      } = req.body;
      const result = await webhookService.dispatchEvent(eventType, payload);

      return res.status(200).json({
        success: true,
        data: result,
        message: "Test webhook event dispatched successfully.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get delivery logs
   */
  async getLogs(req, res) {
    let logs = webhookLogs;
    if (db) {
      try {
        const snap = await db.collection("webhook_logs").limit(20).get();
        if (!snap.empty) {
          logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        // non-blocking
      }
    }

    return res.status(200).json({
      success: true,
      data: logs,
    });
  },
};
