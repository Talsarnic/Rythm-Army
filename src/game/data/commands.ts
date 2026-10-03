import type { CommandDef } from "../types";

export const COMMANDS: CommandDef[] = [
  { id: "march", name: "MARCH", pattern: [1, 1, 1, 0], hint: "Advance the line" },
  { id: "attack", name: "ATTACK", pattern: [0, 0, 1, 0], hint: "Strike in range" },
  { id: "defend", name: "DEFEND", pattern: [3, 3, 1, 0], hint: "Raise shields" },
  { id: "retreat", name: "RETREAT", pattern: [0, 1, 0, 1], hint: "Fall back" },
  { id: "charge", name: "CHARGE", pattern: [0, 0, 3, 3], hint: "Rush and empower" },
  { id: "jump", name: "JUMP", pattern: [2, 2, 3, 3], hint: "Leap over slams" },
];

export const INPUT_BEATS = 4;
export const MEASURE_BEATS = 8;
export const FEVER_COMBO = 4;
