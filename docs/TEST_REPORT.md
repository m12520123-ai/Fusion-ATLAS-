# v10 test report - 2026-09-24

Version: 10.0.0 / yahoo-overseas-10.

## Executed checks
- `npm run check`: expected frontend and Netlify source files found.
- `npm test`: 78 tests passed (42 retained core + 36 Yahoo integration/parser tests).
- Embedded Chromium desktop/mobile harness: 46 checks passed, no JavaScript page
  exceptions, 1440x1000 desktop and 390x844 touch layout without document overflow.

Browser checks covered all 20 US / 4 JP / 4 KR catalog quotes; source labels and
exchange times; daily/weekly/monthly candles; selected-market signals; Yahoo
remote lookup; out-of-catalog watched-symbol reload; unchanged v9 storage key;
market switching; volume heatmap; partial-failure old-cache messages; mobile
company and diagnostic screens. The fixture prices are NOT market prices.

Backend checks include ticker validation and suffixes, wrong currencies/symbols,
null/invalid bars, incomplete session exclusion, previous-close correctness,
independent adjusted close, search filtering, all three markets without Twelve
Data keys, batching, simultaneous-call dedupe, two-request limit, 429 cooldown,
403 stop/no bypass, cached results and token-protected cache headers.

## Material limitations
All successful data tests used synthetic Yahoo-shaped and Taiwan-shaped fixtures.
Actual Yahoo chart requests for AAPL, 7203.T and 005930.KS failed to connect from
this execution environment. That does not prove the endpoint works or fails from
your Netlify region. No deployed-site acceptance or live data accuracy claims.

The browser environment blocked HTTP navigation. The test loaded the bundled
frontend via page.set_content and bridged API calls to a local fixture server.
This tests the view and application flow, NOT hosted module loading, real HTTPS
routing, browser-origin security, service-worker installation, native persistent
storage or a physical iPhone/Safari device. Storage reload is simulated in the
embedded harness. Source file/module syntax was checked separately.

## Reproduce Node tests
```
npm run check
npm test
```

## Reproduce embedded browser tests (optional)
Requires Python requests/playwright and Chromium (testing only). From repo root:
```
ATLAS_TEST_DATA=1 PORT=8890 node scripts/dev-server.mjs
# In another terminal:
python -m pip install requests playwright
python -m playwright install chromium
node scripts/build-preview.mjs docs/test-results/v10-harness.html
python tests/browser_yahoo.py
```
The browser script accepts ATLAS_TEST_BASE, ATLAS_TEST_OUTPUT and
CHROMIUM_EXECUTABLE environment overrides. Generated harness HTML is test-only;
do NOT publish it as the production homepage. The retained browser_smoke.py is
an older v9 test and was not used for the v10 count above.

Results: docs/test-results/node-tests.txt and browser-yahoo.json.

## Production acceptance remaining
Upload and deploy; confirm /api/atlas/status version 10.0.0; test quotes/history
in US/JP/KR from the real function; inspect source dates and Yahoo errors. Then
verify iPhone Safari navigation, storage, SW update and optional access code.
Complete data permissions and hosting/operational review before broader use.
