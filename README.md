# Fusion ATLAS 3.2 — TWSE MIS personal-use realtime

This build keeps the existing TWSE/TPEx official closing snapshot and FinMind historical daily bars, and changes the intraday realtime source to the TWSE MIS `getStockInfo.jsp` endpoint.

## Data roles
- `/api/quotes?market=TW`: TWSE OpenAPI + TPEx OpenAPI latest official closing snapshot.
- `/api/history?market=TW&stock=2330`: FinMind historical daily bars. `FINMIND_TOKEN` is recommended but realtime Sponsor is no longer required by this build.
- `/api/realtime?symbols=2330,2454`: TWSE MIS `getStockInfo.jsp`, up to 20 symbols per request, front-end polling about every 5 seconds while the TW market is open and the page is visible.

## Important usage boundary
TWSE publishes realtime information through MIS, but TWSE's trading-information rules restrict retransmission or providing realtime information to others without an appropriate agreement. This build is intended for the owner's personal research use. Do not market, resell, or share this deployment as a public realtime quote service without confirming the required authorization with TWSE.

The MIS `getStockInfo.jsp` endpoint is not part of the documented TWSE OpenAPI contract and may change, throttle, or block cloud requests without notice. If it fails, the app continues to retain the official closing snapshot and historical data instead of inventing replacement prices.

## Deploy
Upload the repository contents to GitHub and let the existing Netlify project deploy from `main`. `netlify.toml` publishes `site/` and deploys `netlify/functions/`.

After Published, test:
- `/api/status`
- `/api/realtime?symbols=2330,2454`
- `/#radar`

If iPhone shows an older build, close the web app/Safari tab and reopen once; service worker cache was bumped to 3.2.0.
