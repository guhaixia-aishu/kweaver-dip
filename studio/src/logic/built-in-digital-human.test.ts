import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../errors/http-error";
import { DefaultBuiltInDigitalHumanLogic } from "./built-in-digital-human";

describe("DefaultBuiltInDigitalHumanLogic", () => {
  let builtInRootDir: string;

  afterEach(async () => {
    if (builtInRootDir !== undefined) {
      await rm(builtInRootDir, { recursive: true, force: true });
    }
  });

  it("lists built-in digital human templates from metadata.json", async () => {
    builtInRootDir = await mkdtemp(join(tmpdir(), "dip-built-in-dh-"));
    const templateDir = join(builtInRootDir, "bkn-creator");
    await mkdir(templateDir, { recursive: true });
    await writeFile(
      join(templateDir, "metadata.json"),
      JSON.stringify({
        type: "digital-human",
        id: "__bkn_creator__",
        name: "BKN Creator",
        description: "BKN helper",
        is_builtin: true
      }),
      "utf8"
    );
    await writeFile(join(templateDir, "IDENTITY.md"), "- Name: BKN Creator\n", "utf8");
    await writeFile(join(templateDir, "SOUL.md"), "Soul\n", "utf8");

    const logic = new DefaultBuiltInDigitalHumanLogic({ builtInRootDir });

    await expect(logic.listBuiltInDigitalHumans()).resolves.toEqual([
      {
        id: "__bkn_creator__",
        name: "BKN Creator",
        description: "BKN helper"
      }
    ]);
  });

  it("creates selected built-in digital humans by installing skills first", async () => {
    builtInRootDir = await mkdtemp(join(tmpdir(), "dip-built-in-dh-create-"));
    const templateDir = join(builtInRootDir, "bkn-creator");
    const skillsDir = join(templateDir, "skills");
    await mkdir(skillsDir, { recursive: true });
    await writeFile(
      join(templateDir, "metadata.json"),
      JSON.stringify({
        type: "digital-human",
        id: "__bkn_creator__",
        name: "BKN Creator",
        description: "Built-in",
        is_builtin: true
      }),
      "utf8"
    );
    await writeFile(
      join(templateDir, "IDENTITY.md"),
      ["- **Name:**", "  BKN Creator", "- **Creature:**", "  Analyst"].join("\n"),
      "utf8"
    );
    await writeFile(join(templateDir, "SOUL.md"), "Built-in soul\n", "utf8");
    await writeFile(join(skillsDir, "create-bkn.skill"), "zip-a", "utf8");
    await writeFile(join(skillsDir, "data-semantic.skill"), "zip-b", "utf8");

    const agentSkillsLogic = {
      installSkill: vi
        .fn()
        .mockResolvedValueOnce({ name: "create-bkn", skillPath: "/tmp/a" })
        .mockResolvedValueOnce({ name: "data-semantic", skillPath: "/tmp/b" })
    };
    const digitalHumanLogic = {
      getDigitalHuman: vi.fn().mockRejectedValue(new HttpError(404, "Digital human not found")),
      createDigitalHuman: vi.fn().mockResolvedValue({ id: "agent-1", name: "BKN Creator" })
    };
    const logic = new DefaultBuiltInDigitalHumanLogic({ builtInRootDir });

    await expect(
      logic.createBuiltInDigitalHumans(["__bkn_creator__"], {
        agentSkillsLogic: agentSkillsLogic as never,
        digitalHumanLogic: digitalHumanLogic as never
      })
    ).resolves.toEqual([{ id: "agent-1", name: "BKN Creator" }]);

    expect(agentSkillsLogic.installSkill).toHaveBeenNthCalledWith(
      1,
      Buffer.from("zip-a"),
      { overwrite: true, name: "create-bkn" }
    );
    expect(agentSkillsLogic.installSkill).toHaveBeenNthCalledWith(
      2,
      Buffer.from("zip-b"),
      { overwrite: true, name: "data-semantic" }
    );
    expect(digitalHumanLogic.createDigitalHuman).toHaveBeenCalledWith({
      id: "__bkn_creator__",
      name: "BKN Creator",
      creature: "Analyst",
      icon_id: undefined,
      soul: "Built-in soul\n",
      bkn: undefined,
      skills: ["create-bkn", "data-semantic"]
    });
  });

  it("updates an existing built-in digital human by merging current and new skills", async () => {
    builtInRootDir = await mkdtemp(join(tmpdir(), "dip-built-in-dh-update-"));
    const templateDir = join(builtInRootDir, "bkn-creator");
    const skillsDir = join(templateDir, "skills");
    await mkdir(skillsDir, { recursive: true });
    await writeFile(
      join(templateDir, "metadata.json"),
      JSON.stringify({
        type: "digital-human",
        id: "__bkn_creator__",
        name: "BKN Creator",
        description: "Built-in",
        is_builtin: true
      }),
      "utf8"
    );
    await writeFile(
      join(templateDir, "IDENTITY.md"),
      ["- **Name:**", "  BKN Creator", "- **Creature:**", "  Analyst"].join("\n"),
      "utf8"
    );
    await writeFile(join(templateDir, "SOUL.md"), "Updated soul\n", "utf8");
    await writeFile(join(skillsDir, "create-bkn.skill"), "zip-a", "utf8");
    await writeFile(join(skillsDir, "data-semantic.skill"), "zip-b", "utf8");

    const agentSkillsLogic = {
      installSkill: vi
        .fn()
        .mockResolvedValueOnce({ name: "create-bkn", skillPath: "/tmp/a" })
        .mockResolvedValueOnce({ name: "data-semantic", skillPath: "/tmp/b" })
    };
    const digitalHumanLogic = {
      getDigitalHuman: vi.fn().mockResolvedValue({
        id: "__bkn_creator__",
        name: "BKN Creator",
        soul: "Old soul\n",
        skills: ["archive-protocol", "create-bkn"]
      }),
      createDigitalHuman: vi.fn(),
      updateDigitalHuman: vi
        .fn()
        .mockResolvedValue({ id: "__bkn_creator__", name: "BKN Creator" })
    };
    const logic = new DefaultBuiltInDigitalHumanLogic({ builtInRootDir });

    await expect(
      logic.createBuiltInDigitalHumans(["__bkn_creator__"], {
        agentSkillsLogic: agentSkillsLogic as never,
        digitalHumanLogic: digitalHumanLogic as never
      })
    ).resolves.toEqual([{ id: "__bkn_creator__", name: "BKN Creator" }]);

    expect(digitalHumanLogic.createDigitalHuman).not.toHaveBeenCalled();
    expect(digitalHumanLogic.updateDigitalHuman).toHaveBeenCalledWith("__bkn_creator__", {
      name: "BKN Creator",
      creature: "Analyst",
      icon_id: undefined,
      soul: "Updated soul\n",
      bkn: undefined,
      skills: ["archive-protocol", "create-bkn", "data-semantic"]
    });
  });

  it("rejects unknown built-in ids", async () => {
    builtInRootDir = await mkdtemp(join(tmpdir(), "dip-built-in-dh-missing-"));
    const logic = new DefaultBuiltInDigitalHumanLogic({ builtInRootDir });

    await expect(logic.getBuiltInDigitalHumanDefinitions(["missing"])).rejects.toEqual(
      new HttpError(400, "Unknown built-in digital human id: missing")
    );
  });

  it("ignores metadata entries that are not marked built-in", async () => {
    builtInRootDir = await mkdtemp(join(tmpdir(), "dip-built-in-dh-nonbuiltin-"));
    const templateDir = join(builtInRootDir, "bkn-creator");
    await mkdir(templateDir, { recursive: true });
    await writeFile(
      join(templateDir, "metadata.json"),
      JSON.stringify({
        type: "digital-human",
        id: "__bkn_creator__",
        name: "BKN Creator",
        description: "BKN helper",
        is_builtin: false
      }),
      "utf8"
    );

    const logic = new DefaultBuiltInDigitalHumanLogic({ builtInRootDir });

    await expect(logic.listBuiltInDigitalHumans()).resolves.toEqual([]);
  });
});
