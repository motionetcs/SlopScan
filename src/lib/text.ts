export const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "i",
  "in",
  "is",
  "it",
  "its",
  "my",
  "of",
  "on",
  "or",
  "so",
  "the",
  "this",
  "to",
  "was",
  "with",
  "you",
  "your",
]);

export function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%.\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function uniqueTokens(value: string) {
  return Array.from(new Set(tokenize(value)));
}

export function jaccard(a: string[], b: string[]) {
  const left = new Set(a);
  const right = new Set(b);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  left.forEach((token) => {
    if (right.has(token)) intersection += 1;
  });
  return intersection / union.size;
}

export function ngrams(tokens: string[], size: number) {
  if (tokens.length < size) return [];
  const out: string[] = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    out.push(tokens.slice(index, index + size).join(" "));
  }
  return out;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function sentenceSnippet(text: string, maxLength = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}...`;
}
