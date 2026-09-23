# Fusion ATLAS 3.0 - Netlify deploy

This package adds same-origin Netlify Functions so the iPhone web app can load real market data instead of showing only the static shell.

## What connects without extra keys

- TWSE / TPEx: latest official post-market snapshot.
- FinMind TaiwanStockPrice: historical daily bars. A FinMind token is optional; without a token FinMind currently documents a lower hourly request limit.
- Radar warm-up: after the first successful Taiwan quote load, the site automatically requests daily bars for up to 8 leading loaded names so the radar is not entirely blank.

## Optional environment variables

Set these in Netlify only when needed. Never put them in site/app.js or a public GitHub file.

- FINMIND_TOKEN: optional, raises the FinMind request allowance for a verified account.
- TWELVE_DATA_API_KEY: needed for US / JP / KR data and symbol search.
- OPENAI_API_KEY + OPENAI_MODEL: optional online research assistant.

## Deploy to the existing Netlify project

1. Create a GitHub repository and upload the CONTENTS of this folder. `netlify.toml` must be at repository root.
2. In the existing Netlify project for `spiffy-vacherin-6d2081.netlify.app`, connect that repository under the project's continuous-deployment / repository settings.
3. Netlify should read `netlify.toml` automatically. Publish directory is `site`; Functions directory is `netlify/functions`; no build command is required.
4. Trigger a production deploy.
5. Test these URLs in Safari or desktop browser:
   - https://spiffy-vacherin-6d2081.netlify.app/api/status
   - https://spiffy-vacherin-6d2081.netlify.app/api/quotes?market=TW
   The first should return JSON with `ok: true`. The second should return a JSON `quotes` array when TWSE / TPEx are reachable.
6. Open `https://spiffy-vacherin-6d2081.netlify.app/#radar`. The site now attempts same-origin API connection automatically. The first few radar rows may take a short time while historical daily bars are fetched.

## If Safari still shows the old static version

The package bumps the service-worker cache to `atlas-shell-fusion-v3.0.0`. If an old installed Home Screen app is still cached, close it completely, open the site once in Safari, reload, and then reopen the Home Screen app.

## Data notes

- Taiwan quote data is post-market, not broker-grade intraday real-time data.
- Historical bars are unadjusted daily bars unless the upstream source says otherwise.
- Technical radar scores are transparent rule scores, not probabilities and not a prediction of tomorrow's return.
- `dataset` endpoints depend on FinMind dataset permissions; some chip / fundamental / news datasets may require provider entitlement.
- A public Netlify URL exposes these API endpoints to anyone who knows the URL. Provider secrets remain server-side, but request quota can still be consumed. For a private production service, add authentication and server-side rate limiting.
