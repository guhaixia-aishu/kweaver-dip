import type { OpenClawAgentSkillsHttpClient } from "../infra/openclaw-agent-skills-http-client";
import type {
  AgentSkillsBinding,
  AgentSkillsCatalog,
  UpdateAgentSkillsResult
} from "../types/agent-skills";

/**
 * Application logic used to query and update agent skill bindings.
 */
export interface AgentSkillsLogic {
  /**
   * Lists globally available skill ids.
   */
  listAvailableSkills(): Promise<AgentSkillsCatalog>;

  /**
   * Reads one agent's current skill ids.
   *
   * @param agentId Stable OpenClaw agent id.
   */
  getAgentSkills(agentId: string): Promise<AgentSkillsBinding>;

  /**
   * Replaces one agent's current skill ids.
   *
   * @param agentId Stable OpenClaw agent id.
   * @param skills Replacement skill ids.
   */
  updateAgentSkills(
    agentId: string,
    skills: string[]
  ): Promise<UpdateAgentSkillsResult>;
}

/**
 * Logic implementation backed by the `skills-control` plugin HTTP API.
 */
export class DefaultAgentSkillsLogic implements AgentSkillsLogic {
  /**
   * Creates the logic implementation.
   *
   * @param client Plugin HTTP client.
   */
  public constructor(private readonly client: OpenClawAgentSkillsHttpClient) {}

  /**
   * Lists globally available skill ids.
   *
   * @returns The plugin payload.
   */
  public async listAvailableSkills(): Promise<AgentSkillsCatalog> {
    return this.client.listAvailableSkills();
  }

  /**
   * Reads one agent's current skill ids.
   *
   * @param agentId Stable OpenClaw agent id.
   * @returns The plugin payload.
   */
  public async getAgentSkills(agentId: string): Promise<AgentSkillsBinding> {
    return this.client.getAgentSkills(agentId);
  }

  /**
   * Replaces one agent's current skill ids.
   *
   * @param agentId Stable OpenClaw agent id.
   * @param skills Replacement skill ids.
   * @returns The plugin payload.
   */
  public async updateAgentSkills(
    agentId: string,
    skills: string[]
  ): Promise<UpdateAgentSkillsResult> {
    return this.client.updateAgentSkills(agentId, skills);
  }
}
