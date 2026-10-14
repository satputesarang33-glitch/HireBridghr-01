export const predictiveAnalyticsController = {
  /**
   * Predictive Time-to-Hire & Funnel Velocity Metrics
   */
  async getPredictiveMetrics(req, res) {
    const data = {
      summary: {
        avgTimeToHireDays: 21.4,
        targetTimeToHireDays: 28.0,
        industryBenchmarkDays: 38.5,
        predictedNextQuarterDays: 19.2,
        costPerHireDollars: 2350,
        benchmarkCostPerHire: 4500,
        savingsRealizedPerHire: 2150,
        totalActiveCandidates: 19,
        openRequisitions: 5,
      },
      funnelVelocity: [
        {
          stage: "Applied",
          candidateCount: 19,
          avgDaysInStage: 1.4,
          passThroughRate: "84%",
          dropOffRate: "16%",
        },
        {
          stage: "AI Screening & Quiz",
          candidateCount: 16,
          avgDaysInStage: 2.1,
          passThroughRate: "68%",
          dropOffRate: "32%",
        },
        {
          stage: "Technical Interview",
          candidateCount: 11,
          avgDaysInStage: 4.8,
          passThroughRate: "54%",
          dropOffRate: "46%",
        },
        {
          stage: "Executive & Culture Fit",
          candidateCount: 6,
          avgDaysInStage: 2.5,
          passThroughRate: "83%",
          dropOffRate: "17%",
        },
        {
          stage: "Offer Extended",
          candidateCount: 5,
          avgDaysInStage: 1.8,
          passThroughRate: "90%",
          dropOffRate: "10%",
        },
        {
          stage: "Hired & Onboarded",
          candidateCount: 4,
          avgDaysInStage: 0.8,
          passThroughRate: "100%",
          dropOffRate: "0%",
        },
      ],
      bottlenecks: [
        {
          id: "btn-1",
          severity: "MEDIUM",
          department: "Product & Engineering",
          stage: "Technical Interview",
          issue: "Interviewer scorecard completion latency exceeds 36 hours.",
          recommendedAction: "Auto-trigger Slack reminder to interview panel at hour 12.",
        },
        {
          id: "btn-2",
          severity: "LOW",
          department: "GTM Sales",
          stage: "Offer Stage",
          issue: "Candidate background check completion averaging 48 hours.",
          recommendedAction: "Switch to Checkr Fast-Track instant criminal database package.",
        },
      ],
    };

    return res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * Executive Diversity & EEOC Compliance Intelligence
   */
  async getDiversityEEOC(req, res) {
    const data = {
      reportingPeriod: "Current Fiscal Year (YTD)",
      complianceStatus: "EEOC COMPLIANT & AUDIT READY",
      adverseImpactRatio: 0.89, // > 0.80 passes standard 4/5ths rule
      fourFifthsRuleAssessment: "PASS - No disparate adverse impact detected across candidate pipeline stages.",
      genderBreakdown: [
        { category: "Women / Female", percentage: 46.5, count: 52 },
        { category: "Men / Male", percentage: 48.0, count: 54 },
        { category: "Non-Binary / Self-Described", percentage: 5.5, count: 6 },
      ],
      raceEthnicityBreakdown: [
        { group: "Asian / Pacific Islander", percentage: 29.5, count: 33 },
        { group: "White / Caucasian", percentage: 32.1, count: 36 },
        { group: "Hispanic / Latino", percentage: 17.8, count: 20 },
        { group: "Black / African American", percentage: 15.2, count: 17 },
        { group: "Two or More Races / Other", percentage: 5.4, count: 6 },
      ],
      veteranStatus: {
        protectedVeteransPercentage: 7.2,
        nonVeteransPercentage: 92.8,
      },
      disabilityStatus: {
        individualsWithDisabilitiesPercentage: 8.5,
        benchmarkTarget: 7.0, // OFCCP 7% aspirational target
        meetsOFCCPTarget: true,
      },
      payEquityParityIndex: 0.98, // 1.0 is exact parity
    };

    return res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * Source of Hire Attribution & Cost-Per-Hire ROI
   */
  async getSourcesROI(req, res) {
    const data = {
      attribution: [
        {
          source: "Chrome Sourcing Extension",
          spend: 0,
          candidates: 28,
          hires: 6,
          costPerHire: 0,
          efficiencyRating: "Highest ROI",
          retentionRate: "98%",
        },
        {
          source: "Indeed Organic & XML Feed",
          spend: 450,
          candidates: 64,
          hires: 8,
          costPerHire: 56.25,
          efficiencyRating: "Very High",
          retentionRate: "92%",
        },
        {
          source: "LinkedIn Recruiter",
          spend: 1800,
          candidates: 42,
          hires: 7,
          costPerHire: 257.14,
          efficiencyRating: "Strong",
          retentionRate: "95%",
        },
        {
          source: "Employee Referrals",
          spend: 3000,
          candidates: 12,
          hires: 6,
          costPerHire: 500.0,
          efficiencyRating: "Highest Retention",
          retentionRate: "100%",
        },
        {
          source: "Direct Company Careers Page",
          spend: 0,
          candidates: 35,
          hires: 4,
          costPerHire: 0,
          efficiencyRating: "High Organic",
          retentionRate: "94%",
        },
      ],
      totalSpend: 5250,
      totalHires: 31,
      blendedCostPerHire: 169.35,
    };

    return res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * Recruiter Productivity Leaderboard
   */
  async getRecruiterLeaderboard(req, res) {
    const data = [
      {
        recruiterId: "usr-3",
        name: "Elena Rostova",
        role: "Lead Technical Recruiter",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ElenaRostova",
        interviewsCoordinated: 54,
        offersExtended: 14,
        offersAccepted: 13,
        acceptanceRate: "92.8%",
        avgDaysToOffer: 17.2,
        candidateNPS: 4.9,
      },
      {
        recruiterId: "usr-2",
        name: "Marcus Vance",
        role: "VP of Talent Acquisition",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MarcusVance",
        interviewsCoordinated: 38,
        offersExtended: 9,
        offersAccepted: 8,
        acceptanceRate: "88.9%",
        avgDaysToOffer: 19.5,
        candidateNPS: 4.8,
      },
      {
        recruiterId: "usr-1",
        name: "Sarah Connor",
        role: "Senior Recruiter",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SarahConnor",
        interviewsCoordinated: 41,
        offersExtended: 8,
        offersAccepted: 7,
        acceptanceRate: "87.5%",
        avgDaysToOffer: 22.0,
        candidateNPS: 4.7,
      },
    ];

    return res.status(200).json({
      success: true,
      data,
    });
  },
};
