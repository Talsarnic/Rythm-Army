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
  // Wildlife
  kooda: 0.85,
  goretusk: 0.5,
  brute: 0.7,
  stag: 0.9,
  "sand-crab": 0.65,
  // Obstacles & Fortifications
  barricade: 0.5,
  "stone-wall": 0.6,
  watchtower: 0.75,
  "catapult-tower": 0.85,
  // Rival Tribe
  "tribe-spear": 0.55,
  "tribe-shield": 0.6,
  "tribe-bow": 0.55,
  "tribe-kiba": 0.65,
  "tribe-deka": 0.75,
  "tribe-tori": 0.7,
  // Bosses
  howl: 1.0,
  "drake-titan": 1.0,
  "colossus-golem": 1.0,
};

export const ENEMY_LOOT_TABLE: Record<EnemyKind, LootDropEntry[]> = {
  // Wildlife Drops
  kooda: [
    { itemId: "mat-meat-leather", weight: 35 },
    { itemId: "mat-veg-eyeball", weight: 35 },
    { itemId: "mat-wood-bitan", weight: 20 },
    { itemId: "mat-meat-tender", weight: 10 },
  ],
  goretusk: [
    { itemId: "mat-meat-leather", weight: 28 },
    { itemId: "mat-wood-bitan", weight: 22 },
    { itemId: "mat-stone-rock", weight: 18 },
    { itemId: "goretusk-fang", weight: 12 },
    { itemId: "mat-veg-eyeball", weight: 10 },
    { itemId: "spear-wood", weight: 4 },
    { itemId: "sword-wood", weight: 3 },
    { itemId: "helm-leather", weight: 3 },
  ],
  brute: [
    { itemId: "mat-meat-tender", weight: 20 },
    { itemId: "mat-stone-hardiron", weight: 20 },
    { itemId: "mat-alloy-hard", weight: 16 },
    { itemId: "mat-wood-hinoki", weight: 14 },
    { itemId: "brute-hide", weight: 10 },
    { itemId: "mat-veg-crying", weight: 8 },
    { itemId: "spear-iron", weight: 3 },
    { itemId: "sword-iron", weight: 3 },
    { itemId: "shield-iron", weight: 3 },
    { itemId: "bow-recurve", weight: 3 },
  ],
  stag: [
    { itemId: "mat-meat-tender", weight: 30 },
    { itemId: "mat-meat-dream", weight: 20 },
    { itemId: "mat-veg-crying", weight: 25 },
    { itemId: "mat-wood-cherry", weight: 15 },
    { itemId: "mat-stone-titanium", weight: 10 },
  ],
  "sand-crab": [
    { itemId: "mat-stone-hardiron", weight: 30 },
    { itemId: "mat-meat-tender", weight: 25 },
    { itemId: "mat-alloy-hard", weight: 25 },
    { itemId: "shield-iron", weight: 10 },
    { itemId: "helm-iron", weight: 10 },
  ],

  // Barriers & Fortifications Drops
  barricade: [
    { itemId: "mat-wood-bitan", weight: 50 },
    { itemId: "mat-wood-hinoki", weight: 30 },
    { itemId: "mat-stone-rock", weight: 20 },
  ],
  "stone-wall": [
    { itemId: "mat-stone-rock", weight: 40 },
    { itemId: "mat-stone-hardiron", weight: 35 },
    { itemId: "mat-alloy-sloppy", weight: 25 },
  ],
  watchtower: [
    { itemId: "mat-wood-hinoki", weight: 30 },
    { itemId: "mat-wood-cherry", weight: 25 },
    { itemId: "bow-wood", weight: 15 },
    { itemId: "bow-recurve", weight: 15 },
    { itemId: "helm-leather", weight: 15 },
  ],
  "catapult-tower": [
    { itemId: "mat-stone-titanium", weight: 30 },
    { itemId: "mat-alloy-awesome", weight: 25 },
    { itemId: "mat-wood-cedar", weight: 20 },
    { itemId: "bow-great", weight: 15 },
    { itemId: "shield-tower", weight: 10 },
  ],

  // Rival Tribe Squads Drops
  "tribe-spear": [
    { itemId: "mat-wood-bitan", weight: 30 },
    { itemId: "mat-stone-rock", weight: 25 },
    { itemId: "spear-wood", weight: 25 },
    { itemId: "spear-iron", weight: 20 },
  ],
  "tribe-shield": [
    { itemId: "mat-stone-hardiron", weight: 30 },
    { itemId: "mat-alloy-sloppy", weight: 25 },
    { itemId: "shield-wood", weight: 25 },
    { itemId: "shield-iron", weight: 20 },
  ],
  "tribe-bow": [
    { itemId: "mat-wood-bitan", weight: 35 },
    { itemId: "mat-meat-leather", weight: 25 },
    { itemId: "bow-wood", weight: 25 },
    { itemId: "bow-recurve", weight: 15 },
  ],
  "tribe-kiba": [
    { itemId: "mat-meat-tender", weight: 30 },
    { itemId: "mat-alloy-hard", weight: 25 },
    { itemId: "spear-iron", weight: 25 },
    { itemId: "spear-storm", weight: 20 },
  ],
  "tribe-deka": [
    { itemId: "mat-stone-hardiron", weight: 30 },
    { itemId: "mat-stone-titanium", weight: 25 },
    { itemId: "club-wood", weight: 25 },
    { itemId: "club-iron", weight: 20 },
  ],
  "tribe-tori": [
    { itemId: "mat-wood-cherry", weight: 30 },
    { itemId: "mat-stone-titanium", weight: 25 },
    { itemId: "spear-iron", weight: 25 },
    { itemId: "horn-sonic", weight: 20 },
  ],

  // Bosses Drops
  howl: [
    { itemId: "mat-meat-dream", weight: 18 },
    { itemId: "mat-stone-titanium", weight: 16 },
    { itemId: "mat-alloy-awesome", weight: 14 },
    { itemId: "mat-wood-cherry", weight: 14 },
    { itemId: "howl-core", weight: 10 },
    { itemId: "ancient-sigil", weight: 8 },
    { itemId: "sword-flame", weight: 4 },
    { itemId: "shield-tower", weight: 4 },
    { itemId: "bow-great", weight: 4 },
    { itemId: "club-crusher", weight: 4 },
    { itemId: "horn-sonic", weight: 2 },
    { itemId: "staff-thunder", weight: 2 },
  ],
  "drake-titan": [
    { itemId: "mat-meat-mystery", weight: 20 },
    { itemId: "mat-wood-cedar", weight: 18 },
    { itemId: "mat-stone-mythril", weight: 16 },
    { itemId: "mat-alloy-magic", weight: 16 },
    { itemId: "ancient-sigil", weight: 10 },
    { itemId: "sword-divine", weight: 5 },
    { itemId: "spear-storm", weight: 5 },
    { itemId: "shield-aegis-core", weight: 5 },
    { itemId: "bow-cyclone", weight: 5 },
  ],
  "colossus-golem": [
    { itemId: "mat-stone-mythril", weight: 24 },
    { itemId: "mat-alloy-magic", weight: 22 },
    { itemId: "mat-wood-cedar", weight: 18 },
    { itemId: "mat-meat-mystery", weight: 16 },
    { itemId: "ancient-sigil", weight: 10 },
    { itemId: "helm-crown", weight: 5 },
    { itemId: "club-crusher", weight: 5 },
  ],
};

export const MISSION_CLEAR_REWARDS: Record<string, MissionGuaranteedLoot[]> = {
  training: [
    { itemId: "mat-meat-leather", qty: 3 },
    { itemId: "mat-wood-bitan", qty: 3 },
    { itemId: "mat-stone-rock", qty: 2 },
    { itemId: "spear-wood", qty: 1 },
    { itemId: "sword-wood", qty: 1 },
    { itemId: "helm-leather", qty: 1 },
  ],
  "coast-hunt": [
    { itemId: "mat-meat-leather", qty: 4 },
    { itemId: "mat-veg-eyeball", qty: 3 },
    { itemId: "mat-wood-bitan", qty: 3 },
    { itemId: "spear-wood", qty: 1 },
    { itemId: "bow-wood", qty: 1 },
  ],
  "shadowmask-clash": [
    { itemId: "mat-meat-tender", qty: 3 },
    { itemId: "mat-stone-hardiron", qty: 3 },
    { itemId: "mat-alloy-sloppy", qty: 2 },
    { itemId: "shield-wood", qty: 1 },
    { itemId: "helm-iron", qty: 1 },
  ],
  "drake-caldera": [
    { itemId: "mat-meat-tender", qty: 4 },
    { itemId: "mat-stone-hardiron", qty: 3 },
    { itemId: "mat-alloy-hard", qty: 2 },
    { itemId: "arm-iron", qty: 1 },
    { itemId: "sword-iron", qty: 1 },
    { itemId: "spear-iron", qty: 1 },
  ],
  "swamp-hunt": [
    { itemId: "mat-meat-tender", qty: 3 },
    { itemId: "mat-veg-crying", qty: 3 },
    { itemId: "mat-wood-hinoki", qty: 3 },
    { itemId: "mat-alloy-hard", qty: 2 },
    { itemId: "bow-recurve", qty: 1 },
  ],
  "jungle-gate": [
    { itemId: "mat-meat-dream", qty: 3 },
    { itemId: "mat-wood-cherry", qty: 4 },
    { itemId: "mat-alloy-awesome", qty: 3 },
    { itemId: "sword-flame", qty: 1 },
    { itemId: "shield-tower", qty: 1 },
    { itemId: "bow-great", qty: 1 },
  ],
  "bastion-siege": [
    { itemId: "mat-meat-dream", qty: 3 },
    { itemId: "mat-stone-titanium", qty: 4 },
    { itemId: "mat-alloy-awesome", qty: 3 },
    { itemId: "arm-crusher", qty: 1 },
    { itemId: "staff-thunder", qty: 1 },
    { itemId: "horn-sonic", qty: 1 },
    { itemId: "club-crusher", qty: 1 },
  ],
  "iron-ridge": [
    { itemId: "mat-meat-dream", qty: 4 },
    { itemId: "mat-wood-cherry", qty: 4 },
    { itemId: "mat-stone-titanium", qty: 4 },
    { itemId: "howl-core", qty: 1 },
    { itemId: "club-iron", qty: 1 },
    { itemId: "horn-iron", qty: 1 },
  ],
  "golem-altar": [
    { itemId: "mat-meat-mystery", qty: 2 },
    { itemId: "mat-wood-cedar", qty: 2 },
    { itemId: "mat-stone-mythril", qty: 2 },
    { itemId: "mat-alloy-magic", qty: 2 },
    { itemId: "ancient-sigil", qty: 1 },
    { itemId: "arm-divine", qty: 1 },
    { itemId: "spear-storm", qty: 1 },
    { itemId: "sword-divine", qty: 1 },
    { itemId: "shield-aegis-core", qty: 1 },
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
