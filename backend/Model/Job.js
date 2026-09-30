import { db } from "../Config/connetdb.js";

const JOBS_COLLECTION = "jobs";

export const JobModel = {
  // Fetch all jobs with filtering
  getAll: async (filters = {}) => {
    let query = db.collection(JOBS_COLLECTION);

    const snapshot = await query.get();
    let jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Apply filters in memory
    if (filters.search) {
      const q = filters.search.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.department?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.client?.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== "ALL") {
      jobs = jobs.filter((j) => j.status === filters.status);
    }

    if (filters.department && filters.department !== "ALL") {
      jobs = jobs.filter((j) => j.department === filters.department);
    }

    if (filters.workplaceType && filters.workplaceType !== "ALL") {
      jobs = jobs.filter((j) => j.workplaceType === filters.workplaceType);
    }

    return jobs;
  },

  // Fetch single job by ID or slug
  getByIdOrSlug: async (idOrSlug) => {
    // 1. Try fetching by Document ID
    const docRef = db.collection(JOBS_COLLECTION).doc(idOrSlug);
    const doc = await docRef.get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() };
    }

    // 2. Try fetching by slug
    const slugQuery = await db
      .collection(JOBS_COLLECTION)
      .where("slug", "==", idOrSlug)
      .limit(1)
      .get();

    if (!slugQuery.empty) {
      const slugDoc = slugQuery.docs[0];
      return { id: slugDoc.id, ...slugDoc.data() };
    }

    return null;
  },

  // Create a new job
  create: async (jobData) => {
    const id = jobData.id || `job-${Date.now().toString().slice(-6)}`;
    const slug =
      jobData.slug ||
      (jobData.title || "new-job")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const finalStatus =
      jobData.status === "PENDING_ADMIN_PUBLICATION" || jobData.status === "PUBLISHED"
        ? "PUBLISHED"
        : jobData.status || "DRAFT";

    const newJob = {
      id,
      slug,
      title: jobData.title || "Untitled Role",
      client: jobData.client || "Apex Global Tech",
      department: jobData.department || "Engineering",
      location: jobData.location || "Remote",
      workplaceType: jobData.workplaceType || "Remote",
      employmentType: jobData.employmentType || "Full-time",
      salaryMin: Number(jobData.salaryMin) || 0,
      salaryMax: Number(jobData.salaryMax) || 0,
      currency: jobData.currency || "USD",
      skills: Array.isArray(jobData.skills) ? jobData.skills : [],
      description: jobData.description || "",
      status: finalStatus,
      applicationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: finalStatus === "PUBLISHED" ? new Date().toISOString() : null,
      distribution: [
        { platform: "MANUAL", status: finalStatus === "PUBLISHED" ? "PUBLISHED" : "PENDING" },
      ],
      ...jobData,
    };

    await db.collection(JOBS_COLLECTION).doc(id).set(newJob);
    return newJob;
  },

  // Update existing job
  update: async (id, jobData) => {
    const docRef = db.collection(JOBS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return null;

    const updatedData = {
      ...jobData,
      updatedAt: new Date().toISOString(),
    };

    if (jobData.status === "PUBLISHED" && !existing.data().publishedAt) {
      updatedData.publishedAt = new Date().toISOString();
    }

    await docRef.set(updatedData, { merge: true });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  },

  // Delete job
  delete: async (id) => {
    const docRef = db.collection(JOBS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (!existing.exists) return false;
    await docRef.delete();
    return true;
  },

  // Increment application count
  incrementApplicationsCount: async (id) => {
    const docRef = db.collection(JOBS_COLLECTION).doc(id);
    const existing = await docRef.get();
    if (existing.exists) {
      const current = existing.data().applicationsCount || 0;
      await docRef.update({ applicationsCount: current + 1 });
    }
  },
};
