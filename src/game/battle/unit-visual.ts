import type * as Phaser from "phaser";
import type { UnitMember } from "../types";
import { ITEMS } from "../data/items.ts";

/**
 * Equipment-aware pixel-art composition.
 * Finished item textures are preferred; procedural geometry remains only as a
 * fallback for equipment that has not received final art yet.
 */
export class UnitVisual {
  private base: Phaser.GameObjects.Sprite;
  private back?: Phaser.GameObjects.Image;
  private front?: Phaser.GameObjects.Image;
  private helmet?: Phaser.GameObjects.Image;
  private fallbackBack: Phaser.GameObjects.Graphics;
  private fallbackFront: Phaser.GameObjects.Graphics;
  private fallbackHelmet: Phaser.GameObjects.Graphics;
  private member: UnitMember;
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, base: Phaser.GameObjects.Sprite, member: UnitMember) {
    this.scene = scene;
    this.base = base;
    this.member = member;
    this.fallbackBack = scene.add.graphics();
    this.fallbackFront = scene.add.graphics();
    this.fallbackHelmet = scene.add.graphics();
    this.rebuild();
    this.sync();
  }

  rebuild() {
    this.destroyLayers();
    this.fallbackBack.clear();
    this.fallbackFront.clear();
    this.fallbackHelmet.clear();

    const weapon = this.member.weapon ? ITEMS[this.member.weapon] : undefined;
    const shield = this.member.shield ? ITEMS[this.member.shield] : undefined;
    const helmet = this.member.helmet ? ITEMS[this.member.helmet] : undefined;

    // Class silhouettes are deliberately built from the same compact pixel language
    // as the reference sprite, and sit behind the shared character body.
    this.loadEquipmentArt();

    if (shield?.equipment?.slot === "shield") {
      this.drawFallbackShield(this.fallbackBack, this.member.shield!);
    }

    if (weapon?.equipment?.slot === "weapon") {
      if (this.member.weapon !== "spear-wood") {
        this.drawFallbackWeapon(this.fallbackFront, this.member.weapon!);
      }
    }

    if (helmet?.equipment?.slot === "helmet") {
      if (this.member.helmet !== "helm-leather") {
        this.drawFallbackHelmet(this.fallbackHelmet, this.member.helmet!);
      }
    }

    this.sync();
  }

  sync() {
    this.fallbackBack.setDepth(this.base.depth - 0.2);
    this.fallbackFront.setDepth(this.base.depth + 0.2);
    this.fallbackHelmet.setDepth(this.base.depth + 0.1);
    this.back?.setDepth(this.base.depth - 0.2);
    this.front?.setDepth(this.base.depth + 0.2);
    this.helmet?.setDepth(this.base.depth + 0.3);

    for (const layer of [this.fallbackBack, this.fallbackFront, this.fallbackHelmet]) {
      layer.setPosition(this.base.x, this.base.y);
      layer.setScale(this.base.scaleX, this.base.scaleY);
      layer.setVisible(this.base.visible && this.base.alpha > 0);
    }

    for (const layer of [this.back, this.front, this.helmet]) {
      if (layer) {
        layer.setPosition(this.base.x, this.base.y - 54 * this.base.scaleY);
        layer.setScale(this.base.scaleX, this.base.scaleY);
        layer.setVisible(this.base.visible && this.base.alpha > 0);
      }
    }
  }

  destroy() {
    this.destroyLayers();
    this.fallbackBack.destroy();
    this.fallbackFront.destroy();
    this.fallbackHelmet.destroy();
  }

  private destroyLayers() {
    this.front?.destroy();
    this.helmet?.destroy();
    this.back?.destroy();
    this.front = undefined;
    this.helmet = undefined;
    this.back = undefined;
  }

  private loadEquipmentArt() {
    const add = (id: string | undefined, layer: "back" | "front" | "helmet") => {
      if (!id || !this.scene.textures.exists(`item-${id}`)) return;
      const image = this.scene.add.image(this.base.x, this.base.y, `item-${id}`).setOrigin(0.5);
      if (layer === "back") this.back = image;
      else if (layer === "helmet") this.helmet = image;
      else this.front = image;
    };
    const weapon = this.member.weapon ? ITEMS[this.member.weapon] : undefined;
    const shield = this.member.shield ? ITEMS[this.member.shield] : undefined;
    const helmet = this.member.helmet ? ITEMS[this.member.helmet] : undefined;
    if (shield?.equipment?.slot === "shield") add(this.member.shield, "back");
    if (weapon?.equipment?.slot === "weapon") add(this.member.weapon, "front");
    if (helmet?.equipment?.slot === "helmet") add(this.member.helmet, "helmet");
  }

  private drawFallbackClass(g: Phaser.GameObjects.Graphics, cls: UnitMember["cls"]) {
    g.clear();

    if (cls === "banner") {
      g.fillStyle(0x75462f, 1);
      g.fillRect(-34, -58, 3, 68);
      g.fillStyle(0x8e3e3d, 1);
      g.fillTriangle(-31, -56, -2, -52, -31, -28);
      g.fillStyle(0xb95745, 1);
      g.fillTriangle(-29, -53, -6, -50, -29, -32);
      g.fillStyle(0xf0c96a, 1);
      g.fillRect(-21, -47, 7, 3);
      g.fillRect(-18, -50, 3, 9);
    } else if (cls === "kiba") {
      g.fillStyle(0x241a1d, 1);
      g.fillEllipse(-18, 31, 54, 25);
      g.fillStyle(0x394b50, 1);
      g.fillEllipse(-17, 29, 47, 19);
      g.fillStyle(0x75462f, 1);
      g.fillRect(-34, 35, 8, 22);
      g.fillRect(2, 35, 8, 22);
      g.fillStyle(0xa86b45, 1);
      g.fillRect(-38, 17, 15, 8);
    } else if (cls === "tori") {
      g.fillStyle(0xb7b0a5, 1);
      g.fillTriangle(-25, 3, -52, -20, -45, 16);
      g.fillTriangle(25, 3, 52, -20, 45, 16);
      g.fillStyle(0xe5e0d4, 1);
      g.fillTriangle(-22, 4, -43, -13, -36, 12);
      g.fillTriangle(22, 4, 43, -13, 36, 12);
    } else if (cls === "maho") {
      g.fillStyle(0x7d68a8, 1);
      g.fillTriangle(-22, 19, 0, 4, 22, 19);
      g.fillStyle(0xb7a1df, 1);
      g.fillRect(-12, 7, 24, 6);
    } else if (cls === "robo") {
      g.fillStyle(0x656d6b, 1);
      g.fillRect(-33, -2, 14, 20);
      g.fillRect(19, -2, 14, 20);
      g.fillStyle(0xd0d0c5, 1);
      g.fillRect(-30, 1, 8, 10);
      g.fillRect(22, 1, 8, 10);
    }
  }

  private drawFallbackWeapon(g: Phaser.GameObjects.Graphics, id: string) {
    const metal = /iron|divine|storm|crusher/.test(id);
    const magic = /flame|thunder|cyclone|divine/.test(id);
    const shaft = metal ? 0x6d7480 : 0x8b5a32;
    const head = magic ? 0xb77cff : metal ? 0xd8dde5 : 0xc7a45a;

    g.lineStyle(4, shaft, 1);
    if (id.startsWith("sword-")) {
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

  private drawFallbackShield(g: Phaser.GameObjects.Graphics, id: string) {
    const heavy = /tower|aegis/.test(id);
    const iron = /iron|tower|aegis/.test(id);
    const w = heavy ? 25 : 19;
    const h = heavy ? 32 : 25;
    g.fillStyle(iron ? 0x6d7480 : 0x8b5a32, 1);
    g.lineStyle(3, iron ? 0xd8dde5 : 0xc7a45a, 1);
    g.fillRoundedRect(-34, -h / 2 - 4, w, h, 6);
    g.strokeRoundedRect(-34, -h / 2 - 4, w, h, 6);
  }

  private drawFallbackHelmet(g: Phaser.GameObjects.Graphics, id: string) {
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
