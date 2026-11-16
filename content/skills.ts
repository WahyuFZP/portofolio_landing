// Single source of truth for skills. Project MDX `tags` reference these ids,
// and "used in" counts are derived from that, so never list projects here.
//
// Levels (review these yourself before launch):
//   proficient = used at work or in a shipped project
//   familiar   = used in learning projects or this portfolio
//   learning   = currently studying, no project yet
export type Level = "proficient" | "familiar" | "learning";
export type SkillCategory = "qa" | "security" | "frontend" | "backend" | "database" | "devops" | "ai" | "design";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: Level;
}

// QA-first order (PRD-UIUX Q13).
export const categories: SkillCategory[] = ["qa", "security", "frontend", "backend", "database", "devops", "ai", "design"];
export const levels: Level[] = ["proficient", "familiar", "learning"];

export const skills: Skill[] = [
  { id: "playwright", name: "Playwright", category: "qa", level: "proficient" },
  { id: "postman", name: "Postman", category: "qa", level: "proficient" },
  { id: "api-testing", name: "API Testing", category: "qa", level: "proficient" },
  { id: "manual-testing", name: "Manual Testing", category: "qa", level: "proficient" },
  { id: "test-case-design", name: "Test Case Design", category: "qa", level: "proficient" },
  { id: "bug-reporting", name: "Bug Reporting", category: "qa", level: "proficient" },
  { id: "jira", name: "Jira", category: "qa", level: "proficient" },
  { id: "notion", name: "Notion", category: "qa", level: "proficient" },
  { id: "unit-testing", name: "Unit Testing", category: "qa", level: "familiar" },
  { id: "load-testing", name: "Load Testing", category: "qa", level: "familiar" },
  { id: "selenium", name: "Selenium", category: "qa", level: "familiar" },
  { id: "cypress", name: "Cypress", category: "qa", level: "learning" },

  { id: "security-testing", name: "Security Testing", category: "security", level: "familiar" },
  { id: "owasp", name: "OWASP Top 10", category: "security", level: "familiar" },
  { id: "pentest", name: "Penetration Testing", category: "security", level: "learning" },

  { id: "nextjs", name: "Next.js", category: "frontend", level: "proficient" },
  { id: "react", name: "React", category: "frontend", level: "proficient" },
  { id: "typescript", name: "TypeScript", category: "frontend", level: "proficient" },
  { id: "tailwind", name: "Tailwind CSS", category: "frontend", level: "proficient" },
  { id: "html-css", name: "HTML & CSS", category: "frontend", level: "proficient" },
  { id: "threejs", name: "Three.js", category: "frontend", level: "familiar" },

  { id: "laravel", name: "Laravel", category: "backend", level: "proficient" },
  { id: "php", name: "PHP", category: "backend", level: "proficient" },
  { id: "nodejs", name: "Node.js", category: "backend", level: "familiar" },
  { id: "rest-api", name: "REST API", category: "backend", level: "familiar" },
  { id: "supabase", name: "Supabase", category: "backend", level: "learning" },

  { id: "postgresql", name: "PostgreSQL", category: "database", level: "proficient" },
  { id: "mysql", name: "MySQL", category: "database", level: "proficient" },

  { id: "git", name: "Git", category: "devops", level: "proficient" },
  { id: "grafana", name: "Grafana", category: "devops", level: "familiar" },
  { id: "github-actions", name: "GitHub Actions", category: "devops", level: "familiar" },
  { id: "vercel", name: "Vercel", category: "devops", level: "familiar" },
  { id: "linux", name: "Linux", category: "devops", level: "familiar" },
  { id: "docker", name: "Docker", category: "devops", level: "learning" },

  { id: "claude-code", name: "Claude Code", category: "ai", level: "familiar" },
  { id: "prompt-engineering", name: "Prompt Engineering", category: "ai", level: "familiar" },
  { id: "llm-api", name: "LLM API", category: "ai", level: "learning" },

  { id: "figma", name: "Figma", category: "design", level: "familiar" },
];

export const skillById = new Map(skills.map((s) => [s.id, s]));
