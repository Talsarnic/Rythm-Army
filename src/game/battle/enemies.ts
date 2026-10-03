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

/** Enemy waves: spawning, advancing, swinging, and the boss's telegraphed slam. */
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
      if (!staggered) e.sprite.x += enemyWalk(dist, stats.range, stats.speed, s.engine.fever, dt);
      e.sprite.x += e.kb * dt;
      e.lunge = Math.max(0, e.lunge - dt * 3);
      e.flash = Math.max(0, e.flash - dt);
      e.sprite.x -= e.lunge * 40 * dt;
      e.sprite.y = s.groundY + e.formY - idleBeat * 4;
      squash(e, idleBeat * 0.05, idleBeat * 0.03);
      if (e.flash > 0) e.sprite.setTintFill(0xffffff);
      else if (e.kind === "howl" && s.telegraph) e.sprite.setTint(0xff6644);
      else e.sprite.clearTint();
      const bw = e.kind === "howl" ? 86 : 40;
      drawBar(e, e.sprite.x, e.sprite.y - (e.kind === "howl" ? 110 : 74), bw);
    }
  }

  /** On the army's first answering beat, every enemy in reach swings. The boss slams instead. */
  swing() {
    const { s } = this;
    const front = frontOf(s);
    for (const e of s.enemies) {
      if (!e.alive || !e.kind) continue;
      const stats = ENEMY_STATS[e.kind];
      if (e.kind === "howl") continue;
      const d = e.sprite.x - front;
      if (d > 8 && d < stats.range + 12) this.combat.enemyStrike(e, stats.damage);
    }
  }

  /** Wind up the boss's slam, giving the player a measure to answer with JUMP. */
  maybeTelegraph(beat: number) {
    const { s, fx } = this;
    const boss = liveBoss(s);
    if (!boss) return;
    const measure = Math.floor(beat / MEASURE_BEATS);
    if (!shouldTelegraphSlam(measure, boss.sprite.x, frontOf(s))) return;
    s.telegraph = { until: beat + INPUT_BEATS, kind: "SLAM — JUMP" };
    boss.sprite.setTint(0xff6644);
    fx.floatText(boss.sprite.x, boss.sprite.y - 110, "SLAM", "#e4572e");
  }

  /** The slam lands, unless the army jumped. */
  maybeSlam() {
    const { s, fx } = this;
    const boss = liveBoss(s);
    if (!boss || !s.telegraph) return;
    boss.sprite.clearTint();
    const stats = ENEMY_STATS.howl;
    fx.impact(boss.sprite.x - 40, s.groundY - 20);
    fx.ring(boss.sprite.x - 40, s.groundY - 10, 0xff6644);
    fx.puff(boss.sprite.x - 40, s.groundY, 10);
    s.addTrauma(0.55);
    fx.flash(80, 40, 10, 8);
    if (s.jumping) {
      fx.floatText(s.armyX + 40, s.groundY - 150, "DODGED", "#59cd90");
    } else {
      this.combat.enemyStrike(boss, bossSlamDamage(stats.damage, s.defending), 2.4);
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
        const x = wave.atX + n * 54;
        const y = s.groundY + (n % 2) * 10;
        const sprite = scene.add.sprite(x, y, stats.sprite, 0);
        sprite.setOrigin(0.5, 0.92);
        sprite.setDepth(8);
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
          formY: (n % 2) * 10,
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
