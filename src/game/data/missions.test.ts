import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNextPlayableMissionId } from "./missions.ts";

describe("getNextPlayableMissionId", () => {
  it("returns the first mission (training) when no missions are completed", () => {
    assert.equal(getNextPlayableMissionId([]), "training");
  });

  it("returns the next uncleared mission when earlier missions are completed", () => {
    assert.equal(getNextPlayableMissionId(["training"]), "coast-hunt");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt"]), "shadowmask-clash");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash"]), "drake-caldera");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash", "drake-caldera"]), "swamp-hunt");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash", "drake-caldera", "swamp-hunt"]), "jungle-gate");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash", "drake-caldera", "swamp-hunt", "jungle-gate"]), "bastion-siege");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash", "drake-caldera", "swamp-hunt", "jungle-gate", "bastion-siege"]), "iron-ridge");
    assert.equal(getNextPlayableMissionId(["training", "coast-hunt", "shadowmask-clash", "drake-caldera", "swamp-hunt", "jungle-gate", "bastion-siege", "iron-ridge"]), "golem-altar");
  });

  it("returns the furthest completed mission when all missions are cleared", () => {
    const all = ["training", "coast-hunt", "shadowmask-clash", "drake-caldera", "swamp-hunt", "jungle-gate", "bastion-siege", "iron-ridge", "golem-altar"];
    assert.equal(getNextPlayableMissionId(all), "golem-altar");
  });

  it("returns the furthest completed mission even if completed list is disordered", () => {
    const all = ["golem-altar", "shadowmask-clash", "training", "iron-ridge", "swamp-hunt", "coast-hunt", "jungle-gate", "bastion-siege", "drake-caldera"];
    assert.equal(getNextPlayableMissionId(all), "golem-altar");
  });
});
