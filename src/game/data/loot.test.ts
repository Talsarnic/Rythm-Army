import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { addLootToInventory, rollBattleLoot, ENEMY_LOOT_TABLE, MISSION_CLEAR_REWARDS } from "./loot.ts";
import { ITEMS } from "./items.ts";

describe("Loot Tables & Item System", () => {
  it("all items referenced in loot tables and mission rewards exist in ITEMS registry", () => {
    for (const [kind, entries] of Object.entries(ENEMY_LOOT_TABLE)) {
      for (const entry of entries) {
        assert.ok(ITEMS[entry.itemId], `Item ${entry.itemId} in ${kind} loot table must exist in ITEMS`);
      }
    }

    for (const [missionId, rewards] of Object.entries(MISSION_CLEAR_REWARDS)) {
      for (const reward of rewards) {
        assert.ok(ITEMS[reward.itemId], `Item ${reward.itemId} in ${missionId} rewards must exist in ITEMS`);
      }
    }
  });

  it("rollBattleLoot grants guaranteed mission rewards even with zero killed enemies", () => {
    const rewards = rollBattleLoot("training", []);
    assert.ok(rewards.length >= 2);
    const branch = rewards.find((r) => r.itemId === "wood-branch");
    const resin = rewards.find((r) => r.itemId === "drummer-resin");
    assert.equal(branch?.qty, 2);
    assert.equal(resin?.qty, 1);
  });

  it("rollBattleLoot correctly accumulates enemy drops with deterministic RNG", () => {
    // RNG returning 0.0 means drop chance check passes (< dropRate) and chooses first weighted entry (qty: 1 per mob)
    const zeroRng = () => 0.0;
    const rewards = rollBattleLoot("dust-road", ["goretusk", "brute"], zeroRng);

    const fang = rewards.find((r) => r.itemId === "goretusk-fang");
    const hide = rewards.find((r) => r.itemId === "brute-hide");
    const branch = rewards.find((r) => r.itemId === "wood-branch");

    assert.ok(fang && fang.qty === 1); // 1 from goretusk
    assert.ok(hide && hide.qty === 1); // 1 from brute
    assert.ok(branch && branch.qty === 2); // 2 from mission guaranteed rewards
  });

  it("addLootToInventory merges new spoils cleanly into existing stock", () => {
    const startInv = { "iron-scrap": 3, "wood-branch": 5 };
    const spoils = [
      { itemId: "iron-scrap", qty: 2 },
      { itemId: "howl-core", qty: 1 },
      { itemId: "wood-branch", qty: 0 }, // no-op
    ];

    const updated = addLootToInventory(startInv, spoils);
    assert.equal(updated["iron-scrap"], 5);
    assert.equal(updated["wood-branch"], 5);
    assert.equal(updated["howl-core"], 1);
    assert.notEqual(updated, startInv); // Immutable
  });
});
