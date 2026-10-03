import type { CommandDef } from "../types";

export const COMMANDS: CommandDef[] = [
  { id: "march", name: "MARCH", pattern: [1, 1, 1, 0], hint: "Advance the line" },
  { id: "attack", name: "ATTACK", pattern: [0, 0, 1, 0], hint: "Strike in range" },
  { id: "defend", name: "DEFEND", pattern: [3, 3, 1, 0], hint: "Raise shields & counter" },
  { id: "retreat", name: "RETREAT", pattern: [0, 1, 0, 1], hint: "Fall back" },
  { id: "charge", name: "CHARGE", pattern: [0, 0, 3, 3], hint: "Rush and empower" },
  { id: "jump", name: "JUMP", pattern: [2, 2, 3, 3], hint: "Leap over slams" },
];

export const INPUT_BEATS = 4;
export const MEASURE_BEATS = 8;
export const FEVER_COMBO = 4;

/**
 * Timing windows, measured either side of the beat. This is the one place to tune how
 * forgiving the drums feel. A tap inside `perfectMs` is Perfect, inside `goodMs` is Good.
 * Anything further out is an off-beat tap: it is ignored, it does not reset the sequence.
 */
export const TIMING = {
  perfectMs: 85,
  goodMs: 190,
} as const;

/** The good window never grows past this share of a beat, so neighbouring beats can't overlap. */
export const MAX_GOOD_BEAT_SHARE = 0.45;
