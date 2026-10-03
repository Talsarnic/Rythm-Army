import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLASSES } from "@/game/data/units";
import { isUnlocked, MISSIONS } from "@/game/data/missions";
import { cn } from "@/lib/utils";
import { useGame } from "@/store/game-store";
import { ChevronLeft, Settings, BookOpen } from "lucide-react";
import { CommandsModal } from "./CommandsModal";

const PORTRAITS: Record<string, string> = {
  pike: "/assets/sprites/spearkin-portrait.png",
  bow: "/assets/sprites/bowkin-portrait.png",
  aegis: "/assets/sprites/aegiskin-portrait.png",
  banner: "/assets/sprites/bannerkin-portrait.png",
};

export function HubScreen({ onPlay }: { onPlay: (id: string) => void }) {
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  const [showCommands, setShowCommands] = useState(false);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="flex items-center justify-between px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="sm" onClick={() => go("title")} className="gap-1">
          <ChevronLeft className="size-4" />
          Title
        </Button>
        <h1 className="font-display text-2xl tracking-wide">Campaign</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommands(true)}
            aria-label="Commands"
            className="gap-1.5"
          >
            <BookOpen className="size-5" />
            <span className="hidden sm:inline text-xs font-semibold">Commands</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => go("settings")} aria-label="Settings">
            <Settings className="size-5" />
          </Button>
        </div>
      </header>

      <section className="px-4 pb-4">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted uppercase">Your army</p>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(CLASSES) as Array<keyof typeof CLASSES>).map((id) => {
            const c = CLASSES[id];
            return (
              <div key={id} className="rounded-2xl border border-border bg-surface p-2 text-center">
                <img src={PORTRAITS[id]} alt="" className="mx-auto h-16 w-16 object-contain" />
                <p className="mt-1 text-xs font-semibold">{c.name}</p>
                <p className="text-[10px] text-faint">{c.role}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3 px-4 pb-10">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Missions</p>
        {MISSIONS.map((m) => {
          const unlocked = isUnlocked(m.id, save.completed);
          const done = save.completed.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              disabled={!unlocked}
              onClick={() => unlocked && onPlay(m.id)}
              className={cn(
                "rounded-3xl border p-4 text-left transition-colors",
                unlocked ? "border-border bg-surface hover:bg-surface-2" : "border-border/40 bg-surface/40 opacity-50",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-xl tracking-wide">{m.name}</h2>
                <span className="text-xs font-semibold text-muted">
                  {done ? "Cleared" : unlocked ? "Open" : "Locked"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{m.blurb}</p>
            </button>
          );
        })}
        <Button variant="secondary" className="mt-2" onClick={() => go("calibrate")}>
          Calibrate timing
        </Button>
      </section>

      <CommandsModal open={showCommands} onClose={() => setShowCommands(false)} />
    </div>
  );
}
