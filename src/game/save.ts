import { createStarterRoster, getDefaultStarterGear } from "./data/units.ts";
import type { SaveData, UnitMember } from "./types.ts";

const KEY = "rhythm-army-save";
export const SAVE_VERSION = 3;

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  completed: [],
  bestCombo: 0,
  offsetMs: 0,
  roster: createStarterRoster(),
  inventory: {},
  settings: { master: 0.85, music: 0.45, sfx: 0.9, shake: 0.7 },
});

export function migrate(raw: Partial<SaveData> & { version?: number }): SaveData {
  const base = defaultSave();

  // Validate or build roster
  let roster: UnitMember[] = base.roster;
  if (Array.isArray(raw.roster) && raw.roster.length > 0) {
    roster = raw.roster
      .filter((u): u is UnitMember => Boolean(u && typeof u.id === "string" && typeof u.cls === "string"))
      .map((u) => {
        const defaultGear = getDefaultStarterGear(u.cls);
        return {
          id: u.id,
          cls: u.cls,
          level: typeof u.level === "number" && u.level > 0 ? u.level : 1,
          weapon: typeof u.weapon === "string" ? u.weapon : defaultGear.weapon,
          shield: typeof u.shield === "string" ? u.shield : defaultGear.shield,
          helmet: typeof u.helmet === "string" ? u.helmet : defaultGear.helmet,
        };
      });
    if (roster.length === 0) roster = base.roster;
  }

  // Validate inventory
  const inventory: Record<string, number> = {};
  if (raw.inventory && typeof raw.inventory === "object" && !Array.isArray(raw.inventory)) {
    for (const [k, v] of Object.entries(raw.inventory)) {
      if (typeof v === "number" && v > 0) {
        inventory[k] = Math.floor(v);
      }
    }
  }

  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    roster,
    inventory,
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    offsetMs: typeof raw.offsetMs === "number" ? raw.offsetMs : 0,
    bestCombo: typeof raw.bestCombo === "number" ? raw.bestCombo : 0,
  };
}

export function loadSave(): SaveData {
  try {
    if (typeof localStorage === "undefined") return defaultSave();
    const v = localStorage.getItem(KEY);
    if (!v) return defaultSave();
    return migrate(JSON.parse(v) as Partial<SaveData>);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: SaveData) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage unavailable */
  }
}
