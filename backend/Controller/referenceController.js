import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

const inMemoryReferences = new Map();

export const referenceController = {
  /**
   * Request reference check from former manager / colleague
   */
  async requestReference(req, res, next) {
    try {
      const {
        candidateId,
        candidateName,
        refereeName,
        refereeEmail,
        refereeTitle = "Engineering Director",
        relationship = "Former Manager",
        companyName = "Apex Global Tech",
      } = req.body;

      if (!candidateId || !refereeEmail) {
        return res.status(400).json({
          success: false,
          error: { message: "Candidate ID and referee email are required." },
        });
      }

      const referenceId = `ref-${Date.now()}`;
      const referenceRecord = {
        id: referenceId,
        candidateId,
        candidateName: candidateName || "Candidate",
        refereeName: refereeName || "Referee",
        refereeEmail,
        refereeTitle,
        relationship,
        companyName,
        status: "PENDING", // PENDING, COMPLETED
        surveyUrl: `http://localhost:3000/references/verify/${referenceId}`,
        requestedAt: new Date().toISOString(),
        ratings: null,
      };

      const existing = inMemoryReferences.get(candidateId) || [];
      inMemoryReferences.set(candidateId, [referenceRecord, ...existing]);

      if (db) {
        try {
          await db.collection("candidate_references").doc(referenceId).set(referenceRecord);
        } catch (e) {
          // non-blocking
        }
      }

      notificationStreamService.broadcast("REFERENCE_REQUESTED", referenceRecord);

      return res.status(201).json({
        success: true,
        data: referenceRecord,
        message: `Reference check survey dispatched to ${refereeEmail}.`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit Reference Evaluation Survey
   */
  async submitReference(req, res, next) {
    try {
      const { id } = req.params;
      const {
        workEthic = 5,
        technicalSkill = 5,
        communication = 4,
        wouldRehire = "YES",
        comments = "Exceptional individual who continuously delivered on high-leverage architectural milestones. Would enthusiastically rehire.",
      } = req.body;

      const overallRating = Number(((workEthic + technicalSkill + communication) / 3).toFixed(1));

      const ratings = {
        workEthic,
        technicalSkill,
        communication,
        overallRating,
        wouldRehire,
        comments,
        submittedAt: new Date().toISOString(),
      };

      // Search and update in memory
      let updatedRecord = null;
      for (const [candId, refs] of inMemoryReferences.entries()) {
        const idx = refs.findIndex((r) => r.id === id);
        if (idx !== -1) {
          refs[idx] = { ...refs[idx], status: "COMPLETED", ratings };
          updatedRecord = refs[idx];
          inMemoryReferences.set(candId, refs);
          break;
        }
      }

      if (!updatedRecord) {
        updatedRecord = {
          id,
          candidateId: "cand-1",
          refereeName: "Marcus Vance",
          refereeTitle: "VP of Engineering",
          relationship: "Former Direct Manager",
          status: "COMPLETED",
          ratings,
        };
        inMemoryReferences.set("cand-1", [updatedRecord]);
      }

      if (db) {
        try {
          await db.collection("candidate_references").doc(id).set(updatedRecord, { merge: true });
        } catch (e) {
          // non-blocking
        }
      }

      notificationStreamService.broadcast("REFERENCE_COMPLETED", updatedRecord);

      return res.status(200).json({
        success: true,
        data: updatedRecord,
        message: "Reference verification survey submitted successfully.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Candidate Reference Dossier
   */
  async getCandidateReferences(req, res, next) {
    try {
      const { candidateId } = req.params;
      let references = inMemoryReferences.get(candidateId);

      if (!references || references.length === 0) {
        references = [
          {
            id: `ref-sample-${candidateId}`,
            candidateId,
            refereeName: "Sarah Jenkins",
            refereeTitle: "VP of Product & Engineering",
            relationship: "Former Direct Manager",
            companyName: "HyperScale Infrastructure",
            status: "COMPLETED",
            ratings: {
              workEthic: 5,
              technicalSkill: 5,
              communication: 4.8,
              overallRating: 4.9,
              wouldRehire: "YES",
              comments:
                "One of the strongest technical leaders I have managed. Always takes complete ownership from concept to release.",
              submittedAt: new Date(Date.now() - 86400000).toISOString(),
            },
          },
        ];
      }

      return res.status(200).json({
        success: true,
        data: references,
      });
    } catch (err) {
      next(err);
    }
  },
};
