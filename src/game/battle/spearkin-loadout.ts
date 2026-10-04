import type { CSSProperties } from "react";
import type { UnitMember } from "../types";

export const SPEARKIN_TEXTURE = "spearkin-loadouts";

export const SPEARKIN_HELMETS = [
  "helm-leather",
  "helm-iron",
  "helm-great",
  "helm-crown",
] as const;

export const SPEARKIN_SPEARS = [
  "spear-wood",
  "spear-iron",
  "spear-fang",
  "spear-storm",
] as const;

export function getSpearkinLoadoutIndex(member: UnitMember): number {
  const helmetIndex = Math.max(0, SPEARKIN_HELMETS.indexOf((member.helmet ?? "helm-leather") as (typeof SPEARKIN_HELMETS)[number]));
  const spearIndex = Math.max(0, SPEARKIN_SPEARS.indexOf((member.weapon ?? "spear-wood") as (typeof SPEARKIN_SPEARS)[number]));
  return helmetIndex * SPEARKIN_SPEARS.length + spearIndex;
}

export function getSpearkinAtlasFrame(member: UnitMember): number {
  const loadoutIndex = getSpearkinLoadoutIndex(member);
  const row = Math.floor(loadoutIndex / 4);
  const blockColumn = loadoutIndex % 4;
  return row * 16 + blockColumn * 4;
}

export function getSpearkinAnimationKey(member: UnitMember): string {
  return `spearkin-loadout-${getSpearkinLoadoutIndex(member)}-anim`;
}

export function getSpearkinSpriteStyle(member: UnitMember, size = 56): CSSProperties {
  const frame = getSpearkinAtlasFrame(member);
  const column = frame % 16;
  const row = Math.floor(frame / 16);
  return {
    width: size,
    height: size,
    backgroundImage: `url("/assets/sprites/spearkin-loadouts.svg")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${size * 16}px ${size * 4}px`,
    backgroundPosition: `-${column * size}px -${row * size}px`,
    imageRendering: "pixelated",
  };
}
