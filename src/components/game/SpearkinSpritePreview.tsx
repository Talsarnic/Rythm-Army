import type { CSSProperties } from "react";
import type { UnitMember } from "@/game/types";
import { getSpearkinSpriteStyle } from "@/game/battle/spearkin-loadout";

export function SpearkinSpritePreview({ unit, size = 56, className = "" }: { unit: UnitMember; size?: number; className?: string }) {
  const style = getSpearkinSpriteStyle(unit, size);
  return <div aria-hidden="true" className={className} style={style as CSSProperties} />;
}
