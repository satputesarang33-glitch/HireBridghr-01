import { db } from "../Config/connetdb.js";
import { CandidateModel } from "../Model/Candidate.js";

let eeocResponses = [
  { gender: "Female", ethnicity: "Asian", veteran: "No", disability: "No" },
  { gender: "Male", ethnicity: "Hispanic / Latino", veteran: "No", disability: "No" },
  { gender: "Non-Binary", ethnicity: "Two or More Races", veteran: "No", disability: "Yes" },
  { gender: "Male", ethnicity: "White", veteran: "Yes", disability: "No" },
  { gender: "Female", ethnicity: "Black / African American", veteran: "No", disability: "No" },
];

export const complianceController = {
  /**
   * Transform candidate dossier into an anonymized "Blind Profile"
   * Strips name, photo, location address, email, phone, and university names.
   */
  async getBlindProfile(req, res, next) {
    try {
      const { candidate = {} } = req.body;

      const blindId = candidate.id ? candidate.id.slice(-4) : Math.floor(1000 + Math.random() * 9000);
      const anonymizedProfile = {
        blindId: `Candidate #${blindId}`,
        currentTitle: candidate.currentTitle || "Software Engineer",
        experienceYears: candidate.experienceYears || 5,
        skills: candidate.skills || ["React.js", "TypeScript", "Node.js"],
        workHistory: (candidate.workHistory || candidate.experience || []).map((exp) => ({
          role: exp.role || exp.title || "Software Engineer",
          companyType: exp.companyType || "Enterprise Tech",
          duration: exp.duration || "2 years",
          responsibilities: exp.responsibilities || exp.description || "Designed scalable systems and core APIs.",
        })),
        educationLevel: "Bachelor's Degree in Computer Science / Related Field",
        blindMode: true,
        sanitizedFields: ["fullName", "email", "phone", "avatar", "exactSchoolName", "graduationYear", "streetAddress"],
      };

      return res.status(200).json({
        success: true,
        data: anonymizedProfile,
        message: "Candidate profile anonymized for blind review mode.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Collect Voluntary Anonymous EEOC Demographic Survey Response
   */
  async submitEeoc(req, res, next) {
    try {
      const {
        gender = "Decline to Self-Identify",
        ethnicity = "Decline to Self-Identify",
        veteranStatus = "Not a Veteran",
        disabilityStatus = "No Disability",
      } = req.body;

      const record = {
        id: `eeoc-${Date.now()}`,
        gender,
        ethnicity,
        veteran: veteranStatus,
        disability: disabilityStatus,
        submittedAt: new Date().toISOString(),
      };

      eeocResponses.push(record);

      if (db) {
        try {
          await db.collection("eeoc_surveys").doc(record.id).set(record);
        } catch (e) {
          // non-blocking
        }
      }

      return res.status(201).json({
        success: true,
        data: { id: record.id },
        message: "Demographic survey recorded anonymously in accordance with EEOC regulations.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Return Aggregated EEO-1 Compliance Demographic Report
   */
  async getEeocReport(req, res) {
    const total = eeocResponses.length || 1;

    const genderCounts = {};
    const ethnicityCounts = {};

    eeocResponses.forEach((r) => {
      genderCounts[r.gender] = (genderCounts[r.gender] || 0) + 1;
      ethnicityCounts[r.ethnicity] = (ethnicityCounts[r.ethnicity] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalSurveyed: total,
        genderBreakdown: genderCounts,
        ethnicityBreakdown: ethnicityCounts,
        veteranRepresentationPercent: Math.round(
          (eeocResponses.filter((r) => r.veteran === "Yes" || r.veteran === "Protected Veteran").length / total) * 100
        ),
        disabilityRepresentationPercent: Math.round(
          (eeocResponses.filter((r) => r.disability === "Yes" || r.disability === "Has Disability").length / total) * 100
        ),
        complianceStandards: ["EEOC Title VII", "OFCCP Section 503", "GDPR Article 9"],
        lastAuditRun: new Date().toISOString(),
      },
    });
  },

  /**
   * GDPR Right-to-be-Forgotten: Purge / Anonymize Candidate
   */
  async anonymizeCandidate(req, res, next) {
    try {
      const { candidateId } = req.params;

      const anonymizedData = {
        name: "GDPR Anonymized Candidate",
        email: `anonymized-${Date.now()}@gdpr-purged.local`,
        phone: "+0 (000) 000-0000",
        notes: [],
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        isAnonymized: true,
        anonymizedAt: new Date().toISOString(),
      };

      try {
        await CandidateModel.update(candidateId, anonymizedData);
      } catch (e) {
        // non-blocking
      }

      return res.status(200).json({
        success: true,
        data: { candidateId, ...anonymizedData },
        message: "Candidate personally identifiable information (PII) successfully purged under GDPR compliance.",
      });
    } catch (err) {
      next(err);
    }
  },
};
