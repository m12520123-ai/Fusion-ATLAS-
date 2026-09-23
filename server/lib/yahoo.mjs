/**
 * Optional Yahoo Finance public-chart adapter. Not an official licensed API.
 * No authentication/cookie bypass, proxy rotation, or retries around a denial.
 * Review Yahoo/provider terms before enabling in a shared or public service.
 * Quotes retain their exchange timestamp. History excludes incomplete bars.
 */
import { HttpError, num } from './providers.mjs';

export const YAHOO_PROVIDER = 'Yahoo Finance';
export const YAHOO_CACHE_SECONDS = 300;
export const YAHOO_BATCH_LIMIT = 5;
const ORIGIN = 'https://query1.finance.yahoo.com';
const MARKETS = {
  US: { currency: 'USD', zone: 'America/New_York' },
  JP: { currency: 'JPY', zone: 'Asia/Tokyo' },
  KR: { currency: 'KRW', zone: 'Asia/Seoul' }
};
const cache = new Map();
let pauseUntil = 0, pauseCode = '', active = 0;
const waiters = [];

export class YahooError extends HttpError {
  constructor(message, status = 502, code = 'YAHOO_ERROR', upstreamStatus = null, retryAfterSeconds = 0) {
    super(message, status);
    this.code = code;
    this.provider = YAHOO_PROVIDER;
    this.upstreamStatus = upstreamStatus;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
function problem(message, status = 502, code = 'YAHOO_SCHEMA') {
  return new YahooError(message, status, code);
}
export function normalizeYahooSymbol(value, market) {
  const raw = String(value || '').trim().toUpperCase();
  if (!MARKETS[market]) throw problem('Yahoo: unsupported market.', 400, 'BAD_MARKET');
  if (market === 'JP') {
    if (!/^[0-9][0-9A-Z]{3}(?:\.T)?$/.test(raw)) throw problem('Yahoo JP: use 7203.T or a valid Tokyo symbol.', 400, 'BAD_SYMBOL');
    return raw.endsWith('.T') ? raw : raw + '.T';
  }
  if (market === 'KR') {
    const match = raw.match(/^(\d{1,6})(\.(?:KS|KQ))?$/);
    if (!match) throw problem('Yahoo KR: use 005930.KS (KOSPI) or 247540.KQ (KOSDAQ).', 400, 'BAD_SYMBOL');
    return match[1].padStart(6, '0') + (match[2] || '.KS');
  }
  if (/\.(?:T|KS|KQ|TW|TWO|TO|L|HK)$/.test(raw) || !/^[A-Z][A-Z0-9]{0,9}(?:[.-][A-Z0-9]{1,3})?$/.test(raw)) {
    throw problem('Yahoo US: use a US symbol such as AAPL, NVDA or BRK-B.', 400, 'BAD_SYMBOL');
  }
  return raw.replace('.', '-');
}
function zoneParts(timestamp, zone) {
  const date = new Date(timestamp * 1000);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const p = k => parts.find(x => x.type === k)?.value;
  return { date: `${p('year')}-${p('month')}-${p('day')}`, time: `${p('hour')}:${p('minute')}:${p('second')}` };
}
const positive = x => { const v = num(x); return v !== null && v > 0 ? v : null; };
const nonnegative = x => { const v = num(x); return v !== null && v >= 0 ? v : null; };

/** Pure parser; nowMs is injectable for timezone/session regression tests. */
export function normalizeYahooChart(payload, id, market, nowMs = Date.now()) {
  const symbol = normalizeYahooSymbol(id, market), expected = MARKETS[market];
  if (payload?.chart?.error) throw problem('Yahoo did not provide data for this symbol.', 404, 'YAHOO_SYMBOL_NOT_FOUND');
  const result = payload?.chart?.result?.[0];
  if (!result?.meta || !Array.isArray(result.timestamp)) throw problem('Yahoo chart response is missing metadata/timestamps.');
  const meta = result.meta;
  if (String(meta.symbol || '').toUpperCase() !== symbol) throw problem('Yahoo symbol does not match the requested symbol.');
  if (meta.currency !== expected.currency) throw problem('Yahoo currency does not match the selected market.', 502, 'YAHOO_CURRENCY_MISMATCH');
  const zone = meta.exchangeTimezoneName || expected.zone;
  // Do not silently interpret an exchange timestamp in the browser timezone.
  try { zoneParts(nowMs / 1000, zone); } catch { throw problem('Yahoo exchange timezone is invalid.'); }
  const q = result.indicators?.quote?.[0];
  if (!q || !['open', 'high', 'low', 'close'].every(k => Array.isArray(q[k]))) throw problem('Yahoo OHLC arrays are missing.');
  const all = [], seen = new Set();
  let skipped = 0;
  for (let i = 0; i < result.timestamp.length; i++) {
    const timestamp = num(result.timestamp[i]);
    if (timestamp === null || timestamp <= 0 || timestamp * 1000 > nowMs + 300000) { skipped++; continue; }
    const d = zoneParts(timestamp, zone);
    const open = positive(q.open[i]), high = positive(q.high[i]), low = positive(q.low[i]), close = positive(q.close[i]);
    const volume = nonnegative(q.volume?.[i]);
    if (!d || [open, high, low, close].some(v => v === null) || high < Math.max(open, close) || low > Math.min(open, close) || high < low || (volume !== null && !Number.isInteger(volume))) { skipped++; continue; }
    if (seen.has(d.date)) throw problem('Yahoo has duplicate trading dates.');
    seen.add(d.date);
    const adjustedClose = positive(result.indicators?.adjclose?.[0]?.adjclose?.[i]);
    all.push({ date: d.date, open, high, low, close, volume, adjustedClose });
  }
  all.sort((a, b) => a.date.localeCompare(b.date));
  if (!all.length) throw problem('Yahoo returned no valid daily bars.', 502, 'YAHOO_EMPTY');
  const localToday = zoneParts(nowMs / 1000, zone).date;
  const regular = meta.currentTradingPeriod?.regular;
  const regularEnd = positive(regular?.end), regularStart = positive(regular?.start);
  const regularQuoteTime = positive(meta.regularMarketTime);
  // Keep today's candle only after the declared session + 30-minute safety margin,
  // and only if the latest regular quote reaches the session close. No invented
  // holiday calendar; when metadata is inconclusive, keep previous complete bars.
  const todayClosed = regularEnd !== null && regularStart !== null && regularQuoteTime !== null &&
    zoneParts(regularStart, zone).date === localToday &&
    nowMs / 1000 >= regularEnd + 1800 && regularQuoteTime >= regularEnd - 120 &&
    zoneParts(regularQuoteTime, zone).date === localToday;
  const rows = all.filter(r => r.date < localToday || (r.date === localToday && todayClosed)).slice(-600);
  const excludedCurrentDay = all.some(r => r.date === localToday) && !todayClosed;
  const warnings = [];
  if (skipped) warnings.push(`Yahoo: ${skipped} invalid/null bar(s) skipped; no synthetic values added.`);
  const observedPrice = positive(meta.regularMarketPrice);
  const canUseQuote = observedPrice !== null && regularQuoteTime !== null && regularQuoteTime * 1000 <= nowMs + 300000;
  const lastComplete = rows.at(-1);
  if (!canUseQuote && !lastComplete) throw problem('Yahoo returned neither a valid timestamped quote nor a complete daily bar.', 502, 'YAHOO_EMPTY');
  const quoteParts = canUseQuote ? zoneParts(regularQuoteTime, zone) : { date: lastComplete.date, time: null };
  const price = canUseQuote ? observedPrice : lastComplete.close;
  const matchingBar = all.find(r => r.date === quoteParts.date);
  // chartPreviousClose is the beginning of the range, NOT yesterday's close.
  const previous = all.filter(r => r.date < quoteParts.date).at(-1);
  const previousClose = previous?.close ?? null;
  const volumeShares = canUseQuote ? nonnegative(meta.regularMarketVolume) : lastComplete.volume;
  const sourceURL = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/`;
  const quote = {
    id: symbol, name: String(meta.longName || meta.shortName || symbol), market,
    currency: expected.currency, price, previousClose, previousCloseDate: previous?.date ?? null,
    change: previousClose ? (price / previousClose - 1) * 100 : null,
    volume: volumeShares === null ? null : volumeShares / 1000,
    volumeUnit: 'thousand-shares', amount: null,
    date: quoteParts.date, time: quoteParts.time, timezone: zone,
    sourceTimestamp: canUseQuote ? new Date(regularQuoteTime * 1000).toISOString() : null,
    source: YAHOO_PROVIDER, sourceURL, exchange: String(meta.fullExchangeName || meta.exchangeName || ''),
    quoteType: canUseQuote ? 'latest-available' : 'end-of-day', realtime: false,
    delayMinutes: null, delayLabel: '\u4f9d\u4ea4\u6613\u6240\u53ef\u80fd\u5ef6\u9072\uff0c\u4e0d\u4fdd\u8b49\u5373\u6642',
    open: matchingBar?.open ?? null, high: matchingBar?.high ?? null, low: matchingBar?.low ?? null
  };
  const history = {
    stock: symbol, market, currency: expected.currency, name: quote.name,
    source: YAHOO_PROVIDER, sourceURL, timezone: zone,
    adjusted: null, adjustmentLabel: 'Yahoo OHLC; adjclose retained separately; not a total-return series.',
    realtime: false, rows, excludedCurrentDay, warnings,
    fetchedAt: new Date(nowMs).toISOString()
  };
  return { quote, history, warnings, fetchedAt: new Date(nowMs).toISOString() };
}

async function limited(fn) {
  if (active >= 2) {
    if (waiters.length >= 24) throw problem('Yahoo request queue is busy; retry later.', 429, 'YAHOO_LOCAL_BUSY');
    await new Promise(resolve => waiters.push(resolve));
  }
  active++;
  try { return await fn(); }
  finally { active--; waiters.shift()?.(); }
}
async function readLimited(response, limit = 5 * 1024 * 1024) {
  if (Number(response.headers.get('content-length')) > limit) throw problem('Yahoo response is too large.');
  const reader = response.body?.getReader();
  if (!reader) return '';
  let size = 0; const chunks = [];
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > limit) throw problem('Yahoo response is too large.');
      chunks.push(value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  return Buffer.concat(chunks).toString('utf8');
}
async function yahooJSON(path, params) {
  return limited(async () => {
    if (Date.now() < pauseUntil) throw new YahooError('\u0059ahoo \u66ab\u505c\u8acb\u6c42\uff1a\u4f86\u6e90\u9650\u5236\u6216\u62d2\u7d55\u5b58\u53d6\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002', 503, pauseCode, null, Math.ceil((pauseUntil - Date.now()) / 1000));
    const url = new URL(path, ORIGIN);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'AtlasResearch/10.0 (personal research)' }, signal: controller.signal, redirect: 'error' });
      if (!response.ok) {
        await response.body?.cancel().catch(() => {});
        const code = response.status === 429 ? 'YAHOO_RATE_LIMIT' : [401, 403].includes(response.status) ? 'YAHOO_ACCESS_DENIED' : response.status === 404 ? 'YAHOO_SYMBOL_NOT_FOUND' : 'YAHOO_HTTP_ERROR';
        let retry = 0;
        if ([401, 403, 429].includes(response.status)) {
          const h = response.headers.get('retry-after');
          retry = Math.min(3600, Math.max(response.status === 429 ? 120 : 600, Number(h) || Math.ceil((Date.parse(h || '') - Date.now()) / 1000) || 0));
          pauseUntil = Date.now() + retry * 1000; pauseCode = code;
        }
        const hint = response.status === 429 ? '\u8acb\u6c42\u904e\u591a\uff0c\u5df2\u66ab\u505c\u91cd\u8a66' : [401, 403].includes(response.status) ? '\u4f86\u6e90\u62d2\u7d55\u5b58\u53d6\uff1b\u4e0d\u662f\u7f3a\u5c11 Twelve Data \u91d1\u9470' : '\u8cc7\u6599\u53d6\u5f97\u5931\u6557';
        throw new YahooError(`Yahoo HTTP ${response.status}: ${hint}`, response.status === 404 ? 404 : response.status === 429 ? 429 : 502, code, response.status, retry);
      }
      const text = await readLimited(response);
      try { return JSON.parse(text); } catch { throw problem('Yahoo did not return JSON; data was not replaced by sample quotes.'); }
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (error?.name === 'AbortError') throw problem('Yahoo \u9023\u7dda\u903e\u6642\uff0c\u5df2\u4fdd\u7559\u820a\u8cc7\u6599\u7684\u539f\u6642\u9593\u3002', 504, 'YAHOO_TIMEOUT');
      throw problem('Yahoo \u7121\u6cd5\u9023\u7dda\uff1b\u53ef\u80fd\u662f\u4f86\u6e90\u6216\u90e8\u7f72\u74b0\u5883\u7684\u7db2\u8def\u9650\u5236\u3002', 502, 'YAHOO_NETWORK');
    } finally { clearTimeout(timer); }
  });
}
async function cachedYahoo(key, fn) {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return structuredClone(await hit.promise);
  const promise = Promise.resolve().then(fn), entry = { promise, until: Date.now() + YAHOO_CACHE_SECONDS * 1000 };
  cache.set(key, entry);
  try {
    const data = await promise;
    if (cache.size > 200) cache.delete(cache.keys().next().value);
    return structuredClone(data);
  } catch (e) { if (cache.get(key) === entry) cache.delete(key); throw e; }
}
async function series(id, market) {
  const symbol = normalizeYahooSymbol(id, market);
  return cachedYahoo(`chart:${market}:${symbol}`, async () => {
    const raw = await yahooJSON(`/v8/finance/chart/${encodeURIComponent(symbol)}`, { range: '2y', interval: '1d', includePrePost: 'false', events: 'div,splits', includeAdjustedClose: 'true' });
    return normalizeYahooChart(raw, symbol, market);
  });
}
export async function getYahooHistory(id, market) {
  const result = await series(id, market);
  if (result.history.rows.length < 2) throw problem('Yahoo has fewer than two complete daily bars.', 502, 'YAHOO_SHORT_HISTORY');
  return result.history;
}
export async function getYahooQuotes(ids, market) {
  if (!Array.isArray(ids) || !ids.length || ids.length > YAHOO_BATCH_LIMIT) throw problem(`Yahoo: request 1-${YAHOO_BATCH_LIMIT} symbols per batch.`, 400, 'BAD_BATCH');
  const symbols = [...new Set(ids.map(id => normalizeYahooSymbol(id, market)))];
  const result = await Promise.allSettled(symbols.map(id => series(id, market)));
  const quotes = [], histories = {}, warnings = [], failed = [];
  for (let i = 0; i < result.length; i++) {
    const r = result[i];
    if (r.status === 'fulfilled') {
      quotes.push(r.value.quote); histories[symbols[i]] = r.value.history;
      warnings.push(...r.value.warnings.map(x => `${symbols[i]}: ${x}`));
    } else {
      failed.push({ symbol: symbols[i], code: r.reason.code || 'YAHOO_ERROR', error: r.reason.message, upstreamStatus: r.reason.upstreamStatus || null });
      warnings.push(`${symbols[i]}: ${r.reason.message}`);
    }
  }
  if (!quotes.length) throw result.find(r => r.status === 'rejected').reason;
  return { quotes, histories, warnings, failures: failed, mode: 'external', provider: YAHOO_PROVIDER, realtime: false,
    coverage: { requested: symbols.length, received: quotes.length, missing: failed.map(f => f.symbol) },
    label: 'Yahoo Finance \u6700\u8fd1\u53ef\u7528\u5831\u50f9\uff0c\u53ef\u80fd\u5ef6\u9072',
    cacheSeconds: YAHOO_CACHE_SECONDS, fetchedAt: new Date().toISOString() };
}
export function parseYahooSearch(raw, market) {
  if (!Array.isArray(raw?.quotes)) throw problem('Yahoo search response is invalid.');
  const acceptedUS = new Set(['NYQ', 'NMS', 'NGM', 'NCM', 'ASE', 'PCX', 'BTS', 'NYS', 'NAS']);
  const results = [];
  for (const q of raw.quotes) {
    if (!['EQUITY', 'ETF'].includes(q.quoteType) || q.isYahooFinance === false) continue;
    const s = String(q.symbol || '').toUpperCase();
    if (market === 'JP' && !s.endsWith('.T')) continue;
    if (market === 'KR' && !/\.(KS|KQ)$/.test(s)) continue;
    if (market === 'US' && !acceptedUS.has(q.exchange)) continue;
    try {
      const id = normalizeYahooSymbol(s, market);
      results.push({ id, name: String(q.longname || q.shortname || id), market, currency: MARKETS[market].currency, exchange: String(q.exchDisp || q.exchange || ''), source: YAHOO_PROVIDER });
    } catch { /* Cross-market / unsupported symbols are not guessed. */ }
  }
  return { results: [...new Map(results.map(r => [r.id, r])).values()].slice(0,30), source: YAHOO_PROVIDER };
}
export async function searchYahoo(query, market) {
  const q = String(query || '').trim();
  if (!MARKETS[market] || !q || q.length > 80) throw problem('Yahoo search requires a supported market and 1-80 characters.', 400, 'BAD_SEARCH');
  // Exact symbols use the chart lookup and don't depend on the search service.
  let id;
  try { id = normalizeYahooSymbol(q, market); } catch { /* company-name lookup */ }
  if (id) {
    try { const { quote } = await series(id, market); return { results: [{ id: quote.id, name: quote.name, market, currency: quote.currency, exchange: quote.exchange, source: YAHOO_PROVIDER }], source: YAHOO_PROVIDER }; }
    catch (error) { if (error.code !== 'YAHOO_SYMBOL_NOT_FOUND') throw error; }
  }
  return cachedYahoo(`search:${market}:${q}`, async () => parseYahooSearch(await yahooJSON('/v1/finance/search', { q, quotesCount: 30, newsCount: 0, listsCount: 0, enableFuzzyQuery: 'false' }), market));
}
// Internal test helper; never exported through a public HTTP route.
export function resetYahooCacheForTests() { cache.clear(); pauseUntil = 0; pauseCode = ''; }
