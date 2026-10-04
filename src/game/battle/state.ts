import type * as Phaser from "phaser";
import type { RhythmEngine } from "../rhythm.ts";
import type { CommandId, EnemyKind, MissionDef, UnitClass, UnitMember } from "../types";

/** One soldier or enemy on the field. */
export interface Fighter {
  sprite: Phaser.GameObjects.Sprite;
  hp: number;
  maxHp: number;
  /** Set for army units. */
  cls?: UnitClass;
  member?: UnitMember;
  damage?: number;
  range?: number;
  defense?: number;
  attackSpeed?: number;
  /** Set for enemies. */
  kind?: EnemyKind;
  alive: boolean;
  /** Resting offset from the army's anchor, so the formation holds its shape. */
  formX: number;
  formY: number;
  /** Eases from 1 to 0 after a swing, pushing the sprite forward. */
  lunge: number;
  /** Seconds of white hit-flash remaining. */
  flash: number;
  bar: Phaser.GameObjects.Graphics;
  /** Knockback. Units: a shove offset in px that eases back to formation. Enemies: velocity in px/s. */
  kb: number;
  /** Attack run offset: when attacking, units surge forward towards enemies and return to formation. */
  attackOffset?: number;
  /** Jump height during attack windup (e.g. Spearkin jumping to hurl spears). */
  jumpOffset?: number;
  /** Resting sprite scale, so squash and stretch can be applied on top of it. */
  sx: number;
  sy: number;
}

export interface ActiveAction {
  id: CommandId;
  /** The beat on which the command was answered. */
  beat: number;
}

export interface Telegraph {
  until: number;
  kind: string;
}

/**
 * Everything the battle modules share. There is one per battle, created in
 * BattleScene.create(), so a restarted mission always begins from a clean slate.
 */
export class BattleState {
  readonly mission: MissionDef;
  readonly engine: RhythmEngine;

  ended = false;
  paused = false;

  /** The army's anchor on the map. Units sit at this plus their formation offset. */
  armyX = 280;
  groundY = 420;
  viewW = 1280;
  viewH = 720;

  /** The next beat whose audio has not been scheduled yet. */
  nextTick = 0;
  action: ActiveAction | null = null;
  charged = false;
  defending = false;
  jumping = false;

  /** Camera shake, 0 to 1, decaying. */
  trauma = 0;
  /** Seconds the whole battle is frozen for, to give hits weight. */
  hitstop = 0;
  /** 0 to 1, eases towards 1 while fever is active. */
  feverT = 0;
  shakeMul: number;

  units: Fighter[] = [];
  enemies: Fighter[] = [];
  killedEnemies: EnemyKind[] = [];
  spawnedWaves = new Set<number>();

  lastGrade: string | null = null;
  telegraph: Telegraph | null = null;
  feverReached = false;
  tutorial = "";

  constructor(mission: MissionDef, engine: RhythmEngine, view: { w: number; h: number }, shakeMul: number) {
    this.mission = mission;
    this.engine = engine;
    this.shakeMul = shakeMul;
    this.resize(view.w, view.h);
  }

  resize(w: number, h: number) {
    this.viewW = w;
    this.viewH = h;
    this.groundY = h * 0.64;
  }

  addTrauma(amount: number) {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  /** Freeze the battle for at least this many seconds. */
  freeze(seconds: number) {
    this.hitstop = Math.max(this.hitstop, seconds);
  }

  clearAction() {
    this.action = null;
    this.defending = false;
    this.jumping = false;
  }
}
