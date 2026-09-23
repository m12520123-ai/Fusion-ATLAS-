# ATLAS Industry Research Map - v10.0.0

Yahoo Finance overseas quote/history adapter for the existing v9 Netlify app.
US, Japan and Korea no longer depend on TWELVE_DATA_API_KEY. Taiwan keeps the
existing official end-of-day and FinMind sources. This package does NOT deploy
itself, replace your hosted site, or grant any third-party data rights.

Chinese deployment guide: [docs/UPDATE_GUIDE.md](docs/UPDATE_GUIDE.md).

## Deploy
Upload the CONTENTS of this directory to your current GitHub repository root.
Keep site/, server/, scripts/, netlify.toml and package.json together. Netlify:
- build: `node scripts/check-build.mjs`
- publish: `site`
- functions: `server/functions`
- Node: 22
- one custom route: `/api/atlas/*` (no default-function rewrite)
After Published, open `/start.html` and use the update button. Keep FINMIND_TOKEN
server-side. Legacy netlify/functions files may remain but are not selected.
Existing v9 user data is intentionally retained under `atlas-map-v9-user`.

## Overseas behavior
- Latest available Yahoo price, source timestamp, exchange timezone and currency.
- Symbols: AAPL / NVDA, 7203.T / 6758.T, 005930.KS / 000660.KS / 247540.KQ.
- Five symbols per backend batch, two upstream requests concurrently, maximum
  60 selected/watch/catalog symbols per frontend refresh. This is NOT a full
  exchange symbol database (seed index: 20 US / 4 JP / 4 KR).
- Quote requests include history, preventing duplicate chart downloads.
- Up to two years of daily chart data; complete daily bars only for indicators.
  Today's candle needs declared session close + 30 minutes and closing quote
  evidence, otherwise it is excluded conservatively.
- Five-minute successful-data cache per function instance and public CDN reply;
  no guaranteed periodic refresh or real-time streaming. Settings control
  foreground refresh; repeated clicks do not force upstream cache bypass.
- Null amount stays null. Overseas heatmaps use returned volume, not a fabricated
  close-times-volume turnover number. Quote volume is thousand shares; historical
  volume is shares. Prices and portfolios retain USD, JPY and KRW separately.
- Yahoo OHLC and adjusted close are kept separate. Returns are not total returns.
- Explicit errors, retained old-data labels, and no synthetic production fallback.
- 401/403 stop, 429 cools down; no cookie/crumb bypass, proxy rotation or evasion.
- Lookup by exact symbol or Yahoo name search, with exchange filtering.

## Source limitations and permission
The public Yahoo chart interface used here is not a contracted supported API.
No key is used by this implementation; this is NOT a guarantee of free access,
availability, redistribution rights or real-time data. The endpoint can reject
cloud requests, change schema, or return 401/403/429. Review applicable Yahoo and
provider terms and obtain any required permission for automated collection and
redistribution, including personal use. The adapter does not circumvent denial.
See docs/SOURCES.md for official source links.

No real Yahoo chart response could be obtained from the current execution
network. All passing tests used clearly labeled synthetic upstream fixtures.
Netlify production, provider eligibility, and actual iPhone Safari remain
unverified. Do not treat `overseasConfigured: true` as verified market data.

## API examples
```
/api/atlas/status
/api/atlas/quotes?market=US&symbols=AAPL,NVDA
/api/atlas/quotes?market=JP&symbols=7203.T
/api/atlas/quotes?market=KR&symbols=005930.KS,000660.KS
/api/atlas/history?market=US&stock=AAPL
/api/atlas/search?market=JP&q=Toyota
```
Status intentionally reports `overseasDataVerified: false`; it does not probe
live data or invent provider entitlement. Inspect actual quote rows and dates.
With ATLAS_ACCESS_TOKEN set, supply x-atlas-token from the app's settings. Never
include secrets in URLs, screenshots, HTML or source control.

## Local checks
Node 22+, no npm dependencies needed for server and unit tests:
```
npm run check
npm test
npm start
```
The dev server uses real sources unless ATLAS_TEST_DATA=1. Test-only fixtures
are never imported by the deployed function. For browser tests see
`docs/TEST_REPORT.md`. Synthetic preview output must NOT replace site/index.html.

## Scope
This update connects overseas prices, daily bars and search. It does not add
complete overseas financial statements, institutional flows, full-market
industry classifications, paid AIStockMap research, cloud user accounts or
background notifications. Retained v9 features and gaps: docs/FEATURE_MATRIX.md.
