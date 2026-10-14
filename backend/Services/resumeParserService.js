/**
 * Resume Parser Service
 * Extracts structured candidate profile data, skills, contact information, and experience.
 */

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "React.js", "Node.js", "Python", "Java", "C++",
  "HTML5", "CSS3", "Tailwind CSS", "Next.js", "Express", "PostgreSQL", "MongoDB",
  "MySQL", "Redis", "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD",
  "Git", "GitHub", "REST API", "GraphQL", "Microservices", "System Design", "Agile",
  "Scrum", "Figma", "UI/UX", "Linux", "Terraform", "Jest", "Playwright", "Cypress"
];

export const resumeParserService = {
  /**
   * Parses raw resume text into structured candidate fields
   */
  parseText(rawText = "") {
    const text = String(rawText);

    // 1. Extract Email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0].toLowerCase() : null;

    // 2. Extract Phone
    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : null;

    // 3. Extract Links
    const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

    // 4. Extract Skills
    const matchedSkills = [];
    const lowerText = text.toLowerCase();
    for (const skill of COMMON_SKILLS) {
      const lowerSkill = skill.toLowerCase();
      // Whole word matching
      const regex = new RegExp(`\\b${lowerSkill.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(lowerText) && !matchedSkills.includes(skill)) {
        matchedSkills.push(skill);
      }
    }

    // 5. Estimate Experience Years
    let experienceYears = 0;
    const expMatches = text.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i);
    if (expMatches && expMatches[1]) {
      experienceYears = parseInt(expMatches[1], 10);
    } else {
      // Find date ranges like 2018 - 2024
      const yearRanges = text.match(/(20\d{2})\s*(?:-|–|to)\s*(20\d{2}|present)/gi);
      if (yearRanges && yearRanges.length > 0) {
        experienceYears = Math.min(15, yearRanges.length * 2);
      }
    }

    // 6. Name Extraction (first non-empty line heuristics)
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let name = "Candidate";
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (firstLine.length < 40 && !firstLine.includes("@") && !firstLine.includes("http")) {
        name = firstLine;
      }
    }

    return {
      name,
      email,
      phone,
      linkedinUrl: linkedinMatch ? linkedinMatch[0] : null,
      githubUrl: githubMatch ? githubMatch[0] : null,
      skills: matchedSkills,
      experienceYears,
      headline: matchedSkills.length > 0 ? `${matchedSkills.slice(0, 3).join(", ")} Specialist` : "Software Engineer",
      parsedAt: new Date().toISOString(),
    };
  },
};
