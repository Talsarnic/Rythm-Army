import * as Phaser from "phaser";

const SHEETS = [
  "spearkin-idle",
  "bowkin-idle",
  "aegiskin-idle",
  "bannerkin-idle",
  "goretusk-idle",
  "howl-idle",
  "arrow",
  "impact",
] as const;

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bar = this.add.graphics();
    const label = this.add
      .text(w / 2, h / 2 + 28, "Drumming up the army…", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#b9a58c",
      })
      .setOrigin(0.5);

    this.load.on("progress", (v: number) => {
      bar.clear();
      bar.fillStyle(0x2a2038, 1);
      bar.fillRoundedRect(w / 2 - 140, h / 2 - 8, 280, 10, 5);
      bar.fillStyle(0xe4572e, 1);
      bar.fillRoundedRect(w / 2 - 140, h / 2 - 8, 280 * v, 10, 5);
    });
    this.load.on("complete", () => {
      bar.destroy();
      label.destroy();
    });

    this.load.image("sky", "/assets/map/dusk-sky.jpg");
    for (const key of SHEETS) {
      this.load.spritesheet(key, `/assets/sprites/${key}.png`, {
        frameWidth: 128,
        frameHeight: 128,
      });
    }
  }

  create() {
    const mk = (key: string, anim: string, rate: number, repeat: number) => {
      if (this.anims.exists(anim)) return;
      this.anims.create({
        key: anim,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: rate,
        repeat,
      });
    };
    for (const key of SHEETS) {
      if (key === "impact") mk(key, "fx-impact", 18, 0);
      else if (key === "arrow") mk(key, "arrow-fly", 12, -1);
      else mk(key, `${key}-anim`, 7, -1);
    }
    this.scene.start("battle");
  }
}
