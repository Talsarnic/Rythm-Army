import { Button } from "@/components/ui/button";
import { COMMANDS } from "@/game/data/commands";
import { DRUMS } from "@/game/types";
import { useGame } from "@/store/game-store";
import { ChevronLeft } from "lucide-react";

export function HowToScreen() {
  const go = useGame((s) => s.go);
  return (
    <div className="min-h-dvh bg-bg px-5 pb-10 text-fg pt-[max(1rem,env(safe-area-inset-top))]">
      <Button variant="ghost" size="sm" onClick={() => go("title")} className="mb-4 gap-1">
        <ChevronLeft className="size-4" />
        Back
      </Button>
      <h1 className="font-display text-3xl tracking-wide">How to drum</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
        Each measure is eight beats. You drum the first four. The army answers on the next four — marching, striking, or holding. Hit the beat. Chain four commands to ignite Fever.
      </p>
      <h2 className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted uppercase">Drums</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {DRUMS.map((d) => (
          <li key={d.id} className="rounded-2xl border border-border bg-surface p-3">
            <p className="font-display text-lg" style={{ color: d.color }}>
              {d.name}
            </p>
            <p className="font-mono text-xs text-muted uppercase">{d.keys.join(" / ")}</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted uppercase">Commands</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {COMMANDS.map((c) => (
          <li key={c.id} className="flex flex-col rounded-2xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted">{c.hint}</p>
            </div>
            <p className="mt-1 font-mono text-sm text-fg sm:mt-0">
              {c.pattern.map((id) => DRUMS[id]!.name).join("  ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
