import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Download,
  FileWarning,
  Flag,
  Info,
  ListChecks,
  MessageSquareText,
  Radar,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProductAnalysis, ReviewAnalysis } from "../types";
import { CategoryPill, Pill, VerdictPill } from "./Badges";
import { ProductVisual } from "./ProductVisual";
import { ScoreRing } from "./ScoreRing";

const categoryColors: Record<string, string> = {
  Grounded: "#5ff1c8",
  Suspicious: "#ffcf66",
  Ghost: "#ff6f91",
  Unclear: "#b8c2d6",
};

const sentimentColors: Record<string, string> = {
  Positive: "#5ff1c8",
  Neutral: "#b8c2d6",
  Negative: "#ff6f91",
  Mixed: "#ffcf66",
};

const tabs = [
  { id: "receipt", label: "Trust Receipt", icon: ShieldCheck },
  { id: "issues", label: "Buyer Issues", icon: ListChecks },
  { id: "reviews", label: "Review X-Ray", icon: Radar },
  { id: "claims", label: "Claims + Q&A", icon: FileWarning },
] as const;

type TabId = (typeof tabs)[number]["id"];

function MetricCard({
  label,
  value,
  detail,
  tone = "info",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "good" | "watch" | "risk" | "info";
}) {
  const toneClass = {
    good: "text-ghost-mint",
    watch: "text-ghost-amber",
    risk: "text-ghost-rose",
    info: "text-ghost-cyan",
  }[tone];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/62">{detail}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink/95 px-3 py-2 text-xs text-white shadow-soft">
      <p className="font-medium">{label || payload[0].name}</p>
      <p className="text-white/65">{payload[0].value}</p>
    </div>
  );
}

function ReviewCard({ analysis }: { analysis: ReviewAnalysis }) {
  const topFlag = analysis.flags[0];
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <CategoryPill category={analysis.category} />
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
              {analysis.review.rating} star
            </span>
            {analysis.review.verified === true ? (
              <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                Verified context
              </span>
            ) : null}
          </div>
          <h4 className="text-base font-semibold text-white">{analysis.review.title}</h4>
          <p className="mt-1 text-xs text-white/45">
            {analysis.review.reviewer}
            {analysis.review.date ? ` · ${analysis.review.date}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right text-xs">
          <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
            <p className="text-white/45">Risk</p>
            <p className="text-lg font-semibold text-ghost-amber">{analysis.suspicionScore}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/15 px-3 py-2">
            <p className="text-white/45">Grounded</p>
            <p className="text-lg font-semibold text-ghost-mint">{analysis.groundednessScore}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/72">{analysis.review.body}</p>
      {topFlag ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/18 p-3">
          <div className="flex items-start gap-2">
            <Flag className="mt-0.5 h-4 w-4 text-ghost-amber" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{topFlag.label}</p>
              <p className="mt-1 text-sm leading-5 text-white/62">{topFlag.explanation}</p>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {analysis.flags.slice(1, 4).map((flag) => (
          <span key={flag.label} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/62">
            {flag.label}
          </span>
        ))}
        {analysis.repeatedPhrases.slice(0, 2).map((phrase) => (
          <span key={phrase} className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">
            "{phrase}"
          </span>
        ))}
      </div>
    </article>
  );
}

function exportAnalysis(analysis: ProductAnalysis) {
  const payload = {
    product: {
      title: analysis.product.title,
      platform: analysis.product.platform,
      category: analysis.product.category,
    },
    trustScore: analysis.trustScore,
    verdict: analysis.finalVerdict,
    categoryCounts: analysis.categoryCounts,
    issueMap: analysis.issueMap,
    claimSignals: analysis.claimSignals,
    generatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ghostcart-trust-receipt.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function AnalysisDashboard({
  analysis,
  onBack,
}: {
  analysis: ProductAnalysis;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("receipt");
  const splitData = useMemo(
    () =>
      Object.entries(analysis.categoryCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [analysis],
  );
  const sentimentData = useMemo(
    () =>
      Object.entries(analysis.sentimentCounts).map(([name, value]) => ({
        name,
        value,
      })),
    [analysis],
  );
  const suspiciousReviews = analysis.reviews.filter((item) => item.category === "Suspicious" || item.category === "Ghost");

  useEffect(() => {
    setActiveTab("receipt");
  }, [analysis.product.id]);

  return (
    <section id="analysis" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/10"
        >
          Back to scan
        </button>
        <button
          type="button"
          onClick={() => exportAnalysis(analysis)}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-ghost-cyan/40 hover:bg-ghost-cyan/10"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export JSON
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="grid gap-6 lg:sticky lg:top-6 lg:self-start">
          <ProductVisual product={analysis.product} />
          <div className="glass rounded-lg p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill className="border-white/10 bg-white/5 text-white/70">{analysis.product.platform}</Pill>
              <VerdictPill verdict={analysis.finalVerdict} />
              <Pill className="border-cyan-300/25 bg-cyan-300/10 text-cyan-100">{analysis.confidence} confidence</Pill>
            </div>
            <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">{analysis.product.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{analysis.summary}</p>
            {analysis.product.demoNote ? (
              <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                Demo analysis generated from available or sample review data. {analysis.product.demoNote}
              </div>
            ) : null}
            <div className="mt-5 flex items-center justify-center">
              <ScoreRing score={analysis.trustScore} label="trust score" caption="GhostCard" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass rounded-lg p-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-white text-ink"
                        : "border border-white/10 bg-white/5 text-white/65 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === "receipt" ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Review noise" value={`${analysis.averageSuspicion}/100`} detail="Average suspicious-pattern score across analyzed reviews." tone={analysis.averageSuspicion > 58 ? "risk" : "watch"} />
                <MetricCard label="Groundedness" value={`${analysis.averageGroundedness}/100`} detail="Experience details, product match, and concrete buyer context." tone={analysis.averageGroundedness > 62 ? "good" : "watch"} />
                <MetricCard label="Real issues" value={`${analysis.issueMap.length}`} detail="Buyer issues extracted from grounded review evidence." tone={analysis.issueMap.some((item) => item.severity === "High") ? "risk" : "info"} />
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-ghost-mint" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Review Trust Split</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={splitData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                          {splitData.map((entry) => (
                            <Cell key={entry.name} fill={categoryColors[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {splitData.map((entry) => (
                      <div key={entry.name} className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-white/70">
                        <span style={{ color: categoryColors[entry.name] }}>●</span> {entry.name}: {entry.value}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Sentiment Distribution</h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sentimentData}>
                        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis hide allowDecimals={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {sentimentData.map((entry) => (
                            <Cell key={entry.name} fill={sentimentColors[entry.name]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm leading-6 text-white/62">
                    Sentiment is cross-checked against star rating so glowing text with no detail, or negative text paired with high stars, becomes visible.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {analysis.patternInsights.map((insight) => (
                  <MetricCard key={insight.title} label={insight.title} value={insight.value} detail={insight.detail} tone={insight.tone} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "issues" ? (
            <div className="grid gap-6">
              <div className="glass rounded-lg p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-ghost-mint" aria-hidden="true" />
                      <h3 className="text-xl font-semibold text-white">Real Buyer Issue Map</h3>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                      Stop reading hundreds of reviews. GhostCart extracts repeated problems from reviews that look grounded in real product experience.
                    </p>
                  </div>
                  <Pill className="border-emerald-300/25 bg-emerald-300/10 text-emerald-100">
                    Suspicious reviews excluded
                  </Pill>
                </div>
              </div>
              {analysis.issueMap.length ? (
                <div className="grid gap-4">
                  {analysis.issueMap.map((issue) => (
                    <article key={issue.issue} className="glass rounded-lg p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">{issue.issue}</h4>
                          <p className="mt-1 text-sm text-white/50">
                            {issue.count} grounded mention{issue.count === 1 ? "" : "s"}
                            {issue.timeframe ? ` · common timeframe: ${issue.timeframe}` : ""}
                          </p>
                        </div>
                        <Pill
                          className={
                            issue.severity === "High"
                              ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                              : issue.severity === "Medium"
                                ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                                : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                          }
                        >
                          {issue.severity} severity
                        </Pill>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {issue.snippets.map((snippet) => (
                          <blockquote key={snippet} className="rounded-lg border border-white/10 bg-black/18 p-3 text-sm leading-6 text-white/70">
                            "{snippet}"
                          </blockquote>
                        ))}
                      </div>
                      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-ghost-amber" aria-hidden="true" />
                        <p className="text-sm leading-6 text-amber-50">{issue.buyerWarning}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-white/66">
                  No repeated grounded buyer issue emerged from this sample.
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "reviews" ? (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard label="Suspicious" value={`${analysis.categoryCounts.Suspicious}`} detail="Generic, repeated, paid-style, or low-evidence reviews." tone="watch" />
                <MetricCard label="Ghost" value={`${analysis.categoryCounts.Ghost}`} detail="Reviews that may not belong to this product." tone={analysis.categoryCounts.Ghost ? "risk" : "good"} />
                <MetricCard label="Repeated clusters" value={`${analysis.repetitionScore}/100`} detail="N-gram and token-overlap repetition across reviews." tone={analysis.repetitionScore > 45 ? "risk" : "info"} />
              </div>

              {suspiciousReviews.length ? (
                <div className="glass rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-ghost-amber" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-white">Suspicious Cluster Highlights</h3>
                  </div>
                  <div className="grid gap-3">
                    {suspiciousReviews.slice(0, 4).map((item) => (
                      <div key={item.review.id} className="rounded-lg border border-white/10 bg-black/18 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <CategoryPill category={item.category} />
                          <p className="text-sm font-semibold text-white">{item.review.title}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/62">{item.flags[0]?.explanation || "Review needs human checking."}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4">
                {analysis.reviews.map((review) => (
                  <ReviewCard key={review.review.id} analysis={review} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "claims" ? (
            <div className="grid gap-6">
              <div className="glass rounded-lg p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">Unsupported Seller Claims</h3>
                </div>
                <div className="grid gap-3">
                  {analysis.claimSignals.map((claim) => (
                    <div key={claim.claim} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{claim.claim}</p>
                          <p className="mt-1 text-sm leading-6 text-white/62">{claim.explanation}</p>
                        </div>
                        <Pill
                          className={
                            claim.status === "Supported"
                              ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                              : claim.status === "Contradicted"
                                ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                                : "border-amber-300/25 bg-amber-300/10 text-amber-100"
                          }
                        >
                          {claim.status}
                        </Pill>
                      </div>
                      {claim.contradictionSnippets.length ? (
                        <div className="mt-3 grid gap-2">
                          {claim.contradictionSnippets.map((snippet) => (
                            <p key={snippet} className="rounded-lg border border-rose-300/15 bg-rose-300/10 p-3 text-sm leading-6 text-rose-50">
                              "{snippet}"
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-lg p-5">
                <div className="mb-4 flex items-center gap-2">
                  <MessageSquareText className="h-5 w-5 text-ghost-violet" aria-hidden="true" />
                  <h3 className="text-lg font-semibold text-white">Q&A Quality Signals</h3>
                </div>
                {analysis.qaSignals.length ? (
                  <div className="grid gap-3">
                    {analysis.qaSignals.map((qa) => (
                      <div key={qa.question} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">{qa.question}</p>
                            <p className="mt-2 text-sm leading-6 text-white/66">{qa.answer}</p>
                            <p className="mt-2 text-sm text-white/45">{qa.reason}</p>
                          </div>
                          <Pill
                            className={
                              qa.risk === "High"
                                ? "border-rose-300/30 bg-rose-300/12 text-rose-100"
                                : qa.risk === "Medium"
                                  ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                                  : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100"
                            }
                          >
                            {qa.risk} risk
                          </Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-ghost-mint" aria-hidden="true" />
                    <p className="text-sm leading-6 text-white/64">No Q&A data was included for this product sample.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
