import type { MissionDef } from "../types";

export const MISSIONS: MissionDef[] = [
  {
    id: "training",
    name: "First Drum",
    blurb: "Learn the four drums, then MARCH to the sun-disk shrine.",
    bpm: 120,
    worldLength: 2400,
    goalX: 1680,
    tutorial: true,
    waves: [],
  },
  {
    id: "dust-road",
    name: "Dust Road",
    blurb: "Goretusks block the caravan road. March, then ATTACK.",
    bpm: 120,
    worldLength: 3200,
    goalX: 2800,
    unlockAfter: "training",
    waves: [
      { atX: 720, enemies: [{ kind: "goretusk", count: 3 }] },
      { atX: 1480, enemies: [{ kind: "goretusk", count: 4 }] },
    ],
  },
  {
    id: "thorn-gate",
    name: "Thorn Gate",
    blurb: "A Tuskbrute leads the pack. DEFEND the slams, then strike.",
    bpm: 120,
    worldLength: 3600,
    goalX: 3100,
    unlockAfter: "dust-road",
    waves: [
      { atX: 640, enemies: [{ kind: "goretusk", count: 3 }] },
      { atX: 1280, enemies: [{ kind: "goretusk", count: 3 }, { kind: "brute", count: 1 }] },
      { atX: 2100, enemies: [{ kind: "goretusk", count: 4 }, { kind: "brute", count: 1 }] },
    ],
  },
  {
    id: "howls-gate",
    name: "Howl's Gate",
    blurb: "Iron Howl waits. JUMP the ground slam. CHARGE when Fever hits.",
    bpm: 120,
    worldLength: 4000,
    goalX: 3400,
    unlockAfter: "thorn-gate",
    waves: [
      { atX: 800, enemies: [{ kind: "goretusk", count: 3 }] },
      { atX: 1600, enemies: [{ kind: "brute", count: 1 }, { kind: "goretusk", count: 2 }] },
      { atX: 2400, enemies: [{ kind: "howl", count: 1 }, { kind: "goretusk", count: 2 }] },
    ],
  },
  {
    id: "bone-canyon",
    name: "Bone Canyon",
    blurb: "Savage beasts prowl the narrow gorge. Maintain rhythm and break the vanguard.",
    bpm: 120,
    worldLength: 4500,
    goalX: 3900,
    unlockAfter: "howls-gate",
    waves: [
      { atX: 800, enemies: [{ kind: "goretusk", count: 4 }] },
      { atX: 1650, enemies: [{ kind: "brute", count: 2 }, { kind: "goretusk", count: 2 }] },
      { atX: 2600, enemies: [{ kind: "brute", count: 2 }, { kind: "goretusk", count: 4 }] },
    ],
  },
  {
    id: "iron-citadel",
    name: "Iron Citadel",
    blurb: "Heavily fortified ruins guarded by armor-clad behemoths. Advance under steady guard.",
    bpm: 120,
    worldLength: 5000,
    goalX: 4400,
    unlockAfter: "bone-canyon",
    waves: [
      { atX: 750, enemies: [{ kind: "brute", count: 1 }, { kind: "goretusk", count: 3 }] },
      { atX: 1600, enemies: [{ kind: "howl", count: 1 }, { kind: "goretusk", count: 3 }] },
      { atX: 2500, enemies: [{ kind: "brute", count: 2 }, { kind: "goretusk", count: 3 }] },
      { atX: 3350, enemies: [{ kind: "howl", count: 1 }, { kind: "brute", count: 1 }] },
    ],
  },
  {
    id: "storm-peak",
    name: "Storm Peak",
    blurb: "The apex summit where thunder and ancient beasts collide. Unleash full rhythm frenzy!",
    bpm: 120,
    worldLength: 5600,
    goalX: 5000,
    unlockAfter: "iron-citadel",
    waves: [
      { atX: 850, enemies: [{ kind: "brute", count: 2 }, { kind: "goretusk", count: 3 }] },
      { atX: 1800, enemies: [{ kind: "howl", count: 1 }, { kind: "goretusk", count: 4 }] },
      { atX: 2850, enemies: [{ kind: "brute", count: 2 }, { kind: "goretusk", count: 4 }] },
      { atX: 3900, enemies: [{ kind: "howl", count: 1 }, { kind: "brute", count: 2 }] },
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
