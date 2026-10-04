export const DRUMS = [
  { id: 0, name: "BOOM", color: "#e4572e", keys: ["a", "j"], codes: ["KeyA", "KeyJ"] },
  { id: 1, name: "TAK", color: "#f2b134", keys: ["s", "k"], codes: ["KeyS", "KeyK"] },
  { id: 2, name: "RAT", color: "#3fa7d6", keys: ["d", "l"], codes: ["KeyD", "KeyL"] },
  { id: 3, name: "TING", color: "#59cd90", keys: ["f", ";"], codes: ["KeyF", "Semicolon"] },
] as const;

export type DrumId = 0 | 1 | 2 | 3;
export type Grade = "perfect" | "good" | "miss";
export type CommandId = "march" | "attack" | "defend" | "retreat" | "charge" | "jump";
export type UnitClass =
  | "banner" // Bannerkin (Standard Bearer)
  | "spear" // Spearkin (Spear Thrower)
  | "aegis" // Aegiskin (Sword & Shield Vanguard)
  | "bow" // Bowkin (Archer)
  | "kiba" // Horsekin (Cavalry Charger)
  | "deka" // Bludgeonkin (Heavy Breaker)
  | "mega" // Warhornkin (Sonic Hornist)
  | "tori" // Wingkin (Aerial Lancer)
  | "maho" // Magekin (Arcane Staff Channeler)
  | "robo"; // Mechakin (Mechanical Gauntlet Brawler - Robopon archetype)

export type EnemyKind =
  // Wildlife / Hunting Game (Patapon Hunting Beasts: Kacheek, Momoti, Poocheek)
  | "kooda" // Swift Plains Runner (flees/runs, drops meats/veggies)
  | "goretusk" // Wild Tuskboar
  | "brute" // Great Armored Boar
  | "stag" // Giant Horned Stag (elusive big game)
  | "sand-crab" // Armored Desert Crab
  // Barriers & Fortifications (Patapon Obstacles & Watchtowers)
  | "barricade" // Wooden Barrier / Palisade
  | "stone-wall" // Fortified Stone Gate
  | "watchtower" // Arrow-shooting wooden watchtower
  | "catapult-tower" // Heavy stone ballista/catapult tower
  // Rival Tribe Squads (Patapon Zigoton Warriors: Yariton, Tateton, Yumiton, Kibaton, Dekaton, Toriton)
  | "tribe-spear" // Enemy Spear Hurler
  | "tribe-shield" // Enemy Shield Vanguard
  | "tribe-bow" // Enemy Archer
  | "tribe-kiba" // Enemy Mounted Charger
  | "tribe-deka" // Enemy Heavy Breaker
  | "tribe-tori" // Enemy Flying Sky Lancer
  // Colossal Bosses (Patapon Bosses: Dodonga, Zaknel, Majidonga, Iron Howl)
  | "howl" // Iron Howl Behemoth
  | "drake-titan" // Fire-Breathing Drake Titan (Dodonga archetype)
  | "colossus-golem"; // Ancient Stone Golem (Majidonga archetype)
export type EquipSlot = "weapon" | "shield" | "helmet";

export interface UnitMember {
  id: string; // Unique unit instance id
  cls: UnitClass;
  level: number;
  weapon?: string; // ItemDef id
  shield?: string; // ItemDef id (for classes that use dual gear e.g. aegis)
  helmet?: string; // ItemDef id
}

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
  roster: UnitMember[];
  inventory: Record<string, number>;
  settings: {
    master: number;
    music: number;
    sfx: number;
    shake: number;
  };
}

export interface LootRewardSummary {
  itemId: string;
  qty: number;
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
  rewards?: LootRewardSummary[];
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
