import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ACTION,
  armyAdvance,
  attackModifiers,
  bossSlamDamage,
  damageToUnit,
  easeEnemyKnockback,
  easeUnitKnockback,
  enemyKnockback,
  enemyWalk,
  evaluateEnd,
  frontX,
  nearestAhead,
  scaledDamage,
  shouldTelegraphSlam,
  STAGGER_SPEED,
  unitKnockback,
  type EndInput,
} from "./rules.ts";

const near = (actual: number, expected: number, eps = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= eps, `expected ${actual} to be within ${eps} of ${expected}`);

describe("attackModifiers", () => {
  it("is neutral with no bonuses", () => {
    assert.deepEqual(attackModifiers({ charged: false, defend: false, fever: false }), { damage: 1, power: 1 });
  });

  it("charging hits harder and shoves harder", () => {
    const m = attackModifiers({ charged: true, defend: false, fever: false });
    near(m.damage, 1.7);
    near(m.power, 1.7);
  });

  it("fever adds damage and a smaller shove bonus", () => {
    const m = attackModifiers({ charged: false, defend: false, fever: true });
    near(m.damage, 1.45);
    near(m.power, 1.25);
  });

  it("defending trades damage for safety but does not change the shove", () => {
    const m = attackModifiers({ charged: false, defend: true, fever: false });
    near(m.damage, 0.45);
    near(m.power, 1);
  });

  it("stacks every bonus together", () => {
    const m = attackModifiers({ charged: true, defend: true, fever: true });
    near(m.damage, 1.45 * 1.7 * 0.45);
    near(m.power, 1.7 * 1.25);
  });
});

describe("scaledDamage", () => {
  it("rounds to a whole number", () => {
    assert.equal(scaledDamage(14, 1.45), 20);
    assert.equal(scaledDamage(9, 1.7), 15);
  });

  it("always deals at least 1, however weak the hit", () => {
    assert.equal(scaledDamage(1, 0.1), 1);
    assert.equal(scaledDamage(7, 0.45), 3);
  });
});

describe("knockback", () => {
  it("shoves an ordinary enemy back 260px/s per unit of power", () => {
    assert.equal(enemyKnockback(0, 1, "goretusk"), 260);
  });

  it("stacks across hits up to a cap of 520", () => {
    assert.equal(enemyKnockback(260, 1, "goretusk"), 520);
    assert.equal(enemyKnockback(500, 2, "goretusk"), 520);
  });

  it("barely moves heavy enemies", () => {
    near(enemyKnockback(0, 1, "brute"), 143);
    near(enemyKnockback(0, 1, "howl"), 31.2);
  });

  it("a normal hit staggers a goretusk but not the boss", () => {
    assert.ok(enemyKnockback(0, 1, "goretusk") > STAGGER_SPEED);
    assert.ok(enemyKnockback(0, 1, "howl") < STAGGER_SPEED);
  });

  it("nudges army units backwards, shields less", () => {
    assert.equal(unitKnockback(0, 1, "pike", false), -26);
    near(unitKnockback(0, 1, "aegis", false), -15.6);
  });

  it("defending resists the shove further", () => {
    near(unitKnockback(0, 1, "pike", true), -10.4);
    near(unitKnockback(0, 1, "aegis", true), -6.24);
  });

  it("never pushes a unit more than 46px out of formation", () => {
    assert.equal(unitKnockback(-40, 3, "pike", false), -46);
  });

  it("unit shove decays and snaps to zero", () => {
    const later = easeUnitKnockback(-40, 0.1);
    assert.ok(later < 0 && later > -40, "still backwards, but weaker");
    assert.equal(easeUnitKnockback(-0.31, 0.1), 0);
  });

  it("enemy shove decays and snaps to zero", () => {
    const later = easeEnemyKnockback(260, 0.1);
    assert.ok(later > 0 && later < 260);
    assert.equal(easeEnemyKnockback(4.2, 0.1), 0);
  });
});

describe("damage taken by the army", () => {
  it("is unchanged normally and cut to 38% when defending", () => {
    assert.equal(damageToUnit(14, false), 14);
    assert.equal(damageToUnit(10, true), 4);
  });

  it("the boss slam is softened by defending, then cut again on the way in", () => {
    assert.equal(bossSlamDamage(22, false), 22);
    assert.equal(bossSlamDamage(22, true), 9);
    assert.equal(damageToUnit(bossSlamDamage(22, true), true), 3);
  });
});

describe("enemyWalk", () => {
  it("walks towards the army when out of range", () => {
    assert.ok(enemyWalk(300, 70, 46, false, 0.1) < 0);
  });

  it("holds position once in range", () => {
    assert.equal(enemyWalk(60, 70, 46, false, 0.1), 0);
  });

  it("backs off when the army has marched past", () => {
    assert.ok(enemyWalk(-80, 70, 46, false, 0.1) > 0);
  });

  it("is slower during fever", () => {
    const normal = Math.abs(enemyWalk(300, 70, 46, false, 0.1));
    const fever = Math.abs(enemyWalk(300, 70, 46, true, 0.1));
    near(fever, normal * 0.9);
  });
});

describe("nearestAhead", () => {
  type T = { x: number; alive: boolean };
  const xOf = (t: T) => t.x;
  const alive = (t: T) => t.alive;

  it("picks the closest target ahead within range", () => {
    const items: T[] = [
      { x: 400, alive: true },
      { x: 250, alive: true },
      { x: 330, alive: true },
    ];
    assert.equal(nearestAhead(items, 100, 500, xOf, alive), items[1]);
  });

  it("skips the dead", () => {
    const items: T[] = [
      { x: 150, alive: false },
      { x: 300, alive: true },
    ];
    assert.equal(nearestAhead(items, 100, 500, xOf, alive), items[1]);
  });

  it("ignores targets behind or right on top of the shooter", () => {
    const items: T[] = [
      { x: 50, alive: true },
      { x: 105, alive: true },
    ];
    assert.equal(nearestAhead(items, 100, 500, xOf, alive), null);
  });

  it("respects range", () => {
    const items: T[] = [{ x: 400, alive: true }];
    assert.equal(nearestAhead(items, 100, 260, xOf, alive), null);
    assert.equal(nearestAhead(items, 100, 301, xOf, alive), items[0]);
  });
});

describe("frontX", () => {
  it("is the rightmost unit", () => {
    assert.equal(frontX([100, 340, 220], 0), 340);
  });

  it("falls back to the anchor when no unit is left", () => {
    assert.equal(frontX([], 280), 280);
  });
});

describe("shouldTelegraphSlam", () => {
  it("winds up on every third measure", () => {
    assert.equal(shouldTelegraphSlam(2, 1000, 900), true);
    assert.equal(shouldTelegraphSlam(5, 1000, 900), true);
    assert.equal(shouldTelegraphSlam(0, 1000, 900), false);
    assert.equal(shouldTelegraphSlam(1, 1000, 900), false);
    assert.equal(shouldTelegraphSlam(3, 1000, 900), false);
  });

  it("waits until the army is within reach", () => {
    assert.equal(shouldTelegraphSlam(2, 1340, 1000), true);
    assert.equal(shouldTelegraphSlam(2, 1341, 1000), false);
  });
});

describe("armyAdvance", () => {
  it("moves at command speed, faster in fever", () => {
    near(armyAdvance(500, 100, false, 0.5, 4000), 550);
    near(armyAdvance(500, 100, true, 0.5, 4000), 566);
  });

  it("can retreat but not off the left edge", () => {
    near(armyAdvance(500, -125, false, 1, 4000), 375);
    assert.equal(armyAdvance(100, -125, false, 1, 4000), 80);
  });

  it("stops 200px before the end of the map", () => {
    assert.equal(armyAdvance(3790, 310, false, 1, 4000), 3800);
  });

  it("retreat is the only command that moves the army backwards", () => {
    const backwards = Object.entries(ACTION).filter(([, a]) => a.speed < 0).map(([id]) => id);
    assert.deepEqual(backwards, ["retreat"]);
  });
});

describe("evaluateEnd", () => {
  const base: EndInput = {
    unitsAlive: 8,
    hasBanner: true,
    bannerAlive: true,
    tutorial: false,
    armyX: 500,
    goalX: 2800,
    wavesTotal: 2,
    wavesSpawned: 1,
    enemiesSpawned: 3,
    enemiesAlive: 3,
  };

  it("carries on while the fight is going", () => {
    assert.equal(evaluateEnd(base), null);
  });

  it("loses when the banner falls, even with soldiers left", () => {
    assert.deepEqual(evaluateEnd({ ...base, bannerAlive: false }), { win: false, cause: "The banner fell." });
  });

  it("loses when the whole army is wiped out", () => {
    assert.deepEqual(evaluateEnd({ ...base, unitsAlive: 0, hasBanner: false }), {
      win: false,
      cause: "The army was wiped out.",
    });
  });

  it("losing takes priority over reaching the shrine", () => {
    const v = evaluateEnd({ ...base, tutorial: true, armyX: 2800, bannerAlive: false });
    assert.equal(v?.win, false);
  });

  it("the tutorial is won by reaching the shrine", () => {
    assert.equal(evaluateEnd({ ...base, tutorial: true, wavesTotal: 0, armyX: 2759 }), null);
    assert.deepEqual(evaluateEnd({ ...base, tutorial: true, wavesTotal: 0, armyX: 2760 }), {
      win: true,
      cause: "The shrine is yours.",
    });
  });

  it("a normal mission is won by clearing every wave", () => {
    const cleared = { ...base, wavesSpawned: 2, enemiesAlive: 0 };
    assert.deepEqual(evaluateEnd(cleared), { win: true, cause: "The road is clear." });
  });

  it("is not won while a wave is still to come", () => {
    assert.equal(evaluateEnd({ ...base, wavesSpawned: 1, enemiesAlive: 0 }), null);
  });

  it("is not won while an enemy is still standing", () => {
    assert.equal(evaluateEnd({ ...base, wavesSpawned: 2, enemiesAlive: 1 }), null);
  });

  it("is not won before anything has spawned", () => {
    assert.equal(evaluateEnd({ ...base, wavesSpawned: 2, enemiesSpawned: 0, enemiesAlive: 0 }), null);
  });
});
