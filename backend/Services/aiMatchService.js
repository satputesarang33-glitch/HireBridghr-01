/**
 * AI Candidate Matching Engine
 * Compares candidate skills, experience, and profile against Job Requisition requirements.
 */

export const aiMatchService = {
  /**
   * Computes comprehensive AI match score & skill gap analysis
   */
  calculateMatchScore({ candidate = {}, job = {} }) {
    const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase().trim());
    const jobSkills = (job.skills || []).map((s) => s.toLowerCase().trim());

    // 1. Skill Matching (Weight: 55%)
    let matchingSkills = [];
    let missingSkills = [];

    if (jobSkills.length > 0) {
      for (const reqSkill of jobSkills) {
        const found = candidateSkills.some(
          (cs) => cs === reqSkill || cs.includes(reqSkill) || reqSkill.includes(cs)
        );
        if (found) {
          matchingSkills.push(reqSkill);
        } else {
          missingSkills.push(reqSkill);
        }
      }
    } else {
      matchingSkills = candidateSkills.slice(0, 5);
    }

    const skillScore = jobSkills.length > 0
      ? (matchingSkills.length / jobSkills.length) * 55
      : 45;

    // 2. Experience Level Matching (Weight: 25%)
    const candExp = Number(candidate.experienceYears || candidate.experience || 0);
    const minExp = Number(job.experienceMin || 0);
    const maxExp = Number(job.experienceMax || minExp + 3 || 10);

    let expScore = 20;
    if (candExp >= minExp && candExp <= maxExp + 2) {
      expScore = 25;
    } else if (candExp >= minExp - 1) {
      expScore = 18;
    } else {
      expScore = Math.max(5, Math.round((candExp / Math.max(minExp, 1)) * 25));
    }

    // 3. Title / Domain Relevance (Weight: 10%)
    let titleScore = 5;
    const currentTitle = (candidate.currentTitle || candidate.headline || "").toLowerCase();
    const jobTitle = (job.title || "").toLowerCase();
    if (jobTitle && currentTitle) {
      const jobWords = jobTitle.split(/\s+/).filter((w) => w.length > 2);
      const matches = jobWords.filter((w) => currentTitle.includes(w));
      titleScore = matches.length > 0 ? 10 : 6;
    }

    // 4. Workplace / Location Fit (Weight: 10%)
    let locationScore = 8;
    const workplaceType = (job.workplaceType || "").toLowerCase();
    const candLocation = (candidate.location || "").toLowerCase();
    const jobLocation = (job.location || "").toLowerCase();

    if (workplaceType === "remote") {
      locationScore = 10;
    } else if (candLocation && jobLocation && (candLocation.includes(jobLocation) || jobLocation.includes(candLocation))) {
      locationScore = 10;
    }

    // Aggregate Score
    const totalScore = Math.min(100, Math.round(skillScore + expScore + titleScore + locationScore));

    // Recommendation synthesis
    let recommendation = "Moderate Fit";
    let tier = "TIER_2";
    if (totalScore >= 85) {
      recommendation = "High Match — Strong Recommendation";
      tier = "TIER_1";
    } else if (totalScore >= 70) {
      recommendation = "Good Match — Qualified Candidate";
      tier = "TIER_2";
    } else if (totalScore >= 50) {
      recommendation = "Moderate Match — Skill Gaps Present";
      tier = "TIER_3";
    } else {
      recommendation = "Low Match — Significant Requirements Missing";
      tier = "TIER_4";
    }

    return {
      matchScore: totalScore,
      tier,
      recommendation,
      breakdown: {
        skillMatchPercent: jobSkills.length > 0 ? Math.round((matchingSkills.length / jobSkills.length) * 100) : 100,
        matchingSkills,
        missingSkills,
        candidateExperienceYears: candExp,
        requiredExperienceRange: `${minExp} - ${maxExp} yrs`,
        locationFit: workplaceType === "remote" ? "Fully Remote" : (locationScore === 10 ? "Direct Match" : "Relocation Needed"),
      },
      calculatedAt: new Date().toISOString(),
    };
  },
};
