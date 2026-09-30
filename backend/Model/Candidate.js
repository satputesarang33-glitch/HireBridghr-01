import { db } from "../Config/connetdb.js";

const CANDIDATES_COLLECTION = "candidates";

export const CandidateModel = {
  // Get all candidates with filtering
  getAll: async (filters = {}) => {
    const snapshot = await db.collection(CANDIDATES_COLLECTION).get();
    let candidates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (filters.search) {
      const q = filters.search.toLowerCase();
      candidates = candidates.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.currentTitle?.toLowerCase().includes(q) ||
          c.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== "ALL") {
      candidates = candidates.filter((c) => c.status === filters.status);
    }

    if (filters.stage && filters.stage !== "ALL") {
      candidates = candidates.filter((c) => c.stage === filters.stage);
    }

    return candidates;
  },

  // Get candidate by ID
  getById: async (id) => {
    const doc = await db.collection(CANDIDATES_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  // Create new candidate
  create: async (data) => {
    const id = data.id || `cand-${Date.now().toString().slice(-6)}`;
    const newCand = {
      id,
      name: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Candidate",
      email: data.email || "",
      phone: data.phone || "",
      location: data.location || "",
      currentTitle: data.currentTitle || "",
      skills: Array.isArray(data.skills) ? data.skills : [],
      status: data.status || "ACTIVE",
      stage: data.stage || "APPLIED",
      notes: Array.isArray(data.notes) ? data.notes : [],
      timeline: [
        {
          id: `time-${Date.now()}`,
          title: "Candidate profile created",
          date: new Date().toISOString(),
          type: "created",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await db.collection(CANDIDATES_COLLECTION).doc(id).set(newCand);
    return newCand;
  },

  // Update candidate
  update: async (id, data) => {
    const docRef = db.collection(CANDIDATES_COLLECTION).doc(id);
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

  // Delete candidate
  delete: async (id) => {
    const docRef = db.collection(CANDIDATES_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    await docRef.delete();
    return true;
  },

  // Add a note to candidate
  addNote: async (id, noteText, author = "Recruiter") => {
    const docRef = db.collection(CANDIDATES_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const candidate = doc.data();
    const notes = candidate.notes || [];
    const newNote = {
      id: `note-${Date.now()}`,
      author,
      content: noteText,
      createdAt: new Date().toISOString(),
    };

    notes.unshift(newNote);
    await docRef.update({ notes, updatedAt: new Date().toISOString() });
    return newNote;
  },
};
