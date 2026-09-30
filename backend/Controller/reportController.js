import { JobModel } from "../Model/Job.js";
import { CandidateModel } from "../Model/Candidate.js";
import { ApplicationModel } from "../Model/Application.js";
import { InterviewModel } from "../Model/Interview.js";

/**
 * Controller for Reporting & Analytics Aggregations
 */
export const reportController = {
  getAnalyticsOverview: async (req, res, next) => {
    try {
      const [jobs, candidates, applications, interviews] = await Promise.all([
        JobModel.getAll(),
        CandidateModel.getAll(),
        ApplicationModel.getAll(),
        InterviewModel.getAll(),
      ]);

      const activeJobs = jobs.filter((j) => j.status === "PUBLISHED").length;
      const hires = applications.filter((a) => a.stage === "HIRED").length;
      const offers = applications.filter((a) => a.stage === "OFFER").length;

      // Recruitment Funnel
      const funnel = [
        { stage: "Applications", count: applications.length, fill: "#06b6d4" },
        {
          stage: "Screening",
          count: applications.filter((a) =>
            ["SCREENING", "SHORTLISTED", "INTERVIEW", "OFFER", "HIRED"].includes(a.stage)
          ).length,
          fill: "#38bdf8",
        },
        {
          stage: "Shortlisted",
          count: applications.filter((a) =>
            ["SHORTLISTED", "INTERVIEW", "OFFER", "HIRED"].includes(a.stage)
          ).length,
          fill: "#6366f1",
        },
        {
          stage: "Interview",
          count: applications.filter((a) => ["INTERVIEW", "OFFER", "HIRED"].includes(a.stage))
            .length,
          fill: "#818cf8",
        },
        { stage: "Offer", count: offers + hires, fill: "#a855f7" },
        { stage: "Hired", count: hires, fill: "#10b981" },
      ];

      // Sourcing Breakdown
      const sourceMap = {};
      candidates.forEach((c) => {
        const src = c.source || "Direct Apply";
        sourceMap[src] = (sourceMap[src] || 0) + 1;
      });
      const sources = Object.entries(sourceMap).map(([name, value]) => ({ name, value }));

      res.status(200).json({
        success: true,
        data: {
          totalJobs: jobs.length,
          activeJobs,
          totalCandidates: candidates.length,
          totalApplications: applications.length,
          scheduledInterviews: interviews.filter((i) => i.status === "SCHEDULED").length,
          totalHires: hires,
          offersCount: offers,
          funnel,
          sources,
          jobPerformance: jobs.map((j) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            status: j.status,
            applications: j.applicationsCount || 0,
          })),
        },
        message: "Analytics generated successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};
