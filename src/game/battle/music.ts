import { audio } from "../audio";
import { INPUT_BEATS, MEASURE_BEATS } from "../data/commands";
import type { BattleState } from "./state.ts";

const MUSIC = [196, 233, 262, 311, 349];
const MUSIC_FEVER = [262, 311, 349, 392, 466];

/** How far ahead of the audio clock beats are scheduled, in seconds. */
const LOOKAHEAD = 0.22;

/**
 * Queue the drums, chant and melody for upcoming beats on the audio clock.
 * Called every frame; it only schedules beats that haven't been queued yet.
 */
export function scheduleMusic(s: BattleState, now: number) {
  const e = s.engine;
  if (!e.started || e.startTime === null) return;
  while (e.beatTime(s.nextTick) < now + LOOKAHEAD) {
    const slot = s.nextTick % MEASURE_BEATS;
    const when = e.beatTime(s.nextTick);
    if (s.nextTick >= 0 && when > e.startTime - 0.01) {
      if (slot < INPUT_BEATS) audio.tick(when, slot === 0);
      else {
        audio.thump(when);
        audio.chant(when, e.fever);
      }
      const scale = e.fever ? MUSIC_FEVER : MUSIC;
      if (slot === 0 || slot === 4) audio.pluck(when, scale[s.nextTick % scale.length]!, e.fever);
      if (e.fever && slot === 2) audio.pluck(when, scale[2]!, true);
    }
    s.nextTick += 1;
  }
}
