import type { EnemyKind } from "../types";

export interface LootDropEntry {
  itemId: string;
  weight: number; // relative weight when choosing an item drop
  chance?: number; // legacy/compatibility field if needed
}

export interface MissionGuaranteedLoot {
  itemId: string;
  qty: number;
}

/**
 * Drop table per enemy type.
 * At most 1 item drops per defeated mob.
 */
export const ENEMY_MOB_DROP_RATES: Record<EnemyKind, number> = {
  goretusk: 0.45, // 45% chance to drop 1 item
  brute: 0.60,    // 60% chance to drop 1 item
  howl: 1.0,      // 100% chance to drop 1 item
};

export const ENEMY_LOOT_TABLE: Record<EnemyKind, LootDropEntry[]> = {
  goretusk: [
    { itemId: "goretusk-fang", weight: 30 },
    { itemId: "beast-meat", weight: 30 },
    { itemId: "wood-branch", weight: 20 },
    { itemId: "stone-chunk", weight: 10 },
    { itemId: "spear-wood", weight: 6 },
    { itemId: "helm-leather", weight: 4 },
  ],
  brute: [
    { itemId: "brute-hide", weight: 25 },
    { itemId: "iron-scrap", weight: 25 },
    { itemId: "stone-chunk", weight: 15 },
    { itemId: "goretusk-fang", weight: 15 },
    { itemId: "spear-iron", weight: 5 },
    { itemId: "bow-recurve", weight: 5 },
    { itemId: "shield-iron", weight: 4 },
    { itemId: "helm-iron", weight: 4 },
    { itemId: "spear-fang", weight: 2 },
  ],
  howl: [
    { itemId: "howl-core", weight: 25 },
    { itemId: "ancient-sigil", weight: 20 },
    { itemId: "helm-great", weight: 14 },
    { itemId: "shield-tower", weight: 14 },
    { itemId: "bow-great", weight: 12 },
    { itemId: "spear-fang", weight: 8 },
    { itemId: "spear-storm", weight: 2 },
    { itemId: "bow-cyclone", weight: 2 },
    { itemId: "shield-aegis-core", weight: 2 },
    { itemId: "helm-crown", weight: 1 },
  ],
};

export const MISSION_CLEAR_REWARDS: Record<string, MissionGuaranteedLoot[]> = {
  training: [
    { itemId: "wood-branch", qty: 2 },
    { itemId: "beast-meat", qty: 2 },
    { itemId: "stone-chunk", qty: 1 },
    { itemId: "drummer-resin", qty: 1 },
    { itemId: "spear-wood", qty: 1 },
    { itemId: "helm-leather", qty: 1 },
  ],
  "dust-road": [
    { itemId: "wood-branch", qty: 2 },
    { itemId: "beast-meat", qty: 2 },
    { itemId: "stone-chunk", qty: 2 },
    { itemId: "iron-scrap", qty: 2 },
    { itemId: "bow-recurve", qty: 1 },
  ],
  "thorn-gate": [
    { itemId: "iron-scrap", qty: 2 },
    { itemId: "brute-hide", qty: 2 },
    { itemId: "spear-iron", qty: 1 },
    { itemId: "shield-iron", qty: 1 },
  ],
  "howls-gate": [
    { itemId: "iron-scrap", qty: 3 },
    { itemId: "drummer-resin", qty: 2 },
    { itemId: "ancient-sigil", qty: 1 },
    { itemId: "helm-great", qty: 1 },
    { itemId: "spear-fang", qty: 1 },
  ],
  "bone-canyon": [
    { itemId: "iron-scrap", qty: 4 },
    { itemId: "brute-hide", qty: 3 },
    { itemId: "stone-chunk", qty: 3 },
    { itemId: "shield-tower", qty: 1 },
    { itemId: "bow-great", qty: 1 },
  ],
  "iron-citadel": [
    { itemId: "iron-scrap", qty: 5 },
    { itemId: "howl-core", qty: 2 },
    { itemId: "ancient-sigil", qty: 2 },
    { itemId: "helm-great", qty: 1 },
    { itemId: "shield-aegis-core", qty: 1 },
  ],
  "storm-peak": [
    { itemId: "howl-core", qty: 3 },
    { itemId: "ancient-sigil", qty: 3 },
    { itemId: "spear-storm", qty: 1 },
    { itemId: "bow-cyclone", qty: 1 },
    { itemId: "helm-crown", qty: 1 },
  ],
};

export interface LootReward {
  itemId: string;
  qty: number;
}

/**
 * Calculates battle spoils based on defeated enemies and mission clear bonus.
 * Guarantees that at most 1 item drops per defeated enemy mob.
 * Accepts an optional random generator function for deterministic testing.
 */
export function rollBattleLoot(
  missionId: string,
  killedEnemies: EnemyKind[],
  rng: () => number = Math.random
): LootReward[] {
  const accumulated: Record<string, number> = {};

  // 1. Guaranteed level completion bonus rewards
  const missionGuaranteed = MISSION_CLEAR_REWARDS[missionId] ?? [];
  for (const reward of missionGuaranteed) {
    accumulated[reward.itemId] = (accumulated[reward.itemId] ?? 0) + reward.qty;
  }

  // 2. Roll drops for each defeated enemy (at most 1 item per mob)
  for (const kind of killedEnemies) {
    const dropRate = ENEMY_MOB_DROP_RATES[kind] ?? 0.5;
    if (rng() < dropRate) {
      const table = ENEMY_LOOT_TABLE[kind] ?? [];
      const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
      if (totalWeight > 0) {
        let rolledWeight = rng() * totalWeight;
        let chosenItem = table[0].itemId;
        for (const entry of table) {
          if (rolledWeight < entry.weight) {
            chosenItem = entry.itemId;
            break;
          }
          rolledWeight -= entry.weight;
        }
        accumulated[chosenItem] = (accumulated[chosenItem] ?? 0) + 1;
      }
    }
  }

  return Object.entries(accumulated).map(([itemId, qty]) => ({ itemId, qty }));
}

/**
 * Merges loot rewards into an existing inventory record.
 */
export function addLootToInventory(
  currentInventory: Record<string, number>,
  rewards: LootReward[]
): Record<string, number> {
  const updated = { ...currentInventory };
  for (const reward of rewards) {
    if (reward.qty > 0) {
      updated[reward.itemId] = (updated[reward.itemId] ?? 0) + reward.qty;
    }
  }
  return updated;
}
