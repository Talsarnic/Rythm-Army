import * as Phaser from "phaser";
import { PreloadScene } from "./scenes/PreloadScene";
import { BattleScene } from "./scenes/BattleScene";

export function createGame(parent: HTMLElement, missionId: string) {
  const w = Math.max(320, parent.clientWidth || 1280);
  const h = Math.max(240, parent.clientHeight || 720);
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: w,
    height: h,
    backgroundColor: "#110c18",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { antialias: true, powerPreference: "high-performance" },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    audio: { disableWebAudio: true, noAudio: true },
    scene: [PreloadScene, BattleScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set("missionId", missionId);
      },
    },
  });
}
