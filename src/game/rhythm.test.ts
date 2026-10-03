import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { RhythmEngine } from "./rhythm.ts";

describe("RhythmEngine", () => {
  it("does not start rhythm until the first button is hit", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    assert.equal(engine.started, false);
    assert.equal(engine.startTime, null);
    assert.equal(engine.beatPosition(10), -1);

    // advance should produce no events when not started
    const events = engine.advance(10);
    assert.deepEqual(events, []);

    // First tap starts the rhythm
    const firstTap = engine.tap(1, 10.0);
    assert.equal(engine.started, true);
    assert.equal(engine.startTime, 10.0);
    assert.equal(firstTap.grade, "perfect");
    assert.equal(firstTap.slot, 0);
    assert.equal(firstTap.measure, 0);
  });

  it("advances beats and completes a valid command sequence (MARCH: TAK TAK TAK BOOM)", () => {
    const engine = new RhythmEngine({ bpm: 120 }); // beatLength = 0.5s
    const t0 = 5.0;

    // Drum 1 = TAK, Drum 0 = BOOM
    // Beat 0 (t = 5.0): TAK
    const j0 = engine.tap(1, t0);
    assert.equal(j0.grade, "perfect");
    assert.equal(j0.slot, 0);

    // Advance to t = 5.4
    let evs = engine.advance(5.4);
    assert.ok(evs.some((e) => e.type === "beat" && e.slot === 0));

    // Beat 1 (t = 5.5): TAK
    const j1 = engine.tap(1, 5.5);
    assert.equal(j1.grade, "perfect");
    assert.equal(j1.slot, 1);

    // Beat 2 (t = 6.0): TAK
    const j2 = engine.tap(1, 6.0);
    assert.equal(j2.grade, "perfect");
    assert.equal(j2.slot, 2);

    // Beat 3 (t = 6.5): BOOM
    const j3 = engine.tap(0, 6.5);
    assert.equal(j3.grade, "perfect");
    assert.equal(j3.slot, 3);

    // Advance past input beats (grace period ends around 7.0 + 0.13 = 7.13s)
    evs = engine.advance(7.2);
    const cmdEv = evs.find((e) => e.type === "command");
    assert.ok(cmdEv, "Expected command event");
    if (cmdEv && cmdEv.type === "command") {
      assert.equal(cmdEv.command.id, "march");
    }
    assert.equal(engine.combo, 1);
  });

  it("resets rhythm when an invalid command is entered", () => {
    const engine = new RhythmEngine({ bpm: 120 }); // beatLength = 0.5s
    const t0 = 5.0;

    // Enter invalid pattern: BOOM BOOM BOOM BOOM (0, 0, 0, 0) - not a known command
    engine.tap(0, t0);
    engine.tap(0, t0 + 0.5);
    engine.tap(0, t0 + 1.0);
    engine.tap(0, t0 + 1.5);

    const evs = engine.advance(t0 + 2.2);
    const failEv = evs.find((e) => e.type === "fail");
    assert.ok(failEv, "Expected fail event");
    if (failEv && failEv.type === "fail") {
      assert.equal(failEv.reason, "unknown");
    }
    assert.equal(engine.started, false);
    assert.equal(engine.combo, 0);
  });

  it("resets rhythm when a beat is missed during input", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    // Only tap beats 0 and 1, skipping beats 2 and 3
    engine.tap(1, t0);
    engine.tap(1, t0 + 0.5);

    const evs = engine.advance(t0 + 2.2);
    const failEv = evs.find((e) => e.type === "fail");
    assert.ok(failEv, "Expected fail event");
    if (failEv && failEv.type === "fail") {
      assert.equal(failEv.reason, "incomplete");
    }
    assert.equal(engine.started, false);
    assert.equal(engine.combo, 0);
  });

  it("resets rhythm when a tap is severely off-beat (miss grade)", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    // Tap with deltaMs = 250ms (off beat)
    const j = engine.tap(1, t0 + 0.25);
    assert.equal(j.grade, "miss");
    assert.equal(engine.started, false);
    assert.equal(engine.combo, 0);
  });
});
