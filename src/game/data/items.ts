import type { EquipSlot, UnitClass } from "../types";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic";
export type ItemCategory = "material" | "food" | "gear" | "relic";
export type GearType = "spear" | "bow" | "shield" | "helmet" | "banner";

export interface EquipmentStats {
  slot: EquipSlot;
  gearType: GearType;
  allowedClasses: UnitClass[];
  damageBonus?: number;
  attackSpeedMultiplier?: number; // e.g. 1.2 = 20% faster attack lunge/recovery
  rangeBonus?: number;
  hpBonus?: number;
  defenseBonus?: number; // 0..1 flat reduction (e.g. 0.15 = 15% defense)
}

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string; // Emoji / icon representation
  equipment?: EquipmentStats;
}

export const ITEMS: Record<string, ItemDef> = {
  // === GEAR: WEAPONS - SPEARS ===
  "spear-wood": {
    id: "spear-wood",
    name: "Wooden Spear",
    description: "Standard carved spear with decent thrust and balance.",
    category: "gear",
    rarity: "common",
    icon: "🍢",
    equipment: {
      slot: "weapon",
      gearType: "spear",
      allowedClasses: ["spear"],
      damageBonus: 0,
      attackSpeedMultiplier: 1.0,
      rangeBonus: 0,
    },
  },
  "spear-iron": {
    id: "spear-iron",
    name: "Iron Pike",
    description: "Reinforced iron-tipped spear dealing heavy piercing thrusts.",
    category: "gear",
    rarity: "uncommon",
    icon: "🗡️",
    equipment: {
      slot: "weapon",
      gearType: "spear",
      allowedClasses: ["spear"],
      damageBonus: 6,
      attackSpeedMultiplier: 1.15,
      rangeBonus: 20,
    },
  },
  "spear-fang": {
    id: "spear-fang",
    name: "Goretusk War-Spear",
    description: "Brutal barbed spear tipped with beast fangs. Swift and lethal.",
    category: "gear",
    rarity: "rare",
    icon: "🔱",
    equipment: {
      slot: "weapon",
      gearType: "spear",
      allowedClasses: ["spear"],
      damageBonus: 12,
      attackSpeedMultiplier: 1.35,
      rangeBonus: 40,
    },
  },

  // === GEAR: WEAPONS - BOWS ===
  "bow-wood": {
    id: "bow-wood",
    name: "Short Bow",
    description: "Simple wooden hunting bow with standard draw weight.",
    category: "gear",
    rarity: "common",
    icon: "🏹",
    equipment: {
      slot: "weapon",
      gearType: "bow",
      allowedClasses: ["bow"],
      damageBonus: 0,
      attackSpeedMultiplier: 1.0,
      rangeBonus: 0,
    },
  },
  "bow-recurve": {
    id: "bow-recurve",
    name: "Hunter's Recurve",
    description: "Flexible composite bow delivering fast, piercing volleys.",
    category: "gear",
    rarity: "uncommon",
    icon: "🏹",
    equipment: {
      slot: "weapon",
      gearType: "bow",
      allowedClasses: ["bow"],
      damageBonus: 4,
      attackSpeedMultiplier: 1.25,
      rangeBonus: 50,
    },
  },
  "bow-great": {
    id: "bow-great",
    name: "Howl Longbow",
    description: "Heavy iron-reinforced bow with extreme reach and impact.",
    category: "gear",
    rarity: "rare",
    icon: "🎯",
    equipment: {
      slot: "weapon",
      gearType: "bow",
      allowedClasses: ["bow"],
      damageBonus: 9,
      attackSpeedMultiplier: 1.1,
      rangeBonus: 100,
    },
  },

  // === GEAR: WEAPONS - SHIELDS ===
  "shield-wood": {
    id: "shield-wood",
    name: "Wooden Buckler",
    description: "Basic plank shield providing reliable baseline defense.",
    category: "gear",
    rarity: "common",
    icon: "🛡️",
    equipment: {
      slot: "weapon",
      gearType: "shield",
      allowedClasses: ["aegis"],
      damageBonus: 0,
      attackSpeedMultiplier: 1.0,
      rangeBonus: 0,
      defenseBonus: 0.05,
      hpBonus: 10,
    },
  },
  "shield-iron": {
    id: "shield-iron",
    name: "Iron Heater Shield",
    description: "Stout iron-rimmed shield that deflects heavy impacts and counter-strikes hard.",
    category: "gear",
    rarity: "uncommon",
    icon: "🛡️",
    equipment: {
      slot: "weapon",
      gearType: "shield",
      allowedClasses: ["aegis"],
      damageBonus: 4,
      attackSpeedMultiplier: 1.15,
      rangeBonus: 10,
      defenseBonus: 0.12,
      hpBonus: 24,
    },
  },
  "shield-tower": {
    id: "shield-tower",
    name: "Brute Bulwark",
    description: "Massive slab shield forged from monster plates. Grants impenetrable protection.",
    category: "gear",
    rarity: "rare",
    icon: "🛡️",
    equipment: {
      slot: "weapon",
      gearType: "shield",
      allowedClasses: ["aegis"],
      damageBonus: 8,
      attackSpeedMultiplier: 1.05,
      rangeBonus: 15,
      defenseBonus: 0.22,
      hpBonus: 45,
    },
  },

  // === GEAR: HELMETS ===
  "helm-leather": {
    id: "helm-leather",
    name: "Leather Cap",
    description: "Padded headgear offering light impact cushioning and comfort.",
    category: "gear",
    rarity: "common",
    icon: "🧢",
    equipment: {
      slot: "helmet",
      gearType: "helmet",
      allowedClasses: ["spear", "bow", "aegis", "banner"],
      hpBonus: 12,
      defenseBonus: 0.05,
    },
  },
  "helm-iron": {
    id: "helm-iron",
    name: "Iron Casque",
    description: "Solid forged skullcap that absorbs crushing blows.",
    category: "gear",
    rarity: "uncommon",
    icon: "🪖",
    equipment: {
      slot: "helmet",
      gearType: "helmet",
      allowedClasses: ["spear", "bow", "aegis", "banner"],
      hpBonus: 26,
      defenseBonus: 0.12,
    },
  },
  "helm-great": {
    id: "helm-great",
    name: "Greathelm of Fortitude",
    description: "Heavy plate helmet worn by elite champions. Grants immense vitality and defense.",
    category: "gear",
    rarity: "rare",
    icon: "👑",
    equipment: {
      slot: "helmet",
      gearType: "helmet",
      allowedClasses: ["spear", "bow", "aegis", "banner"],
      hpBonus: 48,
      defenseBonus: 0.2,
    },
  },
  "helm-crown": {
    id: "helm-crown",
    name: "Feathered War-Crown",
    description: "Ancient relic crown radiating rhythmic power, boosting the wearer's vitality.",
    category: "gear",
    rarity: "epic",
    icon: "⚜️",
    equipment: {
      slot: "helmet",
      gearType: "helmet",
      allowedClasses: ["spear", "bow", "aegis", "banner"],
      hpBonus: 70,
      defenseBonus: 0.28,
    },
  },

  // === MATERIALS ===
  "wood-branch": {
    id: "wood-branch",
    name: "Sturdy Branch",
    description: "Flexible hardwood branch used for bows and spear shafts.",
    category: "material",
    rarity: "common",
    icon: "🪵",
  },
  "iron-scrap": {
    id: "iron-scrap",
    name: "Iron Scrap",
    description: "Jagged pieces of battlefield iron. Essential for forging shields and spear tips.",
    category: "material",
    rarity: "common",
    icon: "🔩",
  },
  "stone-chunk": {
    id: "stone-chunk",
    name: "Hard Stone",
    description: "Dense river stones and quarry rocks used for fortifications and unit gear.",
    category: "material",
    rarity: "common",
    icon: "🪨",
  },
  "goretusk-fang": {
    id: "goretusk-fang",
    name: "Goretusk Fang",
    description: "Sharp curved tusk dropped by wild beasts.",
    category: "material",
    rarity: "common",
    icon: "🦷",
  },
  "beast-meat": {
    id: "beast-meat",
    name: "Tender Beast Meat",
    description: "Hearty ration collected from hunts to nourish the army.",
    category: "food",
    rarity: "common",
    icon: "🍖",
  },

  // === UNCOMMON MATERIALS ===
  "brute-hide": {
    id: "brute-hide",
    name: "Tuskbrute Hide",
    description: "Thick, layered leather that dampens heavy shockwaves.",
    category: "material",
    rarity: "uncommon",
    icon: "🛡️",
  },
  "drummer-resin": {
    id: "drummer-resin",
    name: "Drummer's Resin",
    description: "Aromatic sap that resonates with the rhythm of the drums.",
    category: "material",
    rarity: "uncommon",
    icon: "💧",
  },

  // === RARE / BOSS ITEMS ===
  "howl-core": {
    id: "howl-core",
    name: "Iron Howl Core",
    description: "Pulsing iron reactor retrieved from the defeated Iron Howl behemoth.",
    category: "relic",
    rarity: "rare",
    icon: "🔮",
  },
  "ancient-sigil": {
    id: "ancient-sigil",
    name: "Ancient Sigil",
    description: "A mysterious tribal token engraved with forgotten rhythm symbols.",
    category: "relic",
    rarity: "rare",
    icon: "✨",
  },
};
