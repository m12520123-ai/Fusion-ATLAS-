const TWSE_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL';
const TPEX_URL = 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes';
const FINMIND_URL = 'https://api.finmindtrade.com/api/v4/data';
const TWELVE_URL = 'https://api.twelvedata.com';

export class HttpError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache,
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer'
    }
  });
}

export function fail(error) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error);
  return json({ error: '\u4f3a\u670d\u5668\u8655\u7406\u5931\u6557\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002' }, 500);
}

export function env(name) {
  return String(process.env[name] || '').trim();
}

function num(value) {
  if (value === null || value === undefined || typeof value === 'boolean') return null;
  const text = String(value).trim().replaceAll(',', '').replace('\u2212', '-').replace('\uff0b', '+');
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function field(row, ...keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && String(row[key]).trim() !== '') return row[key];
  }
  return null;
}

function rocDate(value) {
  const text = String(value || '').replace(/\D/g, '');
  let y, m, d;
  if (text.length === 7) {
    y = Number(text.slice(0, 3)) + 1911;
    m = Number(text.slice(3, 5));
    d = Number(text.slice(5, 7));
  } else if (text.length === 8) {
    y = Number(text.slice(0, 4));
    m = Number(text.slice(4, 6));
    d = Number(text.slice(6, 8));
  } else return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function isoDateInZone(zone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const pick = type => parts.find(p => p.type === type)?.value;
  return `${pick('year')}-${pick('month')}-${pick('day')}`;
}

export async function fetchJson(url, { timeout = 18000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'FusionAtlas-Netlify/3.0', ...headers },
      signal: controller.signal
    });
    if (!res.ok) throw new HttpError(`\u4e0a\u6e38\u670d\u52d9\u56de\u61c9 HTTP ${res.status}\uff0c\u8acb\u7a0d\u5f8c\u518d\u8a66\u3002`, 502);
    const text = await res.text();
    if (text.length > 25 * 1024 * 1024) throw new HttpError('\u4e0a\u6e38\u8cc7\u6599\u904e\u5927\uff0c\u5df2\u505c\u6b62\u8b80\u53d6\u3002', 502);
    try { return JSON.parse(text); }
    catch { throw new HttpError('\u4e0a\u6e38\u6c92\u6709\u56de\u50b3\u6709\u6548 JSON\u3002', 502); }
  } catch (error) {
    if (error?.name === 'AbortError') throw new HttpError('\u8cc7\u6599\u4f86\u6e90\u56de\u61c9\u903e\u6642\u3002', 504);
    if (error instanceof HttpError) throw error;
    throw new HttpError('\u7121\u6cd5\u9023\u7dda\u8cc7\u6599\u4f86\u6e90\u3002', 502);
  } finally {
    clearTimeout(timer);
  }
}

export function normalizeQuotes(rows, market) {
  if (!Array.isArray(rows)) throw new HttpError(`${market} \u56de\u50b3\u683c\u5f0f\u4e0d\u7b26\u3002`);
  const out = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const id = String(field(row, 'Code', 'SecuritiesCompanyCode', 'SecurityCode') || '').trim();
    const name = String(field(row, 'Name', 'CompanyName', 'SecuritiesCompanyName', 'SecuritiesName') || '').trim();
    const date = rocDate(field(row, 'Date', 'date'));
    if (!/^[A-Za-z0-9._-]{1,16}$/.test(id) || !name || !date) continue;
    const priceRaw = num(field(row, 'ClosingPrice', 'Close', 'Closing'));
    const delta = num(field(row, 'Change', 'PriceChange'));
    const volume = num(field(row, 'TradeVolume', 'TradingShares'));
    const amount = num(field(row, 'TradeValue', 'TransactionAmount', 'TradingAmount'));
    const price = priceRaw !== null && priceRaw > 0 ? priceRaw : null;
    const previous = price !== null && delta !== null ? price - delta : null;
    const change = previous !== null && previous > 0 ? delta / previous * 100 : null;
    out.push({
      id, name, market, date, price, change,
      volume: volume !== null && volume >= 0 ? volume / 1000 : null,
      amount: amount !== null && amount >= 0 ? amount : null,
      currency: 'TWD',
      source: market === 'TWSE' ? 'TWSE OpenAPI' : 'TPEx OpenAPI'
    });
  }
  if (!out.length) throw new HttpError(`${market} \u6c92\u6709\u53ef\u8fa8\u8b58\u7684\u884c\u60c5\u8cc7\u6599\u3002`);
  return out;
}

export async function getTwQuotes() {
  const settled = await Promise.allSettled([
    fetchJson(TWSE_URL).then(rows => normalizeQuotes(rows, 'TWSE')),
    fetchJson(TPEX_URL).then(rows => normalizeQuotes(rows, 'TPEX'))
  ]);
  const quotes = [];
  const warnings = [];
  const sourceDates = {};
  for (let i = 0; i < settled.length; i++) {
    const market = i === 0 ? 'TWSE' : 'TPEX';
    const result = settled[i];
    if (result.status === 'fulfilled') {
      const latest = result.value.map(r => r.date).sort().at(-1);
      sourceDates[market] = latest;
      quotes.push(...result.value.filter(r => r.date === latest));
    } else warnings.push(`${market}: ${result.reason?.message || '\u53d6\u5f97\u5931\u6557'}`);
  }
  if (!quotes.length) throw new HttpError('\u7121\u6cd5\u53d6\u5f97 TWSE / TPEx \u76e4\u5f8c\u884c\u60c5\u3002', 502);
  return {
    quotes, warnings, sourceDates,
    label: Object.entries(sourceDates).map(([m, d]) => `${m} ${d}`).join(' / ') + ' \u00b7 \u6700\u8fd1\u76e4\u5f8c\u5feb\u7167',
    fetchedAt: new Date().toISOString(), mode: 'official', realtime: false
  };
}

export function normalizeBars(raw, mapping = { date: 'datetime', open: 'open', high: 'high', low: 'low', close: 'close', volume: 'volume' }) {
  if (!Array.isArray(raw)) throw new HttpError('\u65e5\u7dda\u8cc7\u6599\u683c\u5f0f\u4e0d\u6b63\u78ba\u3002');
  const seen = new Map();
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const date = String(item[mapping.date] || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const open = num(item[mapping.open]), high = num(item[mapping.high]), low = num(item[mapping.low]), close = num(item[mapping.close]), volume = num(item[mapping.volume]);
    if ([open, high, low, close].some(v => v === null || v <= 0)) continue;
    if (high < Math.max(open, close) || low > Math.min(open, close) || high < low) continue;
    if (volume !== null && volume < 0) continue;
    if (seen.has(date)) throw new HttpError('\u4f86\u6e90\u542b\u91cd\u8907\u65e5\u671f\u65e5\u7dda\uff0c\u672a\u8f09\u5165\u3002');
    seen.set(date, { date, open, high, low, close, volume });
  }
  return [...seen.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export const currencies = { TW: 'TWD', US: 'USD', JP: 'JPY', KR: 'KRW' };

export async function finmind(dataset, params = {}) {
  const url = new URL(FINMIND_URL);
  url.searchParams.set('dataset', dataset);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  const token = env('FINMIND_TOKEN');
  if (token) url.searchParams.set('token', token);
  const data = await fetchJson(url.toString(), { timeout: 22000 });
  if (!data || data.status !== 200 || !Array.isArray(data.data)) throw new HttpError(`FinMind \u672a\u63d0\u4f9b ${dataset}\u3002\u8acb\u78ba\u8a8d\u4ee3\u865f\u3001\u984d\u5ea6\u6216\u65b9\u6848\u3002`, 502);
  return data.data;
}

function overseasParams(id, market) {
  if (!['US', 'JP', 'KR'].includes(market)) throw new HttpError('\u672a\u77e5\u6d77\u5916\u5e02\u5834\u3002', 400);
  if (!/^[A-Za-z0-9._-]{1,16}$/.test(id)) throw new HttpError('\u80a1\u7968\u4ee3\u865f\u683c\u5f0f\u932f\u8aa4\u3002', 400);
  if (market === 'JP') return { symbol: id.replace(/\.T$/i, ''), mic_code: 'XJPX' };
  if (market === 'KR') return { symbol: id.replace(/\.KS$/i, ''), mic_code: 'XKRX' };
  return { symbol: id.toUpperCase(), country: 'United States' };
}

async function twelve(endpoint, params) {
  const key = env('TWELVE_DATA_API_KEY');
  if (!key) throw new HttpError('\u5c1a\u672a\u8a2d\u5b9a TWELVE_DATA_API_KEY\uff0c\u6d77\u5916\u8cc7\u6599\u7121\u6cd5\u9023\u7dda\u3002', 503);
  const url = new URL(`${TWELVE_URL}/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  url.searchParams.set('apikey', key);
  const data = await fetchJson(url.toString(), { timeout: 22000 });
  if (!data || data.status === 'error') throw new HttpError('\u6d77\u5916\u8cc7\u6599\u4f86\u6e90\u672a\u63d0\u4f9b\u8cc7\u6599\u3002\u8acb\u78ba\u8a8d\u4ee3\u865f\u8207\u65b9\u6848\u6b0a\u9650\u3002', 502);
  return data;
}

export async function getHistory(id, market = 'TW') {
  market = String(market || 'TW').toUpperCase();
  if (['TW', 'TWSE', 'TPEX'].includes(market)) {
    if (!/^\d{4,6}$/.test(id)) throw new HttpError('\u53f0\u80a1\u6b77\u53f2\u65e5\u7dda\u53ea\u63a5\u53d7 4-6 \u78bc\u4ee3\u865f\u3002', 400);
    const end = isoDateInZone('Asia/Taipei');
    const startDate = new Date(end + 'T00:00:00Z');
    startDate.setUTCDate(startDate.getUTCDate() - 420);
    const raw = await finmind('TaiwanStockPrice', { data_id: id, start_date: startDate.toISOString().slice(0, 10), end_date: end });
    const rows = normalizeBars(raw, { date: 'date', open: 'open', high: 'max', low: 'min', close: 'close', volume: 'Trading_Volume' }).filter(r => r.date <= end);
    if (rows.length < 2) throw new HttpError('\u65e5\u7dda\u8cc7\u6599\u4e0d\u8db3\u3002', 502);
    return { stock: id, market: 'TW', currency: 'TWD', source: 'FinMind TaiwanStockPrice', adjusted: false, realtime: false, rows, fetchedAt: new Date().toISOString() };
  }
  const params = overseasParams(id, market);
  const data = await twelve('time_series', { ...params, interval: '1day', outputsize: 500, order: 'ASC', adjust: 'none', format: 'JSON' });
  let rows = normalizeBars(data.values || []);
  const zone = market === 'US' ? 'America/New_York' : market === 'JP' ? 'Asia/Tokyo' : 'Asia/Seoul';
  const localToday = isoDateInZone(zone);
  rows = rows.filter(r => r.date < localToday);
  if (rows.length < 2) throw new HttpError('\u6d77\u5916\u65e5\u7dda\u8cc7\u6599\u4e0d\u8db3\u3002', 502);
  const meta = data.meta || {};
  return { stock: id, market, currency: currencies[market], source: 'Twelve Data time_series', adjusted: false, realtime: false, name: String(meta.symbol || id), rows, fetchedAt: new Date().toISOString() };
}

export async function searchMarket(query, market) {
  query = String(query || '').trim();
  market = String(market || 'TW').toUpperCase();
  if (!query || query.length > 80) throw new HttpError('\u641c\u5c0b\u6587\u5b57\u9808\u70ba 1-80 \u5b57\u3002', 400);
  if (!currencies[market]) throw new HttpError('\u672a\u77e5\u5e02\u5834\u3002', 400);
  if (market === 'TW') {
    const result = await getTwQuotes();
    const q = query.toLowerCase();
    return { results: result.quotes.filter(r => r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)).slice(0, 30).map(r => ({ id: r.id, name: r.name, market: r.market, currency: 'TWD' })), source: 'TWSE / TPEx' };
  }
  const data = await twelve('symbol_search', { symbol: query, outputsize: 60 });
  const countries = { US: ['united states', 'united states of america', 'usa'], JP: ['japan'], KR: ['south korea', 'korea', 'korea, republic of'] };
  const results = [];
  for (const row of data.data || []) {
    const country = String(row.country || '').toLowerCase();
    if (!countries[market].includes(country)) continue;
    const symbol = String(row.symbol || '');
    if (!/^[A-Za-z0-9._-]{1,12}$/.test(symbol)) continue;
    const id = market === 'JP' ? `${symbol}.T` : market === 'KR' ? `${symbol}.KS` : symbol;
    if (id.length > 16) continue;
    results.push({ id, name: String(row.instrument_name || symbol), market, currency: currencies[market], exchange: String(row.exchange || '') });
  }
  return { results: results.slice(0, 30), source: 'Twelve Data symbol_search' };
}

export function institutionMetrics(rows, tradingDates) {
  const groups = { foreignStreak: ['Foreign_Investor'], trustStreak: ['Investment_Trust'], dealerStreak: ['Dealer', 'Dealer_self', 'Dealer_Hedging'] };
  const days = [...new Set(tradingDates)].sort();
  const metrics = {};
  for (const [metric, names] of Object.entries(groups)) {
    const daily = new Map();
    for (const row of rows) {
      if (!names.includes(row.name) || !days.includes(row.date)) continue;
      const buy = num(row.buy), sell = num(row.sell);
      if (buy === null || sell === null || buy < 0 || sell < 0) continue;
      if (metric === 'dealerStreak') {
        const obj = daily.get(row.date) || {};
        obj[row.name] = buy - sell;
        daily.set(row.date, obj);
      } else daily.set(row.date, (daily.get(row.date) || 0) + buy - sell);
    }
    let net = new Map();
    if (metric === 'dealerStreak') {
      for (const [day, parts] of daily.entries()) {
        if ('Dealer_self' in parts && 'Dealer_Hedging' in parts) net.set(day, parts.Dealer_self + parts.Dealer_Hedging);
        else if ('Dealer' in parts) net.set(day, parts.Dealer);
      }
    } else net = daily;
    if (!days.length || !net.has(days.at(-1))) { metrics[metric] = null; continue; }
    const first = net.get(days.at(-1));
    const sign = first > 0 ? 1 : first < 0 ? -1 : 0;
    let count = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (!net.has(days[i])) { count = null; break; }
      const value = net.get(days[i]);
      const current = value > 0 ? 1 : value < 0 ? -1 : 0;
      if (current !== sign) break;
      count += 1;
    }
    metrics[metric] = count === null ? null : sign * count;
  }
  return metrics;
}

export const DATASETS = {
  institutions: ['TaiwanStockInstitutionalInvestorsBuySell', 90],
  broker: ['TaiwanStockTradingDailyReport', 7],
  holders: ['TaiwanStockHoldingSharesPer', 90],
  margin: ['TaiwanStockMarginPurchaseShortSale', 60],
  pe: ['TaiwanStockPER', 40],
  revenue: ['TaiwanStockMonthRevenue', 400],
  financials: ['TaiwanStockFinancialStatements', 760],
  dividend: ['TaiwanStockDividend', 760],
  disposition: ['TaiwanStockDispositionSecuritiesPeriod', 60],
  news: ['TaiwanStockNews', 3]
};

export { isoDateInZone };
