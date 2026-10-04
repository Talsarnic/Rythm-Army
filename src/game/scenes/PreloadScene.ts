import * as Phaser from "phaser";
import { getSpearkinAtlasFrame, SPEARKIN_TEXTURE } from "../battle/spearkin-loadout";

const PLAYER_SHEETS = [
  ["spearkin-idle", "spearkin-idle.svg"],
  ["bowkin-idle", "bowkin-idle.svg"],
  ["aegiskin-idle", "aegiskin-idle.svg"],
  ["bannerkin-idle", "bannerkin-idle.svg"],
  ["kibakin-idle", "kibakin-idle.svg"],
  ["dekakin-idle", "dekakin-idle.svg"],
  ["megakin-idle", "megakin-idle.svg"],
  ["torikin-idle", "torikin-idle.svg"],
  ["mahokin-idle", "mahokin-idle.svg"],
  ["robokin-idle", "robokin-idle.svg"],
] as const;


const SHEETS = [
  "spearkin-idle",
  "bowkin-idle",
  "aegiskin-idle",
  "bannerkin-idle",
  "kibakin-idle",
  "dekakin-idle",
  "megakin-idle",
  "torikin-idle",
  "mahokin-idle",
  "robokin-idle",
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
    for (const [key, file] of PLAYER_SHEETS) {
      // Load SVG as an image, then add explicit 128x128 frames in create().
      // This avoids browser-dependent SVG spritesheet dimension parsing.
      this.load.image(key, `/assets/sprites/${file}`);
    }
    this.load.image(SPEARKIN_TEXTURE, "/assets/sprites/spearkin-loadouts.svg");
    this.load.spritesheet("arrow", "/assets/sprites/arrow.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("impact", "/assets/sprites/impact.png", { frameWidth: 128, frameHeight: 128 });
    const EQUIPMENT_ART = [
      "spear-wood","spear-iron","spear-fang","spear-storm","sword-wood","sword-iron","sword-flame","sword-divine",
      "shield-wood","shield-iron","shield-tower","shield-aegis-core","bow-wood","bow-recurve","bow-great","bow-cyclone",
      "club-wood","club-iron","club-crusher","club-divine","horn-wood","horn-iron","horn-sonic","horn-divine",
      "staff-wood","staff-flame","staff-thunder","staff-divine","arm-wood","arm-iron","arm-crusher","arm-divine",
      "helm-leather","helm-iron","helm-great","helm-crown",
    ] as const;
    for (const id of EQUIPMENT_ART) this.load.image(`item-${id}`, `/assets/items/${id}.svg`);

    // Player art is now reference-matched hand-authored pixel art.
    // Enemy/fortification art remains generated below until its art pass.
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
    // Convert each 512x128 SVG sheet into four explicit 128x128 Phaser frames.
    for (const [key] of PLAYER_SHEETS) {
      const texture = this.textures.get(key);
      if (!texture || texture.has(0)) continue;
      texture.firstFrame = 0;
      for (let frame = 0; frame < 4; frame++) {
        texture.add(frame, 0, frame * 128, 0, 128, 128);
      }
    }

    // The atlas is 16 loadouts x 4 animation frames, packed as 16 frames across each row.
    const spearkinTexture = this.textures.get(SPEARKIN_TEXTURE);
    if (spearkinTexture && !spearkinTexture.has(0)) {
      spearkinTexture.firstFrame = 0;
      for (let frame = 0; frame < 64; frame++) {
        const column = frame % 16;
        const row = Math.floor(frame / 16);
        spearkinTexture.add(frame, 0, column * 128, row * 128, 128, 128);
      }
    }

    // Keep the hand-authored pixel art crisp at every gameplay scale.
    for (const key of [...SHEETS, SPEARKIN_TEXTURE]) {
      this.textures.get(key)?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
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
    for (let loadoutIndex = 0; loadoutIndex < 16; loadoutIndex++) {
      const baseFrame = Math.floor(loadoutIndex / 4) * 16 + (loadoutIndex % 4) * 4;
      const anim = `spearkin-loadout-${loadoutIndex}-anim`;
      if (!this.anims.exists(anim)) {
        this.anims.create({
          key: anim,
          frames: this.anims.generateFrameNumbers(SPEARKIN_TEXTURE, { start: baseFrame, end: baseFrame + 3 }),
          frameRate: 7,
          repeat: -1,
        });
      }
    }

    // Register animations for new classes & enemy types
    const extraSheets = [
      "kibakin-idle",
      "dekakin-idle",
      "megakin-idle",
      "torikin-idle",
      "mahokin-idle",
      "robokin-idle",
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
