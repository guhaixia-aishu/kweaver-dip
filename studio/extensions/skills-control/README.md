# Skills Control Extension

A plugin for OpenClaw to programmatically and interactively manage agent skills. It enables/disables global skills via CLI and manages per-agent skill lists via an HTTP API.

## Features

- **HTTP API**: Modify `agent.list[].skills` data for specific agents.
- **CLI Commands**: Enable/disable global skills by modifying `skills.entries` in `openclaw.json`.
- **Self-contained**: Operates entirely within the `extensions/` directory.

## Installation

1. Copy or link the `skills-control` folder into your OpenClaw extensions directory (default: `~/.openclaw/extensions/`).
2. Add the plugin to your `openclaw.json`:

```json
{
  "plugins": {
    "entries": {
      "skills-control": {
        "enabled": true
      }
    }
  }
}
```

3. Restart the OpenClaw gateway.

## CLI Usage

Commands are available via the `/skills-manage` slash command in supported chat interfaces.

- `/skills-manage list`: List all global skill entries and their current enabled status.
- `/skills-manage enable <skillName>`: Enable a global skill.
- `/skills-manage disable <skillName>`: Disable a global skill.

## HTTP API Documentation

All endpoints require Gateway authentication (e.g., Bearer token).

### GET `/v1/config/agents/skills`

Retrieve the list of enabled skills for a specific agent, or all available skills.

**Behavior:**
- **No `agentId`**: Returns **all available skills** discovered in the filesystem (`skills/` directory).
- **With `agentId`**:
  - If the agent's `skills` configuration is `undefined`, it returns **all available skills**.
  - If the agent's `skills` configuration is an empty array `[]`, it returns `[]`.
  - Otherwise, it returns the explicit list of skills configured for the agent.

**Query Parameters:**
- `agentId` (optional): The ID of the agent to query.

**Example Request (All Skills):**
```bash
curl -X GET "http://localhost:18789/v1/config/agents/skills" \
     -H "Authorization: Bearer <TOKEN>"
```

**Example Request (Specific Agent):**
```bash
curl -X GET "http://localhost:18789/v1/config/agents/skills?agentId=de_finance" \
     -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "agentId": "de_finance",
  "skills": ["apple-notes", "weather", "google-search"]
}
```

---

### POST/PUT `/v1/config/agents/skills`

Update the list of enabled skills for a specific agent.

**Request Body (JSON):**
- `agentId` (string, required): The ID of the agent to update.
- `skills` (string[], required): The new list of skill IDs for the agent. Use `null` or omit the field in `openclaw.json` (via manual edit) to revert to "all skills".

**Example Request:**
```bash
curl -X POST "http://localhost:18789/v1/config/agents/skills" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"agentId": "de_finance", "skills": ["apple-notes", "weather"]}'
```

**Response (200 OK):**
```json
{
  "success": true,
  "agentId": "de_finance",
  "skills": ["apple-notes", "weather"]
}
```

## Implementation Details

- **Location**: `extensions/skills-control/`
- **Configuration**: Direct writes to `openclaw.json` using the OpenClaw Plugin SDK `api.runtime.config` methods.
- **Discovery**: Custom filesystem listing of the `skills/` directory to ensure comprehensive coverage.
- **Security**: HTTP routes are protected by `auth: "gateway"`.
