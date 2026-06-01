import { Backpack, Cable, Headphones, PackageSearch, Sparkles, Watch } from "lucide-react";
import type { ProductDemo } from "../types";

const toneClasses: Record<ProductDemo["imageTone"], string> = {
  mint: "from-emerald-300/28 via-cyan-300/12 to-slate-950",
  cyan: "from-cyan-300/26 via-sky-400/12 to-slate-950",
  amber: "from-amber-300/28 via-lime-300/10 to-slate-950",
  rose: "from-rose-300/28 via-fuchsia-300/10 to-slate-950",
  violet: "from-violet-300/28 via-cyan-300/10 to-slate-950",
};

const ringClasses: Record<ProductDemo["imageTone"], string> = {
  mint: "border-emerald-200/40 text-emerald-100",
  cyan: "border-cyan-200/40 text-cyan-100",
  amber: "border-amber-200/40 text-amber-100",
  rose: "border-rose-200/40 text-rose-100",
  violet: "border-violet-200/40 text-violet-100",
};

function iconFor(category: string) {
  const value = category.toLowerCase();
  if (value.includes("earbud")) return Headphones;
  if (value.includes("charger")) return Cable;
  if (value.includes("watch")) return Watch;
  if (value.includes("backpack")) return Backpack;
  if (value.includes("skin")) return Sparkles;
  return PackageSearch;
}

export function ProductVisual({ product, compact = false }: { product: ProductDemo; compact?: boolean }) {
  const Icon = iconFor(product.category);
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br ${toneClasses[product.imageTone]} ${
        compact ? "h-36" : "h-56 md:h-72"
      }`}
      aria-label={product.imageLabel}
    >
      <div className="absolute inset-0 grid-mask opacity-70" />
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10 bg-white/5 blur-sm" />
      <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50">{product.platform}</p>
          <p className="max-w-[15rem] text-lg font-semibold leading-tight text-white">{product.imageLabel}</p>
        </div>
        <div className={`grid h-16 w-16 place-items-center rounded-lg border bg-white/10 ${ringClasses[product.imageTone]}`}>
          <Icon className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>
      <div className="absolute left-5 top-5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
        Demo-safe visual
      </div>
    </div>
  );
}
