import { demoProducts } from "../src/data/products";
import { analyzeProduct } from "../src/lib/analysis";

const rows = demoProducts.map((product) => {
  const analysis = analyzeProduct(product);
  return {
    product: product.title,
    platform: product.platform,
    trustScore: analysis.trustScore,
    verdict: analysis.finalVerdict,
    grounded: analysis.categoryCounts.Grounded,
    suspicious: analysis.categoryCounts.Suspicious,
    ghost: analysis.categoryCounts.Ghost,
    issues: analysis.issueMap.length,
  };
});

console.table(rows);
