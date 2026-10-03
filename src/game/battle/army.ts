import type * as Phaser from "phaser";
import { CLASSES, STARTER_ARMY } from "../data/units";
import type { UnitClass } from "../types";
import { beatFraction, drawBar, squash } from "./fighter.ts";
import { ACTION, easeUnitKnockback } from "./rules.ts";
import type { BattleState } from "./state.ts";

/** Where each class stands relative to the banner, front rank on the right. */
const FORMATION: Record<UnitClass, number[]> = {
  banner: [-200],
  bow: [-92, -52],
  pike: [8, 48, 88],
  aegis: [128, 168],
};

/** The player's marching army: spawning it in formation and animating it each frame. */
export class Army {
  private scene: Phaser.Scene;
  private s: BattleState;

  constructor(scene: Phaser.Scene, state: BattleState) {
    this.scene = scene;
    this.s = state;
  }

  spawn() {
    const { scene, s } = this;
    const used: Record<string, number> = { banner: 0, aegis: 0, pike: 0, bow: 0 };
    STARTER_ARMY.forEach((cls, i) => {
      const stats = CLASSES[cls];
      const idx = used[cls] ?? 0;
      used[cls] = idx + 1;
      const formX = FORMATION[cls][idx] ?? idx * 36;
      const formY = (i % 2) * 8;
      const sprite = scene.add.sprite(s.armyX + formX, s.groundY + formY, stats.sprite, 0);
      sprite.setOrigin(0.5, 0.92);
      sprite.setDepth(10 + i * 0.01);
      const display = cls === "banner" ? 92 : 80;
      sprite.setDisplaySize(display, display);
      sprite.play(`${stats.sprite}-anim`);
      const bar = scene.add.graphics().setDepth(40);
      s.units.push({
        sprite,
        hp: stats.hp,
        maxHp: stats.hp,
        cls,
        alive: true,
        formX,
        formY,
        lunge: 0,
        flash: 0,
        bar,
        kb: 0,
        sx: sprite.scaleX,
        sy: sprite.scaleY,
      });
    });
  }

  update(dt: number, beatPos: number) {
    const { s } = this;
    const frac = beatFraction(beatPos);
    const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
    const act = s.action ? ACTION[s.action.id] : null;
    const hop = act?.jump ? Math.abs(Math.sin(Math.min(1, (beatPos - s.action!.beat) / 4) * Math.PI * 2)) * 64 : 0;
    const thrust = act?.lunge ? Math.max(0, Math.sin(frac * Math.PI)) * 18 : 0;

    for (const u of s.units) {
      if (!u.alive) continue;
      u.lunge = Math.max(0, u.lunge - dt * 3);
      u.flash = Math.max(0, u.flash - dt);
      u.kb = easeUnitKnockback(u.kb, dt);
      const x = s.armyX + u.formX + thrust + u.lunge * 16 + u.kb;
      const y = s.groundY + u.formY - idleBeat * 6 - hop;
      u.sprite.x = x;
      u.sprite.y = y;
      squash(u, idleBeat * 0.08, idleBeat * 0.045);
      if (u.flash > 0) u.sprite.setTintFill(0xffffff);
      else u.sprite.clearTint();
      drawBar(u, x, y - 72, 36);
    }
  }
}
