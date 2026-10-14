import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

const backgroundCheckStore = new Map();
const checklistStore = new Map();

// Default Onboarding Checklist items for any candidate
const createDefaultChecklist = (candidateId) => [
  {
    id: "chk-1",
    title: "I-9 Employment Eligibility Verification",
    description: "Submit government-issued identification and verify employment authorization.",
    category: "COMPLIANCE",
    status: "COMPLETED",
    dueDate: "Day -3",
    completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "chk-2",
    title: "W-4 Federal & State Tax Withholding",
    description: "Configure tax withholdings, allowances, and digital e-signature.",
    category: "FINANCE",
    status: "COMPLETED",
    dueDate: "Day -2",
    completedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "chk-3",
    title: "Direct Deposit & Banking Details",
    description: "Provide routing and account numbers for automated bi-weekly payroll.",
    category: "FINANCE",
    status: "IN_PROGRESS",
    dueDate: "Day -1",
    completedAt: null,
  },
  {
    id: "chk-4",
    title: "IT Equipment & Hardware Choice",
    description: "Select primary work laptop (Apple MacBook Pro M3 Max or Dell XPS 15) and peripherals.",
    category: "IT_OPERATIONS",
    status: "IN_PROGRESS",
    dueDate: "Day -2",
    completedAt: null,
  },
  {
    id: "chk-5",
    title: "Employee Handbook & NDA Signing",
    description: "Review corporate security policies, intellectual property assignments, and confidentiality.",
    category: "LEGAL",
    status: "COMPLETED",
    dueDate: "Day 0",
    completedAt: new Date().toISOString(),
  },
  {
    id: "chk-6",
    title: "Day 1 Welcome Call & Mentor Introduction",
    description: "Virtual orientation with engineering buddy and HR People Partner.",
    category: "CULTURE",
    status: "SCHEDULED",
    dueDate: "Day 1",
    completedAt: null,
  },
];

export const onboardingController = {
  /**
   * Initiate Automated Background Check (Checkr / Sterling Mock Adapter)
   */
  async initiateBackgroundCheck(req, res, next) {
    try {
      const {
        candidateId = "cand-1",
        candidateName = "Candidate",
        packageType = "ENTERPRISE_PRO",
      } = req.body;

      const checkId = `bg-${Date.now()}`;
      const record = {
        id: checkId,
        candidateId,
        candidateName,
        packageType,
        provider: "Checkr Enterprise Screening Adapter",
        status: "CLEAR", // Simulation reaches clear
        completionPercentage: 100,
        checks: [
          { name: "County Criminal Records Search", status: "CLEAR", recordsFound: 0 },
          { name: "Federal Criminal Court Search", status: "CLEAR", recordsFound: 0 },
          { name: "National Sex Offender Registry", status: "CLEAR", recordsFound: 0 },
          { name: "Global Watchlist & Sanctions (OFAC)", status: "CLEAR", recordsFound: 0 },
          { name: "Education Verification (Degree Check)", status: "VERIFIED", details: "M.S. Computer Science" },
          { name: "Past Employment Verification", status: "VERIFIED", details: "Past 5 years confirmed" },
          { name: "SSN Trace & Address History", status: "VERIFIED", details: "Valid SSN issued 2012" },
        ],
        adjudication: "ELIGIBLE_FOR_HIRE",
        reportUrl: `https://reports.hirebridgehr.com/bg-checks/${checkId}.pdf`,
        initiatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        completedAt: new Date().toISOString(),
      };

      backgroundCheckStore.set(candidateId, record);

      notificationStreamService.broadcast({
        type: "BACKGROUND_CHECK_COMPLETED",
        title: "Background Check Completed: CLEAR",
        message: `Background check for ${candidateName} has completed with status CLEAR (Eligible for Hire).`,
        candidateId,
        checkId,
        timestamp: new Date().toISOString(),
      });

      return res.status(201).json({
        success: true,
        message: "Background check completed and verified successfully.",
        data: record,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Candidate Background Check Status
   */
  async getBackgroundCheck(req, res) {
    const { candidateId } = req.params;
    let record = backgroundCheckStore.get(candidateId);

    if (!record) {
      record = {
        id: `bg-default-${candidateId}`,
        candidateId,
        candidateName: "Alexander Rivera",
        packageType: "ENTERPRISE_PRO",
        provider: "Checkr Enterprise Screening Adapter",
        status: "CLEAR",
        completionPercentage: 100,
        checks: [
          { name: "County Criminal Records Search", status: "CLEAR", recordsFound: 0 },
          { name: "Federal Criminal Records Search", status: "CLEAR", recordsFound: 0 },
          { name: "Global Watchlist & Sanctions", status: "CLEAR", recordsFound: 0 },
          { name: "Education & Degree Verification", status: "VERIFIED", details: "Verified Accredited Institution" },
          { name: "Past 5-Year Employment Verification", status: "VERIFIED", details: "Confirmed dates & titles" },
        ],
        adjudication: "ELIGIBLE_FOR_HIRE",
        reportUrl: `https://reports.hirebridgehr.com/bg-checks/bg-${candidateId}.pdf`,
        completedAt: new Date().toISOString(),
      };
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  },

  /**
   * Get Candidate Onboarding Checklist
   */
  async getOnboardingChecklist(req, res) {
    const { candidateId } = req.params;
    let items = checklistStore.get(candidateId);

    if (!items) {
      items = createDefaultChecklist(candidateId);
      checklistStore.set(candidateId, items);
    }

    const completedCount = items.filter((i) => i.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedCount / items.length) * 100);

    return res.status(200).json({
      success: true,
      data: {
        candidateId,
        progressPercentage,
        completedCount,
        totalItems: items.length,
        items,
      },
    });
  },

  /**
   * Update / Toggle Onboarding Checklist Item
   */
  async updateChecklistItem(req, res, next) {
    try {
      const { candidateId, itemId } = req.params;
      const { status } = req.body;

      let items = checklistStore.get(candidateId);
      if (!items) {
        items = createDefaultChecklist(candidateId);
        checklistStore.set(candidateId, items);
      }

      const item = items.find((i) => i.id === itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Onboarding checklist item not found.",
        });
      }

      item.status = status || (item.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED");
      item.completedAt = item.status === "COMPLETED" ? new Date().toISOString() : null;

      const completedCount = items.filter((i) => i.status === "COMPLETED").length;
      const progressPercentage = Math.round((completedCount / items.length) * 100);

      notificationStreamService.broadcast({
        type: "ONBOARDING_ITEM_UPDATED",
        title: "Onboarding Step Completed",
        message: `Step "${item.title}" marked as ${item.status}. Overall progress: ${progressPercentage}%.`,
        candidateId,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: `Checklist item "${item.title}" updated to ${item.status}.`,
        data: {
          candidateId,
          progressPercentage,
          items,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Provision New Hire to HRIS / Payroll (Workday, Rippling, BambooHR, Gusto)
   */
  async provisionHris(req, res, next) {
    try {
      const {
        candidateId = "cand-1",
        candidateName = "Alexander Rivera",
        targetHris = "Workday",
        jobTitle = "Lead Product Architect",
        department = "Product Engineering",
        baseSalary = "$155,000",
        startDate = new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
      } = req.body;

      const employeeId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

      const provisionRecord = {
        employeeId,
        candidateId,
        candidateName,
        targetHris,
        jobTitle,
        department,
        baseSalary,
        startDate,
        syncStatus: "PROVISIONED_SUCCESSFULLY",
        workEmail: `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@hirebridge.enterprise`,
        payrollStatus: "ACTIVE_DIRECT_DEPOSIT_READY",
        provisionedAt: new Date().toISOString(),
      };

      notificationStreamService.broadcast({
        type: "HRIS_EMPLOYEE_PROVISIONED",
        title: "Employee Provisioned to HRIS",
        message: `${candidateName} has been successfully provisioned into ${targetHris} with Employee ID ${employeeId}.`,
        candidateId,
        employeeId,
        timestamp: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        message: `Candidate ${candidateName} successfully provisioned to ${targetHris}. Employee ID: ${employeeId}.`,
        data: provisionRecord,
      });
    } catch (err) {
      next(err);
    }
  },
};
