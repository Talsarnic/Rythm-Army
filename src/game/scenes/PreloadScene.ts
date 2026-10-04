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

    // Procedurally generate unit spritesheets for new classes if not on disk
    this.generateProceduralSpritesheets();
  }

  private generateProceduralSpritesheets() {
    // Generate spritesheets for kiba, deka, mega, tori, maho, robo
    const classes = [
      { key: "kibakin-idle", base: "spearkin-idle", tint: 0xe066ff, horse: true },
      { key: "dekakin-idle", base: "aegiskin-idle", tint: 0xf59e0b, giant: true },
      { key: "megakin-idle", base: "bowkin-idle", tint: 0x38bdf8, horn: true },
      { key: "torikin-idle", base: "spearkin-idle", tint: 0x10b981, bird: true },
      { key: "mahokin-idle", base: "bowkin-idle", tint: 0xec4899, staff: true },
      { key: "robokin-idle", base: "aegiskin-idle", tint: 0x64748b, robo: true },
    ];

    for (const c of classes) {
      if (!this.textures.exists(c.key)) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          for (let f = 0; f < 4; f++) {
            const ox = f * 128 + 64;
            const oy = 92 + Math.sin((f / 4) * Math.PI * 2) * 4;

            // Mount / Bird / Body features
            if (c.horse) {
              // Horse body
              ctx.fillStyle = "#1e1e24";
              ctx.beginPath();
              ctx.ellipse(ox - 6, oy + 4, 32, 16, 0, 0, Math.PI * 2);
              ctx.fill();
              // Legs
              ctx.strokeStyle = "#1e1e24";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(ox - 24, oy + 12);
              ctx.lineTo(ox - 26, oy + 28);
              ctx.moveTo(ox + 12, oy + 12);
              ctx.lineTo(ox + 14, oy + 28);
              ctx.stroke();
            } else if (c.bird) {
              // Bird wings
              ctx.fillStyle = "#10b981";
              ctx.beginPath();
              ctx.ellipse(ox - 10, oy - 2, 28, 12, -0.2, 0, Math.PI * 2);
              ctx.fill();
            }

            // Kin warrior body circle
            const radius = c.giant ? 28 : 20;
            ctx.fillStyle = "#111116";
            ctx.beginPath();
            ctx.arc(ox, oy - (c.giant ? 24 : 12), radius, 0, Math.PI * 2);
            ctx.fill();

            // Kin big eyeball
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(ox + 4, oy - (c.giant ? 24 : 12), radius * 0.62, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = "#09090b";
            ctx.beginPath();
            ctx.arc(ox + 6, oy - (c.giant ? 24 : 12), radius * 0.32, 0, Math.PI * 2);
            ctx.fill();

            // Weapon / Accessory
            ctx.strokeStyle = "#fbbf24";
            ctx.fillStyle = "#fbbf24";
            ctx.lineWidth = 3;
            if (c.horn) {
              // Horn bell
              ctx.beginPath();
              ctx.moveTo(ox + 16, oy - 14);
              ctx.lineTo(ox + 34, oy - 26);
              ctx.lineTo(ox + 34, oy - 2);
              ctx.closePath();
              ctx.fill();
            } else if (c.staff) {
              // Staff
              ctx.beginPath();
              ctx.moveTo(ox + 16, oy + 10);
              ctx.lineTo(ox + 26, oy - 38);
              ctx.stroke();
              ctx.fillStyle = "#ec4899";
              ctx.beginPath();
              ctx.arc(ox + 27, oy - 40, 7, 0, Math.PI * 2);
              ctx.fill();
            } else if (c.giant) {
              // Giant club
              ctx.fillStyle = "#78350f";
              ctx.beginPath();
              ctx.rect(ox + 16, oy - 48, 14, 46);
              ctx.fill();
            } else if (c.robo) {
              // Big mechanical fists / gauntlets
              ctx.fillStyle = "#475569";
              ctx.strokeStyle = "#94a3b8";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.roundRect(ox + 12, oy - 24, 20, 20, 4);
              ctx.fill();
              ctx.stroke();
              // Back fist
              ctx.beginPath();
              ctx.roundRect(ox - 24, oy - 18, 16, 16, 3);
              ctx.fill();
              ctx.stroke();
            }
          }
          this.textures.addSpriteSheet(c.key, canvas as unknown as HTMLImageElement, {
            frameWidth: 128,
            frameHeight: 128,
          });
        }
      }
    }

    // Procedurally generate new enemy types (wildlife, obstacles, rival tribe, and colossal bosses)
    this.generateEnemySpritesheets();
  }

  private generateEnemySpritesheets() {
    const enemyTypes = [
      // Wildlife
      { key: "kooda-idle", type: "kooda" },
      { key: "stag-idle", type: "stag" },
      { key: "crab-idle", type: "crab" },
      // Obstacles & Forts
      { key: "barricade-idle", type: "barricade" },
      { key: "stone-wall-idle", type: "stone-wall" },
      { key: "watchtower-idle", type: "watchtower" },
      { key: "catapult-tower-idle", type: "catapult-tower" },
      // Rival Tribe
      { key: "tribe-spear-idle", type: "tribe-spear" },
      { key: "tribe-shield-idle", type: "tribe-shield" },
      { key: "tribe-bow-idle", type: "tribe-bow" },
      { key: "tribe-kiba-idle", type: "tribe-kiba" },
      { key: "tribe-deka-idle", type: "tribe-deka" },
      { key: "tribe-tori-idle", type: "tribe-tori" },
      // Colossal Bosses
      { key: "drake-idle", type: "drake" },
      { key: "golem-idle", type: "golem" },
    ];

    for (const e of enemyTypes) {
      if (this.textures.exists(e.key)) continue;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      for (let f = 0; f < 4; f++) {
        const ox = f * 128 + 64;
        const bob = Math.sin((f / 4) * Math.PI * 2) * 3;
        const oy = 96 + (e.type.includes("tower") || e.type.includes("wall") || e.type.includes("barricade") ? 0 : bob);

        if (e.type === "kooda") {
          // Swift bird-like prey (yellow-orange plumage, round body, beak)
          ctx.fillStyle = "#f59e0b";
          ctx.beginPath();
          ctx.ellipse(ox, oy - 14, 20, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          // Beak
          ctx.fillStyle = "#d97706";
          ctx.beginPath();
          ctx.moveTo(ox + 18, oy - 14);
          ctx.lineTo(ox + 28, oy - 10);
          ctx.lineTo(ox + 18, oy - 6);
          ctx.closePath();
          ctx.fill();
          // Eye
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(ox + 10, oy - 16, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(ox + 12, oy - 16, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Legs
          ctx.strokeStyle = "#92400e";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ox - 6, oy + 1);
          ctx.lineTo(ox - 8, oy + 20);
          ctx.moveTo(ox + 6, oy + 1);
          ctx.lineTo(ox + 8, oy + 20);
          ctx.stroke();
        } else if (e.type === "stag") {
          // Antler beast (golden fur, majestic antlers)
          ctx.fillStyle = "#b45309";
          ctx.beginPath();
          ctx.ellipse(ox - 4, oy - 10, 24, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          // Head
          ctx.beginPath();
          ctx.arc(ox + 18, oy - 22, 12, 0, Math.PI * 2);
          ctx.fill();
          // Golden Antlers
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ox + 18, oy - 30);
          ctx.lineTo(ox + 26, oy - 48);
          ctx.lineTo(ox + 34, oy - 44);
          ctx.moveTo(ox + 22, oy - 38);
          ctx.lineTo(ox + 14, oy - 46);
          ctx.stroke();
          // Legs
          ctx.strokeStyle = "#78350f";
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(ox - 18, oy + 4);
          ctx.lineTo(ox - 18, oy + 24);
          ctx.moveTo(ox + 10, oy + 4);
          ctx.lineTo(ox + 12, oy + 24);
          ctx.stroke();
        } else if (e.type === "crab") {
          // Armored scuttler crab
          ctx.fillStyle = "#475569";
          ctx.beginPath();
          ctx.ellipse(ox, oy - 8, 26, 18, 0, 0, Math.PI * 2);
          ctx.fill();
          // Pincers
          ctx.fillStyle = "#64748b";
          ctx.beginPath();
          ctx.arc(ox + 22, oy - 14, 10, 0, Math.PI * 2);
          ctx.arc(ox - 22, oy - 14, 10, 0, Math.PI * 2);
          ctx.fill();
          // Stalk eyes
          ctx.fillStyle = "#e2e8f0";
          ctx.beginPath();
          ctx.arc(ox + 6, oy - 22, 4, 0, Math.PI * 2);
          ctx.arc(ox - 6, oy - 22, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(ox + 6, oy - 22, 2, 0, Math.PI * 2);
          ctx.arc(ox - 6, oy - 22, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type === "barricade") {
          // Wooden barricade with sharpened spikes
          ctx.fillStyle = "#78350f";
          ctx.fillRect(ox - 24, oy - 36, 48, 48);
          // Spikes
          ctx.fillStyle = "#b45309";
          ctx.beginPath();
          ctx.moveTo(ox - 22, oy - 36);
          ctx.lineTo(ox - 14, oy - 56);
          ctx.lineTo(ox - 6, oy - 36);
          ctx.moveTo(ox + 6, oy - 36);
          ctx.lineTo(ox + 14, oy - 56);
          ctx.lineTo(ox + 22, oy - 36);
          ctx.fill();
          // Cross beams
          ctx.strokeStyle = "#451a03";
          ctx.lineWidth = 4;
          ctx.strokeRect(ox - 24, oy - 36, 48, 48);
        } else if (e.type === "stone-wall") {
          // Stone fortified rampart
          ctx.fillStyle = "#475569";
          ctx.fillRect(ox - 32, oy - 58, 64, 70);
          ctx.fillStyle = "#64748b";
          ctx.fillRect(ox - 28, oy - 70, 16, 14);
          ctx.fillRect(ox + 12, oy - 70, 16, 14);
          // Mortar lines
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 3;
          ctx.strokeRect(ox - 32, oy - 58, 64, 70);
        } else if (e.type === "watchtower") {
          // Wooden watchtower with red-masked sentry on top
          ctx.fillStyle = "#78350f";
          ctx.fillRect(ox - 18, oy - 72, 36, 80);
          ctx.fillStyle = "#451a03";
          ctx.fillRect(ox - 26, oy - 88, 52, 18);
          // Sentry mask
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(ox, oy - 94, 10, 0, Math.PI * 2);
          ctx.fill();
          // Sentry bow
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(ox - 12, oy - 94, 8, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();
        } else if (e.type === "catapult-tower") {
          // Stone ballista bastion
          ctx.fillStyle = "#334155";
          ctx.fillRect(ox - 30, oy - 80, 60, 90);
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(ox - 34, oy - 96, 68, 18);
          // Heavy ballista arm
          ctx.fillStyle = "#78350f";
          ctx.fillRect(ox - 8, oy - 110, 16, 26);
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(ox, oy - 116, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (e.type.startsWith("tribe-")) {
          // Red-masked rival tribal warriors (square / horned dark-red mask)
          const isKiba = e.type === "tribe-kiba";
          const isDeka = e.type === "tribe-deka";
          const isTori = e.type === "tribe-tori";
          const isShield = e.type === "tribe-shield";
          const isBow = e.type === "tribe-bow";

          if (isKiba) {
            // Dark war-mount
            ctx.fillStyle = "#1e1b4b";
            ctx.beginPath();
            ctx.ellipse(ox + 4, oy + 4, 30, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1e1b4b";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(ox - 14, oy + 12);
            ctx.lineTo(ox - 16, oy + 26);
            ctx.moveTo(ox + 18, oy + 12);
            ctx.lineTo(ox + 20, oy + 26);
            ctx.stroke();
          } else if (isTori) {
            // Dark wings
            ctx.fillStyle = "#4c0519";
            ctx.beginPath();
            ctx.ellipse(ox + 8, oy - 4, 26, 12, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Red Mask Body
          const radius = isDeka ? 26 : 18;
          ctx.fillStyle = "#dc2626"; // Crimson mask
          ctx.beginPath();
          if (isDeka) {
            ctx.rect(ox - radius, oy - 28 - radius, radius * 2, radius * 2);
          } else {
            ctx.arc(ox, oy - (isDeka ? 28 : 12), radius, 0, Math.PI * 2);
          }
          ctx.fill();

          // Angry yellow slitted eye
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(ox - 4, oy - (isDeka ? 28 : 12), radius * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#18181b";
          ctx.beginPath();
          ctx.arc(ox - 6, oy - (isDeka ? 28 : 12), radius * 0.25, 0, Math.PI * 2);
          ctx.fill();

          // Tribal weapons
          if (isShield) {
            ctx.fillStyle = "#991b1b";
            ctx.fillRect(ox - 24, oy - 28, 12, 34);
            ctx.strokeStyle = "#fef08a";
            ctx.lineWidth = 2;
            ctx.strokeRect(ox - 24, oy - 28, 12, 34);
          } else if (isBow) {
            ctx.strokeStyle = "#d97706";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(ox - 16, oy - 12, 14, Math.PI / 2, -Math.PI / 2);
            ctx.stroke();
          } else if (isDeka) {
            ctx.fillStyle = "#3f3f46";
            ctx.fillRect(ox - 32, oy - 56, 16, 44);
          } else {
            // Spear
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ox - 24, oy - 20);
            ctx.lineTo(ox + 16, oy + 4);
            ctx.stroke();
          }
        } else if (e.type === "drake") {
          // Colossal Red Flame Drake (Dodonga style)
          ctx.fillStyle = "#991b1b";
          ctx.beginPath();
          ctx.ellipse(ox + 8, oy - 16, 44, 30, 0, 0, Math.PI * 2);
          ctx.fill();
          // Great Drake Head
          ctx.fillStyle = "#b91c1c";
          ctx.beginPath();
          ctx.arc(ox - 26, oy - 32, 24, 0, Math.PI * 2);
          ctx.fill();
          // Giant Horns
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(ox - 20, oy - 48);
          ctx.lineTo(ox - 12, oy - 72);
          ctx.stroke();
          // Glowing Fire Eye
          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(ox - 34, oy - 34, 6, 0, Math.PI * 2);
          ctx.fill();
          // Massive Legs
          ctx.fillStyle = "#7f1d1d";
          ctx.fillRect(ox - 12, oy + 10, 18, 22);
          ctx.fillRect(ox + 22, oy + 10, 18, 22);
        } else if (e.type === "golem") {
          // Colossal Ancient Stone Golem (Majidonga style)
          ctx.fillStyle = "#334155";
          ctx.fillRect(ox - 38, oy - 64, 76, 72);
          // Mystic Carvings
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 4;
          ctx.strokeRect(ox - 28, oy - 54, 56, 52);
          // Ancient Eye Core
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(ox, oy - 28, 12, 0, Math.PI * 2);
          ctx.fill();
          // Heavy Stone Fists
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(ox - 48, oy - 20, 20, 36);
          ctx.fillRect(ox + 28, oy - 20, 20, 36);
        }
      }

      this.textures.addSpriteSheet(e.key, canvas as unknown as HTMLImageElement, {
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

    // Register animations for new classes & enemy types
    const extraSheets = [
      "kibakin-idle",
      "dekakin-idle",
      "megakin-idle",
      "torikin-idle",
      "mahokin-idle",
      "kooda-idle",
      "stag-idle",
      "crab-idle",
      "barricade-idle",
      "stone-wall-idle",
      "watchtower-idle",
      "catapult-tower-idle",
      "tribe-spear-idle",
      "tribe-shield-idle",
      "tribe-bow-idle",
      "tribe-kiba-idle",
      "tribe-deka-idle",
      "tribe-tori-idle",
      "drake-idle",
      "golem-idle",
    ];
    for (const key of extraSheets) {
      mk(key, `${key}-anim`, 7, -1);
    }

    this.scene.start("battle");
  }
}
