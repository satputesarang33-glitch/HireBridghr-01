import { db } from "../Config/connetDB.js";

const APPLICATIONS_COLLECTION = "applications";

export const ApplicationModel = {
  // Get all applications with filters
  getAll: async (filters = {}) => {
    const snapshot = await db.collection(APPLICATIONS_COLLECTION).get();
    let applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (filters.jobId) {
      applications = applications.filter((a) => a.jobId === filters.jobId);
    }

    if (filters.stage && filters.stage !== "ALL") {
      applications = applications.filter((a) => a.stage === filters.stage);
    }

    if (filters.candidateId) {
      applications = applications.filter((a) => a.candidateId === filters.candidateId);
    }

    return applications;
  },

  // Get application by ID
  getById: async (id) => {
    const doc = await db.collection(APPLICATIONS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Get applications for a candidate
  getByCandidate: async (candidateId, candidateEmail) => {
    const snapshot = await db.collection(APPLICATIONS_COLLECTION).get();
    const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return apps.filter(
      (a) =>
        (candidateId && a.candidateId === candidateId) ||
        (candidateEmail &&
          a.candidateEmail &&
          a.candidateEmail.toLowerCase() === candidateEmail.toLowerCase())
    );
  },

  // Check duplicate application
  checkDuplicate: async (jobId, candidateId, candidateEmail) => {
    const snapshot = await db
      .collection(APPLICATIONS_COLLECTION)
      .where("jobId", "==", jobId)
      .get();

    return snapshot.docs.some((doc) => {
      const data = doc.data();
      const matchId = candidateId && data.candidateId === candidateId;
      const matchEmail =
        candidateEmail &&
        data.candidateEmail &&
        data.candidateEmail.toLowerCase() === candidateEmail.toLowerCase();
      return matchId || matchEmail;
    });
  },

  // Create application
  create: async (data) => {
    const id = data.id || `app-${Date.now().toString().slice(-6)}`;
    const newApp = {
      id,
      jobId: data.jobId,
      jobTitle: data.jobTitle || "Job Position",
      company: data.company || "Apex Global Tech",
      candidateId: data.candidateId || "",
      candidateName: data.candidateName || data.fullName || "Candidate",
      candidateEmail: (data.candidateEmail || data.email || "").toLowerCase(),
      candidatePhone: data.candidatePhone || data.phone || "",
      resumeUrl: data.resumeUrl || null,
      resumeFileName: data.resumeFileName || null,
      coverLetter: data.coverLetter || "",
      portfolioUrl: data.portfolioUrl || "",
      linkedinUrl: data.linkedinUrl || "",
      githubUrl: data.githubUrl || "",
      stage: data.stage || "APPLIED",
      status: data.status || "APPLIED",
      appliedDate: data.appliedDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await db.collection(APPLICATIONS_COLLECTION).doc(id).set(newApp);
    return newApp;
  },

  // Update application
  update: async (id, data) => {
    const docRef = db.collection(APPLICATIONS_COLLECTION).doc(id);
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

  // Withdraw application
  withdraw: async (id) => {
    const docRef = db.collection(APPLICATIONS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;

    const updatedData = {
      stage: "WITHDRAWN",
      status: "WITHDRAWN",
      withdrawnAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedData);
    return { id, ...existing.data(), ...updatedData };
  },

  // Delete application
  delete: async (id) => {
    const docRef = db.collection(APPLICATIONS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    await docRef.delete();
    return true;
  },
};
