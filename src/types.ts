export type Platform = "Amazon" | "Flipkart" | "Other";

export type ReviewCategory = "Grounded" | "Suspicious" | "Ghost" | "Unclear";

export type Sentiment = "Positive" | "Neutral" | "Negative" | "Mixed";

export type FinalVerdict =
  | "Likely trustworthy"
  | "Mixed signals"
  | "Check carefully"
  | "High risk";

export interface Review {
  id: string;
  reviewer: string;
  rating: number;
  date?: string;
  verified?: boolean;
  title: string;
  body: string;
}

export interface QAItem {
  question: string;
  answer: string;
}

export interface ProductDemo {
  id: string;
  platform: Platform;
  title: string;
  price: string;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  sellerClaims: string[];
  bullets: string[];
  imageLabel: string;
  imageTone: "mint" | "cyan" | "amber" | "rose" | "violet";
  reviews: Review[];
  qa?: QAItem[];
  demoNote?: string;
}

export interface ReviewFlag {
  label: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

export interface ReviewAnalysis {
  review: Review;
  suspicionScore: number;
  groundednessScore: number;
  trustScore: number;
  category: ReviewCategory;
  sentiment: Sentiment;
  flags: ReviewFlag[];
  evidence: string[];
  similarReviewIds: string[];
  repeatedPhrases: string[];
}

export interface IssueCluster {
  issue: string;
  count: number;
  severity: "Low" | "Medium" | "High";
  timeframe?: string;
  snippets: string[];
  affectedVariant?: string;
  buyerWarning: string;
}

export interface ClaimSignal {
  claim: string;
  status: "Supported" | "Weakly supported" | "Unsupported" | "Contradicted";
  groundedMentions: number;
  contradictionSnippets: string[];
  explanation: string;
}

export interface QAQualitySignal {
  question: string;
  answer: string;
  risk: "Low" | "Medium" | "High";
  reason: string;
}

export interface PatternInsight {
  title: string;
  value: string;
  detail: string;
  tone: "good" | "watch" | "risk" | "info";
}

export interface ProductAnalysis {
  product: ProductDemo;
  reviews: ReviewAnalysis[];
  trustScore: number;
  averageSuspicion: number;
  averageGroundedness: number;
  categoryCounts: Record<ReviewCategory, number>;
  sentimentCounts: Record<Sentiment, number>;
  repetitionScore: number;
  reviewDetailQuality: number;
  unsupportedClaimCount: number;
  qaRiskScore: number;
  confidence: "Low" | "Medium" | "High";
  finalVerdict: FinalVerdict;
  summary: string;
  issueMap: IssueCluster[];
  claimSignals: ClaimSignal[];
  qaSignals: QAQualitySignal[];
  patternInsights: PatternInsight[];
}

export interface ManualImportInput {
  title: string;
  platform: Platform;
  sellerClaims: string;
  reviewsText: string;
}
