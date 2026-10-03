import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNextPlayableMissionId } from "./missions.ts";

describe("getNextPlayableMissionId", () => {
  it("returns the first mission (training) when no missions are completed", () => {
    assert.equal(getNextPlayableMissionId([]), "training");
  });

  it("returns the next uncleared mission when earlier missions are completed", () => {
    assert.equal(getNextPlayableMissionId(["training"]), "dust-road");
    assert.equal(getNextPlayableMissionId(["training", "dust-road"]), "thorn-gate");
    assert.equal(getNextPlayableMissionId(["training", "dust-road", "thorn-gate"]), "howls-gate");
  });

  it("returns the furthest completed mission when all missions are cleared", () => {
    const all = ["training", "dust-road", "thorn-gate", "howls-gate"];
    assert.equal(getNextPlayableMissionId(all), "howls-gate");
  });

  it("returns the furthest completed mission even if completed list is disordered", () => {
    const all = ["howls-gate", "training", "thorn-gate", "dust-road"];
    assert.equal(getNextPlayableMissionId(all), "howls-gate");
  });
});
