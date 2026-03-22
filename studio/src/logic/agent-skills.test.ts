import { describe, expect, it, vi } from "vitest";

import { DefaultAgentSkillsLogic } from "./agent-skills";

describe("DefaultAgentSkillsLogic", () => {
  it("delegates listAvailableSkills to the client", async () => {
    const logic = new DefaultAgentSkillsLogic({
      listAvailableSkills: vi.fn().mockResolvedValue({
        skills: ["weather", "search"]
      }),
      getAgentSkills: vi.fn(),
      updateAgentSkills: vi.fn()
    });

    await expect(logic.listAvailableSkills()).resolves.toEqual({
      skills: ["weather", "search"]
    });
  });

  it("delegates getAgentSkills to the client", async () => {
    const logic = new DefaultAgentSkillsLogic({
      listAvailableSkills: vi.fn(),
      getAgentSkills: vi.fn().mockResolvedValue({
        agentId: "agent-1",
        skills: ["weather"]
      }),
      updateAgentSkills: vi.fn()
    });

    await expect(logic.getAgentSkills("agent-1")).resolves.toEqual({
      agentId: "agent-1",
      skills: ["weather"]
    });
  });

  it("delegates updateAgentSkills to the client", async () => {
    const logic = new DefaultAgentSkillsLogic({
      listAvailableSkills: vi.fn(),
      getAgentSkills: vi.fn(),
      updateAgentSkills: vi.fn().mockResolvedValue({
        success: true,
        agentId: "agent-1",
        skills: ["weather", "search"]
      })
    });

    await expect(
      logic.updateAgentSkills("agent-1", ["weather", "search"])
    ).resolves.toEqual({
      success: true,
      agentId: "agent-1",
      skills: ["weather", "search"]
    });
  });
});
