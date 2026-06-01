import { ArrowRight, MessageSquareText, ScanLine, Star, TrendingUp } from "lucide-react";
import type { ProductAnalysis, ProductDemo } from "../types";
import { analyzeProduct } from "../lib/analysis";
import { ScoreRing } from "./ScoreRing";
import { VerdictPill } from "./Badges";
import { MarketplaceLogo } from "./MarketplaceLogo";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({
  product,
  onAnalyze,
}: {
  product: ProductDemo;
  onAnalyze: (product: ProductDemo) => void;
}) {
  const analysis: ProductAnalysis = analyzeProduct(product);
  const riskTone =
    analysis.finalVerdict === "High review-risk" || analysis.finalVerdict === "Not enough review data"
      ? "text-ghost-amber"
      : "text-ghost-mint";
  const riskyReviews = analysis.categoryCounts.Suspicious + analysis.categoryCounts.Ghost;
  const groundedPct = Math.round((analysis.categoryCounts.Grounded / Math.max(analysis.reviews.length, 1)) * 100);
  const topIssue = analysis.issueMap[0];

  return (
    <article className="premium-panel flex h-full flex-col gap-4 rounded-lg p-4 transition duration-300 hover:-translate-y-1 hover:border-ghost-cyan/28 hover:shadow-glow">
      <ProductVisual product={product} compact />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MarketplaceLogo platform={product.platform} compact />
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            Example report
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/62">
          <Star className="h-3.5 w-3.5 fill-ghost-amber text-ghost-amber" aria-hidden="true" />
          {product.rating}
        </span>
      </div>

      <div className="grid gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-white">{product.title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white">
            {product.category}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/62">
            {analysis.reviews.length} reviews analyzed
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/62">
            {product.price}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg border border-white/10 bg-black/18 p-4">
        <ScoreRing score={analysis.trustScore} label="trust" size="small" />
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/52">Grounded signal</span>
            <span className="font-semibold text-ghost-mint">{groundedPct}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/52">Risky reviews</span>
            <span className={`font-semibold ${riskTone}`}>{riskyReviews}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-white/52">Repeated clusters</span>
            <span className="font-semibold text-white">{analysis.repetitionScore}/100</span>
          </div>
        </div>
      </div>

      <div className="mt-auto grid gap-3 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <VerdictPill verdict={analysis.finalVerdict} />
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            {analysis.categoryCounts.Grounded} grounded
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-ghost-cyan" aria-hidden="true" />
          <p className="text-sm leading-6 text-white/66">{topIssue?.buyerWarning || analysis.summary}</p>
        </div>
        <button
          type="button"
          onClick={() => onAnalyze(product)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ghost-mint focus:outline-none focus:ring-2 focus:ring-ghost-mint/60"
        >
          <ScanLine className="h-4 w-4" aria-hidden="true" />
          View Example Report
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
