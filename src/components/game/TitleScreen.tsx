import { Button } from "@/components/ui/button";
import { useGame } from "@/store/game-store";
import { GAME_VERSION } from "@/game/version";

export function TitleScreen({ onPlay }: { onPlay: () => void }) {
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <img
        src="/assets/ui/title-art.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/25" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-end px-5 pb-10 pt-[max(2rem,env(safe-area-inset-top))] sm:justify-center sm:pb-16">
        <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-muted uppercase">
          Drum war
        </p>
        <h1 className="font-display text-5xl leading-none tracking-tight text-fg sm:text-7xl">
          RHYTHM ARMY
        </h1>
        <p className="mt-4 max-w-md text-center text-base text-muted">
          Drum four beats. Your army answers on the next four. March, strike, and hold the line.
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <Button size="lg" className="w-full rounded-xl" onClick={onPlay}>
            Play
          </Button>
          <Button size="lg" variant="secondary" className="w-full rounded-xl" onClick={() => go("hub")}>
            Campaign
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="ghost" onClick={() => go("howto")}>
              How to drum
            </Button>
            <Button variant="ghost" onClick={() => go("calibrate")}>
              Calibrate
            </Button>
          </div>
        </div>
        <p className="mt-6 font-mono text-xs text-faint">
          v{GAME_VERSION} · Offset {save.offsetMs >= 0 ? "+" : ""}
          {save.offsetMs}ms · Best combo {save.bestCombo}
        </p>
      </div>
    </div>
  );
}
