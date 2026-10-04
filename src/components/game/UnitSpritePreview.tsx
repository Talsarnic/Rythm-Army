import type { UnitMember } from "@/game/types";
import { getUnitLoadoutStyle } from "@/game/battle/unit-loadout";

export function UnitSpritePreview({
  unit,
  size = 56,
  className = "",
}: {
  unit: UnitMember;
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={getUnitLoadoutStyle(unit, size)}
    />
  );
}
