import { db } from "./connetdb.js";

/**
 * Default Seed Data for HireBridgeHR
 * Automatically populates Firestore on first run if collections are empty.
 */
export const seedInitialDatabase = async () => {
  try {
    // 0. Ensure Admin Job Publications exist
    const pubsSnapshot = await db.collection("job_publications").limit(1).get();
    if (pubsSnapshot.empty) {
      const pubsBatch = db.batch();
      const initialPubs = [
        {
          id: "pub-801",
          jobId: "job-102",
          jobTitle: "Lead DevOps & Cloud Architect",
          organizationId: "org-1",
          organizationName: "Apex Global Tech",
          requestedBy: "Elena Rostova",
          requestedDate: "2026-03-10T09:30:00Z",
          targetPlatform: "MANUAL",
          status: "PENDING",
          internalNotes: "Awaiting recruiter client confirmation on remote budget caps before pushing to manual board.",
          createdAt: new Date().toISOString(),
        },
        {
          id: "pub-802",
          jobId: "job-101",
          jobTitle: "Senior Full Stack Engineer",
          organizationId: "org-1",
          organizationName: "Apex Global Tech",
          requestedBy: "Elena Rostova",
          requestedDate: "2026-03-01T11:00:00Z",
          targetPlatform: "MANUAL",
          status: "PUBLISHED",
          publishedDate: "2026-03-02T14:30:00Z",
          internalNotes: "Verified job specifications, published to active portal.",
          createdAt: new Date().toISOString(),
        },
      ];
      for (const pub of initialPubs) {
        pubsBatch.set(db.collection("job_publications").doc(pub.id), pub);
      }
      await pubsBatch.commit();
    }

    // 0.1 Ensure Audit Logs exist
    const auditSnapshot = await db.collection("audit_logs").limit(1).get();
    if (auditSnapshot.empty) {
      const auditBatch = db.batch();
      const initialLogs = [
        {
          id: "audit-1",
          actor: "Elena Rostova",
          role: "RECRUITER",
          action: "JOB_CREATED",
          entity: "Job",
          entityId: "job-102",
          entityName: "Lead DevOps & Cloud Architect",
          date: "2026-03-10T09:15:00Z",
          organization: "Apex Global Tech",
          ipAddress: "198.51.100.42",
          timestamp: new Date().toISOString(),
        },
        {
          id: "audit-2",
          actor: "Elena Rostova",
          role: "RECRUITER",
          action: "PUBLICATION_REQUESTED",
          entity: "JobDistribution",
          entityId: "pub-801",
          entityName: "Lead DevOps & Cloud Architect",
          date: "2026-03-10T09:30:00Z",
          organization: "Apex Global Tech",
          ipAddress: "198.51.100.42",
          timestamp: new Date().toISOString(),
        },
        {
          id: "audit-3",
          actor: "Sarah Connor",
          role: "OWNER",
          action: "OFFER_EXTENDED",
          entity: "Application",
          entityId: "app-101",
          entityName: "Devon Vance (Engineering)",
          date: "2026-03-08T16:00:00Z",
          organization: "Apex Global Tech",
          ipAddress: "198.51.100.18",
          timestamp: new Date().toISOString(),
        },
      ];
      for (const log of initialLogs) {
        auditBatch.set(db.collection("audit_logs").doc(log.id), log);
      }
      await auditBatch.commit();
    }

    const jobsSnapshot = await db.collection("jobs").limit(1).get();
    if (!jobsSnapshot.empty) {
      // Core database collections already seeded
      return;
    }

    console.log("🌱 First-time initialization: Seeding Firestore with sample records...");

    const batch = db.batch();

    // 1. Initial Organizations
    const initialOrgs = [
      {
        id: "org-1",
        name: "Apex Global Tech",
        slug: "apex-global-tech",
        type: "COMPANY",
        industry: "Enterprise Software & Cloud",
        size: "250-500",
        country: "United States",
        city: "San Francisco, CA",
        status: "ACTIVE",
        activeJobsCount: 4,
        totalHires: 12,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const org of initialOrgs) {
      batch.set(db.collection("organizations").doc(org.id), org);
    }

    // 2. Initial Users
    const initialUsers = [
      {
        id: "usr-1",
        name: "Sarah Connor",
        firstName: "Sarah",
        lastName: "Connor",
        email: "sarah.connor@apextech.com",
        role: "OWNER",
        organizationId: "org-1",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-3",
        name: "Elena Rostova",
        firstName: "Elena",
        lastName: "Rostova",
        email: "elena.rostova@apextech.com",
        role: "RECRUITER",
        organizationId: "org-1",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr-cand-101",
        name: "Alexander Rivera",
        firstName: "Alexander",
        lastName: "Rivera",
        email: "alex.rivera@example.com",
        role: "CANDIDATE",
        status: "ACTIVE",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        createdAt: new Date().toISOString(),
      },
    ];

    for (const u of initialUsers) {
      batch.set(db.collection("users").doc(u.id), u);
    }

    // 3. Initial Jobs
    const initialJobs = [
      {
        id: "job-101",
        slug: "senior-full-stack-engineer",
        title: "Senior Full Stack Engineer",
        client: "Apex Global Tech",
        department: "Engineering",
        location: "San Francisco, CA",
        workplaceType: "Hybrid",
        employmentType: "Full-time",
        experienceMin: 5,
        experienceMax: 8,
        experienceLevel: "Senior",
        salaryMin: 120000,
        salaryMax: 160000,
        currency: "USD",
        skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
        description: "Leading the core full-stack platform architecture and team mentoring.",
        status: "PUBLISHED",
        recruiterId: "usr-3",
        recruiterName: "Elena Rostova",
        isPublic: true,
        applicationsCount: 4,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        distribution: [{ platform: "MANUAL", status: "PUBLISHED" }],
      },
      {
        id: "job-102",
        slug: "lead-devops-cloud-architect",
        title: "Lead DevOps & Cloud Architect",
        client: "Apex Global Tech",
        department: "DevOps & SRE",
        location: "Remote",
        workplaceType: "Remote",
        employmentType: "Full-time",
        experienceMin: 7,
        experienceMax: 10,
        experienceLevel: "Lead",
        salaryMin: 140000,
        salaryMax: 180000,
        currency: "USD",
        skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker"],
        description: "Scaling distributed cloud infrastructure and Kubernetes clusters.",
        status: "PUBLISHED",
        recruiterId: "usr-3",
        recruiterName: "Elena Rostova",
        isPublic: true,
        applicationsCount: 2,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        distribution: [{ platform: "MANUAL", status: "PUBLISHED" }],
      },
      {
        id: "job-103",
        slug: "senior-product-designer-ui-ux",
        title: "Senior Product Designer (UI/UX)",
        client: "Apex Global Tech",
        department: "Design",
        location: "New York, NY",
        workplaceType: "Hybrid",
        employmentType: "Full-time",
        experienceMin: 4,
        experienceMax: 7,
        experienceLevel: "Senior",
        salaryMin: 110000,
        salaryMax: 145000,
        currency: "USD",
        skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
        description: "Designing end-to-end user experiences for enterprise SaaS workflows.",
        status: "PUBLISHED",
        recruiterId: "usr-3",
        recruiterName: "Elena Rostova",
        isPublic: true,
        applicationsCount: 3,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        distribution: [{ platform: "MANUAL", status: "PUBLISHED" }],
      },
      {
        id: "job-104",
        slug: "qa-automation-lead-sdit",
        title: "QA Automation Lead (SDET)",
        client: "Apex Global Tech",
        department: "Quality Engineering",
        location: "Austin, TX",
        workplaceType: "On-site",
        employmentType: "Full-time",
        experienceMin: 5,
        experienceMax: 8,
        experienceLevel: "Lead",
        salaryMin: 115000,
        salaryMax: 150000,
        currency: "USD",
        skills: ["Playwright", "Cypress", "JavaScript", "API Testing"],
        description: "Automating enterprise integration testing and release validations.",
        status: "DRAFT",
        recruiterId: "usr-3",
        recruiterName: "Elena Rostova",
        isPublic: false,
        applicationsCount: 0,
        createdAt: new Date().toISOString(),
        distribution: [{ platform: "MANUAL", status: "DRAFT" }],
      },
    ];

    for (const job of initialJobs) {
      batch.set(db.collection("jobs").doc(job.id), job);
    }

    // 4. Initial Candidates
    const initialCandidates = [
      {
        id: "cand-1",
        name: "Devon Vance",
        email: "devon.vance@techhorizon.dev",
        phone: "+1 (555) 301-4492",
        location: "San Francisco, CA",
        currentTitle: "Staff Software Engineer",
        currentCompany: "Horizon Distributed Cloud",
        experienceYears: 7,
        skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
        stage: "INTERVIEW",
        status: "ACTIVE",
        source: "LinkedIn",
        createdAt: new Date().toISOString(),
        notes: [
          {
            id: "note-1",
            author: "Elena Rostova",
            content: "Strong candidate with solid distributed systems background.",
            createdAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: "cand-2",
        name: "Marcus Vance",
        email: "marcus.v@cloudinfra.net",
        phone: "+1 (555) 723-9081",
        location: "Seattle, WA",
        currentTitle: "Principal Cloud Engineer",
        currentCompany: "HyperScale Infrastructure",
        experienceYears: 9,
        skills: ["Kubernetes", "AWS", "Terraform", "Go", "Docker"],
        stage: "SHORTLISTED",
        status: "ACTIVE",
        source: "Direct Apply",
        createdAt: new Date().toISOString(),
        notes: [],
      },
    ];

    for (const cand of initialCandidates) {
      batch.set(db.collection("candidates").doc(cand.id), cand);
    }

    // 5. Initial Candidate Profile for demo
    const initialCandidateProfile = {
      userId: "usr-cand-101",
      firstName: "Alexander",
      lastName: "Rivera",
      fullName: "Alexander Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 382-9912",
      location: "San Francisco, CA",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      headline: "Full Stack Engineer | React, Node.js & Cloud",
      currentTitle: "Senior Software Engineer",
      currentCompany: "Nexus Innovations",
      experienceYears: 5,
      skills: ["React.js", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
      profileCompletion: 85,
      resumeUrl: "/resumes/alexander-rivera-resume.pdf",
      resumeFileName: "Alexander_Rivera_Resume.pdf",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    batch.set(db.collection("candidate_profiles").doc("usr-cand-101"), initialCandidateProfile);

    // 6. Initial Applications
    const initialApps = [
      {
        id: "app-101",
        jobId: "job-101",
        jobTitle: "Senior Full Stack Engineer",
        company: "Apex Global Tech",
        candidateId: "cand-1",
        candidateName: "Devon Vance",
        candidateEmail: "devon.vance@techhorizon.dev",
        candidatePhone: "+1 (555) 301-4492",
        stage: "INTERVIEW",
        status: "INTERVIEW",
        appliedDate: new Date().toISOString(),
      },
      {
        id: "app-102",
        jobId: "job-102",
        jobTitle: "Lead DevOps & Cloud Architect",
        company: "Apex Global Tech",
        candidateId: "cand-2",
        candidateName: "Marcus Vance",
        candidateEmail: "marcus.v@cloudinfra.net",
        candidatePhone: "+1 (555) 723-9081",
        stage: "SHORTLISTED",
        status: "SHORTLISTED",
        appliedDate: new Date().toISOString(),
      },
    ];

    for (const app of initialApps) {
      batch.set(db.collection("applications").doc(app.id), app);
    }

    // 7. Initial Interviews
    const initialInterviews = [
      {
        id: "int-101",
        jobId: "job-101",
        jobTitle: "Senior Full Stack Engineer",
        candidateId: "cand-1",
        candidateName: "Devon Vance",
        interviewerId: "usr-3",
        interviewerName: "Elena Rostova",
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        type: "TECHNICAL",
        status: "SCHEDULED",
        meetingLink: "https://meet.google.com/xyz-hirebridge",
        createdAt: new Date().toISOString(),
      },
    ];

    for (const it of initialInterviews) {
      batch.set(db.collection("interviews").doc(it.id), it);
    }

    // 8. Initial Notifications
    const initialNotifs = [
      {
        id: "notif-1",
        title: "New Application Received",
        message: "Devon Vance submitted an application for Senior Full Stack Engineer.",
        type: "APPLICATION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const n of initialNotifs) {
      batch.set(db.collection("notifications").doc(n.id), n);
    }

    await batch.commit();
    console.log("✅ Firestore successfully seeded with initial HireBridgeHR records!");
  } catch (error) {
    console.error("⚠️ Firestore seeding warning (continuing without blocking):", error.message);
  }
};
