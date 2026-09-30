import { db } from "../Config/connetDB.js";

const ORGS_COLLECTION = "organizations";
const PUBLICATIONS_COLLECTION = "job_publications";
const AUDIT_LOGS_COLLECTION = "audit_logs";

export const AdminModel = {
  // Organizations
  getOrganizations: async () => {
    const snapshot = await db.collection(ORGS_COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Job Publications Queue
  getJobPublications: async () => {
    const snapshot = await db.collection(PUBLICATIONS_COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  updateJobPublication: async (id, data) => {
    const docRef = db.collection(PUBLICATIONS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;

    const updated = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await docRef.set(updated, { merge: true });
    const finalDoc = await docRef.get();
    return { id: finalDoc.id, ...finalDoc.data() };
  },

  addPublicationRequest: async (pubData) => {
    const id = pubData.id || `pub-${Date.now().toString().slice(-6)}`;
    const newPub = {
      id,
      jobId: pubData.jobId,
      jobTitle: pubData.jobTitle || "Job Title",
      organizationName: pubData.organizationName || "Apex Global Tech",
      requestedBy: pubData.requestedBy || "Recruiter",
      requestedDate: new Date().toISOString(),
      targetPlatform: pubData.targetPlatform || "MANUAL",
      status: pubData.status || "PENDING",
      internalNotes: pubData.internalNotes || "Publication requested.",
      createdAt: new Date().toISOString(),
      ...pubData,
    };
    await db.collection(PUBLICATIONS_COLLECTION).doc(id).set(newPub);
    return newPub;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const snapshot = await db.collection(AUDIT_LOGS_COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  addAuditLog: async (log) => {
    const id = `audit-${Date.now().toString().slice(-6)}`;
    const newLog = {
      id,
      timestamp: new Date().toISOString(),
      ...log,
    };
    await db.collection(AUDIT_LOGS_COLLECTION).doc(id).set(newLog);
    return newLog;
  },
};
