/**
 * Calendar & iCal (.ics) Generator Service
 * Implements RFC 5545 compliant calendar invitations for Google Calendar, Outlook, and Apple Calendar.
 */

export const calendarService = {
  /**
   * Generates a valid .ics calendar invite content
   */
  generateIcs({
    id = `interview-${Date.now()}`,
    title,
    description = "",
    startTime,
    endTime,
    location = "Online Video Call",
    meetingUrl = "",
    organizerName = "HireBridgeHR Talent Team",
    organizerEmail = "interviews@hirebridgehr.com",
    attendeeName,
    attendeeEmail,
  }) {
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    };

    const start = formatDate(startTime);
    // Default 45 minutes if no end time provided
    const end = endTime
      ? formatDate(endTime)
      : formatDate(new Date(new Date(startTime).getTime() + 45 * 60 * 1000));
    const now = formatDate(new Date());

    const cleanDescription = (description + (meetingUrl ? `\n\nJoin Meeting: ${meetingUrl}` : "")).replace(/\n/g, "\\n");

    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//HireBridgeHR//Interview Scheduling Platform//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${id}@hirebridgehr.com`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${cleanDescription}`,
      `LOCATION:${location}`,
      meetingUrl ? `URL;VALUE=URI:${meetingUrl}` : "",
      `ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}`,
      attendeeEmail ? `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${attendeeName || attendeeEmail}:mailto:${attendeeEmail}` : "",
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: Upcoming Interview",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
  },

  /**
   * Generates a realistic Google Meet or Zoom meeting link
   */
  generateMeetingUrl(provider = "google_meet", id = "") {
    const slug = id || Math.random().toString(36).substring(2, 10);
    if (provider === "zoom") {
      const numericId = Math.floor(1000000000 + Math.random() * 9000000000);
      return `https://zoom.us/j/${numericId}?pwd=${slug}`;
    }
    // Default Google Meet format: abc-defg-hij
    const part1 = slug.slice(0, 3).padEnd(3, "x");
    const part2 = slug.slice(3, 7).padEnd(4, "y");
    const part3 = slug.slice(7, 10).padEnd(3, "z");
    return `https://meet.google.com/${part1}-${part2}-${part3}`;
  },
};
