import { DRUMS } from "@/game/types";
import { cn } from "@/lib/utils";

export function DrumPads({
  pressed,
  onDrum,
  disabled,
}: {
  pressed: number[];
  onDrum: (drum: number, stamp: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid h-full grid-cols-4 gap-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      {DRUMS.map((d) => {
        const lit = pressed[d.id]! > performance.now();
        return (
          <button
            key={d.id}
            type="button"
            disabled={disabled}
            aria-label={d.name}
            onPointerDown={(e) => {
              e.preventDefault();
              (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
              onDrum(d.id, e.timeStamp);
            }}
            className={cn(
              "flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 select-none",
              "transition-[background-color,transform] duration-75",
              lit ? "scale-[0.98] text-primary-fg" : "bg-surface text-fg",
            )}
            style={{
              borderColor: d.color,
              backgroundColor: lit ? d.color : undefined,
              color: lit ? "#fff8f0" : d.color,
            }}
          >
            <span className="font-display text-xl tracking-wide sm:text-2xl">{d.name}</span>
            <span className="mt-1 font-mono text-[11px] text-muted uppercase">
              {d.keys.join(" / ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
