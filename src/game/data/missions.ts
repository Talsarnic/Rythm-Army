import type { MissionDef } from "../types";

export const MISSIONS: MissionDef[] = [
  {
    id: "training",
    name: "First Drum",
    blurb: "Learn the four drums, then MARCH to the sun-disk shrine.",
    bpm: 112,
    worldLength: 2400,
    goalX: 1680,
    tutorial: true,
    waves: [],
  },
  {
    id: "dust-road",
    name: "Dust Road",
    blurb: "Goretusks block the caravan road. March, then ATTACK.",
    bpm: 118,
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
    bpm: 122,
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
    bpm: 126,
    worldLength: 3800,
    goalX: 3200,
    unlockAfter: "thorn-gate",
    waves: [
      { atX: 900, enemies: [{ kind: "goretusk", count: 2 }] },
      { atX: 1700, enemies: [{ kind: "howl", count: 1 }, { kind: "goretusk", count: 2 }] },
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
