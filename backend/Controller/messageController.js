import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

const inMemoryMessages = new Map();

function getInitialMessages(candidateId) {
  return [
    {
      id: `msg-${Date.now()}-1`,
      candidateId,
      sender: "Elena Rostova (Recruiter)",
      senderType: "RECRUITER",
      channel: "IN_APP",
      text: "Hello! Thank you for applying. We were impressed with your technical background and are excited to connect.",
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: `msg-${Date.now()}-2`,
      candidateId,
      sender: "Candidate",
      senderType: "CANDIDATE",
      channel: "IN_APP",
      text: "Hi Elena! Thank you for the update. I look forward to speaking with the engineering team.",
      timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    },
  ];
}

export const messageController = {
  /**
   * Get all messages for a candidate
   */
  async getMessages(req, res, next) {
    try {
      const { candidateId } = req.params;
      let messages = inMemoryMessages.get(candidateId);

      if (!messages && db) {
        try {
          const snapshot = await db
            .collection("messages")
            .where("candidateId", "==", candidateId)
            .orderBy("timestamp", "asc")
            .get();
          if (!snapshot.empty) {
            messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          }
        } catch (e) {
          // fallback
        }
      }

      if (!messages || messages.length === 0) {
        messages = getInitialMessages(candidateId);
        inMemoryMessages.set(candidateId, messages);
      }

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Send a direct message (In-App, SMS, or WhatsApp)
   */
  async sendMessage(req, res, next) {
    try {
      const {
        candidateId,
        sender = "Elena Rostova",
        senderType = "RECRUITER", // RECRUITER or CANDIDATE
        text,
        channel = "IN_APP", // IN_APP, SMS, WHATSAPP
      } = req.body;

      if (!candidateId || !text) {
        return res.status(400).json({
          success: false,
          error: { message: "Candidate ID and message text are required." },
        });
      }

      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        candidateId,
        sender,
        senderType,
        channel,
        text,
        timestamp: new Date().toISOString(),
      };

      const existing = inMemoryMessages.get(candidateId) || getInitialMessages(candidateId);
      const updated = [...existing, newMsg];
      inMemoryMessages.set(candidateId, updated);

      if (db) {
        try {
          await db.collection("messages").doc(newMsg.id).set(newMsg);
        } catch (e) {
          // non-blocking
        }
      }

      // Broadcast real-time SSE event
      notificationStreamService.broadcast("MESSAGE_RECEIVED", newMsg);

      console.log(`💬 [MESSAGE SENT] Channel: ${channel} | From: ${sender} (${senderType}) to ${candidateId}`);

      return res.status(201).json({
        success: true,
        data: newMsg,
        message: channel === "IN_APP" ? "Message delivered." : `${channel} alert dispatched.`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Dispatch automated SMS/WhatsApp Interview Reminder
   */
  async sendSmsReminder(req, res, next) {
    try {
      const {
        candidateId,
        candidateName,
        phone = "+1 (555) 382-9912",
        jobTitle = "Senior Full Stack Engineer",
        interviewTime,
        meetingUrl = "https://meet.google.com/xyz-hirebridge",
        channel = "SMS", // SMS or WHATSAPP
      } = req.body;

      const reminderText = `Reminder: Your interview for ${jobTitle} at Apex Global Tech is scheduled for ${new Date(
        interviewTime || Date.now() + 7200000
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Join: ${meetingUrl}`;

      const smsRecord = {
        id: `sms-${Date.now()}`,
        candidateId,
        candidateName,
        phone,
        channel,
        text: reminderText,
        status: "DELIVERED",
        sentAt: new Date().toISOString(),
      };

      if (db) {
        try {
          await db.collection("sms_logs").doc(smsRecord.id).set(smsRecord);
        } catch (e) {
          // non-blocking
        }
      }

      notificationStreamService.broadcast("SMS_REMINDER_SENT", smsRecord);

      return res.status(200).json({
        success: true,
        data: smsRecord,
        message: `${channel} reminder dispatched successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },
};
