/**
 * Pure helpers for digital-human skill slugs (defaults + merge on create).
 * Kept in `utils` so `logic/digital-human` does not pull skill-binding implementation from
 * `logic/agent-skills` for stateless transforms.
 */

/**
 * Built-in skill slugs merged into every new digital human agent.
 */
export const DEFAULT_DIGITAL_HUMAN_SKILLS: readonly string[] = [
  "archive-protocol",
  "schedule-plan",
  "kweaver-core"
];

const DEFAULT_DIGITAL_HUMAN_SKILL_SLUG_SET = new Set(DEFAULT_DIGITAL_HUMAN_SKILLS);

/**
 * @param slug Normalized skill id (matches OpenClaw / plugin skill name).
 * @returns Whether this slug is a built-in default for digital humans.
 */
export function isDefaultDigitalHumanSkillSlug(slug: string): boolean {
  return DEFAULT_DIGITAL_HUMAN_SKILL_SLUG_SET.has(slug);
}

/**
 * Merges {@link DEFAULT_DIGITAL_HUMAN_SKILLS} with optional request skills,
 * preserving default order and deduplicating by first occurrence.
 *
 * @param requestSkills Optional extra skill names from the create request.
 * @returns The combined skill list to persist on the agent.
 */
export function mergeCreateDigitalHumanSkills(requestSkills?: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of DEFAULT_DIGITAL_HUMAN_SKILLS) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  for (const s of requestSkills ?? []) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
