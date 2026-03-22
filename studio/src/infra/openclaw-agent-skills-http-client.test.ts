import { describe, expect, it, vi } from "vitest";

import {
  buildOpenClawAgentSkillsUrl,
  createOpenClawAgentSkillsHeaders,
  createOpenClawAgentSkillsStatusError,
  DefaultOpenClawAgentSkillsHttpClient,
  normalizeOpenClawAgentSkillsError
} from "./openclaw-agent-skills-http-client";

describe("buildOpenClawAgentSkillsUrl", () => {
  it("converts ws/wss to http/https and appends agentId when present", () => {
    expect(
      buildOpenClawAgentSkillsUrl("ws://127.0.0.1:19001/ws?x=1")
    ).toBe("http://127.0.0.1:19001/v1/config/agents/skills");

    expect(
      buildOpenClawAgentSkillsUrl("wss://gateway.example.com/socket", "agent-2")
    ).toBe("https://gateway.example.com/v1/config/agents/skills?agentId=agent-2");
  });
});

describe("createOpenClawAgentSkillsHeaders", () => {
  it("creates headers with optional authorization and json content type", () => {
    const headers = createOpenClawAgentSkillsHeaders("secret-token", true);

    expect(headers.get("accept")).toBe("application/json");
    expect(headers.get("authorization")).toBe("Bearer secret-token");
    expect(headers.get("content-type")).toBe("application/json");

    const withoutToken = createOpenClawAgentSkillsHeaders();
    expect(withoutToken.get("authorization")).toBeNull();
    expect(withoutToken.get("content-type")).toBeNull();
  });
});

describe("createOpenClawAgentSkillsStatusError", () => {
  it("returns a 502 error with upstream details", async () => {
    const response = new Response("denied", {
      status: 403
    });

    await expect(createOpenClawAgentSkillsStatusError(response)).resolves.toMatchObject({
      statusCode: 502,
      message: "OpenClaw /v1/config/agents/skills returned HTTP 403: denied"
    });
  });
});

describe("normalizeOpenClawAgentSkillsError", () => {
  it("keeps HttpError instances and wraps unknown errors", async () => {
    const { HttpError } = await import("../errors/http-error");
    const httpError = new HttpError(502, "bad gateway");

    expect(normalizeOpenClawAgentSkillsError(httpError)).toBe(httpError);
    expect(normalizeOpenClawAgentSkillsError(new Error("offline"))).toMatchObject({
      statusCode: 502,
      message: "Failed to communicate with OpenClaw /v1/config/agents/skills: offline"
    });
  });
});

describe("DefaultOpenClawAgentSkillsHttpClient", () => {
  it("lists available skills", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ skills: ["weather", "search"] }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const client = new DefaultOpenClawAgentSkillsHttpClient(
      {
        gatewayUrl: "ws://127.0.0.1:19001/ws",
        token: "secret",
        timeoutMs: 5000
      },
      fetchImpl
    );

    await expect(client.listAvailableSkills()).resolves.toEqual({
      skills: ["weather", "search"]
    });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:19001/v1/config/agents/skills"
    );
  });

  it("reads one agent's skill bindings", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ agentId: "a1", skills: ["weather"] }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const client = new DefaultOpenClawAgentSkillsHttpClient(
      {
        gatewayUrl: "http://127.0.0.1:19001",
        timeoutMs: 5000
      },
      fetchImpl
    );

    await expect(client.getAgentSkills("a1")).resolves.toEqual({
      agentId: "a1",
      skills: ["weather"]
    });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:19001/v1/config/agents/skills?agentId=a1"
    );
  });

  it("updates one agent's skill bindings", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({
        success: true,
        agentId: "a1",
        skills: ["weather", "search"]
      }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const client = new DefaultOpenClawAgentSkillsHttpClient(
      {
        gatewayUrl: "http://127.0.0.1:19001",
        timeoutMs: 5000
      },
      fetchImpl
    );

    await expect(
      client.updateAgentSkills("a1", ["weather", "search"])
    ).resolves.toEqual({
      success: true,
      agentId: "a1",
      skills: ["weather", "search"]
    });

    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:19001/v1/config/agents/skills"
    );
    expect(fetchImpl.mock.calls[0]?.[1]).toMatchObject({
      method: "PUT",
      body: JSON.stringify({ agentId: "a1", skills: ["weather", "search"] })
    });
  });
});
