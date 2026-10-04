import { useState } from "react";
import { ITEMS } from "@/game/data/items";
import { useGame } from "@/store/game-store";
import { cn } from "@/lib/utils";
import { Package, X, Shield, Sparkles, Filter } from "lucide-react";

interface InventoryModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = "all" | "materials" | "gear";

export function InventoryModal({ open, onClose }: InventoryModalProps) {
  const save = useGame((s) => s.save);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  if (!open) return null;

  const inventoryEntries = Object.entries(save.inventory ?? {})
    .filter(([, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const item = ITEMS[itemId] ?? {
        id: itemId,
        name: itemId,
        description: "Tribal item or craft material",
        category: "material",
        rarity: "common",
        icon: "📦",
      };
      return { item, qty };
    });

  const filteredEntries = inventoryEntries.filter(({ item }) => {
    if (activeTab === "all") return true;
    if (activeTab === "materials") return item.category !== "gear";
    if (activeTab === "gear") return item.category === "gear";
    return true;
  });

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
              <Package className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wide text-fg">Camp Inventory & Materials</h2>
              <p className="text-xs text-muted">Stockpiled resources, craft alloys, meats, and armaments</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-elevated hover:text-fg transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-border/40">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer",
              activeTab === "all"
                ? "bg-accent text-accent-fg shadow-sm"
                : "bg-surface-elevated text-muted hover:text-fg"
            )}
          >
            All Items ({inventoryEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("materials")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer",
              activeTab === "materials"
                ? "bg-accent text-accent-fg shadow-sm"
                : "bg-surface-elevated text-muted hover:text-fg"
            )}
          >
            Materials & Food
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gear")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-xl transition cursor-pointer",
              activeTab === "gear"
                ? "bg-accent text-accent-fg shadow-sm"
                : "bg-surface-elevated text-muted hover:text-fg"
            )}
          >
            Weapons & Armor
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 max-h-[60vh] pr-1">
          {filteredEntries.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm border border-dashed border-border/60 rounded-2xl">
              <Package className="size-8 mx-auto mb-2 text-muted/60" />
              <p>No items in this category yet.</p>
              <p className="text-xs text-muted/70 mt-1">Complete campaign hunts and battles to gather spoils!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredEntries.map(({ item, qty }) => {
                const rarityColor =
                  item.rarity === "epic"
                    ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                    : item.rarity === "rare"
                    ? "text-blue-400 border-blue-500/30 bg-blue-500/10"
                    : item.rarity === "uncommon"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : "text-amber-300 border-amber-500/20 bg-amber-500/5";

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/60 bg-surface-elevated/70 hover:border-accent/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface border border-border/80 text-xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-fg leading-tight">{item.name}</p>
                          <span
                            className={cn(
                              "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border",
                              rarityColor
                            )}
                          >
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className="font-mono text-sm font-bold text-accent">×{qty}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-elevated text-sm font-semibold text-fg hover:bg-surface-elevated/80 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
