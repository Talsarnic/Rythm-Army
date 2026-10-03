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

    // Advance past input beats: a complete row is answered on beat 4 (t = 7.0)
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

  it("keeps going when a tap is far off the beat, and the next good tap still counts", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    // 250ms from the nearest beat: outside the good window, so it is a miss...
    const stray = engine.tap(1, t0 + 0.25);
    assert.equal(stray.grade, "miss");
    assert.equal(stray.ignored, false);
    // ...but it breaks nothing.
    assert.equal(engine.started, true);
    assert.equal(engine.failCount, 0);

    // Playing the rest of MARCH on time (TAK TAK TAK BOOM) still works.
    const slot1 = engine.tap(1, t0 + 0.5);
    assert.equal(slot1.slot, 1);
    assert.equal(slot1.grade, "perfect");
    engine.tap(1, t0 + 1.0);
    engine.tap(0, t0 + 1.5);

    const evs = engine.advance(t0 + 2.0);
    const cmd = evs.find((e) => e.type === "command");
    assert.ok(cmd, "Expected the sequence to finish as a command");
    assert.equal(engine.combo, 1);
  });

  it("accepts taps up to the wide good window instead of calling them misses", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    const late = engine.tap(1, t0 + 0.5 + 0.15); // 150ms late
    assert.equal(late.grade, "good");
    const early = engine.tap(1, t0 + 1.0 - 0.17); // 170ms early
    assert.equal(early.grade, "good");
    const tight = engine.tap(0, t0 + 1.5 + 0.05); // 50ms late
    assert.equal(tight.grade, "perfect");
  });

  it("ignores drums during the response phase without resetting", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    engine.tap(1, t0 + 0.5);
    engine.tap(1, t0 + 1.0);
    engine.tap(0, t0 + 1.5);

    const evs = engine.advance(t0 + 2.0);
    assert.ok(evs.some((e) => e.type === "command"));
    assert.equal(engine.combo, 1);

    // Beat 5 is the army's turn: this tap does nothing and costs nothing.
    const during = engine.tap(1, t0 + 2.5);
    assert.equal(during.ignored, true);
    assert.equal(engine.started, true);
    assert.equal(engine.combo, 1);
    assert.equal(engine.failCount, 0);

    // The next measure's input starts at beat 8 and builds the combo.
    const t1 = t0 + 4.0;
    engine.tap(1, t1);
    engine.tap(1, t1 + 0.5);
    engine.tap(1, t1 + 1.0);
    engine.tap(0, t1 + 1.5);
    const next = engine.advance(t1 + 2.0);
    assert.ok(next.some((e) => e.type === "command"));
    assert.equal(engine.combo, 2);
  });

  it("answers a complete sequence on the beat, not after the grace period", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    engine.tap(1, t0 + 0.5);
    engine.tap(1, t0 + 1.0);
    engine.tap(0, t0 + 1.5);

    // Just before beat 4: nothing yet. On beat 4: the command fires straight away.
    assert.equal(engine.advance(t0 + 1.99).some((e) => e.type === "command"), false);
    assert.equal(engine.advance(t0 + 2.0).some((e) => e.type === "command"), true);
  });

  it("waits out the grace period for a late final tap, then completes it", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    engine.tap(1, t0 + 0.5);
    engine.tap(1, t0 + 1.0);

    // Beat 4 arrives with the last slot still empty: no verdict yet.
    assert.equal(engine.advance(t0 + 2.05).some((e) => e.type === "fail" || e.type === "command"), false);

    // The last tap lands 150ms late, still inside the good window.
    const last = engine.tap(0, t0 + 1.5 + 0.15);
    assert.equal(last.grade, "good");
    const evs = engine.advance(t0 + 2.16);
    assert.ok(evs.some((e) => e.type === "command"), "Expected the late tap to complete the command");
  });

  it("still fails when the last tap never comes", () => {
    const engine = new RhythmEngine({ bpm: 120 });
    const t0 = 5.0;

    engine.tap(1, t0);
    engine.tap(1, t0 + 0.5);
    engine.tap(1, t0 + 1.0);

    const evs = engine.advance(t0 + 2.4);
    const fail = evs.find((e) => e.type === "fail");
    assert.ok(fail, "Expected an incomplete fail");
    assert.equal(engine.started, false);
  });

  it("caps the good window at fast tempos so neighbouring beats never overlap", () => {
    const fast = new RhythmEngine({ bpm: 200 }); // beat = 300ms
    assert.ok(fast.goodMs <= 300 * 0.45 + 1e-9);
    assert.ok(fast.perfectMs <= fast.goodMs);

    const normal = new RhythmEngine({ bpm: 120 });
    assert.equal(normal.goodMs, 190);
    assert.equal(normal.perfectMs, 85);
  });
});
