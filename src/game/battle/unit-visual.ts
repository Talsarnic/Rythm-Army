import type * as Phaser from "phaser";
import type { UnitMember } from "../types";
import { ITEMS } from "../data/items.ts";

/**
 * Equipment-aware visual composition.
 * The first version uses procedural placeholder overlays so the renderer can be
 * tested before final pixel-art assets replace these layers.
 */
export class UnitVisual {
  private base: Phaser.GameObjects.Sprite;
  private back: Phaser.GameObjects.Graphics;
  private front: Phaser.GameObjects.Graphics;
  private helmet: Phaser.GameObjects.Graphics;
  private member: UnitMember;

  constructor(scene: Phaser.Scene, base: Phaser.GameObjects.Sprite, member: UnitMember) {
    this.base = base;
    this.member = member;
    this.back = scene.add.graphics();
    this.front = scene.add.graphics();
    this.helmet = scene.add.graphics();
    this.back.setDepth(base.depth - 0.01);
    this.front.setDepth(base.depth + 0.01);
    this.helmet.setDepth(base.depth + 0.02);
    this.rebuild();
    this.sync();
  }

  rebuild() {
    this.back.clear();
    this.front.clear();
    this.helmet.clear();

    const weapon = this.member.weapon ? ITEMS[this.member.weapon] : undefined;
    const shield = this.member.shield ? ITEMS[this.member.shield] : undefined;
    const helmet = this.member.helmet ? ITEMS[this.member.helmet] : undefined;

    if (shield?.equipment?.slot === "shield") this.drawShield(this.back, this.member.shield!);
    if (weapon?.equipment?.slot === "weapon") this.drawWeapon(this.front, this.member.weapon!);
    if (helmet?.equipment?.slot === "helmet") this.drawHelmet(this.helmet, this.member.helmet!);
  }

  sync() {
    for (const layer of [this.back, this.front, this.helmet]) {
      layer.setPosition(this.base.x, this.base.y);
      layer.setScale(this.base.scaleX, this.base.scaleY);
      layer.setVisible(this.base.visible && this.base.alpha > 0);
    }
  }

  destroy() {
    this.back.destroy();
    this.front.destroy();
    this.helmet.destroy();
  }

  private drawWeapon(g: Phaser.GameObjects.Graphics, id: string) {
    const metal = /iron|divine|storm|crusher/.test(id);
    const magic = /flame|thunder|cyclone|divine/.test(id);
    const shaft = metal ? 0x6d7480 : 0x8b5a32;
    const head = magic ? 0xb77cff : metal ? 0xd8dde5 : 0xc7a45a;

    g.lineStyle(4, shaft, 1);
    if (id.startsWith("spear-")) {
      g.lineBetween(12, -5, 48, -16);
      g.fillStyle(head, 1);
      g.fillTriangle(48, -16, 39, -10, 41, -22);
    } else if (id.startsWith("sword-")) {
      g.lineBetween(10, -4, 43, -18);
      g.fillStyle(head, 1);
      g.fillTriangle(46, -20, 38, -14, 42, -27);
    } else if (id.startsWith("bow-")) {
      g.lineStyle(3, head, 1);
      g.beginPath();
      g.arc(25, -8, 20, -1.1, 1.1, false);
      g.strokePath();
      g.lineBetween(13, -26, 13, 10);
    } else if (id.startsWith("club-")) {
      g.lineStyle(7, shaft, 1);
      g.lineBetween(10, -3, 43, -18);
      g.fillStyle(head, 1);
      g.fillCircle(44, -19, 7);
    } else if (id.startsWith("staff-")) {
      g.lineStyle(4, shaft, 1);
      g.lineBetween(10, 2, 38, -28);
      g.fillStyle(head, 1);
      g.fillCircle(39, -30, 7);
    } else if (id.startsWith("horn-")) {
      g.lineStyle(5, head, 1);
      g.strokeEllipse(25, -10, 26, 18);
    } else if (id.startsWith("arm-")) {
      g.fillStyle(head, 1);
      g.fillRoundedRect(14, -10, 27, 17, 5);
    }
    if (magic) {
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(42, -22, 3);
    }
  }

  private drawShield(g: Phaser.GameObjects.Graphics, id: string) {
    const heavy = /tower|aegis/.test(id);
    const iron = /iron|tower|aegis/.test(id);
    const w = heavy ? 25 : 19;
    const h = heavy ? 32 : 25;
    g.fillStyle(iron ? 0x6d7480 : 0x8b5a32, 1);
    g.lineStyle(3, iron ? 0xd8dde5 : 0xc7a45a, 1);
    g.fillRoundedRect(-34, -h / 2 - 4, w, h, 6);
    g.strokeRoundedRect(-34, -h / 2 - 4, w, h, 6);
  }

  private drawHelmet(g: Phaser.GameObjects.Graphics, id: string) {
    const iron = /iron|great|crown/.test(id);
    const crown = id.includes("crown");
    const great = id.includes("great");

    g.fillStyle(iron ? 0x626975 : 0x9a6b45, 1);
    g.lineStyle(3, iron ? 0xd8dde5 : 0xd2a66d, 1);

    if (crown) {
      g.fillTriangle(-17, -51, -8, -66, 0, -50);
      g.fillTriangle(-5, -50, 4, -70, 13, -50);
      g.fillTriangle(7, -50, 16, -64, 22, -49);
    }

    g.fillRoundedRect(-22, -52, 44, great ? 24 : 19, 9);
    g.strokeRoundedRect(-22, -52, 44, great ? 24 : 19, 9);
    g.fillRect(-24, -38, 48, 6);
  }
}
