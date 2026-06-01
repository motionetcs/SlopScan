import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleHelp,
  ClipboardList,
  FileText,
  Link as LinkIcon,
  Lock,
  Search,
  ShieldCheck,
  ShieldQuestion,
  ShoppingBag,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { AnalysisDashboard } from "./components/AnalysisDashboard";
import { Pill } from "./components/Badges";
import { ProductCard } from "./components/ProductCard";
import { ProductVisual } from "./components/ProductVisual";
import { demoProducts, winningDemoProduct } from "./data/products";
import { analyzeProduct } from "./lib/analysis";
import { createManualProduct } from "./lib/manualImport";
import type { ManualImportInput, Platform, ProductDemo } from "./types";

type EntryMode = "search" | "link" | "manual";

const defaultManualText = `Rating: 5
Amazing product, value for money, highly recommended.

Rating: 2
Used it for two weeks. The charging case became loose and the left side stopped charging.

Rating: 4
Works fine with my phone, but the mic is weak outdoors during calls.`;

const featureCards = [
  {
    icon: ShieldCheck,
    title: "Review Trust Split",
    copy: "See how many reviews look grounded, suspicious, ghost-like, or unclear.",
  },
  {
    icon: ClipboardList,
    title: "Real Buyer Issue Map",
    copy: "GhostCart extracts repeated buyer problems from reviews that look grounded in real experience.",
  },
  {
    icon: Zap,
    title: "Suspicious Cluster Detection",
    copy: "Find repeated phrases, paid-style praise, burst timing, and copy-paste patterns.",
  },
  {
    icon: ShieldQuestion,
    title: "Ghost Review Detection",
    copy: "Flag reviews that may not belong to the current product category.",
  },
];

const faqs = [
  {
    q: "Does GhostCart guarantee a review is fake?",
    a: "No. GhostCart flags suspicious patterns and explains the evidence. It does not make absolute accusations.",
  },
  {
    q: "Can it work with Amazon and Flipkart?",
    a: "The interface supports Amazon and Flipkart-style product analysis. If live reviews are unavailable due to platform restrictions, GhostCart uses demo-safe review data or manually pasted reviews.",
  },
  {
    q: "What happens if live reviews are unavailable?",
    a: "The app falls back to realistic sample data and clearly labels demo-mode analysis.",
  },
  {
    q: "What makes it different from a review summarizer?",
    a: "A summarizer compresses reviews. GhostCart evaluates trust signals, suspicious clusters, review mismatch, unsupported claims, and grounded buyer issues.",
  },
];

function platformFromUrl(value: string): Platform | null {
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    if (host.includes("amazon.")) return "Amazon";
    if (host.includes("flipkart.")) return "Flipkart";
    return "Other";
  } catch {
    return null;
  }
}

function productFromUrl(value: string, platform: Platform): ProductDemo {
  const lower = value.toLowerCase();
  const platformProducts = demoProducts.filter((product) => platform === "Other" || product.platform === platform);
  const matched =
    platformProducts.find((product) => product.tags.some((tag) => lower.includes(tag.replace(/\s+/g, "-")) || lower.includes(tag))) ||
    platformProducts.find((product) => lower.includes(product.category.toLowerCase().split(" ")[0])) ||
    platformProducts[0] ||
    winningDemoProduct;

  return {
    ...matched,
    id: `link-${matched.id}`,
    platform,
    demoNote:
      "Product URL was validated safely. Live marketplace scraping is intentionally avoided, so GhostCart used demo-safe review data for a reliable scan.",
  };
}

function searchProducts(query: string, platforms: Platform[]) {
  const normalized = query.trim().toLowerCase();
  const allowed = new Set(platforms);
  return demoProducts.filter((product) => {
    const platformMatch = allowed.has(product.platform);
    if (!platformMatch) return false;
    if (!normalized) return true;
    const haystack = `${product.title} ${product.category} ${product.tags.join(" ")} ${product.platform}`.toLowerCase();
    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .some((term) => haystack.includes(term));
  });
}

function App() {
  const [entryMode, setEntryMode] = useState<EntryMode>("search");
  const [query, setQuery] = useState("wireless earbuds");
  const [platforms, setPlatforms] = useState<Platform[]>(["Amazon", "Flipkart"]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDemo | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualInput, setManualInput] = useState<ManualImportInput>({
    title: "Imported wireless earbuds",
    platform: "Other",
    sellerClaims: "Long battery life, noise cancelling calls, fast USB-C charging",
    reviewsText: defaultManualText,
  });

  const analysis = useMemo(() => (selectedProduct ? analyzeProduct(selectedProduct) : null), [selectedProduct]);
  const results = useMemo(() => searchProducts(query, platforms), [query, platforms]);
  const previewAnalysis = useMemo(() => analyzeProduct(winningDemoProduct), []);

  useEffect(() => {
    if (selectedProduct) {
      window.setTimeout(() => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [selectedProduct]);

  function togglePlatform(platform: Platform) {
    setPlatforms((current) => {
      if (current.includes(platform) && current.length > 1) return current.filter((item) => item !== platform);
      if (current.includes(platform)) return current;
      return [...current, platform];
    });
  }

  function handleSearch(event?: FormEvent) {
    event?.preventDefault();
    setEntryMode("search");
    setHasSearched(true);
    window.setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function handleUrlScan(event: FormEvent) {
    event.preventDefault();
    setUrlError("");
    const platform = platformFromUrl(urlValue);
    if (!platform) {
      setUrlError("Paste a valid http or https product URL. GhostCart will never crash or scrape restricted review pages.");
      setSelectedProduct(null);
      return;
    }
    setSelectedProduct(productFromUrl(urlValue, platform));
  }

  function handleManualScan(event: FormEvent) {
    event.preventDefault();
    setManualError("");
    if (manualInput.reviewsText.trim().length < 20) {
      setManualError("Paste at least one review with enough text to analyze.");
      return;
    }
    setSelectedProduct(createManualProduct(manualInput));
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/72 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-3 text-left"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-ghost-mint/30 bg-ghost-mint/12 text-ghost-mint">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-white">GhostCart</span>
              <span className="block text-xs text-white/48">Review X-Ray</span>
            </span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <a href="#methodology" className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              Methodology
            </a>
            <a href="#faq" className="rounded-lg px-3 py-2 text-sm text-white/58 transition hover:bg-white/5 hover:text-white">
              FAQ
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 grid-mask opacity-45" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-24">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-5 flex flex-wrap gap-2">
                <Pill className="border-ghost-mint/25 bg-ghost-mint/10 text-ghost-mint">Hackathon-ready</Pill>
                <Pill className="border-white/10 bg-white/5 text-white/64">Demo-safe analysis engine</Pill>
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] text-white md:text-6xl">
                See what the star rating hides.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
                GhostCart scans marketplace reviews, filters suspicious review noise, and shows the real buyer issues before you buy.
              </p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/48">
                Not an AI detector. An explainable trust layer for online shopping.
              </p>

              <div className="mt-8 grid gap-4 sm:flex">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ghost-mint"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Scan a product
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(winningDemoProduct)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-ghost-cyan/30 bg-ghost-cyan/10 px-5 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-ghost-cyan/18"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Try Demo Scan
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="glass rounded-lg p-4 sm:p-5"
            >
              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { id: "search", label: "Search", icon: Search },
                  { id: "link", label: "Link", icon: LinkIcon },
                  { id: "manual", label: "Manual", icon: Upload },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const active = entryMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setEntryMode(mode.id as EntryMode)}
                      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition ${
                        active ? "bg-white text-ink" : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {entryMode === "search" ? (
                <form onSubmit={handleSearch} className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Product search</span>
                    <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 focus-within:border-ghost-mint/55">
                      <Search className="h-5 w-5 text-white/36" aria-hidden="true" />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="wireless earbuds, USB-C charger, backpack"
                        className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["Amazon", "Flipkart"] as Platform[]).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                          platforms.includes(platform)
                            ? "border-ghost-mint/35 bg-ghost-mint/12 text-ghost-mint"
                            : "border-white/10 bg-white/5 text-white/55 hover:text-white"
                        }`}
                      >
                        {platforms.includes(platform) ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                        {platform}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ghost-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Scan product
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}

              {entryMode === "link" ? (
                <form onSubmit={handleUrlScan} className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Product link</span>
                    <div className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 focus-within:border-ghost-cyan/55">
                      <LinkIcon className="h-5 w-5 text-white/36" aria-hidden="true" />
                      <input
                        value={urlValue}
                        onChange={(event) => setUrlValue(event.target.value)}
                        placeholder="https://www.amazon.com/product/..."
                        className="w-full bg-transparent py-3 text-base text-white outline-none placeholder:text-white/30"
                      />
                    </div>
                  </label>
                  {urlError ? (
                    <div className="flex items-start gap-2 rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 text-sm leading-6 text-rose-50">
                      <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      {urlError}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">
                      <Lock className="mt-0.5 h-4 w-4" aria-hidden="true" />
                      URL mode validates the marketplace and uses demo-safe fallback data instead of restricted scraping.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-ghost-cyan"
                  >
                    Analyze link
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}

              {entryMode === "manual" ? (
                <form onSubmit={handleManualScan} className="grid gap-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Product title</span>
                      <input
                        value={manualInput.title}
                        onChange={(event) => setManualInput((current) => ({ ...current, title: event.target.value }))}
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-ghost-mint/55"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-white/74">Marketplace</span>
                      <select
                        value={manualInput.platform}
                        onChange={(event) => setManualInput((current) => ({ ...current, platform: event.target.value as Platform }))}
                        className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-white outline-none focus:border-ghost-mint/55"
                      >
                        <option>Amazon</option>
                        <option>Flipkart</option>
                        <option>Other</option>
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Seller claims</span>
                    <textarea
                      value={manualInput.sellerClaims}
                      onChange={(event) => setManualInput((current) => ({ ...current, sellerClaims: event.target.value }))}
                      rows={2}
                      className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-ghost-mint/55"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-white/74">Pasted reviews</span>
                    <textarea
                      value={manualInput.reviewsText}
                      onChange={(event) => setManualInput((current) => ({ ...current, reviewsText: event.target.value }))}
                      rows={7}
                      className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-ghost-mint/55"
                    />
                  </label>
                  {manualError ? (
                    <div className="rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-50">{manualError}</div>
                  ) : null}
                  <button
                    type="submit"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-ghost-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    Run manual scan
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : null}
            </motion.div>
          </div>
        </section>

        {analysis ? <AnalysisDashboard analysis={analysis} onBack={() => setSelectedProduct(null)} /> : null}

        <section id="results" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">Marketplace scan</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">Demo product results</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProduct(winningDemoProduct)}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Load Winning Demo
            </button>
          </div>
          {hasSearched && results.length === 0 ? (
            <div className="mb-6 rounded-lg border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
              No live results found. Try a demo product or paste review text.
            </div>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {(hasSearched ? (results.length ? results : demoProducts.slice(0, 3)) : demoProducts.slice(0, 3)).map((product) => (
              <ProductCard key={product.id} product={product} onAnalyze={setSelectedProduct} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="glass rounded-lg p-5">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-ghost-mint/25 bg-ghost-mint/10 text-ghost-mint">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/62">{feature.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">Why it matters</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Fake-looking review noise wastes buyer time.</h2>
            <p className="mt-4 text-base leading-7 text-white/64">
              Star ratings compress too much. GhostCart asks whether reviews look grounded in real product experience,
              then separates buyer evidence from generic praise, repeated clusters, ghost reviews, and unsupported seller claims.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Marketplace trust", "Flags fake-looking reviews, paid-style patterns, and low-evidence praise."],
              ["Content slop", "Catches generic Q&A answers and review text that does not answer real buyer questions."],
              ["Consumer protection", "Surfaces long-term defects, mismatch, safety risk, and return friction."],
              ["Demo reliability", "Works with local data, pasted reviews, and validated product links without hidden APIs."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="glass grid gap-8 rounded-lg p-5 md:grid-cols-[0.9fr_1.1fr] md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-amber">Demo preview</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">The wow moment is the Trust Receipt.</h2>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Judges can click the earbuds demo and instantly see suspicious five-star clusters, grounded battery complaints,
                a weak ANC claim, and a buyer issue map that cuts through review noise.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
              <ProductVisual product={winningDemoProduct} compact />
              <div className="grid gap-3">
                <div className="rounded-lg border border-white/10 bg-black/18 p-4">
                  <p className="text-sm text-white/50">Preview score</p>
                  <p className="mt-1 text-3xl font-semibold text-ghost-amber">{previewAnalysis.trustScore}/100</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{previewAnalysis.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(winningDemoProduct)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-ghost-mint"
                >
                  Open Trust Receipt
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="methodology" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-ghost-mint">Methodology</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Explainable signals, not black-box accusations.</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["Experience grounding", "Rewards time used, device details, defect context, setup notes, measurements, and before/after evidence."],
                ["Similarity clusters", "Uses normalized tokens, repeated n-grams, and Jaccard overlap to flag copy-pattern review noise."],
                ["Product mismatch", "Checks whether review text mentions an unrelated product category, creating a ghost-review risk signal."],
                ["Claim support", "Compares seller claims with grounded buyer evidence and Q&A quality signals."],
              ].map(([title, copy]) => (
                <article key={title} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                  <h3 className="font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-ghost-cyan">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Honest trust analysis for a demo-safe app.</h2>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-lg border border-white/10 bg-white/[0.045] p-4 open:bg-white/[0.065]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white">
                  <span className="flex items-center gap-3">
                    <CircleHelp className="h-5 w-5 text-ghost-cyan" aria-hidden="true" />
                    {faq.q}
                  </span>
                  <span className="text-white/35 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-white/62">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-white/45 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3">
          <FileText className="h-4 w-4" aria-hidden="true" />
          GhostCart is a trust-risk demo, not a perfect fake-review detector or replacement for human judgment.
        </div>
      </footer>
    </div>
  );
}

export default App;
