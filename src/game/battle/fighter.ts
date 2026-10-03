import { frontX } from "./rules.ts";
import type { BattleState, Fighter } from "./state.ts";

/** Squash and stretch about the feet: taller on the beat or when airborne, flatter when hit. */
export function squash(f: Fighter, stretch: number, narrow: number) {
  const hit = Math.min(1, f.flash / 0.12);
  f.sprite.setScale(f.sx * (1 - narrow + hit * 0.12), f.sy * (1 + stretch - hit * 0.1));
}

export function drawBar(f: Fighter, x: number, y: number, w: number) {
  const g = f.bar;
  g.clear();
  if (!f.alive) return;
  const t = f.hp / f.maxHp;
  g.fillStyle(0x110c18, 0.7);
  g.fillRect(x - w / 2, y, w, 5);
  g.fillStyle(t > 0.4 ? 0x59cd90 : 0xe4572e, 1);
  g.fillRect(x - w / 2, y, Math.max(2, w * t), 5);
}

/** Where the army's front rank currently is. */
export function frontOf(s: BattleState): number {
  return frontX(
    s.units.filter((u) => u.alive).map((u) => u.sprite.x),
    s.armyX,
  );
}

/** Iron Howl, while he is alive. */
export function liveBoss(s: BattleState): Fighter | undefined {
  return s.enemies.find((e) => e.alive && e.kind === "howl");
}

/** Position within the current beat, 0 to 1. */
export function beatFraction(beatPos: number): number {
  return beatPos - Math.floor(beatPos);
}
