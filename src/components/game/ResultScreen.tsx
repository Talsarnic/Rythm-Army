import { Button } from "@/components/ui/button";
import { isUnlocked, MISSIONS } from "@/game/data/missions";
import { useGame } from "@/store/game-store";

export function ResultScreen({ onPlay }: { onPlay: (id: string) => void }) {
  const result = useGame((s) => s.result);
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  if (!result) return null;

  const idx = MISSIONS.findIndex((m) => m.id === result.missionId);
  const next = MISSIONS[idx + 1];
  const nextOpen = next ? isUnlocked(next.id, save.completed) : false;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 text-center text-fg">
      <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">{result.missionName}</p>
      <h1 className="mt-3 font-display text-5xl tracking-wide">{result.win ? "Victory" : "Broken beat"}</h1>
      <p className="mt-3 max-w-md text-muted">{result.cause}</p>
      <dl className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-border bg-surface p-3">
          <dt className="text-muted">Commands</dt>
          <dd className="font-display text-2xl tabular-nums">{result.commands}</dd>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <dt className="text-muted">Best combo</dt>
          <dd className="font-display text-2xl tabular-nums">{result.bestCombo}</dd>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <dt className="text-muted">Misses</dt>
          <dd className="font-display text-2xl tabular-nums">{result.fails}</dd>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-3">
          <dt className="text-muted">Fever</dt>
          <dd className="font-display text-2xl">{result.feverReached ? "Yes" : "No"}</dd>
        </div>
      </dl>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Button size="lg" onClick={() => onPlay(result.missionId)}>
          Play again
        </Button>
        {result.win && nextOpen && next && (
          <Button size="lg" variant="secondary" onClick={() => onPlay(next.id)}>
            Next: {next.name}
          </Button>
        )}
        <Button variant="ghost" onClick={() => go("hub")}>
          Campaign
        </Button>
      </div>
    </div>
  );
}
