import { db } from "../Config/connetDB.js";

const INTERVIEWS_COLLECTION = "interviews";

export const InterviewModel = {
  // Get all interviews with filters
  getAll: async (filters = {}) => {
    const snapshot = await db.collection(INTERVIEWS_COLLECTION).get();
    let interviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (filters.status && filters.status !== "ALL") {
      interviews = interviews.filter((i) => i.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      interviews = interviews.filter(
        (i) =>
          i.candidateName?.toLowerCase().includes(q) ||
          i.jobTitle?.toLowerCase().includes(q) ||
          i.interviewerName?.toLowerCase().includes(q)
      );
    }

    return interviews;
  },

  // Get interview by ID
  getById: async (id) => {
    const doc = await db.collection(INTERVIEWS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Schedule an interview
  create: async (data) => {
    const id = data.id || `int-${Date.now().toString().slice(-6)}`;
    const newInterview = {
      id,
      candidateId: data.candidateId || "",
      candidateName: data.candidateName || "Candidate",
      jobId: data.jobId || "",
      jobTitle: data.jobTitle || "Role",
      interviewerId: data.interviewerId || "",
      interviewerName: data.interviewerName || "Interviewer",
      scheduledDate: data.scheduledDate || new Date().toISOString(),
      type: data.type || "TECHNICAL",
      status: "SCHEDULED",
      meetingLink: data.meetingLink || "https://meet.google.com/xyz-demo",
      feedback: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await db.collection(INTERVIEWS_COLLECTION).doc(id).set(newInterview);
    return newInterview;
  },

  // Update interview
  update: async (id, data) => {
    const docRef = db.collection(INTERVIEWS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;

    const updatedData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await docRef.set(updatedData, { merge: true });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  },

  // Delete interview
  delete: async (id) => {
    const docRef = db.collection(INTERVIEWS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    await docRef.delete();
    return true;
  },
};
