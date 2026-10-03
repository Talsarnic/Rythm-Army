import type { SaveData } from "./types";

const KEY = "rhythm-army-save";
const SAVE_VERSION = 1;

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  completed: [],
  bestCombo: 0,
  offsetMs: 0,
  settings: { master: 0.85, music: 0.45, sfx: 0.9, shake: 0.7 },
});

function migrate(raw: Partial<SaveData>): SaveData {
  const base = defaultSave();
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    settings: { ...base.settings, ...(raw.settings ?? {}) },
    offsetMs: typeof raw.offsetMs === "number" ? raw.offsetMs : 0,
    bestCombo: typeof raw.bestCombo === "number" ? raw.bestCombo : 0,
  };
}

export function loadSave(): SaveData {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return defaultSave();
    return migrate(JSON.parse(v) as Partial<SaveData>);
  } catch {
    return defaultSave();
  }
}

export function writeSave(save: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage unavailable */
  }
}
