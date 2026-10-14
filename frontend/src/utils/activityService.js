/**
 * Candidate Activity Timeline & Team Collaboration Service
 * Tracks chronological candidate events, internal team notes with @mentions, and notifications.
 */

const ACTIVITY_STORAGE_KEY = 'ats_candidate_activities';
const NOTIF_STORAGE_KEY = 'ats_inapp_notifications';

export function getCandidateActivities(candidateId) {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[candidateId] || getDefaultActivities(candidateId);
  } catch (e) {
    return getDefaultActivities(candidateId);
  }
}

function getDefaultActivities(candidateId) {
  return [
    {
      id: `act-${Date.now()}-1`,
      type: 'APPLICATION',
      actor: 'System',
      title: 'Application Received',
      description: 'Candidate submitted profile and resume via Career Portal.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `act-${Date.now()}-2`,
      type: 'AI_SCREENING',
      actor: 'AI Matching Engine',
      title: 'AI Screening Profile Evaluated',
      description: 'Calculated qualification fit and verified mandatory requirements.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export function logCandidateActivity(candidateId, activity) {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const list = all[candidateId] || getDefaultActivities(candidateId);
    const entry = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...activity
    };
    all[candidateId] = [entry, ...list];
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(all));

    // Also register in-app notification if it's a mention or important event
    if (activity.type === 'NOTE' || activity.type === 'STAGE_MOVE' || activity.type === 'OFFER') {
      logNotification({
        title: activity.title,
        message: activity.description,
        type: activity.type.toLowerCase(),
        candidateId,
        actor: activity.actor || 'Elena Rostova'
      });
    }

    return entry;
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}

export function getNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) {
      const initial = [
        {
          id: 'notif-1',
          title: 'New Applicant Submitted',
          message: 'Alexander Wright applied for Product Manager.',
          type: 'candidate',
          isRead: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-2',
          title: 'Interview Confirmed',
          message: 'Sophia Martinez accepted Technical Assessment invite.',
          type: 'interview',
          isRead: false,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'notif-3',
          title: '@Mention in Candidate Note',
          message: 'Marcus Vance mentioned you: "@Elena please review Alexander portfolio".',
          type: 'mention',
          isRead: false,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function logNotification(notif) {
  try {
    const list = getNotifications();
    const entry = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notif
    };
    const updated = [entry, ...list];
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    return entry;
  } catch (e) {}
}

export function markNotificationsAsRead() {
  try {
    const list = getNotifications();
    const updated = list.map(n => ({ ...n, isRead: true }));
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export const activityService = {
  getCandidateActivities,
  logCandidateActivity,
  getNotifications,
  logNotification,
  markNotificationsAsRead
};

export default activityService;
