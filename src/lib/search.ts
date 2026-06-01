import type { Platform, ProductDemo } from "../types";

const aliases: Record<string, string[]> = {
  earbuds: ["earbud", "earbuds", "buds", "airpods", "earphone", "earphones", "headphones", "headset"],
  charger: ["charger", "charging", "adapter", "usb", "usb-c", "type-c", "cable", "100w", "gan"],
  smartwatch: ["smartwatch", "smart watch", "watch", "fitness", "health", "tracker"],
  backpack: ["backpack", "bag", "laptop bag", "rucksack", "office bag", "travel bag"],
  skincare: ["skincare", "skin", "serum", "vitamin", "cream", "brightening"],
};

function clean(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(value: string) {
  const normalized = clean(value).replace(/\s+/g, "");
  if (normalized.length <= 1) return [normalized];
  return Array.from({ length: normalized.length - 1 }, (_, index) => normalized.slice(index, index + 2));
}

function dice(left: string, right: string) {
  const a = bigrams(left);
  const b = bigrams(right);
  if (!a.length || !b.length) return 0;
  const remaining = [...b];
  let matches = 0;
  a.forEach((item) => {
    const index = remaining.indexOf(item);
    if (index >= 0) {
      matches += 1;
      remaining.splice(index, 1);
    }
  });
  return (2 * matches) / (a.length + b.length);
}

function productTokens(product: ProductDemo) {
  return clean(`${product.title} ${product.category} ${product.tags.join(" ")} ${product.sellerClaims.join(" ")}`).split(" ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(haystack: string, phrase: string) {
  const normalized = clean(phrase);
  if (!normalized) return false;
  return new RegExp(`(^|\\s)${escapeRegExp(normalized)}($|\\s)`, "i").test(haystack);
}

function aliasBucket(queryTerm: string) {
  return Object.entries(aliases).find(([bucket, words]) => {
    return bucket === queryTerm || words.some((word) => word.includes(queryTerm) || queryTerm.includes(word) || dice(queryTerm, word) > 0.42);
  })?.[0];
}

function productCategoryBucket(product: ProductDemo) {
  return aliasBucket(clean(product.category).split(" ")[0]) || aliasBucket(product.tags[0] || "");
}

export function scoreProductForQuery(product: ProductDemo, query: string) {
  const normalized = clean(query);
  if (!normalized) return 1;
  const tokens = productTokens(product);
  const haystack = tokens.join(" ");
  const terms = normalized.split(" ").filter(Boolean);
  const categoryBucket = productCategoryBucket(product);

  return terms.reduce((score, term) => {
    const queryBucket = aliasBucket(term);
    if (queryBucket && queryBucket === categoryBucket) return score + 34;
    if (containsPhrase(haystack, term)) return score + 18;
    if (queryBucket && aliases[queryBucket]?.some((word) => containsPhrase(haystack, word))) return score + 24;
    const bestFuzzy = Math.max(0, ...tokens.map((token) => dice(term, token)));
    if (bestFuzzy > 0.55) return score + Math.round(bestFuzzy * 18);
    return score;
  }, 0);
}

export function searchProductsCatalog(products: ProductDemo[], query: string, platforms: Platform[]) {
  const allowed = new Set(platforms);
  const queryBuckets = new Set(
    clean(query)
      .split(" ")
      .map((term) => aliasBucket(term))
      .filter(Boolean),
  );
  const scored = products
    .map((product) => ({ product, score: allowed.has(product.platform) ? scoreProductForQuery(product, query) : 0 }))
    .filter((item) => item.score > 0)
    .filter((item) => !queryBuckets.size || queryBuckets.has(productCategoryBucket(item.product)))
    .sort((a, b) => b.score - a.score || b.product.reviewCount - a.product.reviewCount);

  return scored
    .map((item) => item.product);
}

export const suggestedSearches = [
  "wireless earbuds",
  "USB-C charger",
  "smart watch",
  "laptop backpack",
  "skincare serum",
];
