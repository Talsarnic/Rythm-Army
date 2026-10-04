import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CLASSES, computeUnitStats } from "@/game/data/units";
import { ITEMS, ItemDef } from "@/game/data/items";
import type { EquipSlot, UnitClass, UnitMember } from "@/game/types";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { Shield, Sparkles, X, ArrowRightLeft, Heart, Zap, Crosshair } from "lucide-react";

const PORTRAITS: Record<string, string> = {
  spear: "/assets/sprites/spearkin-portrait.png",
  bow: "/assets/sprites/bowkin-portrait.png",
  aegis: "/assets/sprites/aegiskin-portrait.png",
  banner: "/assets/sprites/bannerkin-portrait.png",
};

interface EquipmentModalProps {
  open: boolean;
  onClose: () => void;
  unitClass?: UnitClass;
}

export function EquipmentModal({ open, onClose, unitClass }: EquipmentModalProps) {
  const save = useGame((s) => s.save);
  const patchSave = useGame((s) => s.patchSave);

  const allRoster = save.roster ?? [];
  // Filter roster strictly to the selected unit class if specified
  const filteredRoster = unitClass
    ? allRoster.filter((u) => u.cls === unitClass)
    : allRoster;

  const [selectedUnitId, setSelectedUnitId] = useState<string>(() => filteredRoster[0]?.id ?? "");
  const [selectingSlot, setSelectingSlot] = useState<EquipSlot | null>(null);

  // Sync selectedUnitId whenever modal opens or unitClass changes
  useEffect(() => {
    if (open) {
      if (filteredRoster.length > 0 && !filteredRoster.some((u) => u.id === selectedUnitId)) {
        setSelectedUnitId(filteredRoster[0].id);
      }
    } else {
      setSelectingSlot(null);
    }
  }, [open, unitClass]);

  if (!open) return null;

  const currentUnit = filteredRoster.find((u) => u.id === selectedUnitId) ?? filteredRoster[0];
  if (!currentUnit) {
    const classDef = unitClass ? CLASSES[unitClass] : null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative flex flex-col w-full max-w-md rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h2 className="font-display text-xl text-fg">{classDef?.name ?? "Unit"} Equipment</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2/60 text-muted hover:text-fg hover:bg-surface-2 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="py-6 text-center text-sm text-muted">
            No {classDef?.name ?? "units"} currently in your roster.
          </div>
          <div className="pt-3 border-t border-border/60 flex justify-end">
            <Button onClick={onClose} className="rounded-xl px-5">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stats = computeUnitStats(currentUnit);
  const classDef = CLASSES[currentUnit.cls] ?? CLASSES.banner;
  const currentWeapon = currentUnit.weapon ? ITEMS[currentUnit.weapon] : undefined;
  const currentHelmet = currentUnit.helmet ? ITEMS[currentUnit.helmet] : undefined;

  // Find gear items in inventory that are valid for this slot and unit class
  const availableGear = Object.entries(save.inventory ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([id]) => ITEMS[id])
    .filter((item): item is ItemDef => {
      if (!item || !item.equipment) return false;
      if (selectingSlot && item.equipment.slot !== selectingSlot) return false;
      return item.equipment.allowedClasses.includes(currentUnit.cls);
    });

  const handleEquip = (itemId: string, slot: EquipSlot) => {
    patchSave((prev) => {
      const oldEquippedId = slot === "weapon" ? currentUnit.weapon : currentUnit.helmet;
      const updatedInv = { ...prev.inventory };

      // Deduct 1 from inventory
      if ((updatedInv[itemId] ?? 0) > 0) {
        updatedInv[itemId] = (updatedInv[itemId] ?? 1) - 1;
        if (updatedInv[itemId] <= 0) {
          delete updatedInv[itemId];
        }
      }

      // Return previous gear to inventory if there was any
      if (oldEquippedId && oldEquippedId !== itemId) {
        updatedInv[oldEquippedId] = (updatedInv[oldEquippedId] ?? 0) + 1;
      }

      const updatedRoster = prev.roster.map((u) => {
        if (u.id === currentUnit.id) {
          return {
            ...u,
            [slot]: itemId,
          };
        }
        return u;
      });

      return {
        ...prev,
        roster: updatedRoster,
        inventory: updatedInv,
      };
    });

    setSelectingSlot(null);
  };

  const handleUnequip = (slot: EquipSlot) => {
    const oldEquippedId = slot === "weapon" ? currentUnit.weapon : currentUnit.helmet;
    if (!oldEquippedId) return;

    patchSave((prev) => {
      const updatedInv = { ...prev.inventory };
      updatedInv[oldEquippedId] = (updatedInv[oldEquippedId] ?? 0) + 1;

      const updatedRoster = prev.roster.map((u) => {
        if (u.id === currentUnit.id) {
          return {
            ...u,
            [slot]: undefined,
          };
        }
        return u;
      });

      return {
        ...prev,
        roster: updatedRoster,
        inventory: updatedInv,
      };
    });

    setSelectingSlot(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-h-[92dvh] w-full max-w-2xl rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wide text-fg">{classDef.name} Gear & Stats</h2>
              <p className="text-xs text-muted">Customize weapon gear, shields, and helmets for {classDef.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2/60 text-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Unit Selector Strip (Only shown if multiple units of this class exist) */}
        {filteredRoster.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-border/40 scrollbar-none">
            {filteredRoster.map((u, i) => {
              const isSelected = u.id === currentUnit.id;
              const cDef = CLASSES[u.cls] ?? CLASSES.banner;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelectedUnitId(u.id);
                    setSelectingSlot(null);
                  }}
                  className={cn(
                    "flex items-center gap-2 shrink-0 rounded-2xl border px-3 py-2 text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30"
                      : "border-border/60 bg-surface/50 hover:bg-surface-2"
                  )}
                >
                  <img
                    src={PORTRAITS[u.cls]}
                    alt=""
                    className="h-9 w-9 rounded-lg object-contain bg-surface-2/40 p-0.5"
                  />
                  <div>
                    <p className="text-xs font-bold leading-tight text-fg">
                      {cDef.name} #{i + 1}
                    </p>
                    <p className="text-[10px] text-muted capitalize">{u.cls}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Body: Unit Details & Slots */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Info & Stats Card */}
            <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={PORTRAITS[currentUnit.cls]}
                  alt=""
                  className="h-14 w-14 object-contain rounded-xl bg-surface-2/50 border border-border/50 p-1"
                />
                <div>
                  <h3 className="font-display text-lg text-fg">
                    {classDef.name}
                    {filteredRoster.length > 1 ? ` #${filteredRoster.findIndex((u) => u.id === currentUnit.id) + 1}` : ""}
                  </h3>
                  <span className="inline-block rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase tracking-wider">
                    {stats.role}
                  </span>
                </div>
              </div>

              {/* Combat Stats Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5">
                  <Heart className="size-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted block leading-none">Health (HP)</span>
                    <span className="font-mono text-sm font-bold text-fg">{stats.hp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5">
                  <Zap className="size-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted block leading-none">Damage</span>
                    <span className="font-mono text-sm font-bold text-fg">{stats.damage}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5">
                  <Crosshair className="size-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted block leading-none">Attack Range</span>
                    <span className="font-mono text-sm font-bold text-fg">{stats.range}px</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-surface-2/40 p-2.5">
                  <Shield className="size-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-muted block leading-none">Defense</span>
                    <span className="font-mono text-sm font-bold text-fg">
                      {Math.round(stats.defense * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {stats.attackSpeed !== 1.0 && (
                <p className="text-[11px] text-amber-300/90 font-medium">
                  ⚡ Attack Speed: {Math.round(stats.attackSpeed * 100)}%
                </p>
              )}
            </div>

            {/* Equipment Slots */}
            <div className="space-y-3">
              {/* Weapon Slot */}
              {currentUnit.cls !== "banner" && (
                <div
                  className={cn(
                    "rounded-2xl border p-3.5 transition-all",
                    selectingSlot === "weapon"
                      ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                      : "border-border/80 bg-surface/60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                      ⚔️ Weapon / Armament
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectingSlot(selectingSlot === "weapon" ? null : "weapon")}
                      className="h-7 text-xs gap-1 text-accent hover:text-accent"
                    >
                      <ArrowRightLeft className="size-3.5" />
                      {selectingSlot === "weapon" ? "Cancel" : "Change"}
                    </Button>
                  </div>

                  {currentWeapon ? (
                    <div className="flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{currentWeapon.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-fg leading-snug">{currentWeapon.name}</p>
                          <p className="text-[11px] text-muted">
                            +{currentWeapon.equipment?.damageBonus ?? 0} Dmg · +
                            {currentWeapon.equipment?.rangeBonus ?? 0} Range
                            {currentWeapon.equipment?.attackSpeedMultiplier &&
                            currentWeapon.equipment.attackSpeedMultiplier !== 1.0
                              ? ` · ${Math.round(currentWeapon.equipment.attackSpeedMultiplier * 100)}% Spd`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl">
                      No weapon equipped
                    </div>
                  )}
                </div>
              )}

              {/* Helmet Slot */}
              <div
                className={cn(
                  "rounded-2xl border p-3.5 transition-all",
                  selectingSlot === "helmet"
                    ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                    : "border-border/80 bg-surface/60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    🪖 Helmet & Headgear
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectingSlot(selectingSlot === "helmet" ? null : "helmet")}
                    className="h-7 text-xs gap-1 text-accent hover:text-accent"
                  >
                    <ArrowRightLeft className="size-3.5" />
                    {selectingSlot === "helmet" ? "Cancel" : "Change"}
                  </Button>
                </div>

                {currentHelmet ? (
                  <div className="flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{currentHelmet.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-fg leading-snug">{currentHelmet.name}</p>
                        <p className="text-[11px] text-muted">
                          +{currentHelmet.equipment?.hpBonus ?? 0} HP · +
                          {Math.round((currentHelmet.equipment?.defenseBonus ?? 0) * 100)}% Def
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl">
                    No helmet equipped
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gear Selection Drawer (When Changing Slot) */}
          {selectingSlot && (
            <div className="rounded-2xl border border-accent/40 bg-surface-2/60 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <Sparkles className="size-4" />
                  Select {selectingSlot === "weapon" ? "Weapon" : "Helmet"} from Inventory
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnequip(selectingSlot)}
                  className="h-6 text-[11px] text-red-400 hover:text-red-300"
                >
                  Unequip
                </Button>
              </div>

              {availableGear.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted border border-dashed border-border rounded-xl bg-surface/40">
                  No matching {selectingSlot} items available in your inventory. Win missions to find more drops!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableGear.map((item) => {
                    const qty = save.inventory[item.id] ?? 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleEquip(item.id, selectingSlot)}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border/70 bg-surface hover:bg-surface-2 hover:border-accent text-left transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{item.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-fg">{item.name}</p>
                            <p className="text-[10px] text-muted">
                              {selectingSlot === "weapon"
                                ? `+${item.equipment?.damageBonus ?? 0} Dmg · +${item.equipment?.rangeBonus ?? 0} Rng`
                                : `+${item.equipment?.hpBonus ?? 0} HP · +${Math.round((item.equipment?.defenseBonus ?? 0) * 100)}% Def`}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-accent shrink-0">×{qty}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/60 flex justify-end">
          <Button onClick={onClose} className="rounded-xl px-5">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}