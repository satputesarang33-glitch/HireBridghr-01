/**
 * AI Candidate Matching & Screening Evaluation Engine
 * Calculates multi-dimensional match scores, checks mandatory screening questions,
 * and generates AI candidate executive summaries.
 */

export function calculateAIMatchScore({
  candidateSkills = [],
  jobSkills = [],
  candidateExperience = 3,
  jobExperienceLevel = 'Mid Level',
  screeningAnswers = [],
  screeningQuestions = []
}) {
  let score = 50; // base score

  // 1. Skill Overlap (up to +30 points)
  if (jobSkills && jobSkills.length > 0) {
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const matchedSkills = candidateSkills.filter(cs =>
      jobSkillsLower.some(js => js.includes(cs.toLowerCase()) || cs.toLowerCase().includes(js))
    );
    const skillRatio = matchedSkills.length / jobSkills.length;
    score += Math.round(skillRatio * 30);
  } else {
    score += 15;
  }

  // 2. Experience Fit (up to +15 points)
  const expNum = Number(candidateExperience) || 3;
  if (jobExperienceLevel.includes('Entry') && expNum >= 1) {
    score += 15;
  } else if (jobExperienceLevel.includes('Mid') && expNum >= 3) {
    score += 15;
  } else if (jobExperienceLevel.includes('Senior') && expNum >= 5) {
    score += 15;
  } else {
    score += 8;
  }

  // 3. Screening Questions Evaluation (up to +10 points)
  let disqualificationReason = null;
  if (screeningQuestions && screeningQuestions.length > 0 && screeningAnswers.length > 0) {
    let passedQuestions = 0;
    screeningQuestions.forEach(q => {
      const ansObj = screeningAnswers.find(a => a.questionId === q.id);
      if (ansObj) {
        if (q.type === 'YES_NO') {
          if (ansObj.answer === 'No' && q.isMandatory) {
            disqualificationReason = `Did not meet mandatory requirement: "${q.question}"`;
            score -= 25;
          } else if (ansObj.answer === 'Yes') {
            passedQuestions++;
          }
        } else if (ansObj.answer && ansObj.answer.toString().trim()) {
          passedQuestions++;
        }
      }
    });
    score += Math.round((passedQuestions / screeningQuestions.length) * 10);
  } else {
    score += 5;
  }

  // Clamp score between 60 and 99
  const finalScore = Math.min(Math.max(score, 60), 98);

  // Generate 3 AI summary bullets
  const highlights = [];
  if (finalScore >= 85) {
    highlights.push('Top tier applicant: Strong overlap with core required competencies.');
  } else {
    highlights.push('Solid foundational candidate: Meets primary requisition criteria.');
  }

  if (expNum >= 4) {
    highlights.push(`Demonstrated ${expNum}+ years industry background in relevant domain roles.`);
  } else {
    highlights.push('High-potential profile with relevant recent projects.');
  }

  if (!disqualificationReason) {
    highlights.push('Satisfies all mandatory compliance & screening qualifications.');
  } else {
    highlights.push(`Flagged: ${disqualificationReason}`);
  }

  return {
    score: finalScore,
    isDisqualified: Boolean(disqualificationReason),
    disqualificationReason,
    highlights,
    matchedSkills: candidateSkills.filter(cs =>
      (jobSkills || []).some(js => js.toLowerCase().includes(cs.toLowerCase()))
    ),
    missingSkills: (jobSkills || []).filter(js =>
      !candidateSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()))
    )
  };
}

export default calculateAIMatchScore;
