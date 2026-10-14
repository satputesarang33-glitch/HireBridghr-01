/**
 * Candidate Direct Messaging & Multi-Channel SMS/WhatsApp Service
 * Coordinates two-way recruiter-candidate communications and alert delivery.
 */

const MSG_STORAGE_KEY = 'ats_candidate_messages';
const SMS_STORAGE_KEY = 'ats_sms_logs';

export function getCandidateMessages(candidateId) {
  try {
    const raw = localStorage.getItem(MSG_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[candidateId] || getDefaultMessages(candidateId);
  } catch (e) {
    return getDefaultMessages(candidateId);
  }
}

function getDefaultMessages(candidateId) {
  return [
    {
      id: `msg-${Date.now()}-1`,
      sender: 'Elena Rostova (Recruiter)',
      senderType: 'RECRUITER',
      channel: 'IN_APP',
      text: 'Hello! Thank you for applying to our team. We were impressed with your background and are excited to connect.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `msg-${Date.now()}-2`,
      sender: 'Candidate',
      senderType: 'CANDIDATE',
      channel: 'IN_APP',
      text: 'Hi Elena! Thank you for the update. I am very interested in the role and look forward to the next steps.',
      timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export function sendCandidateMessage({ candidateId, sender, senderType = 'RECRUITER', text, channel = 'IN_APP' }) {
  try {
    const raw = localStorage.getItem(MSG_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const list = all[candidateId] || getDefaultMessages(candidateId);

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender,
      senderType,
      channel,
      text,
      timestamp: new Date().toISOString()
    };

    all[candidateId] = [...list, newMsg];
    localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(all));

    // If SMS or WhatsApp, log to outgoing SMS queue
    if (channel === 'SMS' || channel === 'WHATSAPP') {
      logOutgoingSms({
        candidateId,
        channel,
        text,
        recipient: senderType === 'RECRUITER' ? 'Candidate Phone' : 'Recruiter Phone',
        status: 'DELIVERED'
      });
    }

    return newMsg;
  } catch (e) {
    console.error('Failed to send message:', e);
  }
}

export function getSmsLogs() {
  try {
    const raw = localStorage.getItem(SMS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function logOutgoingSms(logData) {
  try {
    const list = getSmsLogs();
    const entry = {
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...logData
    };
    const updated = [entry, ...list];
    localStorage.setItem(SMS_STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (e) {}
}

export const messagingService = {
  getCandidateMessages,
  sendCandidateMessage,
  getSmsLogs,
  logOutgoingSms
};

export default messagingService;
