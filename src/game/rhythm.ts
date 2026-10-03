import {
  COMMANDS,
  FEVER_COMBO,
  INPUT_BEATS,
  MAX_GOOD_BEAT_SHARE,
  MEASURE_BEATS,
  TIMING,
} from "./data/commands.ts";
import type { CommandDef, DrumId, Grade, Judgement, RhythmEvent } from "./types.ts";

export class RhythmEngine {
  bpm: number;
  startTime: number | null;
  inputOffsetMs: number;
  perfectMs: number;
  goodMs: number;
  commands: CommandDef[];
  beatLength: number;
  slots = new Map<number, Array<Judgement | null>>();
  nextBeat = 0;
  nextMeasure = 0;
  combo = 0;
  bestCombo = 0;
  commandCount = 0;
  failCount = 0;
  started = false;

  constructor(opts: {
    bpm?: number;
    startTime?: number | null;
    inputOffsetMs?: number;
    perfectMs?: number;
    goodMs?: number;
    commands?: CommandDef[];
  } = {}) {
    this.bpm = opts.bpm ?? 120;
    this.startTime = opts.startTime ?? null;
    this.started = opts.startTime != null;
    this.inputOffsetMs = opts.inputOffsetMs ?? 0;
    this.commands = opts.commands ?? COMMANDS;
    this.beatLength = 60 / this.bpm;
    // At fast tempos the window is capped so it never reaches into the neighbouring beat.
    const cap = this.beatLength * 1000 * MAX_GOOD_BEAT_SHARE;
    this.goodMs = Math.min(opts.goodMs ?? TIMING.goodMs, cap);
    this.perfectMs = Math.min(opts.perfectMs ?? TIMING.perfectMs, this.goodMs);
  }

  get fever() {
    return this.combo >= FEVER_COMBO;
  }

  start(time: number) {
    const adjusted = time - this.inputOffsetMs / 1000;
    this.startTime = adjusted;
    this.started = true;
    this.slots.clear();
    this.nextBeat = 0;
    this.nextMeasure = 0;
  }

  reset() {
    this.started = false;
    this.startTime = null;
    this.slots.clear();
    this.combo = 0;
    this.nextBeat = 0;
    this.nextMeasure = 0;
  }

  beatTime(n: number): number {
    if (this.startTime === null) return Infinity;
    return this.startTime + n * this.beatLength;
  }

  beatPosition(time: number): number {
    if (this.startTime === null) return -1;
    return (time - this.startTime) / this.beatLength;
  }

  judgeTap(drum: DrumId, time: number): { drum: DrumId; beat: number; deltaMs: number; grade: Grade } {
    if (!this.started || this.startTime === null) {
      return { drum, beat: 0, deltaMs: 0, grade: "perfect" };
    }
    const adjusted = time - this.inputOffsetMs / 1000;
    const beat = Math.round((adjusted - this.startTime) / this.beatLength);
    const deltaMs = (adjusted - this.beatTime(beat)) * 1000;
    const abs = Math.abs(deltaMs);
    const grade: Grade = abs <= this.perfectMs ? "perfect" : abs <= this.goodMs ? "good" : "miss";
    return { drum, beat, deltaMs, grade };
  }

  tap(drum: DrumId, time: number): Judgement {
    if (!this.started || this.startTime === null) {
      this.start(time);
      const row = new Array(INPUT_BEATS).fill(null);
      const j: Judgement = { drum, beat: 0, deltaMs: 0, grade: "perfect", measure: 0, slot: 0, ignored: false };
      row[0] = j;
      this.slots.set(0, row);
      return j;
    }

    const j = this.judgeTap(drum, time);
    if (j.beat < 0) return { ...j, measure: -1, slot: -1, ignored: true };
    const measure = Math.floor(j.beat / MEASURE_BEATS);
    const slot = j.beat % MEASURE_BEATS;

    if (slot >= INPUT_BEATS) {
      // The army is answering. Drums here are ignored rather than punished, as in Patapon.
      return { ...j, measure, slot, ignored: true };
    }

    if (j.grade === "miss") {
      // Too far from the beat to count. The tap is reported as a miss but fills nothing and
      // breaks nothing, so a stray tap can be followed by a correct one on the same beat.
      return { ...j, measure, slot, ignored: false };
    }

    let row = this.slots.get(measure);
    if (!row) {
      row = new Array(INPUT_BEATS).fill(null);
      this.slots.set(measure, row);
    }
    const existing = row[slot];
    if (!existing || Math.abs(j.deltaMs) < Math.abs(existing.deltaMs)) {
      row[slot] = { ...j, measure, slot, ignored: false };
    }
    return { ...j, measure, slot, ignored: false };
  }

  advance(time: number): RhythmEvent[] {
    if (!this.started || this.startTime === null) return [];
    const events: RhythmEvent[] = [];
    while (this.started && this.beatTime(this.nextBeat) <= time) {
      const beat = this.nextBeat++;
      const slot = beat % MEASURE_BEATS;
      events.push({
        type: "beat",
        beat,
        measure: Math.floor(beat / MEASURE_BEATS),
        slot,
        phase: slot < INPUT_BEATS ? "input" : "response",
      });
    }
    const grace = this.goodMs / 1000 + Math.max(0, this.inputOffsetMs) / 1000;
    while (this.started) {
      const m = this.nextMeasure;
      const decideAt = this.beatTime(m * MEASURE_BEATS + INPUT_BEATS);
      if (time < decideAt) break;
      // A full row is answered on the beat. A short row waits out the late-tap grace first,
      // so a wide timing window doesn't also delay every command.
      const row = this.slots.get(m);
      const full = row !== undefined && row.every((s) => s !== null);
      if (!full && time < decideAt + grace) break;
      this.nextMeasure++;
      const ev = this.evaluate(m);
      if (ev) events.push(ev);
    }
    return events;
  }

  evaluate(measure: number): RhythmEvent | null {
    const row = this.slots.get(measure);
    this.slots.delete(measure);
    const beat = measure * MEASURE_BEATS + INPUT_BEATS;
    if (!row || row.some((s) => s === null)) {
      this.combo = 0;
      this.failCount += 1;
      this.reset();
      return { type: "fail", reason: "incomplete", measure, beat };
    }
    const drums = row.map((s) => s!.drum);
    const command = this.commands.find((c) => c.pattern.every((d, i) => d === drums[i]));
    if (!command) {
      this.combo = 0;
      this.failCount += 1;
      this.reset();
      return { type: "fail", reason: "unknown", measure, beat };
    }
    const perfects = row.filter((s) => s!.grade === "perfect").length;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.commandCount += 1;
    return { type: "command", command, measure, beat, perfects, fever: this.fever };
  }
}

export function computeOffset(deltasMs: number[]): number | null {
  const usable = deltasMs.filter((d) => Math.abs(d) <= 250).sort((a, b) => a - b);
  if (usable.length < 4) return null;
  const mid = Math.floor(usable.length / 2);
  const median = usable.length % 2 ? usable[mid]! : (usable[mid - 1]! + usable[mid]!) / 2;
  return Math.round(median);
}
