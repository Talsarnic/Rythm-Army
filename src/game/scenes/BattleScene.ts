import * as Phaser from "phaser";
import { audio } from "../audio";
import { COMMANDS, INPUT_BEATS, MEASURE_BEATS } from "../data/commands";
import { missionById } from "../data/missions";
import { CLASSES, ENEMY_STATS, STARTER_ARMY } from "../data/units";
import { bus } from "../events";
import { RhythmEngine } from "../rhythm";
import { loadSave } from "../save";
import type { BattleResult, CommandId, DrumId, EnemyKind, HudState, MissionDef, UnitClass } from "../types";

interface Fighter {
  sprite: Phaser.GameObjects.Sprite;
  hp: number;
  maxHp: number;
  cls?: UnitClass;
  kind?: EnemyKind;
  alive: boolean;
  formX: number;
  formY: number;
  lunge: number;
  jump: number;
  flash: number;
  bar: Phaser.GameObjects.Graphics;
  atkCd: number;
}

const ACTION: Record<CommandId, { speed: number; walk: boolean; lunge?: boolean; defend?: boolean; jump?: boolean }> = {
  march: { speed: 155, walk: true },
  attack: { speed: 12, lunge: true, walk: false },
  defend: { speed: 0, defend: true, lunge: true, walk: false },
  retreat: { speed: -125, walk: true },
  charge: { speed: 310, walk: true, lunge: true },
  jump: { speed: 20, jump: true, walk: false },
};

const MUSIC = [196, 233, 262, 311, 349];
const MUSIC_FEVER = [262, 311, 349, 392, 466];

export class BattleScene extends Phaser.Scene {
  constructor() {
    super("battle");
  }

  private mission!: MissionDef;
  private engine!: RhythmEngine;
  private ended = false;
  private paused = false;
  private armyX = 280;
  private groundY = 420;
  private viewW = 1280;
  private viewH = 720;
  private nextTick = 0;
  private action: { id: CommandId; beat: number } | null = null;
  private charged = false;
  private defending = false;
  private jumping = false;
  private trauma = 0;
  private hitstop = 0;
  private feverT = 0;
  private shakeMul = 0.7;
  private units: Fighter[] = [];
  private enemies: Fighter[] = [];
  private spawnedWaves = new Set<number>();
  private sky!: Phaser.GameObjects.TileSprite;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private near!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private sun!: Phaser.GameObjects.Arc;
  private shrine?: Phaser.GameObjects.Container;
  private pops: Phaser.GameObjects.Text[] = [];
  private lastHud = 0;
  private lastGrade: string | null = null;
  private telegraph: { until: number; kind: string } | null = null;
  private feverReached = false;
  private offDrum?: () => void;
  private offPause?: () => void;
  private tutorial = "";

  init() {
    this.ended = false;
    this.paused = false;
    this.armyX = 280;
    this.nextTick = 0;
    this.action = null;
    this.charged = false;
    this.defending = false;
    this.jumping = false;
    this.trauma = 0;
    this.hitstop = 0;
    this.feverT = 0;
    this.units = [];
    this.enemies = [];
    this.spawnedWaves = new Set();
    this.pops = [];
    this.lastHud = 0;
    this.lastGrade = null;
    this.telegraph = null;
    this.feverReached = false;
    this.tutorial = "";
  }

  create() {
    const id = String(this.registry.get("missionId") ?? "training");
    const mission = missionById(id);
    if (!mission) {
      this.scene.stop();
      return;
    }
    this.mission = mission;
    const save = loadSave();
    this.shakeMul = save.settings.shake;
    audio.setVolumes(save.settings);

    this.viewW = this.scale.width;
    this.viewH = this.scale.height;
    this.groundY = this.viewH * 0.64;
    this.physics.world.setBounds(0, 0, mission.worldLength, this.viewH);
    this.cameras.main.setBounds(0, 0, mission.worldLength, this.viewH);

    this.buildBackdrop();
    this.spawnArmy();
    this.drawShrine();

    this.engine = new RhythmEngine({
      bpm: mission.bpm,
      inputOffsetMs: save.offsetMs,
    });

    if (mission.tutorial) this.tutorial = "Drum on the four white beats. Miss the army’s four.";

    this.offDrum = bus.on("drum", (payload) => {
      const p = payload as { drum: DrumId; time: number };
      this.onDrum(p.drum, p.time);
    });
    this.offPause = bus.on("pause", (payload) => {
      this.paused = Boolean(payload);
    });

    this.scale.on("resize", (size: Phaser.Structs.Size) => this.relayout(size.width, size.height));
    this.events.once("shutdown", () => this.cleanup());
    this.emitHud();
  }

  private cleanup() {
    this.offDrum?.();
    this.offPause?.();
    this.tweens.killAll();
  }

  private buildBackdrop() {
    const w = this.viewW;
    const h = this.viewH;
    this.sky = this.add.tileSprite(0, 0, w, h, "sky").setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.makeHillTex("hill-far", 1024, 280, 0x5a3470, 0.12, 0.38);
    this.makeHillTex("hill-mid", 1024, 260, 0x3d2458, 0.1, 0.48);
    this.makeHillTex("hill-near", 1024, 220, 0x2a1840, 0.08, 0.58);
    this.makeGroundTex("ground-tex", 512, 220);
    this.far = this.add.tileSprite(0, h * 0.28, w, 280, "hill-far").setOrigin(0, 0).setScrollFactor(0).setDepth(-15);
    this.mid = this.add.tileSprite(0, h * 0.4, w, 260, "hill-mid").setOrigin(0, 0).setScrollFactor(0).setDepth(-12);
    this.near = this.add.tileSprite(0, h * 0.5, w, 220, "hill-near").setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
    this.sun = this.add.circle(w * 0.72, h * 0.22, h * 0.09, 0xffecaa, 0.92).setScrollFactor(0).setDepth(-18);
    this.ground = this.add.tileSprite(0, this.groundY + 8, Math.max(w, this.mission.worldLength), 240, "ground-tex").setOrigin(0, 0).setDepth(-5);
  }

  private makeHillTex(key: string, w: number, h: number, color: number, freq: number, baseT: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.setVisible(false);
    const base = h * baseT;
    const amp = h * 0.22;
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, base);
    for (let x = 0; x <= w; x += 6) {
      const s = x * freq;
      const y = base - (Math.sin(s) * amp + Math.sin(s * 2.17 + 1.1) * amp * 0.38);
      g.lineTo(x, y);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fillPath();
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeGroundTex(key: string, w: number, h: number) {
    if (this.textures.exists(key)) return;
    const g = this.add.graphics();
    g.setVisible(false);
    g.fillStyle(0x1b1426, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x2c2040, 1);
    for (let x = 0; x < w; x += 60) g.fillRect(x, 10, 28, 4);
    g.fillStyle(0x24182e, 1);
    g.fillRect(0, 0, w, 6);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private drawShrine() {
    const x = this.mission.goalX;
    const y = this.groundY;
    const c = this.add.container(x, y).setDepth(2);
    const g = this.add.graphics();
    g.fillStyle(0x4a3020, 1);
    g.fillRect(-7, -118, 14, 118);
    g.fillStyle(0xe4572e, 1);
    g.fillCircle(0, -132, 24);
    g.fillStyle(0xf2b134, 1);
    g.fillCircle(0, -132, 10);
    g.fillStyle(0xf4ead8, 0.85);
    g.fillRect(-2, -154, 4, 16);
    c.add(g);
    this.shrine = c;
  }

  private spawnArmy() {
    const used: Record<string, number> = { banner: 0, aegis: 0, pike: 0, bow: 0 };
    const slots: Record<UnitClass, number[]> = {
      banner: [-200],
      bow: [-92, -52],
      pike: [8, 48, 88],
      aegis: [128, 168],
    };
    STARTER_ARMY.forEach((cls, i) => {
      const stats = CLASSES[cls];
      const idx = used[cls] ?? 0;
      used[cls] = idx + 1;
      const formX = slots[cls][idx] ?? idx * 36;
      const formY = (i % 2) * 8;
      const sprite = this.add.sprite(this.armyX + formX, this.groundY + formY, stats.sprite, 0);
      sprite.setOrigin(0.5, 0.92);
      sprite.setDepth(10 + i * 0.01);
      const display = cls === "banner" ? 92 : 80;
      sprite.setDisplaySize(display, display);
      sprite.play(`${stats.sprite}-anim`);
      const bar = this.add.graphics().setDepth(40);
      this.units.push({
        sprite,
        hp: stats.hp,
        maxHp: stats.hp,
        cls,
        alive: true,
        formX,
        formY,
        lunge: 0,
        jump: 0,
        flash: 0,
        bar,
        atkCd: 0,
      });
    });
  }

  private spawnWave(index: number) {
    const wave = this.mission.waves[index];
    if (!wave) return;
    let n = 0;
    for (const pack of wave.enemies) {
      for (let i = 0; i < pack.count; i++) {
        const stats = ENEMY_STATS[pack.kind];
        const x = wave.atX + n * 54;
        const y = this.groundY + (n % 2) * 10;
        const sprite = this.add.sprite(x, y, stats.sprite, 0);
        sprite.setOrigin(0.5, 0.92);
        sprite.setDepth(8);
        const size = 86 * stats.scale;
        sprite.setDisplaySize(size, size);
        sprite.play(`${stats.sprite}-anim`);
        const bar = this.add.graphics().setDepth(40);
        this.enemies.push({
          sprite,
          hp: stats.hp,
          maxHp: stats.hp,
          kind: pack.kind,
          alive: true,
          formX: 0,
          formY: (n % 2) * 10,
          lunge: 0,
          jump: 0,
          flash: 0,
          bar,
          atkCd: 0.4 + n * 0.15,
        });
        n += 1;
      }
    }
  }

  private onDrum(drum: DrumId, time: number) {
    if (this.ended || this.paused) return;
    const wasStarted = this.engine.started;
    const j = this.engine.tap(drum, time);
    if (!wasStarted && this.engine.started) {
      this.nextTick = 1;
    }
    if (j.ignored) return;
    const label = j.grade === "perfect" ? "PERFECT" : j.grade === "good" ? "GOOD" : "MISS";
    const color = j.grade === "perfect" ? "#59cd90" : j.grade === "good" ? "#f2b134" : "#e4572e";
    this.lastGrade = label;
    this.floatText(this.armyX + 40, this.groundY - 130, `${label}  ${j.deltaMs >= 0 ? "+" : ""}${Math.round(j.deltaMs)}ms`, color);
    if (j.grade === "miss") {
      this.applyFail("miss");
      this.trauma = Math.min(1, this.trauma + 0.18);
    }
  }

  private floatText(x: number, y: number, text: string, color: string) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "18px",
        fontStyle: "800",
        color,
        stroke: "#110c18",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.pops.push(t);
    this.tweens.add({
      targets: t,
      y: y - 42,
      alpha: 0,
      duration: 720,
      ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
  }

  update(_time: number, delta: number) {
    try {
      this.tick(delta);
    } catch (err) {
      (window as unknown as { __battleErr?: unknown }).__battleErr = err;
      console.error(err);
    }
  }

  private tick(delta: number) {
    const dt = Math.min(0.05, delta / 1000);
    if (this.ended) return;
    if (this.paused) return;

    if (this.hitstop > 0) {
      this.hitstop -= dt;
      return;
    }

    const now = audio.now();
    this.scheduleAudio(now);

    for (const ev of this.engine.advance(now)) {
      if (ev.type === "command") this.applyCommand(ev.command.id, ev.beat, ev.fever, ev.perfects);
      else if (ev.type === "fail") this.applyFail(ev.reason);
      else if (ev.type === "beat") this.onBeat(ev.slot, ev.phase, ev.beat);
    }

    const beatPos = this.engine.beatPosition(now);
    if (this.action && beatPos >= this.action.beat + INPUT_BEATS) {
      this.action = null;
      this.defending = false;
      this.jumping = false;
    }

    const act = this.action ? ACTION[this.action.id] : null;
    const speed = (act?.speed ?? 0) * (this.engine.fever ? 1.32 : 1);
    this.armyX = Math.min(this.mission.worldLength - 200, Math.max(80, this.armyX + speed * dt));

    this.spawnWavesIfNeeded();
    this.updateUnits(dt, beatPos, now);
    this.updateEnemies(dt, beatPos);
    this.updateCamera(dt, beatPos);
    this.updateParallax();
    this.checkEnd();

    this.lastHud += dt;
    if (this.lastHud > 0.05) {
      this.lastHud = 0;
      this.emitHud();
    }
  }

  private scheduleAudio(now: number) {
    const e = this.engine;
    if (!e.started || e.startTime === null) return;
    while (e.beatTime(this.nextTick) < now + 0.22) {
      const slot = this.nextTick % MEASURE_BEATS;
      const when = e.beatTime(this.nextTick);
      if (this.nextTick >= 0 && when > e.startTime - 0.01) {
        if (slot < INPUT_BEATS) audio.tick(when, slot === 0);
        else {
          audio.thump(when);
          audio.chant(when, e.fever);
        }
        const scale = e.fever ? MUSIC_FEVER : MUSIC;
        if (slot === 0 || slot === 4) audio.pluck(when, scale[this.nextTick % scale.length]!, e.fever);
        if (e.fever && slot === 2) audio.pluck(when, scale[2]!, true);
      }
      this.nextTick += 1;
    }
  }

  private applyCommand(id: CommandId, beat: number, fever: boolean, perfects: number) {
    this.action = { id, beat };
    this.defending = id === "defend";
    this.jumping = id === "jump";
    if (id === "charge") this.charged = true;
    if (fever) this.feverReached = true;
    if (id === "attack" || id === "charge" || id === "defend") {
      this.resolveAttack(id === "charge" || this.charged, id === "defend");
    }
    if (id === "attack") this.charged = false;
    const label = fever ? `${id.toUpperCase()}  FEVER` : id.toUpperCase();
    this.floatText(this.armyX + 90, this.groundY - 180, label, fever ? "#ffe08a" : "#f4ead8");
    this.trauma = Math.min(1, this.trauma + (fever ? 0.28 : 0.12) + perfects * 0.03);
    if (this.mission.tutorial) {
      if (id === "march") this.tutorial = "Keep marching. The sun-disk shrine is ahead.";
      else this.tutorial = "MARCH is TAK TAK TAK BOOM. Drive them to the shrine.";
    }
  }

  private applyFail(reason: "incomplete" | "unknown" | "miss") {
    this.action = null;
    this.defending = false;
    this.jumping = false;
    this.charged = false;
    this.nextTick = 0;
    this.floatText(
      this.armyX + 80,
      this.groundY - 170,
      reason === "unknown" ? "UNKNOWN BEAT" : reason === "miss" ? "OFF BEAT" : "MISSED BEAT",
      "#ff8a6b",
    );
    this.trauma = Math.min(1, this.trauma + 0.22);
    if (this.mission.tutorial) this.tutorial = "Four drums in a row. TAK TAK TAK BOOM to MARCH.";
  }

  private onBeat(slot: number, phase: "input" | "response", beat: number) {
    const pulse = this.sun;
    this.tweens.add({ targets: pulse, scale: 1.08, yoyo: true, duration: 90 });
    if (phase === "response" && slot === INPUT_BEATS) {
      this.maybeBossTelegraph(beat);
    }
    if (phase === "response" && slot === INPUT_BEATS + 1) {
      this.enemySwing();
      this.maybeBossSlam();
    }
    if (this.mission.tutorial && this.engine.combo === 0 && beat === 8) {
      this.tutorial = "Try MARCH: TAK TAK TAK BOOM on the four white beats.";
    }
  }

  private spawnWavesIfNeeded() {
    this.mission.waves.forEach((w, i) => {
      if (this.spawnedWaves.has(i)) return;
      if (this.armyX > w.atX - 520) {
        this.spawnedWaves.add(i);
        this.spawnWave(i);
      }
    });
  }

  private frontX() {
    const living = this.units.filter((u) => u.alive);
    if (!living.length) return this.armyX;
    return Math.max(...living.map((u) => u.sprite.x));
  }

  private resolveAttack(charged: boolean, defend = false) {
    const defendPenalty = defend ? 0.45 : 1;
    const mul = (this.engine.fever ? 1.45 : 1) * (charged ? 1.7 : 1) * defendPenalty;
    for (const u of this.units) {
      if (!u.alive || !u.cls) continue;
      const stats = CLASSES[u.cls];
      if (stats.damage <= 0) continue;
      const target = this.nearestEnemy(u.sprite.x, stats.range + (charged ? 40 : 0));
      if (!target) continue;
      u.lunge = defend ? 0.6 : 1;
      const dmg = Math.max(1, Math.round(stats.damage * mul));
      if (stats.role === "ranged") {
        const isSpear = u.cls === "pike";
        this.fireRangedProjectile(u.sprite.x, u.sprite.y - 40, target, dmg, isSpear);
      } else {
        this.hitFighter(target, dmg);
        this.spawnImpact(target.sprite.x - 20, target.sprite.y - 36);
      }
    }
    audio.hit();
  }

  private fireRangedProjectile(
    startX: number,
    startY: number,
    target: Fighter,
    dmg: number,
    isSpear = false
  ) {
    const startPos = { x: startX + 10, y: startY };
    const projectile = this.add
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

    this.tweens.add({
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
          this.hitFighter(target, dmg);
          this.spawnImpact(target.sprite.x - 10, target.sprite.y - 36);
        }
      },
    });
  }

  private spawnImpact(x: number, y: number) {
    const s = this.add.sprite(x, y, "impact", 0).setDepth(50).setDisplaySize(72, 72);
    s.play("fx-impact");
    s.once("animationcomplete", () => s.destroy());
  }

  private nearestEnemy(x: number, range: number) {
    let best: Fighter | null = null;
    let bestD = range;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = e.sprite.x - x;
      if (d > 8 && d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private hitFighter(f: Fighter, dmg: number) {
    if (!f.alive) return;
    f.hp = Math.max(0, f.hp - dmg);
    f.flash = 0.12;
    f.sprite.x += f.kind ? 18 : -10;
    this.floatText(f.sprite.x, f.sprite.y - 70, String(dmg), "#ffe08a");
    this.trauma = Math.min(1, this.trauma + 0.2);
    this.hitstop = Math.max(this.hitstop, 0.045);
    if (f.hp <= 0) this.killFighter(f);
  }

  private killFighter(f: Fighter) {
    f.alive = false;
    f.hp = 0;
    this.hitstop = Math.max(this.hitstop, 0.08);
    this.tweens.add({
      targets: f.sprite,
      alpha: 0,
      y: f.sprite.y + 24,
      angle: f.kind ? -40 : 40,
      duration: 420,
      ease: "Cubic.easeIn",
      onComplete: () => {
        f.sprite.setVisible(false);
        f.bar.clear();
      },
    });
    audio.whoosh();
  }

  private enemySwing() {
    const front = this.frontX();
    for (const e of this.enemies) {
      if (!e.alive || !e.kind) continue;
      const stats = ENEMY_STATS[e.kind];
      if (e.kind === "howl") continue;
      const d = e.sprite.x - front;
      if (d > 8 && d < stats.range + 12) this.enemyStrike(e, stats.damage);
    }
  }

  private maybeBossTelegraph(beat: number) {
    const boss = this.enemies.find((e) => e.alive && e.kind === "howl");
    if (!boss) return;
    const measure = Math.floor(beat / MEASURE_BEATS);
    if (measure % 3 !== 2) return;
    const front = this.frontX();
    if (boss.sprite.x - front > 340) return;
    this.telegraph = { until: beat + INPUT_BEATS, kind: "SLAM — JUMP" };
    boss.sprite.setTint(0xff6644);
    this.floatText(boss.sprite.x, boss.sprite.y - 110, "SLAM", "#e4572e");
  }

  private maybeBossSlam() {
    const boss = this.enemies.find((e) => e.alive && e.kind === "howl");
    if (!boss || !this.telegraph) return;
    boss.sprite.clearTint();
    const stats = ENEMY_STATS.howl;
    this.spawnImpact(boss.sprite.x - 40, this.groundY - 20);
    this.trauma = Math.min(1, this.trauma + 0.55);
    this.cameras.main.flash(80, 40, 10, 8);
    if (this.jumping) {
      this.floatText(this.armyX + 40, this.groundY - 150, "DODGED", "#59cd90");
    } else {
      this.enemyStrike(boss, this.defending ? Math.round(stats.damage * 0.4) : stats.damage);
    }
    this.telegraph = null;
  }

  private enemyStrike(e: Fighter, damage: number) {
    e.lunge = 1;
    audio.hit();
    const living = this.units.filter((u) => u.alive);
    if (!living.length) return;
    living.sort((a, b) => b.sprite.x - a.sprite.x);
    const target = living.find((u) => u.cls === "aegis") ?? living[0]!;
    let dmg = damage;
    if (this.defending) dmg = Math.round(dmg * 0.38);
    this.hitFighter(target, dmg);
    this.spawnImpact(target.sprite.x + 16, target.sprite.y - 30);
  }

  private updateUnits(dt: number, beatPos: number, _now: number) {
    const frac = beatPos - Math.floor(beatPos);
    const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
    const act = this.action ? ACTION[this.action.id] : null;
    const hop = act?.jump ? Math.abs(Math.sin(Math.min(1, (beatPos - this.action!.beat) / 4) * Math.PI * 2)) * 64 : 0;
    const thrust = act?.lunge ? Math.max(0, Math.sin(frac * Math.PI)) * 18 : 0;

    for (const u of this.units) {
      if (!u.alive) continue;
      u.lunge = Math.max(0, u.lunge - dt * 3);
      u.flash = Math.max(0, u.flash - dt);
      const x = this.armyX + u.formX + thrust + u.lunge * 16;
      const y = this.groundY + u.formY - idleBeat * 6 - hop;
      u.sprite.x = x;
      u.sprite.y = y;
      if (u.flash > 0) u.sprite.setTintFill(0xffffff);
      else u.sprite.clearTint();
      this.drawBar(u, x, y - 72, 36);
    }
  }

  private updateEnemies(dt: number, beatPos: number) {
    const frac = beatPos - Math.floor(beatPos);
    const idleBeat = beatPos >= 0 ? Math.exp(-frac * 6) : 0;
    const front = this.frontX();
    for (const e of this.enemies) {
      if (!e.alive || !e.kind) continue;
      const stats = ENEMY_STATS[e.kind];
      const dist = e.sprite.x - front;
      if (dist > stats.range) {
        e.sprite.x -= stats.speed * (this.engine.fever ? 0.9 : 1) * dt;
      } else if (dist < -36) {
        e.sprite.x += stats.speed * dt;
      }
      e.lunge = Math.max(0, e.lunge - dt * 3);
      e.flash = Math.max(0, e.flash - dt);
      e.sprite.x -= e.lunge * 40 * dt;
      e.sprite.y = this.groundY + e.formY - idleBeat * 4;
      if (e.flash > 0) e.sprite.setTintFill(0xffffff);
      else e.sprite.clearTint();
      const bw = e.kind === "howl" ? 86 : 40;
      this.drawBar(e, e.sprite.x, e.sprite.y - (e.kind === "howl" ? 110 : 74), bw);
    }
  }

  private drawBar(f: Fighter, x: number, y: number, w: number) {
    const g = f.bar;
    g.clear();
    if (!f.alive) return;
    const t = f.hp / f.maxHp;
    g.fillStyle(0x110c18, 0.7);
    g.fillRect(x - w / 2, y, w, 5);
    g.fillStyle(t > 0.4 ? 0x59cd90 : 0xe4572e, 1);
    g.fillRect(x - w / 2, y, Math.max(2, w * t), 5);
  }

  private updateCamera(dt: number, beatPos: number) {
    const cam = this.cameras.main;
    const look = this.armyX - this.viewW * 0.28 + (this.action && ACTION[this.action.id].speed > 0 ? 40 : 0);
    const target = Math.min(Math.max(0, this.mission.worldLength - this.viewW), Math.max(0, look));
    const k = 1 - Math.exp(-3.2 * dt);
    cam.scrollX += (target - cam.scrollX) * k;
    cam.scrollY = 0;
    this.trauma = Math.max(0, this.trauma - dt * 1.7);
    const shake = this.trauma * this.trauma * this.shakeMul;
    if (shake > 0.002) {
      cam.scrollX += (Math.random() - 0.5) * shake * 22;
      cam.scrollY += (Math.random() - 0.5) * shake * 10;
    }
    const frac = beatPos - Math.floor(beatPos);
    const pulse = beatPos >= 0 ? Math.exp(-frac * 5) : 0;
    this.sun.setScale(1 + pulse * 0.06 + this.feverT * 0.08);
    const targetFever = this.engine.fever ? 1 : 0;
    this.feverT += (targetFever - this.feverT) * Math.min(1, dt * 3);
    if (this.feverT > 0.05) this.sky.setTint(0xffc8b4);
    else this.sky.clearTint();
  }

  private updateParallax() {
    const x = this.cameras.main.scrollX;
    this.far.tilePositionX = x * 0.12;
    this.mid.tilePositionX = x * 0.28;
    this.near.tilePositionX = x * 0.5;
    this.sky.tilePositionX = x * 0.04;
  }

  private relayout(w: number, h: number) {
    this.viewW = w;
    this.viewH = h;
    this.groundY = h * 0.64;
    this.sky.setSize(w, h);
    this.far.setPosition(0, h * 0.28).setSize(w, 280);
    this.mid.setPosition(0, h * 0.4).setSize(w, 260);
    this.near.setPosition(0, h * 0.5).setSize(w, 220);
    this.sun.setPosition(w * 0.72, h * 0.22);
    this.sun.setRadius(h * 0.09);
    this.ground.y = this.groundY + 8;
    this.ground.setSize(Math.max(w, this.mission.worldLength), 240);
    this.cameras.main.setBounds(0, 0, this.mission.worldLength, h);
    if (this.shrine) this.shrine.y = this.groundY;
  }

  private checkEnd() {
    if (this.ended) return;
    const banner = this.units.find((u) => u.cls === "banner");
    const living = this.units.filter((u) => u.alive);
    if (!living.length || (banner && !banner.alive)) {
      this.finish(false, banner && !banner.alive ? "The banner fell." : "The army was wiped out.");
      return;
    }
    if (this.mission.tutorial && this.armyX >= this.mission.goalX - 40) {
      this.finish(true, "The shrine is yours.");
      return;
    }
    if (!this.mission.tutorial && this.mission.waves.length) {
      const allSpawned = this.spawnedWaves.size >= this.mission.waves.length;
      const noneLeft = this.enemies.every((e) => !e.alive);
      if (allSpawned && noneLeft && this.enemies.length > 0) {
        this.finish(true, "The road is clear.");
      }
    }
  }

  private finish(win: boolean, cause: string) {
    this.ended = true;
    const result: BattleResult = {
      win,
      missionId: this.mission.id,
      missionName: this.mission.name,
      commands: this.engine.commandCount,
      fails: this.engine.failCount,
      bestCombo: this.engine.bestCombo,
      feverReached: this.feverReached,
      cause,
    };
    this.time.delayedCall(700, () => bus.emit("battle-end", result));
  }

  private emitHud() {
    const e = this.engine;
    const beatPos = e.beatPosition(audio.now());
    const n = Math.floor(beatPos);
    const slot = beatPos >= 0 ? ((n % MEASURE_BEATS) + MEASURE_BEATS) % MEASURE_BEATS : -1;
    const armyHp = this.units.reduce((s, u) => s + Math.max(0, u.hp), 0);
    const armyMax = this.units.reduce((s, u) => s + u.maxHp, 0);
    const banner = this.units.find((u) => u.cls === "banner");
    const boss = this.enemies.find((en) => en.kind === "howl" && en.alive);
    const cmd = this.action ? COMMANDS.find((c) => c.id === this.action!.id) : null;
    const hud: HudState = {
      combo: e.combo,
      fever: e.fever,
      command: cmd?.name ?? this.lastGrade,
      commandColor: e.fever ? "#ffe08a" : "#f4ead8",
      slot,
      phase: beatPos < 0 ? "wait" : slot < INPUT_BEATS ? "input" : "response",
      beatPos,
      armyHp,
      armyMax,
      bannerHp: banner?.hp ?? 0,
      bannerMax: banner?.maxHp ?? 1,
      msg: cmd?.name ?? null,
      msgColor: "#f4ead8",
      ready: beatPos < 0,
      tutorial: this.tutorial || null,
      boss: boss ? { name: "Iron Howl", hp: boss.hp, max: boss.maxHp } : null,
      telegraph: this.telegraph?.kind ?? null,
    };
    bus.emit("hud", hud);
  }
}
