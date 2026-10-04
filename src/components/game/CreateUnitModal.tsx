import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CLASSES,
  MAX_UNITS_PER_CLASS,
  UNIT_CREATION_RECIPES,
  canCreateUnit,
  getDefaultStarterGear,
} from "@/game/data/units";
import { ITEMS } from "@/game/data/items";
import type { UnitClass } from "@/game/types";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { UserPlus, X, Sparkles, Check, AlertCircle } from "lucide-react";
import { UnitSpritePreview } from "./UnitSpritePreview";

const CRAFTABLE_CLASSES: Exclude<UnitClass, "banner">[] = [
  "spear", // Spearkin
  "aegis", // Aegiskin
  "bow", // Bowkin
  "kiba", // Horsekin
  "deka", // Bludgeonkin
  "mega", // Warhornkin
  "tori", // Wingkin
  "maho", // Magekin
  "robo", // Mechakin
];

interface CreateUnitModalProps {
  open: boolean;
  onClose: () => void;
  initialClass?: UnitClass;
}

export function CreateUnitModal({ open, onClose, initialClass }: CreateUnitModalProps) {
  const save = useGame((s) => s.save);
  const patchSave = useGame((s) => s.patchSave);

  const [selectedCls, setSelectedCls] = useState<Exclude<UnitClass, "banner">>(() => {
    if (initialClass && initialClass !== "banner") return initialClass;
    return "bow";
  });
  const [createdSuccess, setCreatedSuccess] = useState<string | null>(null);

  if (!open) return null;

  const currentCount = (save.roster ?? []).filter((u) => u.cls === selectedCls).length;
  const maxAllowed = MAX_UNITS_PER_CLASS[selectedCls] ?? 3;
  const recipe = UNIT_CREATION_RECIPES[selectedCls];
  const check = canCreateUnit(selectedCls, save.roster ?? [], save.inventory ?? {});
  const classDef = CLASSES[selectedCls];
  const selectedPreviewUnit = {
    id: `preview-${selectedCls}`,
    cls: selectedCls,
    level: 1,
    ...getDefaultStarterGear(selectedCls),
  };

  const handleCreate = () => {
    if (!check.allowed || !recipe) return;

    patchSave((prev) => {
      const updatedInv = { ...prev.inventory };
      // Deduct materials
      for (const [matId, reqQty] of Object.entries(recipe.materials)) {
        updatedInv[matId] = (updatedInv[matId] ?? 0) - reqQty;
        if (updatedInv[matId] <= 0) {
          delete updatedInv[matId];
        }
      }

      // Create new unit with basic starter gear
      const starterGear = getDefaultStarterGear(selectedCls);
      const newUnitId = `unit-${selectedCls}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newUnit = {
        id: newUnitId,
        cls: selectedCls,
        level: 1,
        weapon: starterGear.weapon,
        helmet: starterGear.helmet,
      };

      return {
        ...prev,
        inventory: updatedInv,
        roster: [...(prev.roster ?? []), newUnit],
      };
    });

    setCreatedSuccess(`${classDef.name} recruited!`);
    setTimeout(() => {
      setCreatedSuccess(null);
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col max-h-[92dvh] w-full max-w-lg rounded-3xl border border-border/80 bg-surface/95 p-5 shadow-2xl backdrop-blur-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wide text-fg">Barracks · Train Units</h2>
              <p className="text-xs text-muted">Use camp materials to recruit and expand your squad</p>
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

        {/* Unit Class Selection Tabs */}
        <div className="grid grid-cols-4 gap-2 py-3 border-b border-border/40 max-h-40 overflow-y-auto">
          {CRAFTABLE_CLASSES.map((cls) => {
            const isSelected = selectedCls === cls;
            const cDef = CLASSES[cls];
            const count = (save.roster ?? []).filter((u) => u.cls === cls).length;
            const previewUnit = {
              id: `preview-${cls}`,
              cls,
              level: 1,
              ...getDefaultStarterGear(cls),
            };
            const max = MAX_UNITS_PER_CLASS[cls] ?? 3;
            const isFull = count >= max;

            return (
              <button
                key={cls}
                type="button"
                onClick={() => {
                  setSelectedCls(cls);
                  setCreatedSuccess(null);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-2xl border text-center transition-all cursor-pointer",
                  isSelected
                    ? "border-accent bg-accent/15 shadow-sm ring-1 ring-accent/30"
                    : "border-border/60 bg-surface/60 hover:bg-surface-2"
                )}
              >
                <UnitSpritePreview unit={previewUnit} size={36} className="rounded-lg bg-surface-2/40" />
                <div>
                  <p className="text-[11px] font-bold text-fg leading-tight truncate max-w-[70px]">{cDef.name}</p>
                  <p className="text-[9px] text-muted">{cDef.roleTitle}</p>
                  <span
                    className={cn(
                      "text-[9px] font-mono font-semibold",
                      isFull ? "text-amber-400" : "text-muted"
                    )}
                  >
                    {count}/{max}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Unit Details & Cost */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-surface/60 p-3.5">
            <UnitSpritePreview
              unit={selectedPreviewUnit}
              size={56}
              className="rounded-xl bg-surface-2/50 border border-border/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg text-fg">{classDef.name}</h3>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent uppercase">
                  {classDef.role}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Base HP: <span className="font-mono text-fg font-bold">{classDef.hp}</span> · Damage:{" "}
                <span className="font-mono text-fg font-bold">{classDef.damage}</span> · Range:{" "}
                <span className="font-mono text-fg font-bold">{classDef.range}px</span>
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {createdSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-semibold animate-fade-in">
              <Check className="size-4 shrink-0" />
              <span>{createdSuccess} Added to your active squad.</span>
            </div>
          )}

          {/* Required Materials */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
              <span>Required Resources</span>
              <span className="text-[11px] font-mono normal-case text-muted">
                Limit: {currentCount}/{maxAllowed}
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {Object.entries(recipe.materials).map(([matId, reqQty]) => {
                const item = ITEMS[matId];
                const available = save.inventory?.[matId] ?? 0;
                const hasEnough = available >= reqQty;

                return (
                  <div
                    key={matId}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors",
                      hasEnough
                        ? "border-border/80 bg-surface/80"
                        : "border-red-500/30 bg-red-950/20 text-red-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item?.icon ?? "📦"}</span>
                      <div>
                        <p className="font-bold text-fg leading-tight">{item?.name ?? matId}</p>
                        <p className="text-[10px] text-muted">Cost: {reqQty}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "font-mono font-bold text-xs px-2 py-0.5 rounded-md",
                        hasEnough
                          ? "bg-surface-2 text-fg"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {available}/{reqQty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {!check.allowed && (
            <div className="flex items-center gap-2 rounded-xl bg-surface-2/60 border border-border/80 p-3 text-xs text-muted">
              <AlertCircle className="size-4 text-amber-400 shrink-0" />
              <span>
                {currentCount >= maxAllowed
                  ? `You have reached the maximum quota of ${maxAllowed} ${classDef.name}s.`
                  : "Collect more meat, wood, stone, or iron scraps by clearing battle stages."}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!check.allowed}
            className="rounded-xl px-5 gap-1.5 font-bold"
          >
            <Sparkles className="size-4" />
            Recruit {classDef.name}
          </Button>
        </div>
      </div>
    </div>
  );
}
