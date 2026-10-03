import { useEffect, useRef, useState } from "react";
import { PhaserGame } from "@/game/PhaserGame";
import { audio } from "@/game/audio";
import { bus } from "@/game/events";
import { DRUMS, type BattleResult, type DrumId, type HudState } from "@/game/types";
import { useGame } from "@/store/game-store";
import { BattleHud } from "./BattleHud";
import { CalibrateScreen } from "./CalibrateScreen";
import { DrumPads } from "./DrumPads";
import { HowToScreen } from "./HowToScreen";
import { HubScreen } from "./HubScreen";
import { ResultScreen } from "./ResultScreen";
import { SettingsScreen } from "./SettingsScreen";
import { TitleScreen } from "./TitleScreen";
import { Button } from "@/components/ui/button";

export function GameShell() {
  const screen = useGame((s) => s.screen);
  const missionId = useGame((s) => s.missionId);
  const hud = useGame((s) => s.hud);
  const paused = useGame((s) => s.paused);
  const save = useGame((s) => s.save);
  const hydrate = useGame((s) => s.hydrate);
  const go = useGame((s) => s.go);
  const startMission = useGame((s) => s.startMission);
  const setHud = useGame((s) => s.setHud);
  const setPaused = useGame((s) => s.setPaused);
  const finishBattle = useGame((s) => s.finishBattle);
  const pressed = useRef([0, 0, 0, 0]);
  const [, bump] = useState(0);
  const padHeld = useRef([false, false, false, false]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    audio.setVolumes(save.settings);
  }, [save.settings]);

  useEffect(() => {
    const offHud = bus.on("hud", (p) => setHud(p as HudState));
    const offEnd = bus.on("battle-end", (p) => finishBattle(p as BattleResult));
    return () => {
      offHud();
      offEnd();
    };
  }, [setHud, finishBattle]);

  async function unlockAndPlay(id: string) {
    await audio.unlock();
    startMission(id);
  }

  function hitDrum(drum: number, stamp: number) {
    if (screen !== "battle" || paused) return;
    pressed.current[drum] = performance.now() + 120;
    bump((n) => n + 1);
    void audio.unlock().then(() => {
      audio.drum(drum as DrumId);
      const t = audio.eventTimeToAudio(stamp);
      bus.emit("drum", { drum, time: t });
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Escape") {
        if (screen === "battle") {
          const next = !useGame.getState().paused;
          setPaused(next);
          bus.emit("pause", next);
        } else if (screen !== "title") go("title");
        return;
      }
      if (screen === "title" && e.code === "Enter") {
        void unlockAndPlay("training");
        return;
      }
      if (screen !== "battle") return;
      const drum = DRUMS.findIndex((d) => (d.codes as readonly string[]).includes(e.code));
      if (drum < 0) return;
      e.preventDefault();
      hitDrum(drum, e.timeStamp);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, go, setPaused]);

  useEffect(() => {
    if (screen !== "battle") return;
    let raf = 0;
    const poll = () => {
      const pads = navigator.getGamepads?.() ?? [];
      const p = pads[0];
      if (p) {
        const map = [0, 1, 2, 3];
        for (let i = 0; i < 4; i++) {
          const down = p.buttons[map[i]!]?.pressed ?? false;
          if (down && !padHeld.current[i]) hitDrum(i, performance.now());
          padHeld.current[i] = down;
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [screen, paused]);

  if (screen === "title") return <TitleScreen onPlay={() => void unlockAndPlay("training")} />;
  if (screen === "hub") return <HubScreen onPlay={(id) => void unlockAndPlay(id)} />;
  if (screen === "howto") return <HowToScreen />;
  if (screen === "calibrate") return <CalibrateScreen />;
  if (screen === "settings") return <SettingsScreen />;
  if (screen === "result") return <ResultScreen onPlay={(id) => void unlockAndPlay(id)} />;

  return (
    <div className="relative h-dvh overflow-hidden bg-bg text-fg">
      {missionId && <PhaserGame missionId={missionId} />}
      <BattleHud
        hud={hud}
        offsetMs={save.offsetMs}
        onPause={() => {
          setPaused(true);
          bus.emit("pause", true);
        }}
      />
      <div className="absolute inset-x-0 bottom-0 z-20 h-[min(28vh,168px)] bg-bg/90">
        <DrumPads pressed={pressed.current} onDrum={hitDrum} disabled={paused} />
      </div>
      {paused && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-bg/80 px-6">
          <h2 className="font-display text-4xl tracking-wide">Paused</h2>
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
            <Button
              size="lg"
              onClick={() => {
                setPaused(false);
                bus.emit("pause", false);
              }}
            >
              Resume
            </Button>
            <Button variant="secondary" size="lg" onClick={() => go("hub")}>
              Abandon march
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
