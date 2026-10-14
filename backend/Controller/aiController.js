import { aiMatchService } from "../Services/aiMatchService.js";
import { resumeParserService } from "../Services/resumeParserService.js";
import { db } from "../Config/connetdb.js";

export const aiController = {
  /**
   * Match Candidate against a Job Requisition
   */
  async matchCandidate(req, res) {
    try {
      let { candidate, job, candidateId, jobId } = req.body;

      // If candidateId provided, fetch from Firestore
      if (!candidate && candidateId && db) {
        let candDoc = await db.collection("candidates").doc(candidateId).get();
        if (!candDoc.exists) {
          candDoc = await db.collection("candidate_profiles").doc(candidateId).get();
        }
        if (candDoc.exists) {
          candidate = candDoc.data();
        }
      }

      // If jobId provided, fetch from Firestore
      if (!job && jobId && db) {
        const jobDoc = await db.collection("jobs").doc(jobId).get();
        if (jobDoc.exists) {
          job = jobDoc.data();
        }
      }

      // Fallbacks if not found or sample
      candidate = candidate || {
        name: "Sample Candidate",
        skills: ["React.js", "Node.js", "TypeScript", "PostgreSQL"],
        experienceYears: 5,
        location: "San Francisco, CA",
        currentTitle: "Senior Full Stack Engineer",
      };

      job = job || {
        title: "Senior Full Stack Engineer",
        skills: ["React.js", "Node.js", "TypeScript", "AWS"],
        experienceMin: 4,
        experienceMax: 8,
        workplaceType: "Hybrid",
        location: "San Francisco, CA",
      };

      const matchAnalysis = aiMatchService.calculateMatchScore({ candidate, job });

      return res.status(200).json({
        success: true,
        data: {
          candidateName: candidate.name || candidate.fullName,
          jobTitle: job.title,
          ...matchAnalysis,
        },
        message: "Candidate AI match calculated successfully.",
      });
    } catch (err) {
      console.error("AI Match error:", err);
      return res.status(500).json({
        success: false,
        error: { message: err.message || "Failed to calculate AI match." },
      });
    }
  },

  /**
   * Parse Resume Text directly
   */
  async parseResumeText(req, res) {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({
          success: false,
          error: { message: "Please provide resume 'text' in the request body." },
        });
      }

      const parsed = resumeParserService.parseText(text);

      return res.status(200).json({
        success: true,
        data: parsed,
        message: "Resume text parsed successfully.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: { message: err.message || "Failed to parse resume text." },
      });
    }
  },
};
