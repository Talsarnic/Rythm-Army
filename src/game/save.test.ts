import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { defaultSave, migrate, SAVE_VERSION } from "./save.ts";
import type { SaveData } from "./types.ts";

describe("SaveData Migration & Persistence", () => {
  it("generates defaultSave with version 3, default starter roster with starter gear, and empty inventory", () => {
    const save = defaultSave();
    assert.equal(save.version, 3);
    assert.equal(save.version, SAVE_VERSION);
    assert.deepEqual(save.completed, []);
    assert.equal(save.bestCombo, 0);
    assert.equal(save.roster.length, 8);
    assert.deepEqual(save.inventory, {});
    assert.equal(save.roster[0]?.cls, "banner");
    assert.equal(save.roster[0]?.helmet, "helm-leather");
    assert.equal(save.roster[1]?.cls, "bow");
    assert.equal(save.roster[1]?.weapon, "bow-wood");
    assert.equal(save.roster[1]?.helmet, "helm-leather");
  });

  it("migrates v1/v2 save format (missing roster, inventory, or gear) to v3 seamlessly", () => {
    const v1Raw = {
      version: 1,
      completed: ["training", "dust-road"],
      bestCombo: 14,
      offsetMs: 15,
      settings: { master: 0.9, music: 0.5, sfx: 0.8, shake: 0.6 },
    };

    const migrated = migrate(v1Raw as unknown as Partial<SaveData>);
    assert.equal(migrated.version, 3);
    assert.deepEqual(migrated.completed, ["training", "dust-road"]);
    assert.equal(migrated.bestCombo, 14);
    assert.equal(migrated.offsetMs, 15);
    assert.equal(migrated.settings.master, 0.9);
    assert.equal(migrated.roster.length, 8);
    assert.deepEqual(migrated.inventory, {});
  });

  it("preserves custom roster, gear, and inventory if provided in valid format", () => {
    const v2Raw: Partial<SaveData> = {
      version: 2,
      completed: ["training"],
      bestCombo: 22,
      roster: [
        { id: "hero-1", cls: "spear", level: 2, weapon: "spear-iron", helmet: "helm-iron" },
        { id: "tank-1", cls: "aegis", level: 3, weapon: "shield-tower", helmet: "helm-great" },
      ],
      inventory: {
        "iron-scrap": 5,
        "wood-branch": 10,
        invalidNegative: -2,
      },
    };

    const migrated = migrate(v2Raw);
    assert.equal(migrated.roster.length, 2);
    assert.equal(migrated.roster[0]?.id, "hero-1");
    assert.equal(migrated.roster[0]?.weapon, "spear-iron");
    assert.equal(migrated.roster[0]?.helmet, "helm-iron");
    assert.equal(migrated.roster[1]?.level, 3);
    assert.equal(migrated.roster[1]?.weapon, "shield-tower");
    assert.equal(migrated.roster[1]?.helmet, "helm-great");
    assert.equal(migrated.inventory["iron-scrap"], 5);
    assert.equal(migrated.inventory["wood-branch"], 10);
    assert.equal(migrated.inventory.invalidNegative, undefined);
  });
});
