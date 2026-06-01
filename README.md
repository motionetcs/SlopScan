# SlopScan

SlopScan is a review trust analyzer for online shopping. It helps shoppers inspect the quality of product reviews before trusting a rating.

## Core Flow

1. Paste a product URL.
2. Paste or import review text.
3. Analyze review-risk signals.
4. Read, copy, print, or export the report.

## What It Detects

- Repeated praise and low-detail reviews
- Promotional or paid-style wording
- Product-category mismatch
- Unsupported seller claims
- Real buyer issue clusters
- Q&A answers that do not actually answer buyer questions

## Demo Features

- URL detection for Amazon, Flipkart, Meesho, Myntra, Walmart, Best Buy, and other stores
- Manual review paste/import flow
- Example report search
- Dashboard-level trust report
- Buyer issue map
- Review X-Ray tab
- Claims and Q&A analysis
- Copyable report summary
- Print and JSON export
- Mobile-responsive layout

## PPT And Video Storyboard

Open this route after starting the app:

```text
http://localhost:5174/ppt-video-storyboard.html
```

The source files are also in `docs/`.

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
npm run analyze:demo
```

## Deployment

This repo includes a GitHub Pages workflow at `.github/workflows/deploy.yml`.

On every push to `main`, GitHub Actions:

1. Installs dependencies with `npm ci`.
2. Runs TypeScript checks.
3. Builds the Vite app.
4. Deploys `dist/` to GitHub Pages.

## Note

SlopScan flags suspicious review patterns. It does not prove that a review is fake and does not replace human judgment.
