import { db } from "../Config/connetdb.js";

const RECRUITER_NOTIFICATIONS = "notifications";
const CANDIDATE_NOTIFICATIONS = "candidate_notifications";

export const NotificationModel = {
  // --- RECRUITER / WORKSPACE NOTIFICATIONS ---
  getAllRecruiter: async () => {
    const snapshot = await db.collection(RECRUITER_NOTIFICATIONS).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  markRecruiterRead: async (id) => {
    const docRef = db.collection(RECRUITER_NOTIFICATIONS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update({ isRead: true, updatedAt: new Date().toISOString() });
    return { id, ...doc.data(), isRead: true };
  },

  markAllRecruiterRead: async () => {
    const snapshot = await db.collection(RECRUITER_NOTIFICATIONS).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true, updatedAt: new Date().toISOString() });
    });
    await batch.commit();
    return true;
  },

  createRecruiterNotification: async (data) => {
    const id = data.id || `notif-${Date.now().toString().slice(-6)}`;
    const newNotif = {
      id,
      title: data.title || "Notification",
      message: data.message || "",
      type: data.type || "INFO",
      isRead: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    await db.collection(RECRUITER_NOTIFICATIONS).doc(id).set(newNotif);
    return newNotif;
  },

  // --- CANDIDATE NOTIFICATIONS ---
  getAllCandidate: async (candidateId) => {
    const snapshot = await db.collection(CANDIDATE_NOTIFICATIONS).get();
    let notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (candidateId) {
      notifs = notifs.filter((n) => !n.candidateId || n.candidateId === candidateId);
    }
    return notifs;
  },

  markCandidateRead: async (id) => {
    const docRef = db.collection(CANDIDATE_NOTIFICATIONS).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    await docRef.update({ isRead: true, updatedAt: new Date().toISOString() });
    return { id, ...doc.data(), isRead: true };
  },

  markAllCandidateRead: async (candidateId) => {
    const snapshot = await db.collection(CANDIDATE_NOTIFICATIONS).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (!candidateId || !data.candidateId || data.candidateId === candidateId) {
        batch.update(doc.ref, { isRead: true, updatedAt: new Date().toISOString() });
      }
    });
    await batch.commit();
    return true;
  },

  createCandidateNotification: async (data) => {
    const id = data.id || `c-notif-${Date.now().toString().slice(-6)}`;
    const newNotif = {
      id,
      candidateId: data.candidateId || "",
      title: data.title || "Update on your application",
      message: data.message || "",
      type: data.type || "INFO",
      isRead: false,
      createdAt: new Date().toISOString(),
      ...data,
    };
    await db.collection(CANDIDATE_NOTIFICATIONS).doc(id).set(newNotif);
    return newNotif;
  },
};
