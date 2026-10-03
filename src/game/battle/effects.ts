import * as Phaser from "phaser";
import type { BattleState } from "./state.ts";

type Emitter = Phaser.GameObjects.Particles.ParticleEmitter;

/** Which side a burst of sparks belongs to: gold for hits we land, red for hits we take. */
export type SparkKind = "hit" | "hurt";

/**
 * Particles, rings, floating text and the fever glow. All procedural, so nothing
 * here needs art files. Other modules ask for effects; none of them touch emitters.
 */
export class Effects {
  private scene: Phaser.Scene;
  private s: BattleState;
  private sparkHit!: Emitter;
  private sparkHurt!: Emitter;
  private dust!: Emitter;
  private embers!: Emitter;
  private feverGlow!: Phaser.GameObjects.Rectangle;
  private wasFever = false;

  constructor(scene: Phaser.Scene, state: BattleState) {
    this.scene = scene;
    this.s = state;
    this.build();
  }

  sparks(kind: SparkKind, count: number, x: number, y: number) {
    (kind === "hit" ? this.sparkHit : this.sparkHurt).explode(count, x, y);
  }

  puff(x: number, y: number, n = 2) {
    this.dust.emitParticleAt(x, y, n);
  }

  /** An expanding ring, used for shockwaves and big moments. */
  ring(x: number, y: number, color: number) {
    const c = this.scene.add.circle(x, y, 12, color, 0).setStrokeStyle(2, color, 1).setDepth(51);
    this.scene.tweens.add({
      targets: c,
      scale: 9,
      alpha: 0,
      duration: 420,
      ease: "Cubic.easeOut",
      onComplete: () => c.destroy(),
    });
  }

  impact(x: number, y: number) {
    const s = this.scene.add.sprite(x, y, "impact", 0).setDepth(50).setDisplaySize(72, 72);
    s.play("fx-impact");
    s.once("animationcomplete", () => s.destroy());
  }

  floatText(x: number, y: number, text: string, color: string, size = 18) {
    const t = this.scene.add
      .text(x, y, text, {
        fontFamily: "Nunito, sans-serif",
        fontSize: `${size}px`,
        fontStyle: "800",
        color,
        stroke: "#110c18",
        strokeThickness: Math.max(4, Math.round(size / 5)),
      })
      .setOrigin(0.5)
      .setDepth(60);
    this.scene.tweens.add({
      targets: t,
      y: y - 42,
      alpha: 0,
      duration: 720,
      ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
  }

  flash(durationMs: number, r: number, g: number, b: number) {
    this.scene.cameras.main.flash(durationMs, r, g, b);
  }

  /** Call every frame: starts and stops the fever effects as fever turns on and off. */
  updateFever(beatPos: number) {
    const { s } = this;
    const fever = s.engine.fever;
    if (fever && !this.wasFever) this.enterFever();
    if (!fever && this.wasFever) this.embers.stop();
    this.wasFever = fever;
    if (fever) this.embers.setPosition(s.armyX - 20, s.groundY + 6);
    const pulse = beatPos >= 0 ? Math.exp(-(beatPos - Math.floor(beatPos)) * 5) : 0;
    this.feverGlow.setFillStyle(0xff9a3d, s.feverT * (0.06 + pulse * 0.07));
  }

  resize(w: number, h: number) {
    this.feverGlow.setSize(w, h);
  }

  private enterFever() {
    const { s } = this;
    this.embers.start();
    this.flash(160, 255, 210, 110);
    s.addTrauma(0.3);
    this.floatText(s.armyX + 60, s.groundY - 230, "FEVER!", "#ffe08a", 40);
    this.ring(s.armyX + 20, s.groundY - 40, 0xffd36b);
    this.sparks("hit", 24, s.armyX + 20, s.groundY - 60);
  }

  private build() {
    const { scene, s } = this;
    if (!scene.textures.exists("fx-spark")) {
      const g = scene.add.graphics();
      g.setVisible(false);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, 6, 5);
      g.generateTexture("fx-spark", 12, 12);
      g.clear();
      for (let r = 16; r > 0; r -= 2) {
        g.fillStyle(0xffffff, 0.06 + (16 - r) * 0.012);
        g.fillCircle(16, 16, r);
      }
      g.generateTexture("fx-puff", 32, 32);
      g.destroy();
    }

    const sparkEmitter = (tint: number[]) =>
      scene.add
        .particles(0, 0, "fx-spark", {
          emitting: false,
          lifespan: { min: 220, max: 480 },
          speed: { min: 90, max: 280 },
          angle: { min: 0, max: 360 },
          gravityY: 520,
          scale: { start: 0.9, end: 0 },
          alpha: { start: 1, end: 0 },
          tint,
          blendMode: "ADD",
        })
        .setDepth(52);
    this.sparkHit = sparkEmitter([0xfff2b0, 0xffc857]);
    this.sparkHurt = sparkEmitter([0xff8a6b, 0xe4572e]);

    this.dust = scene.add
      .particles(0, 0, "fx-puff", {
        emitting: false,
        lifespan: { min: 380, max: 700 },
        speedX: { min: -50, max: 20 },
        speedY: { min: -40, max: -10 },
        scale: { start: 0.5, end: 1.3 },
        alpha: { start: 0.38, end: 0 },
        tint: 0xb9a68e,
      })
      .setDepth(9);

    this.embers = scene.add
      .particles(0, 0, "fx-spark", {
        emitting: false,
        frequency: 55,
        lifespan: { min: 700, max: 1200 },
        speedY: { min: -120, max: -60 },
        speedX: { min: -18, max: 18 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: [0xffd36b, 0xff9a3d, 0xff6644],
        blendMode: "ADD",
        emitZone: {
          type: "random",
          source: new Phaser.Geom.Rectangle(-230, -10, 420, 20),
        } as unknown as Phaser.Types.GameObjects.Particles.EmitZoneData,
      })
      .setDepth(11);

    this.feverGlow = scene.add
      .rectangle(0, 0, s.viewW, s.viewH, 0xff9a3d, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(45);
  }
}
