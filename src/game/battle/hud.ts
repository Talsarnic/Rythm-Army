import { INPUT_BEATS, MEASURE_BEATS } from "../data/commands.ts";
import type { HudState } from "../types";

export interface HudInput {
  combo: number;
  fever: boolean;
  /** Position in beats on the rhythm clock. Negative until the first drum starts it. */
  beatPos: number;
  /** Name of the running command, if any. */
  commandName: string | null;
  /** Fallback label shown when there is no command, such as the last timing grade. */
  lastGrade: string | null;
  armyHp: number;
  armyMax: number;
  banner: { hp: number; maxHp: number } | null;
  boss: { name: string; hp: number; maxHp: number } | null;
  tutorial: string;
  telegraph: string | null;
}

/** Turn battle state into what the React HUD shows. Pure, so it can be tested. */
export function buildHud(i: HudInput): HudState {
  const n = Math.floor(i.beatPos);
  const slot = i.beatPos >= 0 ? ((n % MEASURE_BEATS) + MEASURE_BEATS) % MEASURE_BEATS : -1;
  return {
    combo: i.combo,
    fever: i.fever,
    command: i.commandName ?? i.lastGrade,
    commandColor: i.fever ? "#ffe08a" : "#f4ead8",
    slot,
    phase: i.beatPos < 0 ? "wait" : slot < INPUT_BEATS ? "input" : "response",
    beatPos: i.beatPos,
    armyHp: i.armyHp,
    armyMax: i.armyMax,
    bannerHp: i.banner?.hp ?? 0,
    bannerMax: i.banner?.maxHp ?? 1,
    msg: i.commandName,
    msgColor: "#f4ead8",
    ready: i.beatPos < 0,
    tutorial: i.tutorial || null,
    boss: i.boss ? { name: i.boss.name, hp: i.boss.hp, max: i.boss.maxHp } : null,
    telegraph: i.telegraph,
  };
}
