export const DRUMS = [
  { id: 0, name: "BOOM", color: "#e4572e", keys: ["a", "j"], codes: ["KeyA", "KeyJ"] },
  { id: 1, name: "TAK", color: "#f2b134", keys: ["s", "k"], codes: ["KeyS", "KeyK"] },
  { id: 2, name: "RAT", color: "#3fa7d6", keys: ["d", "l"], codes: ["KeyD", "KeyL"] },
  { id: 3, name: "TING", color: "#59cd90", keys: ["f", ";"], codes: ["KeyF", "Semicolon"] },
] as const;

export type DrumId = 0 | 1 | 2 | 3;
export type Grade = "perfect" | "good" | "miss";
export type CommandId = "march" | "attack" | "defend" | "retreat" | "charge" | "jump";
export type UnitClass = "pike" | "bow" | "aegis" | "banner";
export type EnemyKind = "goretusk" | "brute" | "howl";

export type ScreenId =
  | "title"
  | "hub"
  | "howto"
  | "battle"
  | "result"
  | "calibrate"
  | "settings";

export interface CommandDef {
  id: CommandId;
  name: string;
  pattern: [DrumId, DrumId, DrumId, DrumId];
  hint: string;
}

export interface MissionDef {
  id: string;
  name: string;
  blurb: string;
  bpm: number;
  worldLength: number;
  goalX: number;
  tutorial?: boolean;
  waves: WaveDef[];
  unlockAfter?: string;
}

export interface WaveDef {
  atX: number;
  enemies: { kind: EnemyKind; count: number }[];
}

export interface Judgement {
  drum: DrumId;
  beat: number;
  deltaMs: number;
  grade: Grade;
  measure: number;
  slot: number;
  ignored: boolean;
}

export interface BeatEvent {
  type: "beat";
  beat: number;
  measure: number;
  slot: number;
  phase: "input" | "response";
}

export interface CommandEvent {
  type: "command";
  command: CommandDef;
  measure: number;
  beat: number;
  perfects: number;
  fever: boolean;
}

export interface FailEvent {
  type: "fail";
  reason: "incomplete" | "unknown";
  measure: number;
  beat: number;
}

export type RhythmEvent = BeatEvent | CommandEvent | FailEvent;

export interface SaveData {
  version: number;
  completed: string[];
  bestCombo: number;
  offsetMs: number;
  settings: {
    master: number;
    music: number;
    sfx: number;
    shake: number;
  };
}

export interface BattleResult {
  win: boolean;
  missionId: string;
  missionName: string;
  commands: number;
  fails: number;
  bestCombo: number;
  feverReached: boolean;
  cause: string;
}

export interface HudState {
  combo: number;
  fever: boolean;
  command: string | null;
  commandColor: string;
  slot: number;
  phase: "input" | "response" | "wait";
  beatPos: number;
  armyHp: number;
  armyMax: number;
  bannerHp: number;
  bannerMax: number;
  msg: string | null;
  msgColor: string;
  ready: boolean;
  tutorial: string | null;
  boss: { name: string; hp: number; max: number } | null;
  telegraph: string | null;
}
