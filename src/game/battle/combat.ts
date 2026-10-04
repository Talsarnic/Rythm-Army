import type * as Phaser from "phaser";
import { audio } from "../audio";
import { CLASSES } from "../data/units";
import type { Effects } from "./effects.ts";
import {
  attackModifiers,
  damageToUnit,
  enemyKnockback,
  nearestAhead,
  scaledDamage,
  unitKnockback,
} from "./rules.ts";
import type { BattleState, Fighter } from "./state.ts";

/** Landing hits, taking hits and dying. Decides what happens; Effects decides how it looks. */
export class Combat {
  private scene: Phaser.Scene;
  private s: BattleState;
  private fx: Effects;

  constructor(scene: Phaser.Scene, state: BattleState, fx: Effects) {
    this.scene = scene;
    this.s = state;
    this.fx = fx;
  }

  /** The army answers an ATTACK, CHARGE or DEFEND command: everyone in range strikes. */
  resolveAttack(charged: boolean, defend = false) {
    const { s, fx } = this;
    const mod = attackModifiers({ charged, defend, fever: s.engine.fever });
    for (const u of s.units) {
      if (!u.alive || !u.cls) continue;
      const classDef = CLASSES[u.cls];
      const damage = u.damage ?? classDef.damage;
      const range = u.range ?? classDef.range;
      const role = classDef.role;

      if (damage <= 0) continue;
      const target = this.nearestEnemy(u.sprite.x, range + (charged ? 40 : 0));
      if (!target) continue;
      u.lunge = defend ? 0.6 : 1;
      const dmg = scaledDamage(damage, mod.damage);
      if (role === "ranged") {
        const isSpear = u.cls === "spear";
        this.fireRanged(u.sprite.x, u.sprite.y - 40, target, dmg, isSpear, 0.7 * mod.power);
      } else {
        this.hit(target, dmg, 1.2 * mod.power);
        fx.impact(target.sprite.x - 20, target.sprite.y - 36);
      }
    }
    audio.hit();
  }

  /** An enemy blow lands on the army. Shield-bearers take it first. */
  enemyStrike(e: Fighter, damage: number, power = 1) {
    const { s, fx } = this;
    e.lunge = 1;
    audio.hit();
    const living = s.units.filter((u) => u.alive);
    if (!living.length) return;
    living.sort((a, b) => b.sprite.x - a.sprite.x);
    const target = living.find((u) => u.cls === "aegis") ?? living[0]!;
    this.hit(target, damageToUnit(damage, s.defending, target.defense ?? 0), power);
    fx.impact(target.sprite.x + 16, target.sprite.y - 30);
  }

  /** Apply damage, knockback and feedback to one fighter, and kill it if it runs out of health. */
  hit(f: Fighter, dmg: number, power = 1) {
    const { s, fx } = this;
    if (!f.alive) return;
    f.hp = Math.max(0, f.hp - dmg);
    f.flash = 0.12;

    // Enemies are shoved back as a velocity that eases out, and stagger while it lasts.
    // Army units are nudged out of formation and spring home.
    f.kb = f.kind ? enemyKnockback(f.kb, power, f.kind) : unitKnockback(f.kb, power, f.cls, s.defending);

    const burst = Math.round(5 + Math.min(10, dmg * 0.6));
    fx.sparks(f.kind ? "hit" : "hurt", burst, f.sprite.x, f.sprite.y - 38);
    fx.floatText(f.sprite.x, f.sprite.y - 70, String(dmg), "#ffe08a", Math.round(16 + Math.min(14, dmg * 0.5)));
    s.addTrauma(0.2);
    s.freeze(0.045);
    if (f.hp <= 0) this.kill(f);
  }

  private kill(f: Fighter) {
    const { s, fx, scene } = this;
    f.alive = false;
    f.hp = 0;
    if (f.kind) {
      s.killedEnemies.push(f.kind);
    }
    const boss = f.kind === "howl";
    s.freeze(boss ? 0.16 : 0.08);

    const sprite = f.sprite;
    const hx = sprite.x;
    const hy = sprite.y - 36;
    fx.sparks(f.kind ? "hit" : "hurt", boss ? 36 : 16, hx, hy);
    fx.puff(hx, sprite.y, boss ? 9 : 4);
    fx.ring(hx, hy, f.kind ? 0xffe08a : 0xff8a6b);
    if (boss) {
      s.trauma = 1;
      fx.flash(120, 255, 240, 200);
    }

    // Pop up and back, then fall away and fade.
    const dir = f.kind ? 1 : -1;
    scene.tweens.add({
      targets: sprite,
      y: sprite.y - 34,
      x: sprite.x + dir * 26,
      angle: dir * 18,
      duration: 150,
      ease: "Quad.easeOut",
      onComplete: () => {
        scene.tweens.add({
          targets: sprite,
          y: sprite.y + 52,
          x: sprite.x + dir * 20,
          angle: dir * 72,
          alpha: 0,
          duration: 380,
          ease: "Quad.easeIn",
          onComplete: () => {
            sprite.setVisible(false);
            f.bar.clear();
          },
        });
      },
    });
    audio.whoosh();
  }

  private fireRanged(startX: number, startY: number, target: Fighter, dmg: number, isSpear = false, power = 1) {
    const { scene, fx } = this;
    const startPos = { x: startX + 10, y: startY };
    const projectile = scene.add
      .sprite(startPos.x, startPos.y, "arrow", 0)
      .setDepth(35)
      .setDisplaySize(isSpear ? 52 : 42, isSpear ? 52 : 42);

    if (isSpear) {
      projectile.setTint(0xffd59e);
    }
    projectile.play("arrow-fly");

    const targetX = target.sprite.x - 16;
    const targetY = target.sprite.y - 42;
    const dist = Math.max(60, targetX - startPos.x);

    // Dynamic arc height based on distance so it arcs visibly over troops
    const arcHeight = Math.min(140, Math.max(70, dist * 0.38));
    const duration = Math.min(480, Math.max(260, dist * 0.95));

    const flight = { t: 0 };
    let prevX = startPos.x;
    let prevY = startPos.y;

    scene.tweens.add({
      targets: flight,
      t: 1,
      duration,
      ease: "Linear",
      onUpdate: () => {
        const t = flight.t;
        // Parabolic arc: 4 * arcHeight * t * (1 - t)
        const currX = startPos.x + (targetX - startPos.x) * t;
        const baseY = startPos.y + (targetY - startPos.y) * t;
        const currY = baseY - 4 * arcHeight * t * (1 - t);

        const dx = currX - prevX;
        const dy = currY - prevY;
        if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
          projectile.setRotation(Math.atan2(dy, dx));
        }

        projectile.setPosition(currX, currY);
        prevX = currX;
        prevY = currY;
      },
      onComplete: () => {
        projectile.destroy();
        if (target.alive) {
          this.hit(target, dmg, power);
          fx.impact(target.sprite.x - 10, target.sprite.y - 36);
        }
      },
    });
  }

  private nearestEnemy(x: number, range: number): Fighter | null {
    return nearestAhead(
      this.s.enemies,
      x,
      range,
      (e) => e.sprite.x,
      (e) => e.alive,
    );
  }
}
