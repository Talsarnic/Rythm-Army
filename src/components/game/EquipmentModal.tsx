import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  CLASSES,
  MAX_UNITS_PER_CLASS,
  UNIT_CREATION_RECIPES,
  canCreateUnit,
  computeUnitStats,
  getDefaultStarterGear,
  optimizeUnitsEquipment,
} from "@/game/data/units";
import { ITEMS, ItemDef } from "@/game/data/items";
import type { EquipSlot, UnitClass, UnitMember } from "@/game/types";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";
import {
  Shield,
  Sparkles,
  X,
  ArrowRightLeft,
  Heart,
  Zap,
  Crosshair,
  Wand2,
  UserPlus,
  Check,
  AlertCircle,
} from "lucide-react";
import { UnitSpritePreview } from "./UnitSpritePreview";

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
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null);
  const [recruitNotice, setRecruitNotice] = useState<string | null>(null);

  // Sync selectedUnitId whenever modal opens or unitClass changes
  useEffect(() => {
    if (open) {
      if (filteredRoster.length > 0 && !filteredRoster.some((u) => u.id === selectedUnitId)) {
        setSelectedUnitId(filteredRoster[0].id);
      }
    } else {
      setSelectingSlot(null);
      setOptimizeNotice(null);
      setRecruitNotice(null);
    }
  }, [open, unitClass]);

  if (!open) return null;

  const currentUnit = filteredRoster.find((u) => u.id === selectedUnitId) ?? filteredRoster[0];
  const activeClass = unitClass ?? currentUnit?.cls ?? "bow";
  const classDef = CLASSES[activeClass] ?? CLASSES.banner;
  const currentCount = (save.roster ?? []).filter((u) => u.cls === activeClass).length;
  const maxAllowed = MAX_UNITS_PER_CLASS[activeClass] ?? 3;
  const isCraftable = activeClass !== "banner";
  const recruitCheck = isCraftable
    ? canCreateUnit(activeClass, save.roster ?? [], save.inventory ?? {})
    : { allowed: false };
  const recipe = isCraftable ? UNIT_CREATION_RECIPES[activeClass as Exclude<UnitClass, "banner">] : undefined;

  const handleOptimizeGear = () => {
    patchSave((prev) => {
      const result = optimizeUnitsEquipment(prev.roster ?? [], prev.inventory ?? {}, activeClass);
      if (result.changesCount > 0) {
        setOptimizeNotice(`Optimized gear for all ${classDef.name}s!`);
      } else {
        setOptimizeNotice(`All ${classDef.name}s already have the best available gear.`);
      }
      setTimeout(() => setOptimizeNotice(null), 3000);

      return {
        ...prev,
        roster: result.updatedRoster,
        inventory: result.updatedInventory,
      };
    });
  };

  const handleRecruitUnit = () => {
    if (!recruitCheck.allowed || !recipe || !isCraftable) return;

    patchSave((prev) => {
      const updatedInv = { ...prev.inventory };
      for (const [matId, reqQty] of Object.entries(recipe.materials)) {
        updatedInv[matId] = (updatedInv[matId] ?? 0) - reqQty;
        if (updatedInv[matId] <= 0) {
          delete updatedInv[matId];
        }
      }

      const starterGear = getDefaultStarterGear(activeClass);
      const newUnitId = `unit-${activeClass}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newUnit: UnitMember = {
        id: newUnitId,
        cls: activeClass,
        level: 1,
        weapon: starterGear.weapon,
        helmet: starterGear.helmet,
      };

      const updatedRoster = [...(prev.roster ?? []), newUnit];

      // Auto optimize for this class after recruiting to equip any spare top gear
      const optResult = optimizeUnitsEquipment(updatedRoster, updatedInv, activeClass);

      setRecruitNotice(`Recruited new ${classDef.name} (#${updatedRoster.filter((u) => u.cls === activeClass).length})!`);
      setTimeout(() => setRecruitNotice(null), 3500);

      setSelectedUnitId(newUnitId);

      return {
        ...prev,
        inventory: optResult.updatedInventory,
        roster: optResult.updatedRoster,
      };
    });
  };

  if (!currentUnit) {
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
            <h2 className="font-display text-xl text-fg">{classDef.name} Equipment</h2>
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
            No {classDef.name}s currently in your squad ({currentCount}/{maxAllowed}).
          </div>

          {isCraftable && recipe && (
            <div className="mb-4 p-3.5 rounded-2xl bg-surface-2/50 border border-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fg">Recruit {classDef.name}</span>
                <span className="text-[11px] text-muted font-mono">{currentCount}/{maxAllowed}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {Object.entries(recipe.materials).map(([matId, reqQty]) => {
                  const item = ITEMS[matId];
                  const has = (save.inventory ?? {})[matId] ?? 0;
                  return (
                    <div key={matId} className="flex justify-between px-2 py-1 rounded-lg bg-surface/70">
                      <span>{item?.icon ?? "📦"} {item?.name ?? matId}</span>
                      <span className={has >= reqQty ? "text-emerald-400 font-bold" : "text-red-400"}>
                        {has}/{reqQty}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Button
                size="sm"
                onClick={handleRecruitUnit}
                disabled={!recruitCheck.allowed}
                className="w-full mt-2 rounded-xl font-bold gap-1.5"
              >
                <UserPlus className="size-4" />
                Recruit {classDef.name}
              </Button>
            </div>
          )}

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
  const currentWeapon = currentUnit.weapon ? ITEMS[currentUnit.weapon] : undefined;
  const currentShield = currentUnit.shield ? ITEMS[currentUnit.shield] : undefined;
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
      const oldEquippedId = slot === "weapon" ? currentUnit.weapon : slot === "shield" ? currentUnit.shield : currentUnit.helmet;
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
    const oldEquippedId = slot === "weapon" ? currentUnit.weapon : slot === "shield" ? currentUnit.shield : currentUnit.helmet;
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
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl tracking-wide text-fg">{classDef.name} Squad</h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-surface-2 text-muted">
                  {currentCount}/{maxAllowed}
                </span>
              </div>
              <p className="text-xs text-muted">Optimize gear & manage units in your {classDef.name} division</p>
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

        {/* Action Notifications */}
        {optimizeNotice && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/20 border border-accent/40 text-xs text-accent font-medium my-2 animate-fade-in">
            <Sparkles className="size-4 shrink-0" />
            <span>{optimizeNotice}</span>
          </div>
        )}
        {recruitNotice && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-medium my-2 animate-fade-in">
            <Check className="size-4 shrink-0" />
            <span>{recruitNotice}</span>
          </div>
        )}

        {/* Unit Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 border-b border-border/40 scrollbar-none">
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
                <UnitSpritePreview unit={u} size={36} className="rounded-lg bg-surface-2/40" />
                <div>
                  <p className="text-xs font-bold leading-tight text-fg">
                    {cDef.name} #{i + 1}
                  </p>
                  <p className="text-[10px] text-muted capitalize">{u.cls}</p>
                </div>
              </button>
            );
          })}

          {/* Quick Recruit Card in Strip if slots are open */}
          {isCraftable && currentCount < maxAllowed && (
            <button
              type="button"
              onClick={handleRecruitUnit}
              disabled={!recruitCheck.allowed}
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-2xl border border-dashed px-3 py-2 text-left transition-all",
                recruitCheck.allowed
                  ? "border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 cursor-pointer"
                  : "border-border/60 bg-surface/30 opacity-60 cursor-not-allowed text-muted"
              )}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2/60">
                <UserPlus className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">
                  + Recruit #{currentCount + 1}
                </p>
                <p className="text-[10px]">
                  {recruitCheck.allowed ? "Ready to Train" : "Need Mats"}
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Main Body: Unit Details & Slots */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Unit Info & Stats Card */}
            <div className="rounded-2xl border border-border/80 bg-surface/60 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <UnitSpritePreview
                  unit={currentUnit}
                  size={56}
                  className="rounded-xl bg-surface-2/50 border border-border/50"
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
                      ⚔️ Weapon / Main Armament
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

              {/* Shield Slot for Aegiskin */}
              {currentUnit.cls === "aegis" && (
                <div
                  className={cn(
                    "rounded-2xl border p-3.5 transition-all",
                    selectingSlot === "shield"
                      ? "border-accent bg-accent/10 ring-1 ring-accent/30"
                      : "border-border/80 bg-surface/60"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                      🛡️ Shield / Offhand
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectingSlot(selectingSlot === "shield" ? null : "shield")}
                      className="h-7 text-xs gap-1 text-accent hover:text-accent"
                    >
                      <ArrowRightLeft className="size-3.5" />
                      {selectingSlot === "shield" ? "Cancel" : "Change"}
                    </Button>
                  </div>

                  {currentShield ? (
                    <div className="flex items-center justify-between bg-surface-2/50 p-2.5 rounded-xl border border-border/40">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{currentShield.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-fg leading-snug">{currentShield.name}</p>
                          <p className="text-[11px] text-muted">
                            +{currentShield.equipment?.hpBonus ?? 0} HP · +
                            {Math.round((currentShield.equipment?.defenseBonus ?? 0) * 100)}% Def · +
                            {currentShield.equipment?.damageBonus ?? 0} Dmg
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-muted border border-dashed border-border rounded-xl">
                      No shield equipped
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

          {/* Recruitment Resource Costs & Status Card if squad not full */}
          {isCraftable && currentCount < maxAllowed && recipe && !selectingSlot && (
            <div className="rounded-2xl border border-border/80 bg-surface/50 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="size-3.5 text-accent" />
                  Recruit Another {classDef.name} ({currentCount}/{maxAllowed})
                </span>
                <span className="text-[11px] text-muted font-mono">
                  {recruitCheck.allowed ? "Materials ready" : "Requires materials"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(recipe.materials).map(([matId, reqQty]) => {
                  const item = ITEMS[matId];
                  const available = (save.inventory ?? {})[matId] ?? 0;
                  const hasEnough = available >= reqQty;
                  return (
                    <div
                      key={matId}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl border text-xs",
                        hasEnough ? "border-border/60 bg-surface/80" : "border-red-500/30 bg-red-950/20"
                      )}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{item?.icon ?? "📦"}</span>
                        <span className="truncate font-medium text-fg">{item?.name ?? matId}</span>
                      </div>
                      <span
                        className={cn(
                          "font-mono font-bold text-[11px] ml-1 shrink-0 px-1.5 py-0.5 rounded",
                          hasEnough ? "text-emerald-400 bg-surface-2" : "text-red-400 bg-red-900/40"
                        )}
                      >
                        {available}/{reqQty}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  onClick={handleRecruitUnit}
                  disabled={!recruitCheck.allowed}
                  className="rounded-xl font-bold gap-1.5 text-xs h-8"
                >
                  <UserPlus className="size-3.5" />
                  Train & Recruit {classDef.name} #{currentCount + 1}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeGear}
            className="rounded-xl text-xs gap-1.5 text-accent border-accent/40 hover:bg-accent/10"
          >
            <Wand2 className="size-3.5" />
            Auto-Optimize {classDef.name} Gear
          </Button>
          <Button onClick={onClose} className="rounded-xl px-5">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
