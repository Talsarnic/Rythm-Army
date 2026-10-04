import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CLASSES } from "@/game/data/units";
import { isUnlocked, MISSIONS } from "@/game/data/missions";
import type { UnitClass } from "@/game/types";
import { cn } from "@/lib/utils";
import { useGame } from "@/store/game-store";
import { ChevronLeft, Settings, BookOpen, Package, UserPlus } from "lucide-react";
import { CommandsModal } from "./CommandsModal";
import { EquipmentModal } from "./EquipmentModal";
import { CreateUnitModal } from "./CreateUnitModal";
import { InventoryModal } from "./InventoryModal";

const PORTRAITS: Record<string, string> = {
  spear: "/assets/sprites/spearkin-portrait.svg",
  bow: "/assets/sprites/bowkin-portrait.svg",
  aegis: "/assets/sprites/aegiskin-portrait.svg",
  banner: "/assets/sprites/bannerkin-portrait.svg",
  kiba: "/assets/sprites/kibakin-portrait.svg",
  deka: "/assets/sprites/dekakin-portrait.svg",
  mega: "/assets/sprites/megakin-portrait.svg",
  tori: "/assets/sprites/torikin-portrait.svg",
  maho: "/assets/sprites/mahokin-portrait.svg",
  robo: "/assets/sprites/robokin-portrait.svg",
};

// Unit order reflecting their battle positioning from rear to front:
// Bannerkin ➔ Magekin ➔ Warhornkin ➔ Bowkin ➔ Spearkin ➔ Wingkin ➔ Horsekin ➔ Bludgeonkin ➔ Mechakin ➔ Aegiskin
const CAMPAIGN_UNIT_ORDER: UnitClass[] = [
  "banner",
  "maho",
  "mega",
  "bow",
  "spear",
  "tori",
  "kiba",
  "deka",
  "robo",
  "aegis",
];

export function HubScreen({ onPlay }: { onPlay: (id: string) => void }) {
  const go = useGame((s) => s.go);
  const save = useGame((s) => s.save);
  const [showCommands, setShowCommands] = useState(false);
  const [showBarracks, setShowBarracks] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [selectedEquipClass, setSelectedEquipClass] = useState<UnitClass | null>(null);

  const totalInvCount = Object.values(save.inventory ?? {}).filter((qty) => qty > 0).length;

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
            onClick={() => setShowInventory(true)}
            aria-label="Inventory"
            className="gap-1.5"
          >
            <Package className="size-5" />
            <span className="hidden sm:inline text-xs font-semibold">Inventory ({totalInvCount})</span>
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
            <p className="text-[11px] text-muted">Rear (Back) ➔ Front Line · Tap unit to manage & equip</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInventory(true)}
              className="h-7 text-xs gap-1 rounded-xl text-fg border-border hover:bg-surface cursor-pointer"
            >
              <Package className="size-3.5" />
              Inventory
            </Button>
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
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {CAMPAIGN_UNIT_ORDER.map((id) => {
            const c = CLASSES[id];
            const countInRoster = (save.roster ?? []).filter((u) => u.cls === id).length;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedEquipClass(id)}
                className={cn(
                  "rounded-2xl border p-2 text-center transition-all cursor-pointer group",
                  countInRoster > 0
                    ? "border-border bg-surface hover:bg-surface-2 hover:border-accent"
                    : "border-border/40 bg-surface/30 opacity-60 hover:opacity-100 hover:border-accent"
                )}
              >
                <img src={PORTRAITS[id]} alt="" className="mx-auto h-12 w-12 object-contain group-hover:scale-105 transition-transform" />
                <p className="mt-1 text-xs font-semibold group-hover:text-accent transition-colors truncate">{c.name}</p>
                <p className="text-[10px] text-faint truncate">
                  {c.roleTitle}
                </p>
                <p className="text-[10px] font-mono font-bold text-accent">
                  {countInRoster > 0 ? `×${countInRoster}` : "0"}
                </p>
              </button>
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
      <CreateUnitModal open={showBarracks} onClose={() => setShowBarracks(false)} />
      <InventoryModal open={showInventory} onClose={() => setShowInventory(false)} />
      <EquipmentModal
        open={selectedEquipClass !== null}
        unitClass={selectedEquipClass ?? undefined}
        onClose={() => setSelectedEquipClass(null)}
      />
    </div>
  );
}
