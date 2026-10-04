import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLASSES } from "@/game/data/units";
import { ITEMS } from "@/game/data/items";
import { isUnlocked, MISSIONS } from "@/game/data/missions";
import type { UnitClass } from "@/game/types";
import { cn } from "@/lib/utils";
import { useGame } from "@/store/game-store";
import { ChevronLeft, Settings, BookOpen, Package, ShieldCheck, UserPlus } from "lucide-react";
import { CommandsModal } from "./CommandsModal";
import { EquipmentModal } from "./EquipmentModal";
import { CreateUnitModal } from "./CreateUnitModal";

const PORTRAITS: Record<string, string> = {
  spear: "/assets/sprites/spearkin-portrait.png",
  bow: "/assets/sprites/bowkin-portrait.png",
  aegis: "/assets/sprites/aegiskin-portrait.png",
  banner: "/assets/sprites/bannerkin-portrait.png",
};

// Unit order reflecting their battle positioning: Bannerkin (back), Bowkin, Spearkin, Aegiskin (front)
const CAMPAIGN_UNIT_ORDER: UnitClass[] = ["banner", "bow", "spear", "aegis"];

export function HubScreen({ onPlay }: { onPlay: (id: string) => void }) {
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  const [showCommands, setShowCommands] = useState(false);
  const [showBarracks, setShowBarracks] = useState(false);
  const [selectedEquipClass, setSelectedEquipClass] = useState<UnitClass | null>(null);

  const inventoryItems = Object.entries(save.inventory ?? {}).filter(([, qty]) => qty > 0);

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
            onClick={() => setShowBarracks(true)}
            aria-label="Barracks"
            className="gap-1.5 text-accent hover:text-accent"
          >
            <UserPlus className="size-5" />
            <span className="hidden sm:inline text-xs font-semibold">Barracks</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedEquipClass("spear")}
            aria-label="Equipment"
            className="gap-1.5"
          >
            <ShieldCheck className="size-5" />
            <span className="hidden sm:inline text-xs font-semibold">Equipment</span>
          </Button>
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
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Your army (battle formation order)</p>
            <p className="text-[11px] text-muted">Rear (Back) ➔ Front Line · Tap to equip</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBarracks(true)}
            className="h-7 text-xs gap-1 rounded-xl text-accent border-accent/40 hover:bg-accent/10 cursor-pointer"
          >
            <UserPlus className="size-3.5" />
            Train Units
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {CAMPAIGN_UNIT_ORDER.map((id) => {
            const c = CLASSES[id];
            const countInRoster = (save.roster ?? []).filter((u) => u.cls === id).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEquipClass(id)}
                className="rounded-2xl border border-border bg-surface p-2 text-center hover:bg-surface-2 hover:border-accent transition-all cursor-pointer group"
              >
                <img src={PORTRAITS[id]} alt="" className="mx-auto h-16 w-16 object-contain group-hover:scale-105 transition-transform" />
                <p className="mt-1 text-xs font-semibold group-hover:text-accent transition-colors">{c.name}</p>
                <p className="text-[10px] text-faint">
                  {countInRoster > 0 ? `×${countInRoster} · ${c.role}` : c.role}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Materials & Inventory Section */}
      <section className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">Inventory & Materials</p>
          <span className="text-[11px] text-muted flex items-center gap-1">
            <Package className="size-3.5" />
            {inventoryItems.length} {inventoryItems.length === 1 ? "type" : "types"}
          </span>
        </div>
        {inventoryItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/30 p-3.5 text-center text-xs text-muted">
            No materials yet. Win battles along the campaign to gather battlefield loot and relics!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {inventoryItems.map(([id, qty]) => {
              const item = ITEMS[id];
              const isGear = item?.category === "gear";
              const targetClass = item?.equipment?.allowedClasses?.[0];
              return (
                <div
                  key={id}
                  onClick={() => isGear && setSelectedEquipClass(targetClass ?? "spear")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs transition-colors",
                    isGear && "hover:border-accent hover:bg-surface-2 cursor-pointer"
                  )}
                >
                  <span>{item?.icon ?? "📦"}</span>
                  <span className="font-medium text-fg">{item?.name ?? id}</span>
                  <span className="font-mono font-bold text-accent">×{qty}</span>
                </div>
              );
            })}
          </div>
        )}
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
      <CreateUnitModal open={showBarracks} onClose={() => setShowBarracks(false)} />
      <EquipmentModal
        open={selectedEquipClass !== null}
        unitClass={selectedEquipClass ?? undefined}
        onClose={() => setSelectedEquipClass(null)}
      />
    </div>
  );
}
