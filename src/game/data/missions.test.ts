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
    assert.equal(getNextPlayableMissionId(["training", "dust-road", "thorn-gate", "howls-gate"]), "bone-canyon");
    assert.equal(getNextPlayableMissionId(["training", "dust-road", "thorn-gate", "howls-gate", "bone-canyon"]), "iron-citadel");
    assert.equal(getNextPlayableMissionId(["training", "dust-road", "thorn-gate", "howls-gate", "bone-canyon", "iron-citadel"]), "storm-peak");
  });

  it("returns the furthest completed mission when all missions are cleared", () => {
    const all = ["training", "dust-road", "thorn-gate", "howls-gate", "bone-canyon", "iron-citadel", "storm-peak"];
    assert.equal(getNextPlayableMissionId(all), "storm-peak");
  });

  it("returns the furthest completed mission even if completed list is disordered", () => {
    const all = ["storm-peak", "howls-gate", "training", "thorn-gate", "dust-road", "iron-citadel", "bone-canyon"];
    assert.equal(getNextPlayableMissionId(all), "storm-peak");
  });
});
