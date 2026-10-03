import { COMMANDS } from "@/game/data/commands";
import { DRUMS } from "@/game/types";
import { cn } from "@/lib/utils";
import type { HudState } from "@/game/types";
import { Pause } from "lucide-react";

export function BattleHud({
  hud,
  offsetMs,
  onPause,
}: {
  hud: HudState | null;
  offsetMs: number;
  onPause: () => void;
}) {
  const slot = hud?.slot ?? -1;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      <div className="flex items-start justify-between px-3 pt-[max(0.6rem,env(safe-area-inset-top))] sm:px-4">
        <div>
          <p className="font-display text-lg tabular-nums tracking-wide text-fg">
            COMBO {hud?.combo ?? 0}
          </p>
          <p className="font-mono text-[11px] text-muted">
            offset {offsetMs >= 0 ? "+" : ""}
            {offsetMs}ms
          </p>
          {hud?.fever && (
            <p className="mt-1 font-display text-xl tracking-wide text-fever">FEVER</p>
          )}
        </div>
        <button
          type="button"
          onClick={onPause}
          className="pointer-events-auto rounded-xl border border-border bg-surface/80 p-2 text-fg"
          aria-label="Pause"
        >
          <Pause className="size-5" />
        </button>
      </div>

      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: 8 }, (_, i) => {
            const on = i === slot;
            const input = i < 4;
            return (
              <span
                key={i}
                className={cn(
                  "block rounded-full transition-transform duration-75",
                  on ? "scale-125" : "scale-100",
                  i === 4 ? "ml-2" : "",
                )}
                style={{
                  width: on ? 14 : 10,
                  height: on ? 14 : 10,
                  background: input
                    ? on
                      ? "#f4ead8"
                      : "rgba(244,234,216,0.35)"
                    : on
                      ? "#59cd90"
                      : "rgba(89,205,144,0.35)",
                }}
              />
            );
          })}
        </div>
        <div className="mt-1 flex w-56 justify-between text-[10px] tracking-widest text-muted uppercase">
          <span>Drum</span>
          <span>Army</span>
        </div>
      </div>

      <div className="mx-3 mt-2 sm:mx-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-ting"
            style={{ width: `${hud ? (hud.armyHp / Math.max(1, hud.armyMax)) * 100 : 100}%` }}
          />
        </div>
        {hud?.boss && (
          <div className="mt-2">
            <p className="mb-1 text-right text-[10px] tracking-widest text-muted uppercase">{hud.boss.name}</p>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(hud.boss.hp / Math.max(1, hud.boss.max)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        {hud?.ready && (
          <p className="max-w-md text-sm text-fg">
            Get ready. Drum the first four beats. The army moves on the next four.
          </p>
        )}
        {hud?.telegraph && (
          <p className="font-display text-3xl tracking-wide text-primary">{hud.telegraph}</p>
        )}
        {hud?.tutorial && !hud.ready && (
          <p className="max-w-md text-sm text-muted">{hud.tutorial}</p>
        )}
      </div>

      <div className="pointer-events-none hidden px-4 pb-2 lg:block">
        <div className="ml-auto w-max rounded-2xl border border-border bg-bg/55 px-3 py-2 font-mono text-[11px] text-muted">
          {COMMANDS.map((c) => (
            <p key={c.id}>
              <span className="inline-block w-16 text-fg">{c.name}</span>
              {c.pattern.map((d) => DRUMS[d]!.name).join(" ")}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
