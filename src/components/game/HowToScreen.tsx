import { Button } from "@/components/ui/button";
import { COMMANDS } from "@/game/data/commands";
import { DRUMS } from "@/game/types";
import { useGame } from "@/store/game-store";
import { ChevronLeft, BookOpen } from "lucide-react";

export function HowToScreen() {
  const go = useGame((s) => s.go);
  return (
    <div className="min-h-dvh bg-bg px-5 pb-12 text-fg pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto max-w-xl">
        <Button variant="ghost" size="sm" onClick={() => go("title")} className="mb-4 gap-1">
          <ChevronLeft className="size-4" />
          Back
        </Button>

        <div className="flex items-center gap-2.5">
          <BookOpen className="size-6 text-accent" />
          <h1 className="font-display text-3xl tracking-wide">How to Drum</h1>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          Each measure is eight beats. You drum the first four beats. The army answers on the next four — marching, striking, or holding. Hit the beat. Chain commands to ignite <span className="font-bold text-accent">Fever Mode</span>.
        </p>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Drums & Keys</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {DRUMS.map((d) => (
                <div key={d.id} className="rounded-2xl border border-border bg-surface p-3 text-center">
                  <span className="font-display text-base font-bold block" style={{ color: d.color }}>
                    {d.name}
                  </span>
                  <span className="mt-1 font-mono text-[11px] text-muted block uppercase">
                    {d.keys.join(" / ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Command Sequences</p>
            <p className="mt-1 text-xs text-muted">
              Enter 4 beats in rhythm during your turn:
            </p>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {COMMANDS.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-display text-base tracking-wide text-fg">{c.name}</span>
                    <p className="text-xs text-muted">{c.hint}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {c.pattern.map((drumId, i) => {
                      const drum = DRUMS[drumId]!;
                      return (
                        <span
                          key={i}
                          className="rounded-lg px-2.5 py-1 font-bold text-xs shadow-sm border"
                          style={{
                            backgroundColor: `${drum.color}22`,
                            color: drum.color,
                            borderColor: `${drum.color}44`,
                          }}
                        >
                          {drum.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4">
          <Button className="w-full" size="lg" onClick={() => go("title")}>
            Got it, Let's Drum
          </Button>
        </div>
      </div>
    </div>
  );
}
