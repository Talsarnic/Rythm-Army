import type { EnemyKind, UnitClass, UnitMember } from "../types";
import { ITEMS } from "./items.ts";

export interface ClassStats {
  id: UnitClass;
  name: string;
  roleTitle: string;
  sprite: string;
  hp: number;
  damage: number;
  range: number;
  role: "melee" | "ranged" | "tank" | "flag" | "magic";
  slots: ("weapon" | "shield" | "helmet")[];
}

export const CLASSES: Record<UnitClass, ClassStats> = {
  banner: {
    id: "banner",
    name: "Bannerkin",
    roleTitle: "Standard Bearer",
    sprite: "bannerkin-idle",
    hp: 55,
    damage: 0,
    range: 0,
    role: "flag",
    slots: ["helmet"],
  },
  spear: {
    id: "spear",
    name: "Spearkin",
    roleTitle: "Spear Hurler",
    sprite: "spearkin-idle",
    hp: 44,
    damage: 14,
    range: 380,
    role: "ranged",
    slots: ["weapon", "helmet"],
  },
  aegis: {
    id: "aegis",
    name: "Aegiskin",
    roleTitle: "Shield Guard",
    sprite: "aegiskin-idle",
    hp: 80,
    damage: 10,
    range: 75,
    role: "tank",
    slots: ["weapon", "shield", "helmet"],
  },
  bow: {
    id: "bow",
    name: "Bowkin",
    roleTitle: "Storm Archer",
    sprite: "bowkin-idle",
    hp: 34,
    damage: 9,
    range: 420,
    role: "ranged",
    slots: ["weapon", "helmet"],
  },
  kiba: {
    id: "kiba",
    name: "Horsekin",
    roleTitle: "Cavalry Charger",
    sprite: "kibakin-idle",
    hp: 68,
    damage: 18,
    range: 120,
    role: "melee",
    slots: ["weapon", "helmet"],
  },
  deka: {
    id: "deka",
    name: "Bludgeonkin",
    roleTitle: "Heavy Smasher",
    sprite: "dekakin-idle",
    hp: 125,
    damage: 24,
    range: 85,
    role: "melee",
    slots: ["weapon", "helmet"],
  },
  mega: {
    id: "mega",
    name: "Warhornkin",
    roleTitle: "Sonic Blaster",
    sprite: "megakin-idle",
    hp: 42,
    damage: 13,
    range: 360,
    role: "ranged",
    slots: ["weapon", "helmet"],
  },
  tori: {
    id: "tori",
    name: "Wingkin",
    roleTitle: "Sky Lancer",
    sprite: "torikin-idle",
    hp: 46,
    damage: 15,
    range: 310,
    role: "ranged",
    slots: ["weapon", "helmet"],
  },
  maho: {
    id: "maho",
    name: "Magekin",
    roleTitle: "Mystic Channeler",
    sprite: "mahokin-idle",
    hp: 36,
    damage: 17,
    range: 400,
    role: "magic",
    slots: ["weapon", "helmet"],
  },
  robo: {
    id: "robo",
    name: "Mechakin",
    roleTitle: "Fist Brawler",
    sprite: "robokin-idle",
    hp: 110,
    damage: 22,
    range: 95,
    role: "melee",
    slots: ["weapon", "helmet"],
  },
};

export interface EffectiveUnitStats {
  hp: number;
  damage: number;
  range: number;
  defense: number; // 0..1 flat reduction
  attackSpeed: number; // multiplier e.g. 1.0, 1.25
  role: "melee" | "ranged" | "tank" | "flag" | "magic";
}

export function computeUnitStats(unit: UnitMember): EffectiveUnitStats {
  const base = CLASSES[unit.cls] ?? CLASSES.banner;
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

  if (unit.shield) {
    const shieldDef = ITEMS[unit.shield];
    if (shieldDef?.equipment) {
      damage += shieldDef.equipment.damageBonus ?? 0;
      range += shieldDef.equipment.rangeBonus ?? 0;
      defense += shieldDef.equipment.defenseBonus ?? 0;
      hp += shieldDef.equipment.hpBonus ?? 0;
      attackSpeed *= shieldDef.equipment.attackSpeedMultiplier ?? 1.0;
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
    defense: Math.min(0.85, Math.max(0, defense)),
    attackSpeed: Math.max(0.5, attackSpeed),
    role: base.role,
  };
}

export interface EnemyStatDef {
  name: string;
  sprite: string;
  hp: number;
  damage: number;
  range: number;
  speed: number;
  scale: number;
  isBoss?: boolean;
  isStationary?: boolean;
  isRanged?: boolean;
  isFleeing?: boolean;
  flying?: boolean;
}

export const ENEMY_STATS: Record<EnemyKind, EnemyStatDef> = {
  // --- Wildlife / Hunting Beasts ---
  kooda: {
    name: "Swift Kooda",
    sprite: "kooda-idle",
    hp: 22,
    damage: 0,
    range: 160,
    speed: 75,
    scale: 0.8,
    isFleeing: true,
  },
  goretusk: {
    name: "Goretusk",
    sprite: "goretusk-idle",
    hp: 42,
    damage: 8,
    range: 70,
    speed: 46,
    scale: 0.92,
  },
  brute: {
    name: "Tuskbrute",
    sprite: "goretusk-idle",
    hp: 95,
    damage: 15,
    range: 82,
    speed: 32,
    scale: 1.28,
  },
  stag: {
    name: "Golden Antler",
    sprite: "stag-idle",
    hp: 58,
    damage: 0,
    range: 180,
    speed: 80,
    scale: 1.05,
    isFleeing: true,
  },
  "sand-crab": {
    name: "Ironback Scuttler",
    sprite: "crab-idle",
    hp: 120,
    damage: 12,
    range: 65,
    speed: 26,
    scale: 1.15,
  },

  // --- Obstacles & Fortifications ---
  barricade: {
    name: "Wood Palisade",
    sprite: "barricade-idle",
    hp: 150,
    damage: 0,
    range: 0,
    speed: 0,
    scale: 1.1,
    isStationary: true,
  },
  "stone-wall": {
    name: "Stone Gate Rampart",
    sprite: "stone-wall-idle",
    hp: 340,
    damage: 0,
    range: 0,
    speed: 0,
    scale: 1.35,
    isStationary: true,
  },
  watchtower: {
    name: "Archer Watchtower",
    sprite: "watchtower-idle",
    hp: 220,
    damage: 10,
    range: 320,
    speed: 0,
    scale: 1.3,
    isStationary: true,
    isRanged: true,
  },
  "catapult-tower": {
    name: "Ballista Bastion",
    sprite: "catapult-tower-idle",
    hp: 450,
    damage: 24,
    range: 420,
    speed: 0,
    scale: 1.55,
    isStationary: true,
    isRanged: true,
  },

  // --- Rival Tribal Squads (Red Mask Warriors) ---
  "tribe-spear": {
    name: "Redmask Lancer",
    sprite: "tribe-spear-idle",
    hp: 36,
    damage: 9,
    range: 240,
    speed: 40,
    scale: 0.95,
    isRanged: true,
  },
  "tribe-shield": {
    name: "Redmask Bulwark",
    sprite: "tribe-shield-idle",
    hp: 75,
    damage: 7,
    range: 60,
    speed: 36,
    scale: 0.98,
  },
  "tribe-bow": {
    name: "Redmask Archer",
    sprite: "tribe-bow-idle",
    hp: 30,
    damage: 8,
    range: 340,
    speed: 34,
    scale: 0.92,
    isRanged: true,
  },
  "tribe-kiba": {
    name: "Redmask Rider",
    sprite: "tribe-kiba-idle",
    hp: 70,
    damage: 16,
    range: 75,
    speed: 70,
    scale: 1.05,
  },
  "tribe-deka": {
    name: "Redmask Crusher",
    sprite: "tribe-deka-idle",
    hp: 140,
    damage: 22,
    range: 75,
    speed: 25,
    scale: 1.35,
  },
  "tribe-tori": {
    name: "Redmask Skystriker",
    sprite: "tribe-tori-idle",
    hp: 48,
    damage: 12,
    range: 220,
    speed: 48,
    scale: 1.0,
    flying: true,
    isRanged: true,
  },

  // --- Colossal Bosses ---
  howl: {
    name: "Iron Howl",
    sprite: "howl-idle",
    hp: 420,
    damage: 22,
    range: 110,
    speed: 22,
    scale: 1.7,
    isBoss: true,
  },
  "drake-titan": {
    name: "Pyro Drake Volcan",
    sprite: "drake-idle",
    hp: 780,
    damage: 32,
    range: 140,
    speed: 18,
    scale: 2.1,
    isBoss: true,
  },
  "colossus-golem": {
    name: "Ruin Golem Colossus",
    sprite: "golem-idle",
    hp: 1150,
    damage: 40,
    range: 130,
    speed: 14,
    scale: 2.3,
    isBoss: true,
  },
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
  spear: 6,
  aegis: 6,
  bow: 6,
  kiba: 3,
  deka: 3,
  mega: 3,
  tori: 3,
  maho: 3,
  robo: 3,
};

export interface UnitCreationCost {
  materials: Record<string, number>;
}

export const UNIT_CREATION_RECIPES: Record<Exclude<UnitClass, "banner">, UnitCreationCost> = {
  spear: {
    materials: {
      "mat-meat-leather": 2,
      "mat-wood-bitan": 2,
      "mat-stone-rock": 1,
    },
  },
  aegis: {
    materials: {
      "mat-meat-leather": 2,
      "mat-stone-rock": 2,
      "mat-alloy-sloppy": 1,
    },
  },
  bow: {
    materials: {
      "mat-meat-leather": 2,
      "mat-wood-bitan": 3,
      "mat-stone-rock": 1,
    },
  },
  kiba: {
    materials: {
      "mat-meat-tender": 2,
      "mat-alloy-hard": 2,
      "mat-wood-hinoki": 1,
    },
  },
  deka: {
    materials: {
      "mat-meat-tender": 3,
      "mat-stone-hardiron": 2,
      "mat-alloy-hard": 1,
    },
  },
  mega: {
    materials: {
      "mat-wood-cherry": 2,
      "mat-alloy-hard": 2,
      "mat-meat-tender": 1,
    },
  },
  tori: {
    materials: {
      "mat-meat-tender": 2,
      "mat-wood-cherry": 2,
      "mat-stone-titanium": 1,
    },
  },
  maho: {
    materials: {
      "mat-wood-cherry": 2,
      "mat-alloy-awesome": 1,
      "mat-meat-dream": 1,
    },
  },
  robo: {
    materials: {
      "mat-stone-hardiron": 3,
      "mat-alloy-hard": 2,
      "mat-meat-tender": 2,
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
    // Check direct material ID or alias
    const available = (inventory[matId] ?? 0) + (inventory[getMaterialAlias(matId)] ?? 0);
    if (available < reqQty) {
      return { allowed: false, reason: `Missing materials.` };
    }
  }

  return { allowed: true };
}

function getMaterialAlias(matId: string): string {
  const aliases: Record<string, string> = {
    "mat-meat-leather": "beast-meat",
    "mat-wood-bitan": "wood-branch",
    "mat-stone-rock": "stone-chunk",
    "mat-stone-hardiron": "iron-scrap",
    "mat-alloy-sloppy": "iron-scrap",
    "beast-meat": "mat-meat-leather",
    "wood-branch": "mat-wood-bitan",
    "stone-chunk": "mat-stone-rock",
    "iron-scrap": "mat-stone-hardiron",
  };
  return aliases[matId] ?? "";
}

export function getDefaultStarterGear(cls: UnitClass): { weapon?: string; shield?: string; helmet?: string } {
  switch (cls) {
    case "spear":
      return { weapon: "spear-wood", helmet: "helm-leather" };
    case "aegis":
      return { weapon: "sword-wood", shield: "shield-wood", helmet: "helm-leather" };
    case "bow":
      return { weapon: "bow-wood", helmet: "helm-leather" };
    case "kiba":
      return { weapon: "spear-wood", helmet: "helm-leather" };
    case "deka":
      return { weapon: "club-wood", helmet: "helm-leather" };
    case "mega":
      return { weapon: "horn-wood", helmet: "helm-leather" };
    case "tori":
      return { weapon: "spear-wood", helmet: "helm-leather" };
    case "maho":
      return { weapon: "staff-wood", helmet: "helm-leather" };
    case "robo":
      return { weapon: "arm-wood", helmet: "helm-leather" };
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
      shield: gear.shield,
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
    if (eq.defenseBonus) score += eq.defenseBonus * 80;
    if (eq.hpBonus) score += eq.hpBonus * 1.5;
  } else if (cls === "bow" || cls === "mega" || cls === "maho") {
    if (eq.rangeBonus) score += eq.rangeBonus * 0.5;
    if (eq.damageBonus) score += eq.damageBonus * 3;
  } else if (cls === "spear" || cls === "kiba" || cls === "tori") {
    if (eq.damageBonus) score += eq.damageBonus * 3;
    if (eq.attackSpeedMultiplier && eq.attackSpeedMultiplier > 1.0) {
      score += (eq.attackSpeedMultiplier - 1.0) * 80;
    }
  } else if (cls === "deka" || cls === "robo") {
    if (eq.damageBonus) score += eq.damageBonus * 5;
    if (eq.hpBonus) score += eq.hpBonus * 2.0;
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
 * and equips the highest-scoring weapons, shields, and helmets to all units of that class.
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

  const classesToOptimize = targetClass
    ? [targetClass]
    : (Array.from(new Set(roster.map((u) => u.cls))) as UnitClass[]);

  const newRosterMap = new Map<string, UnitMember>(roster.map((u) => [u.id, { ...u }]));

  for (const cls of classesToOptimize) {
    const classUnits = roster.filter((u) => u.cls === cls);
    if (classUnits.length === 0) continue;

    // 1. Gather all weapons, shields and helmets available for this class
    const availableWeapons: string[] = [];
    const availableShields: string[] = [];
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
        } else if (item.equipment.slot === "shield") {
          availableShields.push(itemId);
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
      if (unit.shield) {
        availableShields.push(unit.shield);
      }
      if (unit.helmet) {
        availableHelmets.push(unit.helmet);
      }
    }

    // Sort available items by score descending
    availableWeapons.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
    availableShields.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));
    availableHelmets.sort((a, b) => getGearScore(b, cls) - getGearScore(a, cls));

    // Remove all class-valid items from updatedInv temporarily
    for (const itemId of new Set([...availableWeapons, ...availableShields, ...availableHelmets])) {
      delete updatedInv[itemId];
    }

    // 2. Assign best gear to each unit of this class
    let weaponIdx = 0;
    let shieldIdx = 0;
    let helmetIdx = 0;

    for (const unit of classUnits) {
      const currentMember = newRosterMap.get(unit.id)!;
      let newWeapon: string | undefined = undefined;
      let newShield: string | undefined = undefined;
      let newHelmet: string | undefined = undefined;

      if (cls !== "banner" && weaponIdx < availableWeapons.length) {
        newWeapon = availableWeapons[weaponIdx++];
      }

      if (cls === "aegis" && shieldIdx < availableShields.length) {
        newShield = availableShields[shieldIdx++];
      }

      if (helmetIdx < availableHelmets.length) {
        newHelmet = availableHelmets[helmetIdx++];
      }

      if (
        currentMember.weapon !== newWeapon ||
        currentMember.shield !== newShield ||
        currentMember.helmet !== newHelmet
      ) {
        changesCount++;
      }

      newRosterMap.set(unit.id, {
        ...currentMember,
        weapon: newWeapon,
        shield: newShield,
        helmet: newHelmet,
      });
    }

    // 3. Put remaining unused items back into updatedInv
    for (let i = weaponIdx; i < availableWeapons.length; i++) {
      const id = availableWeapons[i];
      updatedInv[id] = (updatedInv[id] ?? 0) + 1;
    }
    for (let i = shieldIdx; i < availableShields.length; i++) {
      const id = availableShields[i];
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
