import type * as Phaser from "phaser";
import type { Backdrop } from "./backdrop.ts";
import { ACTION } from "./rules.ts";
import type { BattleState } from "./state.ts";

/** Follows the army, shakes on impact, and eases the fever tint in and out. */
export class CameraRig {
  private scene: Phaser.Scene;
  private s: BattleState;
  private backdrop: Backdrop;

  constructor(scene: Phaser.Scene, state: BattleState, backdrop: Backdrop) {
    this.scene = scene;
    this.s = state;
    this.backdrop = backdrop;
  }

  /** Keep the camera's bounds matched to the map and the window. */
  setBounds() {
    const { s } = this;
    this.scene.cameras.main.setBounds(0, 0, s.mission.worldLength, s.viewH);
  }

  update(dt: number, beatPos: number) {
    const { s, backdrop } = this;
    const cam = this.scene.cameras.main;
    const look = s.armyX - s.viewW * 0.28 + (s.action && ACTION[s.action.id].speed > 0 ? 40 : 0);
    const target = Math.min(Math.max(0, s.mission.worldLength - s.viewW), Math.max(0, look));
    const k = 1 - Math.exp(-3.2 * dt);
    cam.scrollX += (target - cam.scrollX) * k;
    cam.scrollY = 0;
    s.trauma = Math.max(0, s.trauma - dt * 1.7);
    const shake = s.trauma * s.trauma * s.shakeMul;
    if (shake > 0.002) {
      cam.scrollX += (Math.random() - 0.5) * shake * 22;
      cam.scrollY += (Math.random() - 0.5) * shake * 10;
    }
    const frac = beatPos - Math.floor(beatPos);
    const pulse = beatPos >= 0 ? Math.exp(-frac * 5) : 0;
    // The sun is scaled with last frame's fever amount, then the amount eases towards its target.
    backdrop.setSunScale(1 + pulse * 0.06 + s.feverT * 0.08);
    const targetFever = s.engine.fever ? 1 : 0;
    s.feverT += (targetFever - s.feverT) * Math.min(1, dt * 3);
    backdrop.setSkyFever(s.feverT > 0.05);
  }
}
