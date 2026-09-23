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


## v5 routing fix
Each Netlify Function exports its own custom `config.path` such as `/api/status` and `/api/quotes`. Netlify only exposes the function at that custom path when `config.path` is set, so no redirect rule to `/.netlify/functions/*` is needed. The v4 redirect was removed because it could route `/api/*` to a default function URL that Netlify intentionally disables for custom-path functions.

Test after deploy:
- `/api/status`
- `/api/quotes?market=TW`

Do not use `/.netlify/functions/status` for this build.

## v6 / 3.1：台股盤中約 10 秒即時快照

- Netlify 新增 `/api/realtime`，使用 FinMind `taiwan_stock_tick_snapshot`。
- 需要在 Netlify Environment variables 設定 `FINMIND_TOKEN`，且 FinMind 帳號需具 Sponsor 即時資料權限。
- 台股交易時段（台北時間週一至週五 09:00–13:30）且網頁頁籤可見時，前端約每 10 秒輪詢一次。
- 為降低傳輸與額度，預設只更新內建研究清單、自選與目前開啟個股，最多 120 檔。
- 若該檔歷史日線已載入，盤中快照會暫時覆蓋／加入當日日 K，MA、KD、DMI、MACD、RSI 與量比會重新計算；收盤前數值仍可能變動。
- 關閉網頁或手機休眠後不會背景輪詢，也不會自動下單。
