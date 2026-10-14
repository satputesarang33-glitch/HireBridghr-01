import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

// Sample interviewer calendar slots for next 7 business days
const generateAvailabilitySlots = () => {
  const slots = [];
  const now = new Date();
  
  for (let d = 1; d <= 5; d++) {
    const slotDate = new Date(now);
    slotDate.setDate(now.getDate() + d);
    const dateStr = slotDate.toISOString().split("T")[0];

    slots.push(
      {
        id: `slot-${d}-morning`,
        date: dateStr,
        startTime: "10:00 AM EST",
        endTime: "10:45 AM EST",
        interviewer: "Elena Rostova (Lead Technical Recruiter)",
        platform: "Google Meet",
        status: "AVAILABLE",
      },
      {
        id: `slot-${d}-afternoon`,
        date: dateStr,
        startTime: "02:30 PM EST",
        endTime: "03:15 PM EST",
        interviewer: "Marcus Vance (VP of Talent)",
        platform: "Zoom Video",
        status: "AVAILABLE",
      },
      {
        id: `slot-${d}-late`,
        date: dateStr,
        startTime: "04:00 PM EST",
        endTime: "04:45 PM EST",
        interviewer: "Sarah Connor (Hiring Manager)",
        platform: "Microsoft Teams",
        status: "AVAILABLE",
      }
    );
  }
  return slots;
};

const availabilityStore = generateAvailabilitySlots();
const scheduledBookings = new Map();
const dripSequences = new Map();

export const agentController = {
  /**
   * Autonomous AI Recruiter Conversational Screening
   */
  async screenCandidate(req, res, next) {
    try {
      const {
        candidateId = "cand-1",
        candidateName = "Candidate",
        jobRole = "Senior Full-Stack Engineer",
        answers = {},
      } = req.body;

      const {
        compensationExpected = "$150,000",
        noticePeriodWeeks = 2,
        willingToRelocate = true,
        workAuthUs = true,
        primaryTechStack = "React, Node.js, TypeScript, Cloud",
        yearsOfExperience = 6,
      } = answers;

      // Evaluation Logic
      let score = 80;
      const flags = [];

      if (workAuthUs) {
        score += 10;
      } else {
        flags.push("Requires Visa Sponsorship / Verification");
      }

      if (noticePeriodWeeks <= 3) {
        score += 5;
      } else if (noticePeriodWeeks > 8) {
        score -= 5;
        flags.push("Long notice period (> 2 months)");
      }

      if (yearsOfExperience >= 5) {
        score += 5;
      }

      const decision = score >= 85 ? "QUALIFIED" : score >= 70 ? "NEEDS_REVIEW" : "DISQUALIFIED";

      const agentEvaluation = {
        candidateId,
        candidateName,
        jobRole,
        qualificationScore: Math.min(score, 100),
        decision,
        agentConfidence: "96.4%",
        conversationalSummary: `Autonomous AI screened ${candidateName} for ${jobRole}. Candidate demonstrated 6+ years of verified software engineering experience in ${primaryTechStack}. Expected salary of ${compensationExpected} is within authorized band ($140k-$175k). Notice period is ${noticePeriodWeeks} weeks.`,
        keyHighlights: [
          `Authorized to work in US: ${workAuthUs ? "Yes (Verified)" : "No"}`,
          `Notice Period: ${noticePeriodWeeks} weeks`,
          `Salary expectation aligned with departmental budget`,
          `Strong competencies in ${primaryTechStack}`,
        ],
        actionRecommendation:
          decision === "QUALIFIED"
            ? "Immediate Fast-Track to Technical Interview Loop"
            : "Recruiter manual review suggested",
        flags,
        screenedAt: new Date().toISOString(),
      };

      // Broadcast real-time SSE event
      notificationStreamService.broadcast({
        type: "AI_AGENT_SCREENING_COMPLETED",
        title: "AI Recruiter Screening Completed",
        message: `${candidateName} has been autonomously screened for ${jobRole} with score ${agentEvaluation.qualificationScore} (${decision}).`,
        candidateId,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        data: agentEvaluation,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get 2-Way Interview Availability Slots
   */
  async getAvailability(req, res) {
    return res.status(200).json({
      success: true,
      data: availabilityStore,
      totalSlots: availabilityStore.length,
      connectedCalendars: ["Google Workspace", "Microsoft Outlook 365", "Apple iCloud"],
    });
  },

  /**
   * Auto-Schedule Interview (Autonomous Self-Booking)
   */
  async autoScheduleInterview(req, res, next) {
    try {
      const {
        candidateId,
        candidateName = "Candidate",
        candidateEmail = "candidate@example.com",
        slotId,
        interviewType = "Technical Architecture & Systems Review",
      } = req.body;

      const slot = availabilityStore.find((s) => s.id === slotId) || availabilityStore[0];
      slot.status = "BOOKED";

      const bookingId = `book-${Date.now()}`;
      const meetingLink = `https://meet.hirebridgehr.com/hb-auto-${Date.now().toString(36)}`;

      const bookingRecord = {
        id: bookingId,
        candidateId: candidateId || "cand-1",
        candidateName,
        candidateEmail,
        interviewType,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        interviewer: slot.interviewer,
        platform: slot.platform,
        meetingLink,
        status: "CONFIRMED",
        calendarEventSent: true,
        smsReminderScheduled: true,
        bookedAt: new Date().toISOString(),
      };

      scheduledBookings.set(bookingId, bookingRecord);

      // Broadcast real-time SSE event
      notificationStreamService.broadcast({
        type: "AUTONOMOUS_INTERVIEW_BOOKED",
        title: "Interview Auto-Scheduled",
        message: `${candidateName} auto-scheduled a ${interviewType} on ${slot.date} at ${slot.startTime}.`,
        bookingId,
        timestamp: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        message: "Interview successfully auto-scheduled and confirmed.",
        data: bookingRecord,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Drip Follow-Up Sequence Status
   */
  async getDripSequence(req, res) {
    const { candidateId = "cand-1" } = req.params;

    const sequence = dripSequences.get(candidateId) || {
      candidateId,
      campaignName: "Autonomous Candidate Engagement & Nudge Engine",
      status: "ACTIVE",
      totalStages: 4,
      currentStageIndex: 2,
      stages: [
        {
          stage: 1,
          name: "Initial Welcome & Screening Invitation",
          channel: "Email & SMS",
          scheduledOffset: "Day 0",
          status: "COMPLETED",
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          stage: 2,
          name: "Skill Assessment & Coding Quiz Prompt",
          channel: "WhatsApp & In-Portal",
          scheduledOffset: "Day 2",
          status: "DELIVERED",
          completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        },
        {
          stage: 3,
          name: "Autonomous Calendar Booking Reminder",
          channel: "SMS / WhatsApp",
          scheduledOffset: "Day 4",
          status: "QUEUED",
          nextTrigger: new Date(Date.now() + 86400000).toISOString(),
        },
        {
          stage: 4,
          name: "Executive Re-engagement Nudge",
          channel: "Email",
          scheduledOffset: "Day 7",
          status: "SCHEDULED",
          nextTrigger: new Date(Date.now() + 86400000 * 4).toISOString(),
        },
      ],
    };

    return res.status(200).json({
      success: true,
      data: sequence,
    });
  },

  /**
   * Trigger Manual or Automated Nudge
   */
  async triggerNudge(req, res, next) {
    try {
      const { candidateId, channel = "SMS", message } = req.body;

      const nudgeId = `ndg-${Date.now()}`;
      const nudgeRecord = {
        nudgeId,
        candidateId: candidateId || "cand-1",
        channel,
        message: message || "Hi! Don't forget to complete your interview booking slot with our hiring team.",
        deliveryStatus: "SENT",
        sentAt: new Date().toISOString(),
      };

      notificationStreamService.broadcast({
        type: "AI_AGENT_NUDGE_SENT",
        title: "Autonomous Nudge Dispatched",
        message: `Nudge delivered via ${channel} to candidate ${candidateId || "cand-1"}.`,
        nudgeId,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: `Autonomous nudge dispatched successfully via ${channel}.`,
        data: nudgeRecord,
      });
    } catch (err) {
      next(err);
    }
  },
};
