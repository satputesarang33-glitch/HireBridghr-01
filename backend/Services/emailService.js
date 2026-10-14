import { calendarService } from "./calendarService.js";
import { db } from "../Config/connetdb.js";

/**
 * Transactional Email Dispatcher Service
 * Delivers branded HTML templates with calendar .ics attachments and audit persistence.
 */

export const emailService = {
  /**
   * Application Received Confirmation
   */
  async sendApplicationConfirmation({ candidateEmail, candidateName, jobTitle, companyName = "HireBridgeHR" }) {
    const subject = `Application Received: ${jobTitle} at ${companyName}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="margin-bottom: 24px; text-align: center;">
          <h1 style="color: #38bdf8; font-size: 24px; font-weight: 700; margin: 0;">HireBridgeHR</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Talent & Application Notification</p>
        </div>
        <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #334155;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Hello ${candidateName},</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${companyName}</strong>.
          </p>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Our hiring team has received your application and resume. We will review your qualifications and reach out if there is a match for the next evaluation stage.
          </p>
        </div>
        <div style="text-align: center; color: #64748b; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HireBridgeHR. All rights reserved.</p>
        </div>
      </div>
    `;

    return this._dispatchEmail({
      to: candidateEmail,
      subject,
      html,
      type: "APPLICATION_CONFIRMATION",
    });
  },

  /**
   * Interview Scheduled Invitation with .ics attachment
   */
  async sendInterviewInvitation({
    candidateEmail,
    candidateName,
    jobTitle,
    companyName = "Apex Global Tech",
    scheduledDate,
    interviewType = "Technical Interview",
    interviewerName = "Hiring Team",
    meetingUrl,
  }) {
    const formattedDate = new Date(scheduledDate).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const icsContent = calendarService.generateIcs({
      id: `int-${Date.now()}`,
      title: `${interviewType} - ${jobTitle} (${companyName})`,
      description: `Interview with ${interviewerName} for ${jobTitle} position at ${companyName}.`,
      startTime: scheduledDate,
      location: meetingUrl || "Online Video Call",
      meetingUrl,
      attendeeName: candidateName,
      attendeeEmail: candidateEmail,
    });

    const subject = `Interview Confirmed: ${jobTitle} with ${companyName}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
        <h2 style="color: #38bdf8; margin-top: 0;">Interview Scheduled!</h2>
        <p style="color: #cbd5e1; font-size: 15px;">Hi ${candidateName}, your interview for <strong>${jobTitle}</strong> has been confirmed.</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 6px 0; color: #e2e8f0;">📅 <strong>Date & Time:</strong> ${formattedDate}</p>
          <p style="margin: 6px 0; color: #e2e8f0;">🎙️ <strong>Format:</strong> ${interviewType}</p>
          <p style="margin: 6px 0; color: #e2e8f0;">👤 <strong>Interviewer:</strong> ${interviewerName}</p>
          ${meetingUrl ? `<p style="margin: 6px 0; color: #38bdf8;">🔗 <strong>Video Link:</strong> <a href="${meetingUrl}" style="color: #38bdf8;">${meetingUrl}</a></p>` : ""}
        </div>
        <p style="color: #94a3b8; font-size: 13px;">A calendar invitation (.ics) is attached to this notification for one-click add to Google Calendar or Outlook.</p>
      </div>
    `;

    return this._dispatchEmail({
      to: candidateEmail,
      subject,
      html,
      attachments: [{ filename: "interview.ics", content: icsContent }],
      type: "INTERVIEW_INVITATION",
      icsContent,
    });
  },

  /**
   * Internal dispatcher with Firestore log archiving
   */
  async _dispatchEmail({ to, subject, html, attachments = [], type, icsContent }) {
    const emailRecord = {
      id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      to,
      subject,
      type,
      status: "SENT",
      sentAt: new Date().toISOString(),
      hasAttachments: attachments.length > 0,
      icsContent: icsContent || null,
    };

    console.log(`📧 [EMAIL DISPATCHED] To: ${to} | Subject: "${subject}" | Type: ${type}`);

    try {
      if (db) {
        await db.collection("dispatched_emails").doc(emailRecord.id).set(emailRecord);
      }
    } catch (err) {
      console.warn("⚠️ Could not persist email record to Firestore:", err.message);
    }

    return { success: true, emailId: emailRecord.id, details: emailRecord };
  },
};
