import type * as Phaser from "phaser";
import { audio } from "../audio";
import { CLASSES, ENEMY_STATS } from "../data/units";
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
    let hitAny = false;

    for (const u of s.units) {
      if (!u.alive || !u.cls || u.cls === "banner") continue;
      const classDef = CLASSES[u.cls];
      const damage = u.damage ?? classDef.damage;
      const range = u.range ?? classDef.range;
      const role = classDef.role;

      if (damage <= 0) continue;
      // Search for nearest enemy from this unit's EXACT live sprite position in the world
      const target = this.nearestEnemy(u.sprite.x, range + (charged ? 80 : 0));
      if (!target) continue;

      hitAny = true;
      u.lunge = defend ? 0.6 : 1;
      let dmg = scaledDamage(damage, mod.damage);

      // Structure damage bonus for Mechakin (Robopon) and Bludgeonkin (Dekapon) vs obstacles/forts
      const isStructure = target.kind ? (ENEMY_STATS[target.kind]?.isStationary ?? false) : false;
      if (isStructure) {
        if (u.cls === "robo") dmg = Math.round(dmg * 2.5);
        else if (u.cls === "deka") dmg = Math.round(dmg * 1.8);
      }

      const isSpear = u.cls === "spear" || u.cls === "tori";
      const isSonic = u.cls === "mega";
      const isMagic = u.cls === "maho";
      const isBow = u.cls === "bow";
      const isCavalry = u.cls === "kiba";
      const isDekapon = u.cls === "deka";
      const isRobo = u.cls === "robo";

      if (role === "ranged") {
        // In authentic Patapon style:
        // Bowkin fires a 3-arrow arched volley during Fever or Charge
        // Spearkin / Wingkin leap to throw piercing javelins
        // Warhornkin fires resonant piercing sound waves
        const volleyCount = (isBow && (s.engine.fever || charged)) ? 3 : (isSonic && s.engine.fever) ? 2 : 1;
        const arrowDmg = volleyCount > 1 ? Math.max(1, Math.round(dmg / (volleyCount === 3 ? 1.7 : 1.3))) : dmg;

        for (let v = 0; v < volleyCount; v++) {
          const delay = v * 95;
          const launchX = u.sprite.x;
          const launchY = u.sprite.y - (u.cls === "tori" ? 18 : 38);
          if (delay === 0) {
            this.fireRanged(launchX, launchY, target, arrowDmg, isSpear, 0.75 * mod.power, isSonic, false, 0, u.cls === "tori");
          } else {
            this.scene.time.delayedCall(delay, () => {
              if (u.alive && target.alive) {
                this.fireRanged(u.sprite.x, u.sprite.y - 38, target, arrowDmg, isSpear, 0.75 * mod.power, isSonic, false, v * 14, u.cls === "tori");
              }
            });
          }
        }
      } else if (role === "magic") {
        // Magekin (Mahopon): Elemental sky strike descending directly from the heavens onto target
        this.castMagicSpell(u.sprite.x, u.sprite.y, target, dmg, mod.power);
      } else {
        // Melee combat: Swords (Aegiskin), Clubs (Dekapon), Gauntlets (Robopon), Cavalry Lances (Horsekin)
        if (isDekapon) {
          // Dekapon: Giant overhead ground smash with heavy shockwave & stun
          const shovePower = 3.2 * mod.power;
          this.hit(target, dmg, shovePower);
          fx.ring(target.sprite.x - 10, s.groundY - 10, 0xf59e0b);
          fx.puff(target.sprite.x - 10, s.groundY - 10, 6);
          fx.impact(target.sprite.x - 16, target.sprite.y - 36);
          s.addTrauma(0.18);
        } else if (isCavalry) {
          // Kibapon: Cavalry lance charge with extreme knockback shove
          const shovePower = 2.6 * mod.power;
          this.hit(target, dmg, shovePower);
          fx.impact(target.sprite.x - 14, target.sprite.y - 34);
          fx.puff(u.sprite.x, s.groundY + 4, 3);
        } else if (isRobo) {
          // Robopon: Rapid mechanical dual punch combo
          const shovePower = 2.2 * mod.power;
          this.hit(target, dmg, shovePower);
          fx.impact(target.sprite.x - 18, target.sprite.y - 32);
          fx.sparks("hit", 8, target.sprite.x - 14, target.sprite.y - 32);
        } else {
          // Aegiskin: Sword slash & frontline shield push
          const shovePower = 1.3 * mod.power;
          this.hit(target, dmg, shovePower);
          fx.impact(target.sprite.x - 18, target.sprite.y - 34);
        }
      }
    }
    if (hitAny) {
      audio.hit();
    }
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
    const boss = f.kind ? ENEMY_STATS[f.kind]?.isBoss ?? false : false;
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

  private fireRanged(
    startX: number,
    startY: number,
    target: Fighter,
    dmg: number,
    isSpear = false,
    power = 1,
    isSonic = false,
    isMagic = false,
    arcVariance = 0,
    isToripon = false
  ) {
    const { scene, fx, s } = this;
    const startPos = { x: startX + 10, y: startY };
    const projectile = scene.add
      .sprite(startPos.x, startPos.y, "arrow", 0)
      .setDepth(35)
      .setDisplaySize(
        isSpear ? (isToripon ? 60 : 64) : isSonic ? 52 : isMagic ? 48 : 44,
        isSpear ? (isToripon ? 60 : 64) : isSonic ? 52 : isMagic ? 48 : 44
      );

    if (isSpear) {
      projectile.setTint(0xffd59e);
    } else if (isSonic) {
      projectile.setTint(0x38bdf8); // Cyan sonic resonance
    } else if (isMagic) {
      projectile.setTint(0xf43f5e); // Fiery / arcane crimson
    }
    projectile.play("arrow-fly");

    // Ballistic trajectory aimed at enemy position with slight leading / spread
    const spread = (Math.random() - 0.5) * 16;
    const destX = target.sprite.x - 16 + spread;
    const destY = target.sprite.y - 40;
    const dist = Math.max(60, destX - startPos.x);

    // Dynamic arc height based on distance so it arcs visibly over troops
    const arcHeight = isSonic
      ? 15
      : isToripon
      ? -20 // Toripon dive-throws javelins downward from above
      : (isSpear ? Math.min(180, Math.max(90, dist * 0.45)) : Math.min(140, Math.max(70, dist * 0.38))) + arcVariance;
    const duration = Math.min(500, Math.max(260, dist * 0.9));

    const flight = { t: 0 };
    let prevX = startPos.x;
    let prevY = startPos.y;

    scene.tweens.add({
      targets: flight,
      t: 1,
      duration,
      ease: isSonic ? "Sine.easeOut" : "Linear",
      onUpdate: () => {
        const t = flight.t;
        // Parabolic arc: 4 * arcHeight * t * (1 - t)
        const currX = startPos.x + (destX - startPos.x) * t;
        const baseY = startPos.y + (destY - startPos.y) * t;
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
        // Check for any living enemy within hit radius of impact
        const hitRadius = isSonic ? 70 : isMagic ? 60 : 48;
        const hitTarget = s.enemies.find((e) => e.alive && Math.abs(e.sprite.x - destX) <= hitRadius);
        if (hitTarget) {
          this.hit(hitTarget, dmg, power);
          fx.impact(hitTarget.sprite.x - 10, hitTarget.sprite.y - 36);
        } else {
          // Missed because enemy moved/fled or was destroyed: impact dust on the ground
          fx.puff(destX, s.groundY - 10, 3);
        }
      },
    });
  }

  /** Magekin (Mahopon) mystical sky strike that calls down elemental fire/thunder from above */
  private castMagicSpell(
    casterX: number,
    casterY: number,
    target: Fighter,
    dmg: number,
    power = 1
  ) {
    const { scene, fx, s } = this;
    const destX = target.sprite.x - 10;
    const destY = target.sprite.y - 36;

    // Glowing staff channel spark
    fx.sparks("hit", 4, casterX + 16, casterY - 34);

    // Descending lightning / arcane meteor strike
    const spell = scene.add.circle(destX, -40, 18, 0xf43f5e, 0.9).setDepth(48);
    scene.tweens.add({
      targets: spell,
      y: destY,
      duration: 280,
      ease: "Quad.easeIn",
      onComplete: () => {
        spell.destroy();
        fx.ring(destX, destY + 20, 0xec4899);
        fx.sparks("hit", 14, destX, destY);
        fx.impact(destX, destY);
        if (target.alive) {
          this.hit(target, dmg, 1.4 * power);
        }
      },
    });
  }

  fireEnemyRanged(
    startX: number,
    startY: number,
    target: Fighter,
    dmg: number,
    isSpear = false,
    isBoulder = false
  ) {
    const { scene, fx, s } = this;
    const startPos = { x: startX, y: startY };
    const projectile = scene.add
      .sprite(startPos.x, startPos.y, "arrow", 0)
      .setDepth(35)
      .setDisplaySize(isBoulder ? 50 : isSpear ? 56 : 38, isBoulder ? 50 : isSpear ? 56 : 38);

    projectile.setTint(isBoulder ? 0x94a3b8 : isSpear ? 0xef4444 : 0xf87171);
    projectile.play("arrow-fly");

    const spread = (Math.random() - 0.5) * 16;
    const destX = target.sprite.x + 10 + spread;
    const destY = target.sprite.y - 36;
    const dist = Math.max(50, startPos.x - destX);
    const arcHeight = isBoulder ? 75 : 45;
    const duration = Math.min(520, Math.max(280, dist * 0.9));

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
        const currX = startPos.x + (destX - startPos.x) * t;
        const baseY = startPos.y + (destY - startPos.y) * t;
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
        // Check for living army unit within impact radius
        const hitTarget = s.units.find((u) => u.alive && Math.abs(u.sprite.x - destX) <= 45);
        if (hitTarget) {
          this.hit(hitTarget, damageToUnit(dmg, s.defending, hitTarget.defense ?? 0), isBoulder ? 1.8 : 1.0);
          fx.impact(hitTarget.sprite.x + 10, hitTarget.sprite.y - 30);
        } else {
          fx.puff(destX, s.groundY - 10, 3);
        }
      },
    });
  }

  nearestArmyUnit(): Fighter | null {
    const living = this.s.units.filter((u) => u.alive);
    if (!living.length) return null;
    living.sort((a, b) => b.sprite.x - a.sprite.x);
    return living.find((u) => u.cls === "aegis") ?? living[0] ?? null;
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
