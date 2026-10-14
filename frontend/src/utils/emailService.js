/**
 * Automated Email Triggers & Notification Service
 * Manages transactional candidate communications and records sent history.
 */

const STORAGE_KEY = 'ats_sent_emails';

export function getSentEmails() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function logSentEmail(emailRecord) {
  try {
    const emails = getSentEmails();
    const entry = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...emailRecord
    };
    const updated = [entry, ...emails];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (e) {
    console.error('Failed to log email:', e);
  }
}

export const emailService = {
  // 1. Application Receipt Confirmation
  sendApplicationReceived: ({ candidateName, candidateEmail, jobTitle, company }) => {
    return logSentEmail({
      to: candidateEmail,
      recipientName: candidateName,
      subject: `Application Received: ${jobTitle} at ${company}`,
      type: 'APPLICATION_RECEIVED',
      body: `Hi ${candidateName},\n\nThank you for applying for the ${jobTitle} position at ${company}. We have received your application and our recruitment team is currently reviewing your profile.\n\nWe will be in touch with next steps soon!\n\nBest regards,\n${company} Talent Acquisition Team`
    });
  },

  // 2. Interview Invitation
  sendInterviewInvitation: ({
    candidateName,
    candidateEmail,
    jobTitle,
    company,
    date,
    time,
    duration = '45 min',
    meetUrl,
    interviewerName = 'Lead Recruiter'
  }) => {
    return logSentEmail({
      to: candidateEmail,
      recipientName: candidateName,
      subject: `Interview Invitation: ${jobTitle} with ${company}`,
      type: 'INTERVIEW_INVITATION',
      meetingUrl: meetUrl,
      body: `Hi ${candidateName},\n\nWe were impressed with your application and would love to invite you for an interview for the ${jobTitle} role!\n\n📅 Date: ${date}\n⏰ Time: ${time} (${duration})\n👤 Interviewer: ${interviewerName}\n🔗 Meeting Link: ${meetUrl}\n\nPlease click the link at your scheduled time. Let us know if you need to reschedule.\n\nBest regards,\n${company} Hiring Team`
    });
  },

  // 3. Formal Offer Letter Email
  sendOfferLetter: ({
    candidateName,
    candidateEmail,
    jobTitle,
    company,
    salary,
    currency = 'USD',
    startDate,
    offerDeadline
  }) => {
    return logSentEmail({
      to: candidateEmail,
      recipientName: candidateName,
      subject: `Offer of Employment: ${jobTitle} at ${company}`,
      type: 'OFFER_LETTER',
      body: `Dear ${candidateName},\n\nOn behalf of ${company}, we are thrilled to extend a formal offer of employment for the position of ${jobTitle}!\n\n💼 Compensation: ${currency} ${salary}\n📅 Proposed Start Date: ${startDate}\n⏳ Offer Valid Until: ${offerDeadline}\n\nPlease review your formal offer packet and let us know if you have any questions.\n\nWelcome to the team!\n\nBest regards,\n${company} Executive Leadership`
    });
  },

  // 4. Polite Status Rejection
  sendRejection: ({ candidateName, candidateEmail, jobTitle, company }) => {
    return logSentEmail({
      to: candidateEmail,
      recipientName: candidateName,
      subject: `Update regarding your application for ${jobTitle} at ${company}`,
      type: 'REJECTION',
      body: `Hi ${candidateName},\n\nThank you for taking the time to speak with our team regarding the ${jobTitle} position at ${company}. While your background is impressive, we have decided to move forward with another candidate whose experience more closely aligns with our immediate needs.\n\nWe wish you all the best in your career search.\n\nWarm regards,\n${company} Talent Team`
    });
  }
};

export default emailService;
