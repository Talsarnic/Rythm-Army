import * as Phaser from "phaser";
import type { BattleState } from "./state.ts";

type BackdropTheme = {
  skyTint: number;
  far: number;
  mid: number;
  near: number;
  ground: number;
  groundEdge: number;
  accent: number;
  prop: "coast" | "jungle" | "caldera" | "swamp" | "gate" | "bastion" | "ridge" | "ruins";
  sun: number;
};

const THEMES: Record<string, BackdropTheme> = {
  training: { skyTint: 0xffd9b8, far: 0x6d4b62, mid: 0x4a354c, near: 0x2d2433, ground: 0x3b2d35, groundEdge: 0x72504a, accent: 0xf2b134, prop: "ruins", sun: 0xffecaa },
  "coast-hunt": { skyTint: 0xb8e6e6, far: 0x5a8290, mid: 0x37636d, near: 0x21464e, ground: 0x334f49, groundEdge: 0x7c8d62, accent: 0xf1c46a, prop: "coast", sun: 0xffe6a1 },
  "shadowmask-clash": { skyTint: 0x93b6a2, far: 0x416653, mid: 0x294c3e, near: 0x18352e, ground: 0x253b31, groundEdge: 0x526d4a, accent: 0xc84b45, prop: "jungle", sun: 0xf0c47d },
  "drake-caldera": { skyTint: 0x7d5962, far: 0x55313b, mid: 0x3b2028, near: 0x25171c, ground: 0x282126, groundEdge: 0x68413a, accent: 0xf06a3c, prop: "caldera", sun: 0xffa05d },
  "swamp-hunt": { skyTint: 0x778f84, far: 0x43594d, mid: 0x2c4239, near: 0x1d302b, ground: 0x293b32, groundEdge: 0x53664d, accent: 0xa6c27a, prop: "swamp", sun: 0xd8d59b },
  "jungle-gate": { skyTint: 0x7da48a, far: 0x3f6249, mid: 0x294836, near: 0x1a3429, ground: 0x27382e, groundEdge: 0x5c6d49, accent: 0xc45a42, prop: "gate", sun: 0xe8c47d },
  "bastion-siege": { skyTint: 0x7a7d88, far: 0x4d505a, mid: 0x363a44, near: 0x252a32, ground: 0x303138, groundEdge: 0x68635b, accent: 0xc28b55, prop: "bastion", sun: 0xd7c5a4 },
  "iron-ridge": { skyTint: 0x73849a, far: 0x4a5367, mid: 0x343d50, near: 0x232b3a, ground: 0x30343d, groundEdge: 0x686d72, accent: 0xd2a55f, prop: "ridge", sun: 0xd8e0e8 },
  "golem-altar": { skyTint: 0x6f7188, far: 0x514d69, mid: 0x39344f, near: 0x25233a, ground: 0x2e2c39, groundEdge: 0x5f5b68, accent: 0xb78cff, prop: "ruins", sun: 0xd5c3ff },
};

export class Backdrop {
  private scene: Phaser.Scene;
  private s: BattleState;
  private theme!: BackdropTheme;
  private sky!: Phaser.GameObjects.TileSprite;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private near!: Phaser.GameObjects.TileSprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private sun!: Phaser.GameObjects.Arc;
  private shrine?: Phaser.GameObjects.Container;
  private props: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene, state: BattleState) {
    this.scene = scene;
    this.s = state;
    this.theme = THEMES[state.mission.id] ?? THEMES.training;
  }

  build() {
    const { scene, s, theme } = this;
    const w = s.viewW;
    const h = s.viewH;
    this.sky = scene.add.tileSprite(0, 0, w, h, "sky")
      .setOrigin(0).setScrollFactor(0).setDepth(-20).setTint(theme.skyTint);

    this.makeHillTex("hill-far", 1024, 280, theme.far, 0.012, 0.38);
    this.makeHillTex("hill-mid", 1024, 260, theme.mid, 0.01, 0.48);
    this.makeHillTex("hill-near", 1024, 220, theme.near, 0.008, 0.58);
    this.makeGroundTex("ground-tex", 512, 220, theme.ground, theme.groundEdge);

    this.far = scene.add.tileSprite(0, h * 0.28, w, 280, "hill-far")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-15);
    this.mid = scene.add.tileSprite(0, h * 0.4, w, 260, "hill-mid")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-12);
    this.near = scene.add.tileSprite(0, h * 0.5, w, 220, "hill-near")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(-10);

    this.sun = scene.add.circle(w * 0.72, h * 0.22, h * 0.09, theme.sun, 0.9)
      .setScrollFactor(0).setDepth(-18);

    this.ground = scene.add.tileSprite(0, s.groundY + 8, Math.max(w, s.mission.worldLength), 240, "ground-tex")
      .setOrigin(0, 0).setDepth(-5);

    this.buildProps();
    this.drawShrine();
  }

  parallax(scrollX: number) {
    this.far.tilePositionX = scrollX * 0.12;
    this.mid.tilePositionX = scrollX * 0.28;
    this.near.tilePositionX = scrollX * 0.5;
    this.sky.tilePositionX = scrollX * 0.04;
    for (const prop of this.props) {
      prop.x = prop.getData("worldX") - scrollX * Number(prop.getData("parallax") ?? 0.65);
    }
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

  pulseSun() {
    this.scene.tweens.add({ targets: this.sun, scale: 1.08, yoyo: true, duration: 90 });
  }

  setSunScale(scale: number) {
    this.sun.setScale(scale);
  }

  setSkyFever(on: boolean) {
    if (on) this.sky.setTint(this.theme.accent);
    else this.sky.setTint(this.theme.skyTint);
  }

  private buildProps() {
    const { scene, s, theme } = this;
    const spacing = theme.prop === "gate" || theme.prop === "bastion" ? 420 : 520;
    for (let x = 420, i = 0; x < s.mission.worldLength - 220; x += spacing, i++) {
      const c = scene.add.container(0, s.groundY).setDepth(-1);
      c.setData("worldX", x);
      c.setData("parallax", 0.62);
      this.drawProp(c, theme.prop, i);
      c.x = x;
      this.props.push(c);
    }
  }

  private drawProp(c: Phaser.GameObjects.Container, prop: BackdropTheme["prop"], index: number) {
    const g = this.scene.add.graphics();
    const accent = this.theme.accent;

    if (prop === "coast") {
      this.drawPalm(g, index % 2 ? -10 : 10, -12);
      this.drawCoral(g, 52, -4);
    } else if (prop === "jungle") {
      this.drawTree(g, -24, -8, 1.15);
      this.drawVines(g, 35, -45);
    } else if (prop === "caldera") {
      g.fillStyle(0x171217, 1);
      g.fillTriangle(-70, 0, -28, -86, 14, 0);
      g.fillTriangle(5, 0, 54, -105, 105, 0);
      g.fillStyle(accent, 0.75);
      g.fillTriangle(34, -4, 54, -68, 68, -4);
      g.fillStyle(0xffc15a, 0.55);
      g.fillCircle(-42, -35, 5);
    } else if (prop === "swamp") {
      for (let i = 0; i < 6; i++) {
        const x = -45 + i * 18;
        g.lineStyle(4, 0x6b7c59, 1);
        g.lineBetween(x, 0, x + (i % 2 ? 8 : -6), -58 - (i % 3) * 8);
      }
      g.fillStyle(0x6d8264, 0.5);
      g.fillEllipse(0, 4, 110, 16);
    } else if (prop === "gate") {
      this.drawWoodGate(g, 0, -6, index % 2 === 0);
    } else if (prop === "bastion") {
      this.drawStoneBastion(g, 0, -6);
    } else if (prop === "ridge") {
      g.fillStyle(0x1b222d, 1);
      g.fillTriangle(-100, 0, -25, -125, 35, 0);
      g.fillTriangle(0, 0, 76, -92, 135, 0);
      g.fillStyle(0xa7b3c1, 0.35);
      g.fillTriangle(-25, -125, -5, -92, -13, -112);
    } else {
      this.drawRuinPillars(g, index % 2 === 0);
    }

    c.add(g);
  }

  private drawPalm(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.lineStyle(7, 0x5b4534, 1);
    g.lineBetween(x, y, x + 8, y - 92);
    g.lineBetween(x + 8, y - 92, x - 22, y - 116);
    g.lineBetween(x + 8, y - 92, x + 40, y - 112);
    g.lineBetween(x + 8, y - 92, x - 3, y - 126);
    g.lineBetween(x + 8, y - 92, x + 28, y - 132);
    g.fillStyle(0x47704d, 1);
    for (const [dx, dy] of [[-28, -118], [40, -114], [-3, -130], [30, -135]]) g.fillEllipse(x + dx, dy, 42, 13);
  }

  private drawCoral(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.lineStyle(4, 0xd17a68, 1);
    g.lineBetween(x, y, x - 5, y - 28);
    g.lineBetween(x - 5, y - 15, x - 22, y - 28);
    g.lineBetween(x - 4, y - 18, x + 15, y - 34);
  }

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number, scale: number) {
    g.fillStyle(0x4b362c, 1);
    g.fillRect(x - 7, y - 105 * scale, 14, 105 * scale);
    g.fillStyle(0x28523b, 1);
    g.fillCircle(x, y - 120 * scale, 38 * scale);
    g.fillCircle(x - 27 * scale, y - 102 * scale, 28 * scale);
    g.fillCircle(x + 28 * scale, y - 103 * scale, 28 * scale);
    g.fillStyle(0x47724d, 1);
    g.fillCircle(x + 6, y - 136 * scale, 19 * scale);
  }

  private drawVines(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.lineStyle(3, 0x47724d, 1);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 9, y + 34);
    g.lineTo(x + 2, y + 65);
    g.strokePath();
  }

  private drawWoodGate(g: Phaser.GameObjects.Graphics, x: number, y: number, tall: boolean) {
    const h = tall ? 132 : 98;
    g.fillStyle(0x543b2d, 1);
    g.fillRect(x - 58, y - h, 16, h);
    g.fillRect(x + 42, y - h, 16, h);
    g.fillStyle(0x8a5a38, 1);
    g.fillRect(x - 54, y - h + 12, 108, 14);
    g.fillRect(x - 54, y - h + 48, 108, 12);
    g.fillRect(x - 48, y - h + 78, 96, 10);
    g.fillStyle(this.theme.accent, 1);
    g.fillTriangle(x, y - h - 20, x - 13, y - h, x + 13, y - h);
  }

  private drawStoneBastion(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x555861, 1);
    g.fillRect(x - 70, y - 118, 140, 118);
    g.fillStyle(0x777b82, 1);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        g.fillRect(x - 64 + col * 35 + (row % 2 ? 8 : 0), y - 105 + row * 24, 28, 17);
      }
    }
    g.fillStyle(this.theme.accent, 1);
    g.fillRect(x - 8, y - 42, 16, 42);
  }

  private drawRuinPillars(g: Phaser.GameObjects.Graphics, broken: boolean) {
    g.fillStyle(0x69636a, 1);
    g.fillRect(-55, -110, 18, 110);
    g.fillRect(35, -92, 18, 92);
    g.fillRect(-62, -120, 32, 14);
    if (!broken) g.fillRect(28, -103, 32, 14);
    g.fillStyle(this.theme.accent, 0.8);
    g.fillCircle(-46, -128, 7);
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

  private makeGroundTex(key: string, w: number, h: number, ground: number, edge: number) {
    const { scene } = this;
    if (scene.textures.exists(key)) return;
    const g = scene.add.graphics();
    g.setVisible(false);
    g.fillStyle(ground, 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(edge, 1);
    g.fillRect(0, 0, w, 7);
    g.fillStyle(0xffffff, 0.055);
    for (let x = 12; x < w; x += 64) {
      g.fillRect(x, 18 + (x % 3) * 7, 24, 3);
      g.fillRect(x + 18, 82 + (x % 5) * 4, 12, 3);
    }
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private drawShrine() {
    const { scene, s } = this;
    const c = scene.add.container(s.mission.goalX, s.groundY).setDepth(2);
    const g = scene.add.graphics();
    const accent = this.theme.accent;
    g.fillStyle(0x4a3020, 1);
    g.fillRect(-8, -118, 16, 118);
    g.fillStyle(accent, 1);
    g.fillCircle(0, -132, 26);
    g.fillStyle(this.theme.sun, 1);
    g.fillCircle(0, -132, 11);
    g.fillStyle(0xf4ead8, 0.85);
    g.fillRect(-2, -158, 4, 20);
    c.add(g);
    this.shrine = c;
  }
}
