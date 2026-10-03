/**
 * Battle rules as plain functions: damage, knockback, targeting, win and lose.
 *
 * Nothing in this file touches Phaser, so all of it is covered by unit tests
 * (rules.test.ts). The scene modules call these and apply the results to sprites.
 */
import type { CommandId, EnemyKind, UnitClass } from "../types";

export interface ActionDef {
  /** Army speed in px/s while this command is active. */
  speed: number;
  /** Units are walking, so each beat kicks up dust. */
  walk: boolean;
  lunge?: boolean;
  defend?: boolean;
  jump?: boolean;
}

export const ACTION: Record<CommandId, ActionDef> = {
  march: { speed: 155, walk: true },
  attack: { speed: 12, lunge: true, walk: false },
  defend: { speed: 0, defend: true, lunge: true, walk: false },
  retreat: { speed: -125, walk: true },
  charge: { speed: 310, walk: true, lunge: true },
  jump: { speed: 20, jump: true, walk: false },
};

/** How much each enemy resists being shoved. Bigger enemies barely move. */
export const KNOCKBACK_WEIGHT: Record<EnemyKind, number> = { goretusk: 1, brute: 0.55, howl: 0.12 };

/** An enemy shoved faster than this (px/s) is staggered and stops advancing. */
export const STAGGER_SPEED = 40;

/** Fever makes the army move faster and enemies a little slower. */
export const FEVER_ARMY_SPEED = 1.32;
export const FEVER_ENEMY_SPEED = 0.9;

/** The army can't be marched past these distances from the ends of the map. */
const ARMY_MIN_X = 80;
const ARMY_END_MARGIN = 200;

export function armyAdvance(armyX: number, commandSpeed: number, fever: boolean, dt: number, worldLength: number): number {
  const speed = commandSpeed * (fever ? FEVER_ARMY_SPEED : 1);
  return Math.min(worldLength - ARMY_END_MARGIN, Math.max(ARMY_MIN_X, armyX + speed * dt));
}

/** Damage and knockback multipliers for one volley of ATTACK, CHARGE or DEFEND. */
export function attackModifiers(o: { charged: boolean; defend: boolean; fever: boolean }): { damage: number; power: number } {
  return {
    damage: (o.fever ? 1.45 : 1) * (o.charged ? 1.7 : 1) * (o.defend ? 0.45 : 1),
    power: (o.charged ? 1.7 : 1) * (o.fever ? 1.25 : 1),
  };
}

/** Base damage scaled by a multiplier. Every hit does at least 1. */
export function scaledDamage(base: number, multiplier: number): number {
  return Math.max(1, Math.round(base * multiplier));
}

/** Enemy knockback is a velocity (px/s): hits stack up to a cap. Heavy enemies barely move. */
export function enemyKnockback(current: number, power: number, kind: EnemyKind): number {
  return Math.min(520, current + 260 * power * KNOCKBACK_WEIGHT[kind]);
}

/** Army knockback is an offset (px, negative is backwards) from formation. Shields and DEFEND resist it. */
export function unitKnockback(current: number, power: number, cls: UnitClass | undefined, defending: boolean): number {
  const resist = (cls === "aegis" ? 0.6 : 1) * (defending ? 0.4 : 1);
  return Math.max(-46, current - 26 * power * resist);
}

/** Damage an enemy blow deals to the army. DEFEND cuts it sharply. */
export function damageToUnit(damage: number, defending: boolean): number {
  return defending ? Math.round(damage * 0.38) : damage;
}

/** The boss's slam damage before it reaches the army. DEFEND softens it. */
export function bossSlamDamage(base: number, defending: boolean): number {
  return defending ? Math.round(base * 0.4) : base;
}

/** Offset easing back to zero for army units. */
export function easeUnitKnockback(kb: number, dt: number): number {
  const v = kb * Math.exp(-dt * 9);
  return Math.abs(v) < 0.3 ? 0 : v;
}

/** Velocity easing back to zero for enemies. */
export function easeEnemyKnockback(kb: number, dt: number): number {
  const v = kb * Math.exp(-dt * 6.5);
  return v < 4 ? 0 : v;
}

/** How far an enemy walks this frame: forward until in range, backing off if the army is past it. */
export function enemyWalk(distToFront: number, range: number, speed: number, fever: boolean, dt: number): number {
  if (distToFront > range) return -speed * (fever ? FEVER_ENEMY_SPEED : 1) * dt;
  if (distToFront < -36) return speed * dt;
  return 0;
}

/** The target ahead of `x` within `range`, closest first. Ignores anything that is dead or too close. */
export function nearestAhead<T>(
  items: readonly T[],
  x: number,
  range: number,
  xOf: (item: T) => number,
  isAlive: (item: T) => boolean,
): T | null {
  let best: T | null = null;
  let bestD = range;
  for (const item of items) {
    if (!isAlive(item)) continue;
    const d = xOf(item) - x;
    if (d > 8 && d < bestD) {
      bestD = d;
      best = item;
    }
  }
  return best;
}

/** Where the front rank is. Falls back to the army's anchor once every unit is dead. */
export function frontX(unitXs: readonly number[], fallback: number): number {
  return unitXs.length ? Math.max(...unitXs) : fallback;
}

/** The boss winds up a slam every third measure, but only once the army is within reach. */
export const SLAM_REACH = 340;
export function shouldTelegraphSlam(measure: number, bossX: number, front: number): boolean {
  return measure % 3 === 2 && bossX - front <= SLAM_REACH;
}

export interface EndInput {
  unitsAlive: number;
  hasBanner: boolean;
  bannerAlive: boolean;
  tutorial: boolean;
  armyX: number;
  goalX: number;
  wavesTotal: number;
  wavesSpawned: number;
  enemiesSpawned: number;
  enemiesAlive: number;
}

export interface EndVerdict {
  win: boolean;
  cause: string;
}

/** Has the battle been won or lost? Null while it is still going. Losing is checked first. */
export function evaluateEnd(s: EndInput): EndVerdict | null {
  const bannerFell = s.hasBanner && !s.bannerAlive;
  if (s.unitsAlive === 0 || bannerFell) {
    return { win: false, cause: bannerFell ? "The banner fell." : "The army was wiped out." };
  }
  if (s.tutorial && s.armyX >= s.goalX - 40) {
    return { win: true, cause: "The shrine is yours." };
  }
  if (!s.tutorial && s.wavesTotal > 0) {
    const allSpawned = s.wavesSpawned >= s.wavesTotal;
    if (allSpawned && s.enemiesSpawned > 0 && s.enemiesAlive === 0) {
      return { win: true, cause: "The road is clear." };
    }
  }
  return null;
}
