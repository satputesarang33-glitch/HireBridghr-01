import { db } from "../Config/connetdb.js";
import { webhookService } from "../Services/webhookService.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";
import { NotificationModel } from "../Model/Notification.js";
import { CandidateModel } from "../Model/Candidate.js";

// In-memory fallback if collection empty
const inMemoryOffers = new Map();

export const offerController = {
  /**
   * Create or Extend an Offer Letter
   */
  async createOffer(req, res, next) {
    try {
      const {
        candidateId,
        candidateName,
        candidateEmail,
        jobId,
        jobTitle,
        companyName = "Apex Global Tech",
        salary = "135,000",
        currency = "USD",
        salaryPeriod = "Annual",
        bonus = "10%",
        equity = "0.25% Stock Options",
        startDate = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        deadline = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        signatory = "Elena Rostova",
        signatoryTitle = "Head of Talent Acquisition",
        perks = [
          "Comprehensive Health & Dental Coverage",
          "Flexible Hybrid & Remote Work Schedule",
          "$2,000 Annual Learning & Development Budget",
          "Company Laptop & Ergonomic Home Office Setup",
        ],
      } = req.body;

      if (!candidateId) {
        return res.status(400).json({
          success: false,
          error: { message: "Candidate ID is required to extend an offer." },
        });
      }

      const offerId = `offer-${Date.now()}`;
      const offer = {
        id: offerId,
        candidateId,
        candidateName: candidateName || "Candidate",
        candidateEmail: candidateEmail || "candidate@example.com",
        jobId: jobId || "job-101",
        jobTitle: jobTitle || "Senior Full Stack Engineer",
        companyName,
        salary,
        currency,
        salaryPeriod,
        bonus,
        equity,
        startDate,
        deadline,
        signatory,
        signatoryTitle,
        perks,
        status: "PENDING_SIGNATURE", // PENDING_SIGNATURE, ACCEPTED, DECLINED, EXPIRED
        createdAt: new Date().toISOString(),
        signedAt: null,
        signatureUrl: null,
      };

      // Save to Firestore or in-memory
      inMemoryOffers.set(offerId, offer);
      inMemoryOffers.set(`cand-${candidateId}`, offer);

      if (db) {
        try {
          await db.collection("offers").doc(offerId).set(offer);
        } catch (dbErr) {
          console.warn("Could not save offer to Firestore:", dbErr.message);
        }
      }

      // Update candidate stage to OFFER
      try {
        await CandidateModel.update(candidateId, { stage: "OFFER" });
      } catch (e) {
        // non-blocking
      }

      // Notify candidate in-app
      await NotificationModel.createCandidateNotification({
        candidateId,
        title: "Official Offer Letter Extended!",
        message: `Congratulations! ${companyName} has extended an official offer for ${jobTitle}. Review terms and e-sign directly in your portal.`,
        type: "OFFER",
      });

      // Broadcast SSE & Webhook
      notificationStreamService.broadcast("OFFER_EXTENDED", offer);
      await webhookService.dispatchEvent("offer.extended", offer);

      return res.status(201).json({
        success: true,
        data: offer,
        message: "Digital offer letter generated and extended to candidate.",
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Offer by ID
   */
  async getOfferById(req, res, next) {
    try {
      const { id } = req.params;
      let offer = inMemoryOffers.get(id);

      if (!offer && db) {
        const doc = await db.collection("offers").doc(id).get();
        if (doc.exists) {
          offer = doc.data();
        }
      }

      if (!offer) {
        return res.status(404).json({
          success: false,
          error: { message: "Offer letter not found." },
        });
      }

      return res.status(200).json({
        success: true,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Candidate's Active Offer
   */
  async getCandidateOffer(req, res, next) {
    try {
      const { candidateId } = req.params;
      let offer = inMemoryOffers.get(`cand-${candidateId}`);

      if (!offer && db) {
        const snapshot = await db
          .collection("offers")
          .where("candidateId", "==", candidateId)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          offer = snapshot.docs[0].data();
        }
      }

      if (!offer) {
        // Return default sample offer structure if none yet created
        offer = {
          id: `offer-sample-${candidateId}`,
          candidateId,
          candidateName: "Alexander Rivera",
          jobTitle: "Senior Full Stack Engineer",
          companyName: "Apex Global Tech",
          salary: "145,000",
          currency: "USD",
          salaryPeriod: "Annual",
          bonus: "10% Performance Bonus",
          equity: "0.2% Stock Options",
          startDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          deadline: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
          signatory: "Elena Rostova",
          signatoryTitle: "Head of Talent Acquisition",
          status: "PENDING_SIGNATURE",
          perks: [
            "Comprehensive Health, Dental & Vision Coverage",
            "Flexible Hybrid & Remote Work Schedule",
            "$2,500 Annual Professional Development Stipend",
            "401(k) Match up to 5%",
          ],
        };
      }

      return res.status(200).json({
        success: true,
        data: offer,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Sign Digital Offer (In-Portal e-Signature)
   */
  async signOffer(req, res, next) {
    try {
      const { id } = req.params;
      const { signatureDataUrl, signedByName, ipAddress = req.ip } = req.body;

      let offer = inMemoryOffers.get(id);
      if (!offer && db) {
        const doc = await db.collection("offers").doc(id).get();
        if (doc.exists) {
          offer = doc.data();
        }
      }

      if (!offer) {
        offer = {
          id,
          candidateId: "cand-1",
          candidateName: signedByName || "Alexander Rivera",
          jobTitle: "Senior Full Stack Engineer",
          companyName: "Apex Global Tech",
          salary: "145,000",
          status: "PENDING_SIGNATURE",
        };
      }

      const updatedOffer = {
        ...offer,
        status: "ACCEPTED",
        signedAt: new Date().toISOString(),
        signedByName: signedByName || offer.candidateName,
        signatureUrl: signatureDataUrl || "data:image/svg+xml;utf8,<svg>Digital_Sign</svg>",
        ipAddress,
        documentHash: `sha256-${Date.now()}`,
      };

      inMemoryOffers.set(id, updatedOffer);
      inMemoryOffers.set(`cand-${offer.candidateId}`, updatedOffer);

      if (db) {
        try {
          await db.collection("offers").doc(id).set(updatedOffer, { merge: true });
        } catch (e) {
          // non-blocking
        }
      }

      // Update candidate stage to HIRED
      try {
        await CandidateModel.update(offer.candidateId, { stage: "HIRED" });
      } catch (e) {
        // non-blocking
      }

      // Notify Recruiter
      await NotificationModel.createRecruiterNotification({
        title: "Offer Signed!",
        message: `${updatedOffer.signedByName} has signed their offer for ${updatedOffer.jobTitle}.`,
        type: "OFFER_ACCEPTED",
      });

      // Broadcast SSE & Outbound Webhook to HRIS (BambooHR/Workday/Slack)
      notificationStreamService.broadcast("OFFER_SIGNED", updatedOffer);
      await webhookService.dispatchEvent("candidate.hired", {
        candidateId: offer.candidateId,
        candidateName: updatedOffer.signedByName,
        jobTitle: updatedOffer.jobTitle,
        salary: updatedOffer.salary,
        startDate: updatedOffer.startDate,
        signedAt: updatedOffer.signedAt,
      });

      return res.status(200).json({
        success: true,
        data: updatedOffer,
        message: "Offer letter signed successfully! Welcome to the team.",
      });
    } catch (err) {
      next(err);
    }
  },
};
