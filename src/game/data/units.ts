import type { EnemyKind, UnitClass, UnitMember } from "../types";
import { ITEMS } from "./items.ts";

export interface ClassStats {
  id: UnitClass;
  name: string;
  sprite: string;
  hp: number;
  damage: number;
  range: number;
  role: "melee" | "ranged" | "tank" | "flag";
}

export const CLASSES: Record<UnitClass, ClassStats> = {
  banner: { id: "banner", name: "Bannerkin", sprite: "bannerkin-idle", hp: 48, damage: 0, range: 0, role: "flag" },
  aegis: { id: "aegis", name: "Aegiskin", sprite: "aegiskin-idle", hp: 78, damage: 7, range: 70, role: "tank" },
  spear: { id: "spear", name: "Spearkin", sprite: "spearkin-idle", hp: 44, damage: 14, range: 260, role: "ranged" },
  bow: { id: "bow", name: "Bowkin", sprite: "bowkin-idle", hp: 32, damage: 9, range: 420, role: "ranged" },
};

export interface EffectiveUnitStats {
  hp: number;
  damage: number;
  range: number;
  defense: number; // 0..1 flat reduction
  attackSpeed: number; // multiplier e.g. 1.0, 1.25
  role: "melee" | "ranged" | "tank" | "flag";
}

export function computeUnitStats(unit: UnitMember): EffectiveUnitStats {
  const base = CLASSES[unit.cls];
  let hp = base.hp;
  let damage = base.damage;
  let range = base.range;
  let defense = 0;
  let attackSpeed = 1.0;

  if (unit.weapon) {
    const weaponDef = ITEMS[unit.weapon];
    if (weaponDef?.equipment) {
      damage += weaponDef.equipment.damageBonus ?? 0;
      range += weaponDef.equipment.rangeBonus ?? 0;
      defense += weaponDef.equipment.defenseBonus ?? 0;
      hp += weaponDef.equipment.hpBonus ?? 0;
      attackSpeed *= weaponDef.equipment.attackSpeedMultiplier ?? 1.0;
    }
  }

  if (unit.helmet) {
    const helmDef = ITEMS[unit.helmet];
    if (helmDef?.equipment) {
      hp += helmDef.equipment.hpBonus ?? 0;
      defense += helmDef.equipment.defenseBonus ?? 0;
    }
  }

  return {
    hp: Math.max(1, hp),
    damage: Math.max(0, damage),
    range: Math.max(0, range),
    defense: Math.min(0.75, Math.max(0, defense)),
    attackSpeed: Math.max(0.5, attackSpeed),
    role: base.role,
  };
}

export const ENEMY_STATS: Record<EnemyKind, { name: string; sprite: string; hp: number; damage: number; range: number; speed: number; scale: number }> = {
  goretusk: { name: "Goretusk", sprite: "goretusk-idle", hp: 42, damage: 8, range: 70, speed: 46, scale: 0.92 },
  brute: { name: "Tuskbrute", sprite: "goretusk-idle", hp: 90, damage: 14, range: 82, speed: 32, scale: 1.28 },
  howl: { name: "Iron Howl", sprite: "howl-idle", hp: 420, damage: 22, range: 110, speed: 22, scale: 1.7 },
};

export const STARTER_ARMY: UnitClass[] = [
  "banner",
  "bow",
  "bow",
  "spear",
  "spear",
  "spear",
  "aegis",
  "aegis",
];

export const MAX_UNITS_PER_CLASS: Record<UnitClass, number> = {
  banner: 1,
  bow: 3,
  spear: 3,
  aegis: 3,
};

export interface UnitCreationCost {
  materials: Record<string, number>;
}

export const UNIT_CREATION_RECIPES: Record<Exclude<UnitClass, "banner">, UnitCreationCost> = {
  bow: {
    materials: {
      "beast-meat": 3,
      "wood-branch": 4,
      "stone-chunk": 2,
    },
  },
  spear: {
    materials: {
      "beast-meat": 3,
      "wood-branch": 3,
      "iron-scrap": 2,
    },
  },
  aegis: {
    materials: {
      "beast-meat": 4,
      "wood-branch": 2,
      "stone-chunk": 2,
      "iron-scrap": 3,
    },
  },
};

export function canCreateUnit(
  cls: UnitClass,
  roster: UnitMember[],
  inventory: Record<string, number>
): { allowed: boolean; reason?: string } {
  if (cls === "banner") {
    return { allowed: false, reason: "Bannerkin is unique and cannot be cloned." };
  }
  const currentCount = roster.filter((u) => u.cls === cls).length;
  const maxAllowed = MAX_UNITS_PER_CLASS[cls] ?? 3;
  if (currentCount >= maxAllowed) {
    return { allowed: false, reason: `Maximum limit reached (${maxAllowed}/${maxAllowed}).` };
  }

  const recipe = UNIT_CREATION_RECIPES[cls as Exclude<UnitClass, "banner">];
  if (!recipe) {
    return { allowed: false, reason: "No creation recipe found." };
  }

  for (const [matId, reqQty] of Object.entries(recipe.materials)) {
    const available = inventory[matId] ?? 0;
    if (available < reqQty) {
      return { allowed: false, reason: `Missing materials.` };
    }
  }

  return { allowed: true };
}

export function getDefaultStarterGear(cls: UnitClass): { weapon?: string; helmet?: string } {
  switch (cls) {
    case "spear":
      return { weapon: "spear-wood", helmet: "helm-leather" };
    case "bow":
      return { weapon: "bow-wood", helmet: "helm-leather" };
    case "aegis":
      return { weapon: "shield-wood", helmet: "helm-leather" };
    case "banner":
      return { helmet: "helm-leather" };
  }
}

export function createStarterRoster(): UnitMember[] {
  return STARTER_ARMY.map((cls, idx) => {
    const gear = getDefaultStarterGear(cls);
    return {
      id: `starter-${cls}-${idx}`,
      cls,
      level: 1,
      weapon: gear.weapon,
      helmet: gear.helmet,
    };
  });
}

/**
 * Calculates a power/effectiveness score for a piece of gear when equipped on a specific unit class.
 */
export function getGearScore(itemId: string, cls: UnitClass): number {
  const item = ITEMS[itemId];
  if (!item || !item.equipment) return 0;
  if (!item.equipment.allowedClasses.includes(cls)) return -1;

  const eq = item.equipment;
  let score = 0;

  // Rarity baseline weight
  const rarityWeights: Record<string, number> = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 90,
  };
  score += rarityWeights[item.rarity] ?? 10;

  // Stat contributions
  if (eq.damageBonus) score += eq.damageBonus * 4;
  if (eq.hpBonus) score += eq.hpBonus * 1.2;
  if (eq.defenseBonus) score += eq.defenseBonus * 120;
  if (eq.rangeBonus) score += eq.rangeBonus * 0.3;
  if (eq.attackSpeedMultiplier && eq.attackSpeedMultiplier > 1.0) {
    score += (eq.attackSpeedMultiplier - 1.0) * 100;
  }

  // Class-specific weighting
  if (cls === "aegis") {
    // Aegis values defense and HP even more
    if (eq.defenseBonus) score += eq.defenseBonus * 80;
    if (eq.hpBonus) score += eq.hpBonus * 1.5;
  } else if (cls === "bow") {
    // Bowkin values range and damage
    if (eq.rangeBonus) score += eq.rangeBonus * 0.5;
    if (eq.damageBonus) score += eq.damageBonus * 3;
  } else if (cls === "spear") {
    // Spearkin values damage and attack speed
    if (eq.damageBonus) score += eq.damageBonus * 3;
    if (eq.attackSpeedMultiplier && eq.attackSpeedMultiplier > 1.0) {
      score += (eq.attackSpeedMultiplier - 1.0) * 80;
    }
  }

  return Math.round(score);
}

export interface OptimizeGearResult {
  updatedRoster: UnitMember[];
  updatedInventory: Record<string, number>;
  changesCount: number;
}

/**
 * Optimizes equipment for all units of a given class (or all units in the roster if targetClass is omitted).
 * Pulls currently equipped gear for target units back into the candidate pool, sorts available items by score,
 * and equips the highest-scoring weapons and helmets to all units of that class.
 */
export function optimizeUnitsEquipment(
  roster: UnitMember[],
  inventory: Record<string, number>,
  targetClass?: UnitClass
): OptimizeGearResult {
  const targetUnits = targetClass ? roster.filter((u) => u.cls === targetClass) : roster;
  if (targetUnits.length === 0) {
    return {
      updatedRoster: [...roster],
      updatedInventory: { ...inventory },
      changesCount: 0,
    };
  }

  const updatedInv = { ...inventory };
  let changesCount = 0;

  // Gather pools per class if targetClass is not specified, or process class by class
  const classesToOptimize = targetClass
    ? [targetClass]
    : (Array.from(new Set(roster.map((u) => u.cls))) as UnitClass[]);

  const newRosterMap = new Map<string, UnitMember>(roster.map((u) => [u.id, { ...u }]));

  for (const cls of classesToOptimize) {
    const classUnits = roster.filter((u) => u.cls === cls);
    if (classUnits.length === 0) continue;

    // 1. Gather all weapons and helmets available for this class (inventory + already equipped on these units)
    const availableWeapons: string[] = [];
    const availableHelmets: string[] = [];

    // Collect from inventory
    for (const [itemId, qty] of Object.entries(updatedInv)) {
      if (qty <= 0) continue;
      const item = ITEMS[itemId];
      if (!item?.equipment) continue;
      if (!item.equipment.allowedClasses.includes(cls)) continue;

      for (let i = 0; i < qty; i++) {
        if (item.equipment.slot === "weapon") {
          availableWeapons.push(itemId);
        } else if (item.equipment.slot === "helmet") {
          availableHelmets.push(itemId);
        }
      }
    }

    // Collect from currently equipped units of this class
    for (const unit of classUnits) {
      if (unit.weapon) {
        availableWeapons.push(unit.weapon);
      }
      if (unit.helmet) {
        availableHelmets.push(unit.helmet);
      }
    }

    // Sort available items by score descending
    availableWeapons.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
    availableHelmets.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));

    // Clear target units' equipment from updatedInv tracking
    // (We will rebuild inventory at the end based on leftover items)
    // Remove all class-valid items from updatedInv temporarily
    for (const itemId of new Set([...availableWeapons, ...availableHelmets])) {
      delete updatedInv[itemId];
    }

    // 2. Assign best gear to each unit of this class
    let weaponIdx = 0;
    let helmetIdx = 0;

    for (const unit of classUnits) {
      const currentMember = newRosterMap.get(unit.id)!;
      let newWeapon: string | undefined = undefined;
      let newHelmet: string | undefined = undefined;

      if (cls !== "banner" && weaponIdx < availableWeapons.length) {
        newWeapon = availableWeapons[weaponIdx++];
      }

      if (helmetIdx < availableHelmets.length) {
        newHelmet = availableHelmets[helmetIdx++];
      }

      if (currentMember.weapon !== newWeapon || currentMember.helmet !== newHelmet) {
        changesCount++;
      }

      newRosterMap.set(unit.id, {
        ...currentMember,
        weapon: newWeapon,
        helmet: newHelmet,
      });
    }

    // 3. Put remaining unused items back into updatedInv
    for (let i = weaponIdx; i < availableWeapons.length; i++) {
      const id = availableWeapons[i];
      updatedInv[id] = (updatedInv[id] ?? 0) + 1;
    }
    for (let i = helmetIdx; i < availableHelmets.length; i++) {
      const id = availableHelmets[i];
      updatedInv[id] = (updatedInv[id] ?? 0) + 1;
    }
  }

  return {
    updatedRoster: roster.map((u) => newRosterMap.get(u.id) ?? u),
    updatedInventory: updatedInv,
    changesCount,
  };
}
