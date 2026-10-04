import { Button } from "@/components/ui/button";
import { ITEMS } from "@/game/data/items";
import { isUnlocked, MISSIONS } from "@/game/data/missions";
import { useGame } from "@/store/game-store";

const RARITY_COLORS: Record<string, string> = {
  common: "text-muted border-border bg-surface",
  uncommon: "text-[#59cd90] border-[#59cd90]/40 bg-[#59cd90]/10",
  rare: "text-[#3fa7d6] border-[#3fa7d6]/40 bg-[#3fa7d6]/10",
  epic: "text-[#f2b134] border-[#f2b134]/40 bg-[#f2b134]/10",
};

export function ResultScreen({ onPlay }: { onPlay: (id: string) => void }) {
  const result = useGame((s) => s.result);
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  if (!result) return null;

  const idx = MISSIONS.findIndex((m) => m.id === result.missionId);
  const next = MISSIONS[idx + 1];
  const nextOpen = next ? isUnlocked(next.id, save.completed) : false;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5 py-8 text-center text-fg">
      <p className="text-xs font-semibold tracking-[0.24em] text-muted uppercase">{result.missionName}</p>
      <h1 className="mt-3 font-display text-5xl tracking-wide">{result.win ? "Victory" : "Broken beat"}</h1>
      <p className="mt-3 max-w-md text-muted">{result.cause}</p>

      <dl className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3 text-sm">
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

      {result.win && result.rewards && result.rewards.length > 0 && (
        <div className="mt-6 w-full max-w-sm text-left">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Spoils of Battle</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {result.rewards.map((r) => {
              const item = ITEMS[r.itemId];
              const name = item?.name ?? r.itemId;
              const icon = item?.icon ?? "📦";
              const rarityStyle = RARITY_COLORS[item?.rarity ?? "common"];
              return (
                <div
                  key={r.itemId}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium ${rarityStyle}`}
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                  <span className="font-mono font-bold text-fg">+{r.qty}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          Campaign & Army
        </Button>
      </div>
    </div>
  );
}
