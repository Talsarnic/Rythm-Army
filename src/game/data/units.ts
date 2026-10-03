import type { EnemyKind, UnitClass } from "../types";

export interface ClassStats {
  id: UnitClass;
  name: string;
  sprite: string;
  hp: number;
  damage: number;
  range: number;
  role: "melee" | "ranged" | "tank" | "flag";
}

export const CLASSES: Record<UnitClass, ClassStats> = {
  banner: { id: "banner", name: "Bannerkin", sprite: "bannerkin-idle", hp: 48, damage: 0, range: 0, role: "flag" },
  aegis: { id: "aegis", name: "Aegiskin", sprite: "aegiskin-idle", hp: 78, damage: 7, range: 70, role: "tank" },
  pike: { id: "pike", name: "Spearkin", sprite: "spearkin-idle", hp: 44, damage: 14, range: 260, role: "ranged" },
  bow: { id: "bow", name: "Bowkin", sprite: "bowkin-idle", hp: 32, damage: 9, range: 420, role: "ranged" },
};

export const ENEMY_STATS: Record<EnemyKind, { name: string; sprite: string; hp: number; damage: number; range: number; speed: number; scale: number }> = {
  goretusk: { name: "Goretusk", sprite: "goretusk-idle", hp: 42, damage: 8, range: 70, speed: 46, scale: 0.92 },
  brute: { name: "Tuskbrute", sprite: "goretusk-idle", hp: 90, damage: 14, range: 82, speed: 32, scale: 1.28 },
  howl: { name: "Iron Howl", sprite: "howl-idle", hp: 420, damage: 22, range: 110, speed: 22, scale: 1.7 },
};

export const STARTER_ARMY: UnitClass[] = [
  "banner",
  "bow",
  "bow",
  "pike",
  "pike",
  "pike",
  "aegis",
  "aegis",
];
