import { describe, expect, it } from "vitest";

import {
  isDefaultDigitalHumanSkillSlug,
  mergeCreateDigitalHumanSkills
} from "./skills";

describe("utils/skills", () => {
  it("isDefaultDigitalHumanSkillSlug matches built-in slugs", () => {
    expect(isDefaultDigitalHumanSkillSlug("archive-protocol")).toBe(true);
    expect(isDefaultDigitalHumanSkillSlug("schedule-plan")).toBe(true);
    expect(isDefaultDigitalHumanSkillSlug("kweaver-core")).toBe(true);
    expect(isDefaultDigitalHumanSkillSlug("custom")).toBe(false);
  });

  it("mergeCreateDigitalHumanSkills prepends defaults and dedupes", () => {
    expect(mergeCreateDigitalHumanSkills()).toEqual([
      "archive-protocol",
      "schedule-plan",
      "kweaver-core"
    ]);
    expect(mergeCreateDigitalHumanSkills(["x"])).toEqual([
      "archive-protocol",
      "schedule-plan",
      "kweaver-core",
      "x"
    ]);
    expect(mergeCreateDigitalHumanSkills(["archive-protocol", "y"])).toEqual([
      "archive-protocol",
      "schedule-plan",
      "kweaver-core",
      "y"
    ]);
  });
});
