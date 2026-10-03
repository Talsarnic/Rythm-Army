import { COMMANDS, FEVER_COMBO, INPUT_BEATS, MEASURE_BEATS } from "./data/commands";
import type { CommandDef, DrumId, Grade, Judgement, RhythmEvent } from "./types";

export class RhythmEngine {
  bpm: number;
  startTime: number;
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

  constructor(opts: {
    bpm?: number;
    startTime?: number;
    inputOffsetMs?: number;
    perfectMs?: number;
    goodMs?: number;
    commands?: CommandDef[];
  } = {}) {
    this.bpm = opts.bpm ?? 120;
    this.startTime = opts.startTime ?? 0;
    this.inputOffsetMs = opts.inputOffsetMs ?? 0;
    this.perfectMs = opts.perfectMs ?? 60;
    this.goodMs = opts.goodMs ?? 130;
    this.commands = opts.commands ?? COMMANDS;
    this.beatLength = 60 / this.bpm;
  }

  get fever() {
    return this.combo >= FEVER_COMBO;
  }

  beatTime(n: number) {
    return this.startTime + n * this.beatLength;
  }

  beatPosition(time: number) {
    return (time - this.startTime) / this.beatLength;
  }

  judgeTap(drum: DrumId, time: number) {
    const adjusted = time - this.inputOffsetMs / 1000;
    const beat = Math.round((adjusted - this.startTime) / this.beatLength);
    const deltaMs = (adjusted - this.beatTime(beat)) * 1000;
    const abs = Math.abs(deltaMs);
    const grade: Grade = abs <= this.perfectMs ? "perfect" : abs <= this.goodMs ? "good" : "miss";
    return { drum, beat, deltaMs, grade };
  }

  tap(drum: DrumId, time: number): Judgement {
    const j = this.judgeTap(drum, time);
    if (j.beat < 0) return { ...j, measure: -1, slot: -1, ignored: true };
    const measure = Math.floor(j.beat / MEASURE_BEATS);
    const slot = j.beat % MEASURE_BEATS;
    if (slot >= INPUT_BEATS) return { ...j, measure, slot, ignored: true };
    if (j.grade === "miss") {
      return { ...j, measure, slot, ignored: false };
    }
    let row = this.slots.get(measure);
    if (!row) {
      row = new Array(INPUT_BEATS).fill(null);
      this.slots.set(measure, row);
    }
    const existing = row[slot];
    if (!existing || Math.abs(j.deltaMs) < Math.abs(existing.deltaMs)) row[slot] = { ...j, measure, slot, ignored: false };
    return { ...j, measure, slot, ignored: false };
  }

  advance(time: number): RhythmEvent[] {
    const events: RhythmEvent[] = [];
    while (this.beatTime(this.nextBeat) <= time) {
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
    while (this.beatTime(this.nextMeasure * MEASURE_BEATS + INPUT_BEATS) + grace <= time) {
      const m = this.nextMeasure++;
      const ev = this.evaluate(m);
      if (ev) events.push(ev);
    }
    return events;
  }

  evaluate(measure: number): RhythmEvent | null {
    const row = this.slots.get(measure);
    this.slots.delete(measure);
    const beat = measure * MEASURE_BEATS + INPUT_BEATS;
    if (!row) return null;
    if (row.some((s) => s === null)) {
      this.combo = 0;
      this.failCount += 1;
      return { type: "fail", reason: "incomplete", measure, beat };
    }
    const drums = row.map((s) => s!.drum);
    const command = this.commands.find((c) => c.pattern.every((d, i) => d === drums[i]));
    if (!command) {
      this.combo = 0;
      this.failCount += 1;
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
