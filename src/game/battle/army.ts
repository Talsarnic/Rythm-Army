import type * as Phaser from "phaser";
import { CLASSES, computeUnitStats, STARTER_ARMY } from "../data/units";
import { loadSave } from "../save.ts";
import type { UnitClass, UnitMember } from "../types";
import { beatFraction, drawBar, squash } from "./fighter.ts";
import { ACTION, easeUnitKnockback } from "./rules.ts";
import type { BattleState } from "./state.ts";

/** Where each class stands relative to the banner, front rank on the right. */
const FORMATION: Record<UnitClass, number[]> = {
  banner: [-200],
  bow: [-112, -72, -32],
  spear: [8, 48, 88],
  aegis: [128, 168, 208],
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
    const save = loadSave();
    const roster: UnitMember[] = save.roster && save.roster.length > 0 ? save.roster : STARTER_ARMY.map((cls, idx) => ({
      id: `starter-${cls}-${idx}`,
      cls,
      level: 1,
    }));

    const used: Record<string, number> = { banner: 0, aegis: 0, spear: 0, bow: 0 };
    roster.forEach((member, i) => {
      const cls = member.cls;
      const classDef = CLASSES[cls] ?? CLASSES.banner;
      const stats = computeUnitStats(member);
      const idx = used[cls] ?? 0;
      used[cls] = idx + 1;
      const formX = FORMATION[cls]?.[idx] ?? idx * 36;
      const formY = (i % 2) * 8;
      const sprite = scene.add.sprite(s.armyX + formX, s.groundY + formY, classDef.sprite, 0);
      sprite.setOrigin(0.5, 0.92);
      sprite.setDepth(10 + i * 0.01);
      const display = cls === "banner" ? 92 : 80;
      sprite.setDisplaySize(display, display);
      sprite.play(`${classDef.sprite}-anim`);
      const bar = scene.add.graphics().setDepth(40);
      s.units.push({
        sprite,
        hp: stats.hp,
        maxHp: stats.hp,
        cls,
        member,
        damage: stats.damage,
        range: stats.range,
        defense: stats.defense,
        attackSpeed: stats.attackSpeed,
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
      const lungeDecay = 3 * (u.attackSpeed ?? 1);
      u.lunge = Math.max(0, u.lunge - dt * lungeDecay);
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
