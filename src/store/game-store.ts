import { create } from "zustand";
import { defaultSave, loadSave, writeSave } from "@/game/save";
import type { BattleResult, HudState, SaveData, ScreenId } from "@/game/types";

interface GameState {
  screen: ScreenId;
  save: SaveData;
  hydrated: boolean;
  missionId: string | null;
  result: BattleResult | null;
  hud: HudState | null;
  paused: boolean;
  hydrate: () => void;
  patchSave: (fn: (s: SaveData) => SaveData) => void;
  go: (screen: ScreenId) => void;
  startMission: (id: string) => void;
  setHud: (hud: HudState) => void;
  setPaused: (paused: boolean) => void;
  finishBattle: (result: BattleResult) => void;
}

export const useGame = create<GameState>((set, get) => ({
  screen: "title",
  save: defaultSave(),
  hydrated: false,
  missionId: null,
  result: null,
  hud: null,
  paused: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ save: loadSave(), hydrated: true });
  },
  patchSave: (fn) => {
    const save = fn(get().save);
    writeSave(save);
    set({ save });
  },
  go: (screen) => set({ screen, paused: false }),
  startMission: (id) => set({ screen: "battle", missionId: id, result: null, hud: null, paused: false }),
  setHud: (hud) => set({ hud }),
  setPaused: (paused) => set({ paused }),
  finishBattle: (result) => {
    if (result.win) {
      get().patchSave((s) => ({
        ...s,
        completed: s.completed.includes(result.missionId) ? s.completed : [...s.completed, result.missionId],
        bestCombo: Math.max(s.bestCombo, result.bestCombo),
      }));
    } else {
      get().patchSave((s) => ({ ...s, bestCombo: Math.max(s.bestCombo, result.bestCombo) }));
    }
    set({ result, screen: "result", paused: false });
  },
}));
