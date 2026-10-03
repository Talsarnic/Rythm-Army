import { Button } from "@/components/ui/button";
import { COMMANDS } from "@/game/data/commands";
import { DRUMS } from "@/game/types";
import { X, BookOpen } from "lucide-react";

interface CommandsModalProps {
  open: boolean;
  onClose: () => void;
}

export function CommandsModal({ open, onClose }: CommandsModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="commands-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-bg text-fg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="size-5 text-accent" />
            <h2 id="commands-modal-title" className="font-display text-xl tracking-wide">
              Drum Commands
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 rounded-full p-0"
            aria-label="Close commands"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Drums & Keys</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DRUMS.map((d) => (
                <div key={d.id} className="rounded-xl border border-border bg-surface p-2.5 text-center">
                  <span className="font-display text-sm font-bold block" style={{ color: d.color }}>
                    {d.name}
                  </span>
                  <span className="mt-0.5 font-mono text-[11px] text-muted block uppercase">
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
            <div className="mt-2 flex flex-col gap-2">
              {COMMANDS.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-1.5 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="font-display text-sm tracking-wide text-fg">{c.name}</span>
                    <p className="text-xs text-muted">{c.hint}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {c.pattern.map((drumId, i) => {
                      const drum = DRUMS[drumId]!;
                      return (
                        <span
                          key={i}
                          className="rounded-lg px-2 py-1 font-bold text-[11px] shadow-sm border border-border/50"
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

        <div className="border-t border-border p-4 bg-surface/50">
          <Button className="w-full" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
