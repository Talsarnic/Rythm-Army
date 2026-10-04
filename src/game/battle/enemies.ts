import type * as Phaser from "phaser";
import { INPUT_BEATS, MEASURE_BEATS } from "../data/commands";
import { ENEMY_STATS } from "../data/units";
import type { Combat } from "./combat.ts";
import type { Effects } from "./effects.ts";
import { beatFraction, drawBar, frontOf, liveBoss, squash } from "./fighter.ts";
import {
  bossSlamDamage,
  easeEnemyKnockback,
  enemyWalk,
  shouldTelegraphSlam,
  STAGGER_SPEED,
} from "./rules.ts";
import type { BattleState } from "./state.ts";

/** How far ahead of the army a wave appears, in px. */
const SPAWN_AHEAD = 520;

/** Enemy waves: spawning, advancing, swinging, fleeing wildlife, ranged towers, and colossal boss slams. */
export class Enemies {
  private scene: Phaser.Scene;
  private s: BattleState;
  private fx: Effects;
  private combat: Combat;

  constructor(scene: Phaser.Scene, state: BattleState, fx: Effects, combat: Combat) {
    this.scene = scene;
    this.s = state;
    this.fx = fx;
    this.combat = combat;
  }

  /** Spawn any wave the army has marched close enough to. */
  spawnDue() {
    const { s } = this;
    s.mission.waves.forEach((w, i) => {
      if (s.spawnedWaves.has(i)) return;
      if (s.armyX > w.atX - SPAWN_AHEAD) {
        s.spawnedWaves.add(i);
        this.spawnWave(i);
      }
    });
  }

  update(dt: number, beatPos: number) {
    const { s } = this;
    const frac = beatFraction(beatPos);
    const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
    const front = frontOf(s);
    for (const e of s.enemies) {
      if (!e.alive || !e.kind) continue;
      const stats = ENEMY_STATS[e.kind];
      const dist = e.sprite.x - front;
      e.kb = easeEnemyKnockback(e.kb, dt);
      const staggered = e.kb > STAGGER_SPEED;

      if (!staggered) {
        if (stats.isStationary) {
          // Stationary obstacles and towers don't walk
        } else if (stats.isFleeing) {
          // Wildlife flees forward to escape when army gets close
          if (dist < stats.range) {
            e.sprite.x += stats.speed * dt;
          }
          // If wildlife runs off the far edge of the map, it escapes cleanly
          if (e.sprite.x >= s.mission.worldLength - 60) {
            e.alive = false;
            e.hp = 0;
            e.sprite.setVisible(false);
            e.bar.clear();
          }
        } else {
          e.sprite.x += enemyWalk(dist, stats.range, stats.speed, s.engine.fever, dt);
        }
      }
      e.sprite.x += e.kb * dt;
      e.lunge = Math.max(0, e.lunge - dt * 3);
      e.flash = Math.max(0, e.flash - dt);
      e.sprite.x -= e.lunge * 40 * dt;

      // Flying enemies hover higher
      const heightOffset = stats.flying ? -38 : 0;
      e.sprite.y = s.groundY + e.formY + heightOffset - idleBeat * 4;
      squash(e, idleBeat * 0.05, idleBeat * 0.03);

      if (e.flash > 0) e.sprite.setTintFill(0xffffff);
      else if (stats.isBoss && s.telegraph) e.sprite.setTint(0xff6644);
      else e.sprite.clearTint();

      const bw = stats.isBoss ? (e.kind === "colossus-golem" ? 110 : 86) : stats.isStationary ? 56 : 40;
      const barY = e.sprite.y - (stats.isBoss ? 115 : stats.isStationary ? 88 : 74);
      drawBar(e, e.sprite.x, barY, bw);
    }
  }

  /** On the army's first answering beat, every enemy in reach attacks. Ranged units fire projectiles. */
  swing() {
    const { s, fx } = this;
    const front = frontOf(s);
    for (const e of s.enemies) {
      if (!e.alive || !e.kind) continue;
      const stats = ENEMY_STATS[e.kind];
      if (stats.isBoss || stats.damage <= 0) continue;
      const d = e.sprite.x - front;

      if (d > 8 && d < stats.range + 16) {
        if (stats.isRanged) {
          // Ranged projectile attack toward army front
          e.lunge = 0.5;
          const target = this.combat.nearestArmyUnit();
          if (target) {
            this.combat.fireEnemyRanged(
              e.sprite.x - 20,
              e.sprite.y - 30,
              target,
              stats.damage,
              e.kind === "tribe-spear" || e.kind === "tribe-tori",
              e.kind === "catapult-tower"
            );
          }
        } else {
          // Melee strike
          e.lunge = 1.0;
          this.combat.enemyStrike(e, stats.damage);
          fx.impact(e.sprite.x - 30, e.sprite.y - 30);
        }
      }
    }
  }

  /** Wind up the boss's slam / ultimate attack, giving the player a measure to answer with JUMP. */
  maybeTelegraph(beat: number) {
    const { s, fx } = this;
    const boss = liveBoss(s);
    if (!boss || !boss.kind) return;
    const stats = ENEMY_STATS[boss.kind];
    if (!stats.isBoss) return;

    const measure = Math.floor(beat / MEASURE_BEATS);
    if (!shouldTelegraphSlam(measure, boss.sprite.x, frontOf(s))) return;

    const telegraphLabel = boss.kind === "drake-titan" ? "INFERNO — JUMP" : boss.kind === "colossus-golem" ? "QUAKE — JUMP" : "SLAM — JUMP";
    s.telegraph = { until: beat + INPUT_BEATS, kind: telegraphLabel };
    boss.sprite.setTint(0xff6644);
    fx.floatText(boss.sprite.x, boss.sprite.y - 110, telegraphLabel.split(" ")[0] ?? "SLAM", "#e4572e");
  }

  /** The boss attack lands, unless the army jumped. */
  maybeSlam() {
    const { s, fx } = this;
    const boss = liveBoss(s);
    if (!boss || !boss.kind || !s.telegraph) return;
    boss.sprite.clearTint();
    const stats = ENEMY_STATS[boss.kind];
    fx.impact(boss.sprite.x - 40, s.groundY - 20);
    fx.ring(boss.sprite.x - 40, s.groundY - 10, boss.kind === "drake-titan" ? 0xff4422 : 0xff6644);
    fx.puff(boss.sprite.x - 40, s.groundY, 12);
    s.addTrauma(0.6);
    fx.flash(80, 40, 10, 8);
    if (s.jumping) {
      fx.floatText(s.armyX + 40, s.groundY - 150, "DODGED", "#59cd90");
    } else {
      this.combat.enemyStrike(boss, bossSlamDamage(stats.damage, s.defending), boss.kind === "colossus-golem" ? 2.8 : 2.4);
    }
    s.telegraph = null;
  }

  private spawnWave(index: number) {
    const { scene, s } = this;
    const wave = s.mission.waves[index];
    if (!wave) return;
    let n = 0;
    for (const pack of wave.enemies) {
      for (let i = 0; i < pack.count; i++) {
        const stats = ENEMY_STATS[pack.kind];
        const x = wave.atX + n * (stats.isStationary ? 90 : 54);
        const y = s.groundY + (stats.isStationary ? 0 : (n % 2) * 10);
        const sprite = scene.add.sprite(x, y, stats.sprite, 0);
        sprite.setOrigin(0.5, 0.92);
        sprite.setDepth(stats.flying ? 14 : 8);
        const size = 86 * stats.scale;
        sprite.setDisplaySize(size, size);
        sprite.play(`${stats.sprite}-anim`);
        const bar = scene.add.graphics().setDepth(40);
        s.enemies.push({
          sprite,
          hp: stats.hp,
          maxHp: stats.hp,
          kind: pack.kind,
          alive: true,
          formX: 0,
          formY: stats.isStationary ? 0 : (n % 2) * 10,
          lunge: 0,
          flash: 0,
          bar,
          kb: 0,
          sx: sprite.scaleX,
          sy: sprite.scaleY,
        });
        n += 1;
      }
    }
  }
}
