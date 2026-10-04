import type * as Phaser from "phaser";
import { CLASSES, computeUnitStats, createStarterRoster } from "../data/units";
import { loadSave } from "../save.ts";
import type { UnitClass, UnitMember } from "../types";
import { beatFraction, drawBar, squash } from "./fighter.ts";
import { ACTION, ENEMY_COLLISION_RADIUS, easeUnitKnockback } from "./rules.ts";
import type { BattleState } from "./state.ts";
import { UnitVisual } from "./unit-visual.ts";
import { getSpearkinAtlasFrame, SPEARKIN_TEXTURE } from "./spearkin-loadout";

/** Where each class stands relative to the banner, front rank on the right. */
export const FORMATION: Record<UnitClass, number[]> = {
  banner: [-180],
  maho: [-140, -120, -100],
  mega: [-95, -75, -55],
  bow: [-40, -25, -10, 5, 20, 35],
  spear: [50, 68, 86, 104, 122, 140],
  tori: [120, 140, 160],
  kiba: [145, 165, 185],
  deka: [155, 175, 195],
  robo: [165, 185, 205],
  aegis: [170, 188, 206, 224, 242, 260],
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
    const roster: UnitMember[] = save.roster && save.roster.length > 0 ? save.roster : createStarterRoster();

    const used: Record<string, number> = { banner: 0, aegis: 0, spear: 0, bow: 0 };
    roster.forEach((member, i) => {
      const cls = member.cls;
      const classDef = CLASSES[cls] ?? CLASSES.banner;
      const stats = computeUnitStats(member);
      const idx = used[cls] ?? 0;
      used[cls] = idx + 1;
      const formX = FORMATION[cls]?.[idx] ?? idx * 36;
      const formY = (i % 2) * 8;
      const textureKey = cls === "spear" ? SPEARKIN_TEXTURE : classDef.sprite;
      const initialFrame = cls === "spear" ? getSpearkinAtlasFrame(member) : 0;
      const sprite = scene.add.sprite(s.armyX + formX, s.groundY + formY, textureKey, initialFrame);
      sprite.setOrigin(0.5, 0.92);
      sprite.setDepth(10 + i * 0.01);
      // Unit visual dimensions faithfully scaled to Patapon archetypes:
      // Dekakin: giant heavyweight ~116px
      // Kibakin: mounted cavalry with horse ~104px
      // Bannerkin: standard with large flag ~92px
      // Wingkin: sky flyer ~86px
      // Standard kin (Aegiskin, Spearkin, Bowkin, Magekin, Warhornkin, Mechakin): ~80px
      const display = cls === "banner" ? 92 : cls === "deka" ? 116 : cls === "kiba" ? 104 : cls === "tori" ? 86 : 80;
      sprite.setDisplaySize(display, display);
      sprite.play(`${classDef.sprite}-anim`);
      const visual = new UnitVisual(scene, sprite, member);
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
        visual,
      });
    });
  }

  update(dt: number, beatPos: number) {
    const { s } = this;
    const frac = beatFraction(beatPos);
    const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
    const act = s.action ? ACTION[s.action.id] : null;
    const isAttacking = s.action?.id === "attack";
    const isCharging = s.action?.id === "charge";
    const hop = act?.jump ? Math.abs(Math.sin(Math.min(1, (beatPos - s.action!.beat) / 4) * Math.PI * 2)) * 64 : 0;
    const thrust = act?.lunge ? Math.max(0, Math.sin(frac * Math.PI)) * 18 : 0;

    // Find nearest living enemy ahead of the army for attack positioning
    const livingEnemies = s.enemies.filter((e) => e.alive);
    livingEnemies.sort((a, b) => a.sprite.x - b.sprite.x);
    const nearestEnemy = livingEnemies.length > 0 ? livingEnemies[0] : null;

    for (const u of s.units) {
      if (!u.alive) continue;
      const lungeDecay = 3 * (u.attackSpeed ?? 1);
      u.lunge = Math.max(0, u.lunge - dt * lungeDecay);
      u.flash = Math.max(0, u.flash - dt);
      u.kb = easeUnitKnockback(u.kb, dt);

      u.attackOffset = u.attackOffset ?? 0;
      u.jumpOffset = u.jumpOffset ?? 0;

      // Class-specific movement speeds and behavior in Patapon
      const classSpeedMul = u.cls === "kiba" ? 1.4 : u.cls === "deka" ? 0.85 : u.cls === "robo" ? 1.1 : 1.0;

      // Dynamic attack rush: when attacking or charging, non-banner units surge forward toward target
      if (u.cls !== "banner" && (isAttacking || isCharging) && nearestEnemy) {
        const uCurrentX = s.armyX + u.formX + u.attackOffset;
        const enemyDist = nearestEnemy.sprite.x - uCurrentX;
        const desiredDist = u.range ? Math.max(40, u.range * 0.72) : 50;
        const obstacleRadius = nearestEnemy.kind ? ENEMY_COLLISION_RADIUS[nearestEnemy.kind] ?? 30 : 30;

        if (enemyDist > desiredDist) {
          // Surge forward towards enemy, capped at a max tether ahead of formation
          const maxTether = u.cls === "kiba" ? 360 : u.cls === "aegis" || u.cls === "robo" || u.cls === "deka" ? 320 : 220;
          const runSpeed = (isCharging ? 420 : 280) * classSpeedMul * (s.engine.fever ? 1.3 : 1.0);
          u.attackOffset = Math.min(maxTether, u.attackOffset + runSpeed * dt);
        } else {
          // In range: ease attack offset
          u.attackOffset = Math.max(0, u.attackOffset - dt * 45);
        }

        // Clamp unit's position so it stops physically in front of obstacles/enemies (cannot pass through)
        const maxUnitX = nearestEnemy.sprite.x - 20;
        const currentBaseX = s.armyX + u.formX;
        const maxOffset = Math.max(0, maxUnitX - currentBaseX);
        if (u.attackOffset > maxOffset) {
          u.attackOffset = maxOffset;
        }

        // Jump windup animations for Spearkin / Wingkin (leaping javelins)
        if (u.cls === "spear" || u.cls === "tori") {
          const jumpPhase = Math.sin(frac * Math.PI);
          u.jumpOffset = Math.max(0, jumpPhase * (s.engine.fever ? 48 : 34));
        }
      } else {
        // Fall back / return smoothly to base formation position relative to Bannerkin
        const returnSpeed = 290 * classSpeedMul;
        u.attackOffset = Math.max(0, u.attackOffset - dt * returnSpeed);
        u.jumpOffset = Math.max(0, (u.jumpOffset ?? 0) - dt * 180);
      }

      // Torikin / Wingkin hover flight offset
      const flightOffset = u.cls === "tori" ? 38 : 0;

      const x = s.armyX + u.formX + u.attackOffset + thrust + u.lunge * 16 + u.kb;
      const y = s.groundY + u.formY - idleBeat * 6 - hop - (u.jumpOffset ?? 0) - flightOffset;
      u.sprite.x = x;
      u.sprite.y = y;
      squash(u, idleBeat * 0.08, idleBeat * 0.045);
      u.visual?.sync();
      if (u.flash > 0) u.sprite.setTintFill(0xffffff);
      else u.sprite.clearTint();
      drawBar(u, x, y - (u.cls === "deka" ? 92 : 72), u.cls === "deka" ? 48 : 36);
    }
  }
}
