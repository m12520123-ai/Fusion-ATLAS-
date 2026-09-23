import { fail, HttpError, json } from './_shared.mjs';

const MIS_HOME = 'https://mis.twse.com.tw/stock/';
const MIS_ENDPOINT = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp';
const MAX_SYMBOLS = 20;

const numberOrNull = value => {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  const n = Number(String(value).replaceAll(',', '').trim());
  return Number.isFinite(n) ? n : null;
};

const splitLevel = value => String(value || '').split('_').map(numberOrNull).filter(v => v !== null);

function isoDate(raw) {
  const s = String(raw || '').replace(/\D/g, '');
  if (s.length !== 8) return '';
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

function normalize(row) {
  const id = String(row?.c || '').trim();
  if (!/^\d{4,6}$/.test(id)) return null;
  const previous = numberOrNull(row.y);
  const latest = numberOrNull(row.z);
  const open = numberOrNull(row.o);
  const high = numberOrNull(row.h);
  const low = numberOrNull(row.l);
  const volumeLots = numberOrNull(row.v);
  const price = latest && latest > 0 ? latest : null;
  const change = price !== null && previous && previous > 0 ? (price - previous) / previous * 100 : null;
  const bids = splitLevel(row.b);
  const asks = splitLevel(row.a);
  const date = isoDate(row.d);
  const time = /^\d{2}:\d{2}:\d{2}$/.test(String(row.t || '')) ? String(row.t) : '';
  const market = String(row.ex || '').toLowerCase() === 'otc' ? 'TPEX' : 'TWSE';
  const validBar = date && [open, high, low, price].every(v => v !== null && v > 0) && high >= Math.max(open, price) && low <= Math.min(open, price);

  return {
    id,
    name: String(row.n || '').trim(),
    market,
    currency: 'TWD',
    price,
    previousClose: previous,
    change,
    volume: volumeLots,
    amount: null,
    buyPrice: bids[0] ?? null,
    sellPrice: asks[0] ?? null,
    bidPrices: bids.slice(0, 5),
    askPrices: asks.slice(0, 5),
    date,
    time,
    source: 'TWSE MIS getStockInfo',
    realtime: true,
    bar: validBar ? {
      date,
      open,
      high,
      low,
      close: price,
      // MIS v is displayed as accumulated trading lots; convert to shares for the historical-bar engine.
      volume: volumeLots === null ? null : volumeLots * 1000
    } : null
  };
}

function browserHeaders(cookie = '') {
  return {
    accept: 'application/json,text/plain,*/*',
    'accept-language': 'zh-TW,zh;q=0.9,en;q=0.7',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    referer: MIS_HOME,
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/153.0 Safari/537.36',
    ...(cookie ? { cookie } : {})
  };
}

async function fetchWithTimeout(url, options = {}, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } catch (error) {
    if (error?.name === 'AbortError') throw new HttpError('TWSE MIS 回應逾時。', 504);
    throw new HttpError('無法連線 TWSE MIS。', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function getCookie() {
  try {
    const res = await fetchWithTimeout(MIS_HOME, { headers: browserHeaders() }, 8000);
    return String(res.headers.get('set-cookie') || '').split(',').map(x => x.split(';')[0]).filter(Boolean).join('; ');
  } catch {
    return '';
  }
}

async function fetchMis(symbols) {
  // Query both listed and OTC channels. MIS will only return the valid channel for each symbol.
  const channels = [];
  for (const id of symbols) {
    channels.push(`tse_${id}.tw`, `otc_${id}.tw`);
  }
  const url = new URL(MIS_ENDPOINT);
  url.searchParams.set('ex_ch', channels.join('|'));
  url.searchParams.set('json', '1');
  url.searchParams.set('delay', '0');
  url.searchParams.set('_', String(Date.now()));

  const cookie = await getCookie();
  const res = await fetchWithTimeout(url.toString(), { headers: browserHeaders(cookie) }, 14000);
  if (!res.ok) throw new HttpError(`TWSE MIS 回應 HTTP ${res.status}。`, 502);
  const text = await res.text();
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new HttpError('TWSE MIS 沒有回傳有效 JSON。', 502); }
  if (!Array.isArray(payload?.msgArray)) throw new HttpError('TWSE MIS 回傳格式已變更或目前無資料。', 502);
  return payload.msgArray;
}

export default async (req) => {
  try {
    const requestUrl = new URL(req.url);
    const symbols = [...new Set(String(requestUrl.searchParams.get('symbols') || '')
      .split(',').map(s => s.trim()).filter(s => /^\d{4,6}$/.test(s)))].slice(0, MAX_SYMBOLS);
    if (!symbols.length) throw new HttpError('請至少提供一個台股代號。', 400);

    const rows = await fetchMis(symbols);
    const byId = new Map();
    for (const row of rows) {
      const q = normalize(row);
      if (!q || !symbols.includes(q.id)) continue;
      const old = byId.get(q.id);
      // Prefer the row that contains a live price if duplicated.
      if (!old || (q.price !== null && old.price === null)) byId.set(q.id, q);
    }
    const quotes = symbols.map(id => byId.get(id)).filter(Boolean);
    if (!quotes.length) throw new HttpError('TWSE MIS 目前沒有回傳可用行情；可能為非交易時段或來源暫時限制。', 502);

    return json({
      quotes,
      realtime: true,
      intervalSeconds: 5,
      label: 'TWSE MIS 行情 · 約 5 秒刷新（個人研究用）',
      fetchedAt: new Date().toISOString(),
      note: 'MIS getStockInfo 並非 TWSE OpenAPI 公開文件介面；可能調整或限制。'
    }, 200, 'no-store');
  } catch (error) {
    return fail(error);
  }
};

export const config = { path: '/api/realtime' };
