import { db } from "../Config/connetdb.js";

const USERS_COLLECTION = "users";
const CANDIDATE_PROFILES = "candidate_profiles";
const SAVED_JOBS_COLLECTION = "saved_jobs";

export const UserModel = {
  // Find user by email
  findByEmail: async (email) => {
    if (!email) return null;
    const snapshot = await db
      .collection(USERS_COLLECTION)
      .where("email", "==", email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  // Find user by ID
  findById: async (id) => {
    const doc = await db.collection(USERS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Create a new user (Recruiter, Admin, or Candidate)
  create: async (userData) => {
    const id = userData.id || `usr-${Date.now().toString().slice(-6)}`;
    const user = {
      id,
      name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email?.toLowerCase(),
      phone: userData.phone || "",
      role: userData.role || "CANDIDATE",
      organizationId: userData.organizationId || "org-1",
      avatar:
        userData.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...userData,
    };

    await db.collection(USERS_COLLECTION).doc(id).set(user);
    return user;
  },

  // Get all users (for admin)
  getAll: async () => {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Candidate Profile: Get profile by userId
  getCandidateProfile: async (userId) => {
    const doc = await db.collection(CANDIDATE_PROFILES).doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Candidate Profile: Create or Update profile
  saveCandidateProfile: async (userId, profileData) => {
    const ref = db.collection(CANDIDATE_PROFILES).doc(userId);
    const existing = await ref.get();

    const dataToSave = {
      ...(existing.exists ? existing.data() : {}),
      ...profileData,
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (!existing.exists) {
      dataToSave.createdAt = new Date().toISOString();
    }

    await ref.set(dataToSave, { merge: true });
    return { id: userId, ...dataToSave };
  },

  // Saved Jobs for Candidate
  getSavedJobs: async (userId) => {
    const doc = await db.collection(SAVED_JOBS_COLLECTION).doc(userId).get();
    if (!doc.exists) return [];
    return doc.data().jobIds || [];
  },

  addSavedJob: async (userId, jobId) => {
    const ref = db.collection(SAVED_JOBS_COLLECTION).doc(userId);
    const doc = await ref.get();
    const jobIds = doc.exists ? doc.data().jobIds || [] : [];
    if (!jobIds.includes(jobId)) {
      jobIds.push(jobId);
      await ref.set({ jobIds, updatedAt: new Date().toISOString() }, { merge: true });
    }
    return jobIds;
  },

  removeSavedJob: async (userId, jobId) => {
    const ref = db.collection(SAVED_JOBS_COLLECTION).doc(userId);
    const doc = await ref.get();
    if (!doc.exists) return [];
    const jobIds = (doc.data().jobIds || []).filter((id) => id !== jobId);
    await ref.set({ jobIds, updatedAt: new Date().toISOString() }, { merge: true });
    return jobIds;
  },
};
