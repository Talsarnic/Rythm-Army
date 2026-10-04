import * as Phaser from "phaser";
import { audio } from "../audio";
import { Army } from "../battle/army.ts";
import { Backdrop } from "../battle/backdrop.ts";
import { CameraRig } from "../battle/camera.ts";
import { Combat } from "../battle/combat.ts";
import { Effects } from "../battle/effects.ts";
import { Enemies } from "../battle/enemies.ts";
import { liveBoss } from "../battle/fighter.ts";
import { buildHud } from "../battle/hud.ts";
import { scheduleMusic } from "../battle/music.ts";
import { ACTION, armyAdvance, evaluateEnd } from "../battle/rules.ts";
import { BattleState } from "../battle/state.ts";
import { COMMANDS, INPUT_BEATS } from "../data/commands";
import { rollBattleLoot } from "../data/loot";
import { missionById } from "../data/missions";
import { ENEMY_STATS } from "../data/units";
import { bus } from "../events";
import { RhythmEngine } from "../rhythm";
import { loadSave } from "../save";
import type { BattleResult, CommandId, DrumId } from "../types";

/**
 * Runs one battle. The scene is only the coordinator: it turns rhythm events into
 * commands and calls the modules in src/game/battle in the right order each frame.
 *
 *   rules.ts     damage, knockback, targeting, win and lose (pure, tested)
 *   state.ts     the state every module shares
 *   backdrop.ts  scenery, ground, sun, shrine
 *   effects.ts   particles, rings, floating text, fever glow
 *   army.ts      the player's units
 *   enemies.ts   waves and the boss
 *   combat.ts    hits, knockback and deaths
 *   camera.ts    follow, shake and fever tint
 *   music.ts     scheduling drums and melody on the audio clock
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super("battle");
  }

  private s?: BattleState;
  private backdrop!: Backdrop;
  private fx!: Effects;
  private army!: Army;
  private enemies!: Enemies;
  private combat!: Combat;
  private rig!: CameraRig;
  private lastHud = 0;
  private offDrum?: () => void;
  private offPause?: () => void;
  private onResize?: (size: Phaser.Structs.Size) => void;

  create() {
    const id = String(this.registry.get("missionId") ?? "training");
    const mission = missionById(id);
    if (!mission) {
      this.scene.stop();
      return;
    }
    const save = loadSave();
    audio.setVolumes(save.settings);

    const engine = new RhythmEngine({ bpm: mission.bpm, inputOffsetMs: save.offsetMs });
    const s = new BattleState(mission, engine, { w: this.scale.width, h: this.scale.height }, save.settings.shake);
    this.s = s;
    this.lastHud = 0;
    this.physics.world.setBounds(0, 0, mission.worldLength, s.viewH);

    this.backdrop = new Backdrop(this, s);
    this.backdrop.build();
    this.fx = new Effects(this, s);
    this.combat = new Combat(this, s, this.fx);
    this.army = new Army(this, s);
    this.army.spawn();
    this.enemies = new Enemies(this, s, this.fx, this.combat);
    this.rig = new CameraRig(this, s, this.backdrop);
    this.rig.setBounds();

    if (mission.tutorial) s.tutorial = "Drum on the four white beats. Miss the army’s four.";

    this.offDrum = bus.on("drum", (payload) => {
      const p = payload as { drum: DrumId; time: number };
      this.onDrum(p.drum, p.time);
    });
    this.offPause = bus.on("pause", (payload) => {
      s.paused = Boolean(payload);
    });

    this.onResize = (size) => this.relayout(size.width, size.height);
    this.scale.on("resize", this.onResize);
    this.events.once("shutdown", () => this.cleanup());
    this.emitHud();
  }

  update(_time: number, delta: number) {
    if (!this.s) return;
    try {
      this.tick(delta);
    } catch (err) {
      (window as unknown as { __battleErr?: unknown }).__battleErr = err;
      console.error(err);
    }
  }

  private cleanup() {
    this.offDrum?.();
    this.offPause?.();
    if (this.onResize) this.scale.off("resize", this.onResize);
    this.tweens.killAll();
  }

  private tick(delta: number) {
    const s = this.s!;
    const dt = Math.min(0.05, delta / 1000);
    if (s.ended) return;
    if (s.paused) return;

    if (s.hitstop > 0) {
      s.hitstop -= dt;
      return;
    }

    const now = audio.now();
    scheduleMusic(s, now);

    for (const ev of s.engine.advance(now)) {
      if (ev.type === "command") this.applyCommand(ev.command.id, ev.beat, ev.fever, ev.perfects);
      else if (ev.type === "fail") this.applyFail(ev.reason);
      else if (ev.type === "beat") this.onBeat(ev.slot, ev.phase, ev.beat);
    }

    const beatPos = s.engine.beatPosition(now);
    if (s.action && beatPos >= s.action.beat + INPUT_BEATS) s.clearAction();

    const act = s.action ? ACTION[s.action.id] : null;
    s.armyX = armyAdvance(s.armyX, act?.speed ?? 0, s.engine.fever, dt, s.mission.worldLength);

    this.enemies.spawnDue();
    this.army.update(dt, beatPos);
    this.enemies.update(dt, beatPos);
    this.rig.update(dt, beatPos);
    this.fx.updateFever(beatPos);
    this.backdrop.parallax(this.cameras.main.scrollX);
    this.checkEnd();

    this.lastHud += dt;
    if (this.lastHud > 0.05) {
      this.lastHud = 0;
      this.emitHud();
    }
  }

  private onDrum(drum: DrumId, time: number) {
    const s = this.s!;
    if (s.ended || s.paused) return;
    const wasStarted = s.engine.started;
    const j = s.engine.tap(drum, time);
    if (!wasStarted && s.engine.started) {
      s.nextTick = 1;
    }
    if (j.ignored) return;
    const ms = `${j.deltaMs >= 0 ? "+" : ""}${Math.round(j.deltaMs)}ms`;
    if (j.grade === "miss") {
      // Off-beat tap: the engine ignores it, so the sequence carries on. Just tell the player.
      s.lastGrade = "OFF BEAT";
      this.fx.floatText(s.armyX + 40, s.groundY - 130, `OFF BEAT  ${ms}`, "#c9b8a6");
      return;
    }
    const label = j.grade === "perfect" ? "PERFECT" : "GOOD";
    const color = j.grade === "perfect" ? "#59cd90" : "#f2b134";
    s.lastGrade = label;
    this.fx.floatText(s.armyX + 40, s.groundY - 130, `${label}  ${ms}`, color);
  }

  private applyCommand(id: CommandId, beat: number, fever: boolean, perfects: number) {
    const s = this.s!;
    s.action = { id, beat };
    s.defending = id === "defend";
    s.jumping = id === "jump";
    if (id === "charge") s.charged = true;
    if (fever) s.feverReached = true;
    if (id === "attack" || id === "charge" || id === "defend") {
      this.combat.resolveAttack(id === "charge" || s.charged, id === "defend");
    }
    if (id === "attack") s.charged = false;
    const label = fever ? `${id.toUpperCase()}  FEVER` : id.toUpperCase();
    this.fx.floatText(s.armyX + 90, s.groundY - 180, label, fever ? "#ffe08a" : "#f4ead8");
    s.addTrauma((fever ? 0.28 : 0.12) + perfects * 0.03);
    if (perfects >= INPUT_BEATS) this.fx.ring(s.armyX + 20, s.groundY - 40, 0x59cd90);
    if (s.mission.tutorial) {
      if (id === "march") s.tutorial = "Keep marching. The sun-disk shrine is ahead.";
      else s.tutorial = "MARCH is TAK TAK TAK BOOM. Drive them to the shrine.";
    }
  }

  private applyFail(reason: "incomplete" | "unknown") {
    const s = this.s!;
    s.clearAction();
    s.charged = false;
    s.nextTick = 0;
    this.fx.floatText(
      s.armyX + 80,
      s.groundY - 170,
      reason === "unknown" ? "UNKNOWN BEAT" : "MISSED BEAT",
      "#ff8a6b",
    );
    s.addTrauma(0.22);
    if (s.mission.tutorial) s.tutorial = "Four drums in a row. TAK TAK TAK BOOM to MARCH.";
  }

  private onBeat(slot: number, phase: "input" | "response", beat: number) {
    const s = this.s!;
    this.backdrop.pulseSun();
    if (s.action && ACTION[s.action.id].walk) {
      // Footfalls: a little dust kicked up at every unit's heels on each beat of a march.
      const n = s.action.id === "charge" ? 3 : 2;
      for (const u of s.units) {
        if (u.alive) this.fx.puff(u.sprite.x - 20, s.groundY + u.formY + 4, n);
      }
    }
    if (phase === "response" && slot === INPUT_BEATS) {
      this.enemies.maybeTelegraph(beat);
    }
    if (phase === "response" && slot === INPUT_BEATS + 1) {
      this.enemies.swing();
      this.enemies.maybeSlam();
    }
    if (s.mission.tutorial && s.engine.combo === 0 && beat === 8) {
      s.tutorial = "Try MARCH: TAK TAK TAK BOOM on the four white beats.";
    }
  }

  private relayout(w: number, h: number) {
    const s = this.s!;
    s.resize(w, h);
    this.backdrop.relayout();
    this.fx.resize(w, h);
    this.rig.setBounds();
  }

  private checkEnd() {
    const s = this.s!;
    if (s.ended) return;
    const banner = s.units.find((u) => u.cls === "banner");
    const verdict = evaluateEnd({
      unitsAlive: s.units.filter((u) => u.alive).length,
      hasBanner: banner !== undefined,
      bannerAlive: banner?.alive ?? false,
      tutorial: Boolean(s.mission.tutorial),
      armyX: s.armyX,
      goalX: s.mission.goalX,
      wavesTotal: s.mission.waves.length,
      wavesSpawned: s.spawnedWaves.size,
      enemiesSpawned: s.enemies.length,
      enemiesAlive: s.enemies.filter((e) => e.alive).length,
    });
    if (verdict) this.finish(verdict.win, verdict.cause);
  }

  private finish(win: boolean, cause: string) {
    const s = this.s!;
    s.ended = true;
    const result: BattleResult = {
      win,
      missionId: s.mission.id,
      missionName: s.mission.name,
      commands: s.engine.commandCount,
      fails: s.engine.failCount,
      bestCombo: s.engine.bestCombo,
      feverReached: s.feverReached,
      cause,
      rewards: win ? rollBattleLoot(s.mission.id, s.killedEnemies) : undefined,
    };
    this.time.delayedCall(700, () => bus.emit("battle-end", result));
  }

  private emitHud() {
    const s = this.s!;
    const e = s.engine;
    const banner = s.units.find((u) => u.cls === "banner");
    const boss = liveBoss(s);
    const cmd = s.action ? COMMANDS.find((c) => c.id === s.action!.id) : null;
    bus.emit(
      "hud",
      buildHud({
        combo: e.combo,
        fever: e.fever,
        beatPos: e.beatPosition(audio.now()),
        commandName: cmd?.name ?? null,
        lastGrade: s.lastGrade,
        armyHp: s.units.reduce((sum, u) => sum + Math.max(0, u.hp), 0),
        armyMax: s.units.reduce((sum, u) => sum + u.maxHp, 0),
        banner: banner ? { hp: banner.hp, maxHp: banner.maxHp } : null,
        boss: boss ? { name: ENEMY_STATS.howl.name, hp: boss.hp, maxHp: boss.maxHp } : null,
        tutorial: s.tutorial,
        telegraph: s.telegraph?.kind ?? null,
      }),
    );
  }
}
