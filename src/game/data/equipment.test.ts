import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeUnitStats, createStarterRoster, canCreateUnit, UNIT_CREATION_RECIPES } from "./units.ts";
import { ITEMS } from "./items.ts";
import type { UnitMember } from "../types.ts";

describe("Equipment & Unit Stats", () => {
  it("calculates baseline stats for starter units with starter equipment", () => {
    const roster = createStarterRoster();
    const spearUnit = roster.find((u) => u.cls === "spear")!;
    assert.ok(spearUnit);
    assert.equal(spearUnit.weapon, "spear-wood");
    assert.equal(spearUnit.helmet, "helm-leather");

    const stats = computeUnitStats(spearUnit);
    // Base HP 44 + Helm (12) = 56
    assert.equal(stats.hp, 56);
    // Base damage 14 + Wooden Spear (0) = 14
    assert.equal(stats.damage, 14);
    // Base range 260 + Wooden Spear (0) = 260
    assert.equal(stats.range, 260);
    // Leather cap defense 0.05
    assert.equal(stats.defense, 0.05);
    // Wooden spear speed 1.0
    assert.equal(stats.attackSpeed, 1.0);
  });

  it("calculates upgraded stats with Iron Pike and Iron Casque on Spearkin", () => {
    const unit: UnitMember = {
      id: "test-spear",
      cls: "spear",
      level: 1,
      weapon: "spear-iron", // +6 dmg, +20 range, 1.15x attack speed
      helmet: "helm-iron", // +26 HP, 0.12 defense
    };

    const stats = computeUnitStats(unit);
    // Base HP 44 + 26 = 70
    assert.equal(stats.hp, 70);
    // Base damage 14 + 6 = 20
    assert.equal(stats.damage, 20);
    // Base range 260 + 20 = 280
    assert.equal(stats.range, 280);
    // 0.12 defense
    assert.equal(stats.defense, 0.12);
    // 1.15 speed
    assert.equal(stats.attackSpeed, 1.15);
  });

  it("calculates Bowkin stats with Howl Longbow and Greathelm", () => {
    const unit: UnitMember = {
      id: "test-bow",
      cls: "bow",
      level: 1,
      weapon: "bow-great", // +9 dmg, +100 range, 1.1x speed
      helmet: "helm-great", // +48 HP, 0.20 defense
    };

    const stats = computeUnitStats(unit);
    // Base HP 32 + 48 = 80
    assert.equal(stats.hp, 80);
    // Base damage 9 + 9 = 18
    assert.equal(stats.damage, 18);
    // Base range 420 + 100 = 520
    assert.equal(stats.range, 520);
    // 0.20 defense
    assert.equal(stats.defense, 0.2);
    // 1.1 speed
    assert.equal(stats.attackSpeed, 1.1);
  });

  it("calculates Aegiskin stats with Tower Bulwark and Crown", () => {
    const unit: UnitMember = {
      id: "test-aegis",
      cls: "aegis",
      level: 1,
      weapon: "shield-tower", // +8 dmg, +45 HP, +0.22 def, +15 range
      helmet: "helm-crown", // +70 HP, +0.28 def
    };

    const stats = computeUnitStats(unit);
    // Base HP 78 + 45 + 70 = 193
    assert.equal(stats.hp, 193);
    // Base damage 7 + 8 = 15
    assert.equal(stats.damage, 15);
    // Base range 70 + 15 = 85
    assert.equal(stats.range, 85);
    // 0.22 + 0.28 = 0.50 defense (50% reduction)
    assert.equal(stats.defense, 0.5);
  });

  it("all defined equipment items have valid equipment descriptors and allowedClasses", () => {
    const gearItems = Object.values(ITEMS).filter((item) => item.category === "gear");
    assert.ok(gearItems.length >= 8);

    for (const item of gearItems) {
      assert.ok(item.equipment, `${item.id} must have equipment property`);
      assert.ok(item.equipment.slot, `${item.id} must define a slot`);
      assert.ok(item.equipment.allowedClasses.length > 0, `${item.id} must have allowedClasses`);
    }
  });

  it("canCreateUnit enforces max unit limits and material recipe costs", () => {
    const starterRoster = createStarterRoster();

    // Starter roster has 3 spearkin, 2 bowkin, 2 aegiskin, 1 bannerkin
    // Spearkin is at limit (3/3)
    const spearCheck = canCreateUnit("spear", starterRoster, { "beast-meat": 99, "wood-branch": 99, "iron-scrap": 99 });
    assert.equal(spearCheck.allowed, false);
    assert.match(spearCheck.reason ?? "", /Maximum limit reached/);

    // Bannerkin cannot be cloned
    const bannerCheck = canCreateUnit("banner", starterRoster, { "beast-meat": 99 });
    assert.equal(bannerCheck.allowed, false);

    // Bowkin has 2/3: insufficient materials
    const bowCheckNoMat = canCreateUnit("bow", starterRoster, { "beast-meat": 1 });
    assert.equal(bowCheckNoMat.allowed, false);
    assert.match(bowCheckNoMat.reason ?? "", /Missing materials/);

    // Bowkin with exact materials
    const bowCheckOk = canCreateUnit("bow", starterRoster, UNIT_CREATION_RECIPES.bow.materials);
    assert.equal(bowCheckOk.allowed, true);
  });
});
