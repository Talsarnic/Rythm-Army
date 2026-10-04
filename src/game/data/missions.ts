import type { MissionDef } from "../types";

export const MISSIONS: MissionDef[] = [
  {
    id: "training",
    name: "Prologue: Sacred Ground of Awakening",
    blurb: "Learn the ancient drums, then MARCH and ATTACK toward the sun-disk shrine.",
    bpm: 120,
    worldLength: 2400,
    goalX: 1680,
    tutorial: true,
    waves: [],
  },
  {
    id: "coast-hunt",
    name: "1. Hunting on the Coral Coast",
    blurb: "Hunt swift Kooda runners and wild Goretusks along the tropical shores for camp provisions.",
    bpm: 120,
    worldLength: 3200,
    goalX: 2800,
    unlockAfter: "training",
    waves: [
      { atX: 700, enemies: [{ kind: "kooda", count: 3 }, { kind: "goretusk", count: 2 }] },
      { atX: 1550, enemies: [{ kind: "kooda", count: 4 }, { kind: "goretusk", count: 2 }] },
    ],
  },
  {
    id: "shadowmask-clash",
    name: "2. The Masked Clan in the Jungle",
    blurb: "The mysterious Redmask Clan blocks the jungle pass with spearmen, shield guards, and archers.",
    bpm: 120,
    worldLength: 3600,
    goalX: 3100,
    unlockAfter: "coast-hunt",
    waves: [
      { atX: 750, enemies: [{ kind: "tribe-spear", count: 3 }, { kind: "tribe-shield", count: 2 }] },
      { atX: 1800, enemies: [{ kind: "tribe-bow", count: 3 }, { kind: "tribe-shield", count: 2 }, { kind: "tribe-spear", count: 2 }] },
    ],
  },
  {
    id: "drake-caldera",
    name: "3. Volcanic Drake of the Caldera",
    blurb: "The volcanic Drake Titan awakens! Time your DODGE and JUMP to avoid searing infernos.",
    bpm: 120,
    worldLength: 3800,
    goalX: 3300,
    unlockAfter: "shadowmask-clash",
    waves: [
      { atX: 800, enemies: [{ kind: "goretusk", count: 2 }, { kind: "brute", count: 1 }] },
      { atX: 2000, enemies: [{ kind: "drake-titan", count: 1 }] },
    ],
  },
  {
    id: "swamp-hunt",
    name: "4. Wild Game in the Misty Swamps",
    blurb: "Pursue elusive Golden Antler stags, swift Kooda, and Armored Sand Crabs in the deep mist.",
    bpm: 120,
    worldLength: 4200,
    goalX: 3650,
    unlockAfter: "drake-caldera",
    waves: [
      { atX: 750, enemies: [{ kind: "kooda", count: 3 }, { kind: "sand-crab", count: 2 }] },
      { atX: 1650, enemies: [{ kind: "stag", count: 2 }, { kind: "sand-crab", count: 2 }] },
      { atX: 2600, enemies: [{ kind: "stag", count: 2 }, { kind: "kooda", count: 2 }] },
    ],
  },
  {
    id: "jungle-gate",
    name: "5. Assault on the Jungle Gate",
    blurb: "Smash through fortified wooden barricades and bring down reinforced archer watchtowers.",
    bpm: 120,
    worldLength: 4600,
    goalX: 4000,
    unlockAfter: "swamp-hunt",
    waves: [
      { atX: 800, enemies: [{ kind: "barricade", count: 1 }, { kind: "tribe-spear", count: 3 }] },
      { atX: 1750, enemies: [{ kind: "watchtower", count: 1 }, { kind: "tribe-shield", count: 2 }, { kind: "tribe-bow", count: 2 }] },
      { atX: 2850, enemies: [{ kind: "barricade", count: 1 }, { kind: "watchtower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-spear", count: 2 }] },
    ],
  },
  {
    id: "bastion-siege",
    name: "6. Siege of the Iron Bastion",
    blurb: "Breach the massive stone gate ramparts, destroy heavy catapult towers, and defeat the Redmask elite.",
    bpm: 120,
    worldLength: 5000,
    goalX: 4400,
    unlockAfter: "jungle-gate",
    waves: [
      { atX: 850, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "tribe-shield", count: 3 }, { kind: "tribe-bow", count: 3 }] },
      { atX: 1950, enemies: [{ kind: "catapult-tower", count: 1 }, { kind: "tribe-kiba", count: 2 }, { kind: "tribe-tori", count: 2 }] },
      { atX: 3100, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "catapult-tower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-spear", count: 3 }] },
    ],
  },
  {
    id: "iron-ridge",
    name: "7. Iron Howl the Mountain Behemoth",
    blurb: "The thunderous Iron Howl behemoth guards the apex ridge. JUMP ground slams and press the assault!",
    bpm: 120,
    worldLength: 5400,
    goalX: 4800,
    unlockAfter: "bastion-siege",
    waves: [
      { atX: 850, enemies: [{ kind: "tribe-shield", count: 3 }, { kind: "tribe-spear", count: 3 }] },
      { atX: 1900, enemies: [{ kind: "tribe-kiba", count: 2 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-bow", count: 2 }] },
      { atX: 3100, enemies: [{ kind: "howl", count: 1 }, { kind: "tribe-shield", count: 3 }] },
    ],
  },
  {
    id: "golem-altar",
    name: "8. Awakening of the Ruin Colossus",
    blurb: "The ancient Ruin Golem Colossus awakens at the sacred shrine! Maintain rhythm and strike with full might!",
    bpm: 120,
    worldLength: 5800,
    goalX: 5200,
    unlockAfter: "iron-ridge",
    waves: [
      { atX: 900, enemies: [{ kind: "tribe-shield", count: 3 }, { kind: "tribe-tori", count: 2 }] },
      { atX: 2050, enemies: [{ kind: "catapult-tower", count: 1 }, { kind: "tribe-deka", count: 2 }, { kind: "tribe-kiba", count: 2 }] },
      { atX: 3200, enemies: [{ kind: "stone-wall", count: 1 }, { kind: "tribe-shield", count: 3 }, { kind: "tribe-bow", count: 3 }] },
      { atX: 4200, enemies: [{ kind: "colossus-golem", count: 1 }, { kind: "tribe-deka", count: 1 }, { kind: "tribe-tori", count: 2 }] },
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
