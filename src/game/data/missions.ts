import type { MissionDef } from "../types";

export const MISSIONS: MissionDef[] = [
  {
    id: "training",
    name: "Prologue: Sacred Ground of Awakening",
    blurb: "Learn the ancient drums, then MARCH and ATTACK toward the sun-disk shrine.",
    bpm: 120,
    worldLength: 2600,
    goalX: 2000,
    tutorial: true,
    waves: [],
  },
  {
    id: "coast-hunt",
    name: "1. Hunting on the Coral Coast",
    blurb: "Hunt swift Kooda runners and wild Goretusks along the tropical shores for camp provisions.",
    bpm: 120,
    worldLength: 3600,
    goalX: 3200,
    unlockAfter: "training",
    waves: [
      { atX: 900, enemies: [{ kind: "kooda", count: 3 }, { kind: "goretusk", count: 2 }] },
      { atX: 1950, enemies: [{ kind: "kooda", count: 4 }, { kind: "goretusk", count: 2 }] },
    ],
  },
  {
    id: "shadowmask-clash",
    name: "2. The Masked Clan in the Jungle",
    blurb: "The mysterious Redmask Clan blocks the jungle pass with spearmen, shield guards, and archers.",
    bpm: 120,
    worldLength: 4000,
    goalX: 3600,
    unlockAfter: "coast-hunt",
    waves: [
      { atX: 1000, enemies: [{ kind: "tribe-spear", count: 3 }, { kind: "tribe-shield", count: 2 }] },
      { atX: 2200, enemies: [{ kind: "tribe-bow", count: 3 }, { kind: "tribe-shield", count: 2 }, { kind: "tribe-spear", count: 2 }] },
    ],
  },
  {
    id: "drake-caldera",
    name: "3. Volcanic Drake of the Caldera",
    blurb: "The volcanic Drake Titan awakens! Time your DODGE and JUMP to avoid searing infernos.",
    bpm: 120,
    worldLength: 4400,
    goalX: 4000,
    unlockAfter: "shadowmask-clash",
    waves: [
      { atX: 1050, enemies: [{ kind: "goretusk", count: 2 }, { kind: "brute", count: 1 }] },
      { atX: 2450, enemies: [{ kind: "drake-titan", count: 1 }] },
    ],
  },
  {
    id: "swamp-hunt",
    name: "4. Wild Game in the Misty Swamps",
    blurb: "Pursue elusive Golden Antler stags, swift Kooda, and Armored Sand Crabs in the deep mist.",
    bpm: 120,
    worldLength: 4800,
    goalX: 4350,
    unlockAfter: "drake-caldera",
    waves: [
      { atX: 950, enemies: [{ kind: "kooda", count: 3 }, { kind: "sand-crab", count: 2 }] },
      { atX: 2050, enemies: [{ kind: "stag", count: 2 }, { kind: "sand-crab", count: 2 }] },
      { atX: 3150, enemies: [{ kind: "stag", count: 2 }, { kind: "kooda", count: 2 }] },
    ],
  },
  {
    id: "jungle-gate",
    name: "5. Assault on the Jungle Gate",
    blurb: "Smash through fortified wooden barricades and bring down reinforced archer watchtowers.",
    bpm: 120,
    worldLength: 5200,
    goalX: 4750,
    unlockAfter: "swamp-hunt",
    waves: [
      { atX: 1000, enemies: [{ kind: "barricade", count: 1 }, { kind: "tribe-spear", count: 3 }] },
      { atX: 2150, enemies: [{ kind: "watchtower", count: 1 }, { kind: "tribe-shield", count: 2 }, { kind: "tribe-bow", count: 2 }] },
      { atX: 3350, enemies: [{ kind: "barricade", count: 1 }, { kind: "watchtower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-spear", count: 2 }] },
    ],
  },
  {
    id: "bastion-siege",
    name: "6. Siege of the Iron Bastion",
    blurb: "Breach the massive stone gate ramparts, destroy heavy catapult towers, and defeat the Redmask elite.",
    bpm: 120,
    worldLength: 5800,
    goalX: 5300,
    unlockAfter: "jungle-gate",
    waves: [
      { atX: 1100, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "tribe-shield", count: 3 }, { kind: "tribe-bow", count: 3 }] },
      { atX: 2450, enemies: [{ kind: "catapult-tower", count: 1 }, { kind: "tribe-kiba", count: 2 }, { kind: "tribe-tori", count: 2 }] },
      { atX: 3800, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "catapult-tower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-spear", count: 3 }] },
    ],
  },
  {
    id: "iron-ridge",
    name: "7. Iron Howl the Mountain Behemoth",
    blurb: "The thunderous Iron Howl behemoth guards the apex ridge. JUMP ground slams and press the assault!",
    bpm: 120,
    worldLength: 6200,
    goalX: 5700,
    unlockAfter: "bastion-siege",
    waves: [
      { atX: 1100, enemies: [{ kind: "tribe-shield", count: 3 }, { kind: "tribe-spear", count: 3 }] },
      { atX: 2400, enemies: [{ kind: "tribe-kiba", count: 2 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-bow", count: 2 }] },
      { atX: 3950, enemies: [{ kind: "howl", count: 1 }, { kind: "tribe-shield", count: 3 }] },
    ],
  },
  {
    id: "golem-altar",
    name: "8. Awakening of the Ruin Colossus",
    blurb: "The ancient Ruin Golem Colossus awakens at the sacred shrine! Maintain rhythm and strike with full might!",
    bpm: 120,
    worldLength: 6800,
    goalX: 6300,
    unlockAfter: "iron-ridge",
    waves: [
      { atX: 1150, enemies: [{ kind: "tribe-shield", count: 3 }, { kind: "tribe-tori", count: 2 }] },
      { atX: 2550, enemies: [{ kind: "catapult-tower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-kiba", count: 2 }] },
      { atX: 4000, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "tribe-shield", count: 3 }, { kind: "tribe-bow", count: 3 }] },
      { atX: 5150, enemies: [{ kind: "colossus-golem", count: 1 }, { kind: "tribe-deka", count: 1 }, { kind: "tribe-tori", count: 2 }] },
    ],
  },
];

export function missionById(id: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.id === id);
}

export function isUnlocked(id: string, completed: string[]): boolean {
  const m = missionById(id);
  if (!m) return false;
  if (!m.unlockAfter) return true;
  return completed.includes(m.unlockAfter);
}

export function getNextPlayableMissionId(completed: string[]): string {
  if (MISSIONS.length === 0) return "training";
  const uncleared = MISSIONS.find((m) => !completed.includes(m.id) && isUnlocked(m.id, completed));
  if (uncleared) return uncleared.id;

  // If all are cleared, return the furthest completed mission in order of the campaign
  for (let i = MISSIONS.length - 1; i >= 0; i--) {
    if (completed.includes(MISSIONS[i]!.id)) {
      return MISSIONS[i]!.id;
    }
  }

  return MISSIONS[0]!.id;
}
