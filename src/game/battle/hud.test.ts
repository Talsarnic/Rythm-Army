import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildHud, type HudInput } from "./hud.ts";

const base: HudInput = {
  combo: 0,
  fever: false,
  beatPos: -1,
  commandName: null,
  lastGrade: null,
  armyHp: 300,
  armyMax: 380,
  banner: { hp: 48, maxHp: 48 },
  boss: null,
  tutorial: "",
  telegraph: null,
};

describe("buildHud", () => {
  it("waits for the first drum before the clock starts", () => {
    const h = buildHud(base);
    assert.equal(h.phase, "wait");
    assert.equal(h.slot, -1);
    assert.equal(h.ready, true);
  });

  it("stays in the waiting state for any negative beat position", () => {
    const h = buildHud({ ...base, beatPos: -0.5 });
    assert.equal(h.slot, -1);
    assert.equal(h.phase, "wait");
  });

  it("is the player's turn on beats 0 to 3 of each measure", () => {
    for (const [beatPos, slot] of [
      [0, 0],
      [1.4, 1],
      [3.99, 3],
      [8, 0],
      [11.2, 3],
    ] as const) {
      const h = buildHud({ ...base, beatPos });
      assert.equal(h.slot, slot);
      assert.equal(h.phase, "input");
      assert.equal(h.ready, false);
    }
  });

  it("is the army's turn on beats 4 to 7", () => {
    for (const [beatPos, slot] of [
      [4, 4],
      [7.9, 7],
      [12, 4],
    ] as const) {
      const h = buildHud({ ...base, beatPos });
      assert.equal(h.slot, slot);
      assert.equal(h.phase, "response");
    }
  });

  it("shows the running command, falling back to the last timing grade", () => {
    assert.equal(buildHud({ ...base, beatPos: 1, commandName: "MARCH", lastGrade: "GOOD" }).command, "MARCH");
    assert.equal(buildHud({ ...base, beatPos: 1, commandName: null, lastGrade: "GOOD" }).command, "GOOD");
    assert.equal(buildHud({ ...base, beatPos: 1, commandName: null, lastGrade: "GOOD" }).msg, null);
  });

  it("turns the command gold in fever", () => {
    assert.equal(buildHud({ ...base, fever: true }).commandColor, "#ffe08a");
    assert.equal(buildHud({ ...base, fever: false }).commandColor, "#f4ead8");
  });

  it("reports the banner, defaulting sensibly when there isn't one", () => {
    const h = buildHud(base);
    assert.equal(h.bannerHp, 48);
    assert.equal(h.bannerMax, 48);
    const none = buildHud({ ...base, banner: null });
    assert.equal(none.bannerHp, 0);
    assert.equal(none.bannerMax, 1);
  });

  it("reports the boss only when one is alive", () => {
    assert.equal(buildHud(base).boss, null);
    const h = buildHud({ ...base, boss: { name: "Iron Howl", hp: 300, maxHp: 420 } });
    assert.deepEqual(h.boss, { name: "Iron Howl", hp: 300, max: 420 });
  });

  it("turns empty tutorial text into null", () => {
    assert.equal(buildHud(base).tutorial, null);
    assert.equal(buildHud({ ...base, tutorial: "Try MARCH" }).tutorial, "Try MARCH");
  });

  it("passes the slam warning through", () => {
    assert.equal(buildHud({ ...base, telegraph: "SLAM — JUMP" }).telegraph, "SLAM — JUMP");
  });
});
