import type { CSSProperties } from "react";
import type { UnitClass, UnitMember } from "../types";
import {
  getSpearkinAnimationKey,
  getSpearkinAtlasFrame,
  getSpearkinLoadoutIndex,
  getSpearkinSpriteStyle,
  SPEARKIN_TEXTURE,
} from "./spearkin-loadout";

export const UNIT_HELMETS = [
  "helm-leather",
  "helm-iron",
  "helm-great",
  "helm-crown",
] as const;

type LoadoutConfig = {
  texture: string;
  weapons: readonly (string | null)[];
  shields: readonly (string | null)[];
  atlasRows: 4 | 16;
};

export const UNIT_ATLASES: Record<Exclude<UnitClass, "spear">, LoadoutConfig> = {
  banner: {
    texture: "bannerkin-loadouts",
    weapons: [null],
    shields: [null],
    atlasRows: 4,
  },
  aegis: {
    texture: "aegiskin-loadouts",
    weapons: ["sword-wood", "sword-iron", "sword-flame", "sword-divine"],
    shields: ["shield-wood", "shield-iron", "shield-tower", "shield-aegis-core"],
    atlasRows: 16,
  },
  bow: {
    texture: "bowkin-loadouts",
    weapons: ["bow-wood", "bow-recurve", "bow-great", "bow-cyclone"],
    shields: [null],
    atlasRows: 4,
  },
  kiba: {
    texture: "kibakin-loadouts",
    weapons: ["spear-wood", "spear-iron", "spear-fang", "spear-storm"],
    shields: [null],
    atlasRows: 4,
  },
  deka: {
    texture: "dekakin-loadouts",
    weapons: ["club-wood", "club-iron", "club-crusher", "club-divine"],
    shields: [null],
    atlasRows: 4,
  },
  mega: {
    texture: "megakin-loadouts",
    weapons: ["horn-wood", "horn-iron", "horn-sonic", "horn-divine"],
    shields: [null],
    atlasRows: 4,
  },
  tori: {
    texture: "torikin-loadouts",
    weapons: ["spear-wood", "spear-iron", "spear-fang", "spear-storm"],
    shields: [null],
    atlasRows: 4,
  },
  maho: {
    texture: "mahokin-loadouts",
    weapons: ["staff-wood", "staff-flame", "staff-thunder", "staff-divine"],
    shields: [null],
    atlasRows: 4,
  },
  robo: {
    texture: "robokin-loadouts",
    weapons: ["arm-wood", "arm-iron", "arm-crusher", "arm-divine"],
    shields: [null],
    atlasRows: 4,
  },
};

export type UnitLoadoutVariant = {
  cls: Exclude<UnitClass, "spear">;
  index: number;
  firstFrame: number;
  animationKey: string;
};

function itemIndex(items: readonly (string | null)[], value: string | undefined): number {
  const index = items.indexOf(value ?? null);
  return index < 0 ? 0 : index;
}

export function getUnitLoadoutIndex(member: UnitMember): number {
  if (member.cls === "spear") return getSpearkinLoadoutIndex(member);
  const config = UNIT_ATLASES[member.cls];
  const helmetIndex = itemIndex(UNIT_HELMETS, member.helmet ?? UNIT_HELMETS[0]);
  const weaponIndex = itemIndex(config.weapons, member.weapon);
  const shieldIndex = itemIndex(config.shields, member.shield);

  if (member.cls === "aegis") {
    return helmetIndex * 16 + shieldIndex * config.weapons.length + weaponIndex;
  }
  return helmetIndex * config.weapons.length + weaponIndex;
}

export function getUnitLoadoutFirstFrame(member: UnitMember): number {
  if (member.cls === "spear") return getSpearkinAtlasFrame(member);
  const config = UNIT_ATLASES[member.cls];
  const helmetIndex = itemIndex(UNIT_HELMETS, member.helmet ?? UNIT_HELMETS[0]);
  const weaponIndex = itemIndex(config.weapons, member.weapon);
  const shieldIndex = itemIndex(config.shields, member.shield);
  const row = member.cls === "aegis" ? helmetIndex * config.shields.length + shieldIndex : helmetIndex;
  const column = weaponIndex * 4;
  return row * 16 + column;
}

export function getUnitLoadoutAnimationKey(member: UnitMember): string {
  if (member.cls === "spear") return getSpearkinAnimationKey(member);
  return `${member.cls}-loadout-${getUnitLoadoutIndex(member)}-anim`;
}

export function getUnitAtlasTexture(member: UnitMember): string {
  return member.cls === "spear" ? SPEARKIN_TEXTURE : UNIT_ATLASES[member.cls].texture;
}

export function getUnitLoadoutStyle(member: UnitMember, size = 56): CSSProperties {
  if (member.cls === "spear") return getSpearkinSpriteStyle(member, size);
  const config = UNIT_ATLASES[member.cls];
  const frame = getUnitLoadoutFirstFrame(member);
  const column = frame % 16;
  const row = Math.floor(frame / 16);
  return {
    width: size,
    height: size,
    backgroundImage: `url("/assets/sprites/${config.texture}.png")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${size * 16}px ${size * config.atlasRows}px`,
    backgroundPosition: `-${column * size}px -${row * size}px`,
    imageRendering: "pixelated",
  };
}

export function getUnitLoadoutVariants(): UnitLoadoutVariant[] {
  const variants: UnitLoadoutVariant[] = [];
  for (const cls of Object.keys(UNIT_ATLASES) as (keyof typeof UNIT_ATLASES)[]) {
    const config = UNIT_ATLASES[cls];
    for (let helmetIndex = 0; helmetIndex < UNIT_HELMETS.length; helmetIndex += 1) {
      for (let shieldIndex = 0; shieldIndex < config.shields.length; shieldIndex += 1) {
        for (let weaponIndex = 0; weaponIndex < config.weapons.length; weaponIndex += 1) {
          const index = cls === "aegis"
            ? helmetIndex * 16 + shieldIndex * 4 + weaponIndex
            : helmetIndex * config.weapons.length + weaponIndex;
          const row = cls === "aegis"
            ? helmetIndex * config.shields.length + shieldIndex
            : helmetIndex;
          const firstFrame = row * 16 + weaponIndex * 4;
          variants.push({
            cls,
            index,
            firstFrame,
            animationKey: `${cls}-loadout-${index}-anim`,
          });
        }
      }
    }
  }
  return variants;
}
