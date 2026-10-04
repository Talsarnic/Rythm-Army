import { Button } from "@/components/ui/button";
import { audio } from "@/game/audio";
import { useGame } from "@/store/game-store";
import { GAME_VERSION } from "@/game/version";
import { ChevronLeft } from "lucide-react";

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums">{Math.round(value * 100)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full appearance-none rounded-full bg-surface-2 accent-primary"
      />
    </label>
  );
}

export function SettingsScreen() {
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  const patchSave = useGame((s) => s.patchSave);

  function setField(key: "master" | "music" | "sfx" | "shake", v: number) {
    patchSave((s) => ({ ...s, settings: { ...s.settings, [key]: v } }));
    if (key !== "shake") audio.setVolumes({ [key]: v });
  }

  return (
    <div className="min-h-dvh bg-bg px-5 text-fg pt-[max(1rem,env(safe-area-inset-top))]">
      <Button variant="ghost" size="sm" onClick={() => go("hub")} className="mb-4 gap-1">
        <ChevronLeft className="size-4" />
        Back
      </Button>
      <h1 className="font-display text-3xl tracking-wide">Settings</h1>
      <div className="mt-8 flex max-w-md flex-col gap-6">
        <Slider label="Master" value={save.settings.master} onChange={(v) => setField("master", v)} />
        <Slider label="Music" value={save.settings.music} onChange={(v) => setField("music", v)} />
        <Slider label="Drums" value={save.settings.sfx} onChange={(v) => setField("sfx", v)} />
        <Slider label="Screen shake" value={save.settings.shake} onChange={(v) => setField("shake", v)} />
      </div>
      <p className="mt-8 font-mono text-xs text-faint">
        v{GAME_VERSION} · Input offset {save.offsetMs >= 0 ? "+" : ""}
        {save.offsetMs}ms
      </p>
      <Button className="mt-4" variant="secondary" onClick={() => go("calibrate")}>
        Recalibrate
      </Button>
    </div>
  );
}
