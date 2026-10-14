import { db } from "../Config/connetdb.js";
import { notificationStreamService } from "../Services/notificationStreamService.js";

const TESTS = [
  {
    id: "test-react",
    title: "Frontend Architecture & Modern React",
    skill: "React / TypeScript / Architecture",
    durationMinutes: 15,
    questions: [
      {
        id: "q-1",
        question: "What is the primary architectural purpose of React Server Components (RSC)?",
        options: [
          "Render components on client side without DOM",
          "Reduce client bundle size and execute data fetching directly on server",
          "Replace all CSS stylesheets with inline JSON",
          "Enforce strict class-based component inheritance",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "How does React 18 Concurrent Mode handle high-priority UI updates?",
        options: [
          "Pauses and interrupts background re-renders via useTransition",
          "Blocks the entire browser main thread",
          "Executes web workers with local storage caches",
          "Converts JSX into WebAssembly binaries",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "test-backend",
    title: "Node.js & Distributed Cloud Architecture",
    skill: "Node.js / Cloud / Distributed Systems",
    durationMinutes: 20,
    questions: [
      {
        id: "q-3",
        question: "How do you mitigate Node.js event loop starvation under heavy CPU load?",
        options: [
          "Increase the max heap size to 16GB",
          "Offload CPU work to Worker Threads or external microservices",
          "Use synchronous while loops with timers",
          "Disable garbage collection",
        ],
        correctIndex: 1,
      },
      {
        id: "q-4",
        question: "Which database indexing strategy is optimal for filtering high-cardinality multi-tenant records?",
        options: [
          "Full collection table scan",
          "Compound index starting with organizationId or tenantId",
          "Single unindexed B-tree key",
          "SHA-1 hashing on every column",
        ],
        correctIndex: 1,
      },
    ],
  },
];

const inMemoryAssessments = new Map();

export const assessmentController = {
  /**
   * Get all skill tests
   */
  async getTests(req, res) {
    // Return tests without revealing answers to client
    const sanitized = TESTS.map((t) => ({
      ...t,
      questions: t.questions.map(({ correctIndex, ...q }) => q),
    }));
    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  },

  /**
   * Submit and auto-grade candidate assessment
   */
  async submitAssessment(req, res, next) {
    try {
      const { candidateId, testId, answers = {}, tabSwitchCount = 0 } = req.body;

      if (!candidateId || !testId) {
        return res.status(400).json({
          success: false,
          error: { message: "Candidate ID and test ID are required." },
        });
      }

      const targetTest = TESTS.find((t) => t.id === testId) || TESTS[0];
      let correctCount = 0;

      targetTest.questions.forEach((q) => {
        if (answers[q.id] === q.correctIndex) {
          correctCount++;
        }
      });

      const totalQuestions = targetTest.questions.length;
      const scorePercent = Math.round((correctCount / totalQuestions) * 100);
      const passed = scorePercent >= 70;

      const resultRecord = {
        id: `assess-${Date.now()}`,
        candidateId,
        testId: targetTest.id,
        testTitle: targetTest.title,
        skill: targetTest.skill,
        scorePercent,
        correctCount,
        totalQuestions,
        passed,
        tabSwitchCount,
        integrityStatus: tabSwitchCount <= 1 ? "VERIFIED" : "FLAGGED_FOCUS_SWITCHES",
        completedAt: new Date().toISOString(),
      };

      const existing = inMemoryAssessments.get(candidateId) || [];
      inMemoryAssessments.set(candidateId, [resultRecord, ...existing]);

      if (db) {
        try {
          await db.collection("candidate_assessments").doc(resultRecord.id).set(resultRecord);
        } catch (e) {
          // non-blocking
        }
      }

      notificationStreamService.broadcast("ASSESSMENT_COMPLETED", resultRecord);

      return res.status(200).json({
        success: true,
        data: resultRecord,
        message: `Assessment graded: ${scorePercent}% (${passed ? "PASSED" : "NEEDS_IMPROVEMENT"}).`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get candidate assessment history
   */
  async getCandidateAssessments(req, res, next) {
    try {
      const { candidateId } = req.params;
      let results = inMemoryAssessments.get(candidateId);

      if (!results || results.length === 0) {
        results = [
          {
            id: `assess-sample-${candidateId}`,
            candidateId,
            testId: "test-react",
            testTitle: "Frontend Architecture & Modern React",
            skill: "React / TypeScript / Architecture",
            scorePercent: 95,
            passed: true,
            integrityStatus: "VERIFIED",
            completedAt: new Date().toISOString(),
          },
        ];
      }

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (err) {
      next(err);
    }
  },
};
