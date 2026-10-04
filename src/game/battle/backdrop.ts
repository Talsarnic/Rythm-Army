import * as Phaser from "phaser";
import type { BattleState } from "./state.ts";

/** The parallax scenery, the ground, the sun and the goal shrine. */
export class Backdrop {
  private scene: Phaser.Scene;
  private s: BattleState;
  private sky!: Phaser.GameObjects.TileSprite;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private near!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private sun!: Phaser.GameObjects.Arc;
  private shrine?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, state: BattleState) {
    this.scene = scene;
    this.s = state;
  }

  build() {
    const { scene, s } = this;
    const w = s.viewW;
    const h = s.viewH;
    this.sky = scene.add.tileSprite(0, 0, w, h, "sky").setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.makeHillTex("hill-far", 1024, 280, 0x5a3470, 0.12, 0.38);
    this.makeHillTex("hill-mid", 1024, 260, 0x3d2458, 0.1, 0.48);
    this.makeHillTex("hill-near", 1024, 220, 0x2a1840, 0.08, 0.58);
    this.makeGroundTex("ground-tex", 512, 220);
    this.far = scene.add.tileSprite(0, h * 0.28, w, 280, "hill-far").setOrigin(0, 0).setScrollFactor(0).setDepth(-15);
    this.mid = scene.add.tileSprite(0, h * 0.4, w, 260, "hill-mid").setOrigin(0, 0).setScrollFactor(0).setDepth(-12);
    this.near = scene.add.tileSprite(0, h * 0.5, w, 220, "hill-near").setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
    this.sun = scene.add.circle(w * 0.72, h * 0.22, h * 0.09, 0xffecaa, 0.92).setScrollFactor(0).setDepth(-18);
    this.ground = scene.add
      .tileSprite(0, s.groundY + 8, Math.max(w, s.mission.worldLength), 240, "ground-tex")
      .setOrigin(0, 0)
      .setDepth(-5);
    this.drawShrine();
  }

  /** Scroll each layer at its own rate to fake depth. */
  parallax(scrollX: number) {
    this.far.tilePositionX = scrollX * 0.12;
    this.mid.tilePositionX = scrollX * 0.28;
    this.near.tilePositionX = scrollX * 0.5;
    this.sky.tilePositionX = scrollX * 0.04;
  }

  relayout() {
    const { s } = this;
    const w = s.viewW;
    const h = s.viewH;
    this.sky.setSize(w, h);
    this.far.setPosition(0, h * 0.28).setSize(w, 280);
    this.mid.setPosition(0, h * 0.4).setSize(w, 260);
    this.near.setPosition(0, h * 0.5).setSize(w, 220);
    this.sun.setPosition(w * 0.72, h * 0.22);
    this.sun.setRadius(h * 0.09);
    this.ground.y = s.groundY + 8;
    this.ground.setSize(Math.max(w, s.mission.worldLength), 240);
    if (this.shrine) this.shrine.y = s.groundY;
  }

  /** A quick pop on every beat. */
  pulseSun() {
    this.scene.tweens.add({ targets: this.sun, scale: 1.08, yoyo: true, duration: 90 });
  }

  setSunScale(scale: number) {
    this.sun.setScale(scale);
  }

  /** Warm the sky while fever is on. */
  setSkyFever(on: boolean) {
    if (on) this.sky.setTint(0xffc8b4);
    else this.sky.clearTint();
  }

  private makeHillTex(key: string, w: number, h: number, color: number, freq: number, baseT: number) {
    const { scene } = this;
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.setVisible(false);
    const base = h * baseT;
    const amp = h * 0.22;
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(0, h);
    g.lineTo(0, base);
    for (let x = 0; x <= w; x += 6) {
      const t = x * freq;
      const y = base - (Math.sin(t) * amp + Math.sin(t * 2.17 + 1.1) * amp * 0.38);
      g.lineTo(x, y);
    }
    g.lineTo(w, h);
    g.closePath();
    g.fillPath();
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeGroundTex(key: string, w: number, h: number) {
    const { scene } = this;
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
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
    const { scene, s } = this;
    const c = scene.add.container(s.mission.goalX, s.groundY).setDepth(2);
    const g = scene.add.graphics();
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
}
