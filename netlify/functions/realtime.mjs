import { env, fail, fetchJson, HttpError, json } from './_shared.mjs';

const ENDPOINT = 'https://api.finmindtrade.com/api/v4/taiwan_stock_tick_snapshot';

const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replaceAll(',', ''));
  return Number.isFinite(n) ? n : null;
};

function normalize(row) {
  const id = String(row?.stock_id || '').trim();
  if (!/^\d{4,6}$/.test(id)) return null;
  const stamp = String(row?.date || '').trim();
  const date = stamp.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const close = numberOrNull(row.close);
  if (!(close > 0)) return null;
  const open = numberOrNull(row.open);
  const high = numberOrNull(row.high);
  const low = numberOrNull(row.low);
  const totalVolume = numberOrNull(row.total_volume);
  const totalAmount = numberOrNull(row.total_amount);
  return {
    id,
    market: 'TW',
    currency: 'TWD',
    price: close,
    change: numberOrNull(row.change_rate),
    changePrice: numberOrNull(row.change_price),
    volume: totalVolume === null ? null : totalVolume / 1000,
    amount: totalAmount,
    volumeRatio: numberOrNull(row.volume_ratio),
    buyPrice: numberOrNull(row.buy_price),
    sellPrice: numberOrNull(row.sell_price),
    date,
    time: stamp.length > 10 ? stamp.slice(11) : '',
    source: 'FinMind taiwan_stock_tick_snapshot',
    realtime: true,
    bar: [open, high, low, close].every(v => v !== null && v > 0) && high >= Math.max(open, close) && low <= Math.min(open, close)
      ? { date, open, high, low, close, volume: totalVolume }
      : null
  };
}

export default async (req) => {
  try {
    const token = env('FINMIND_TOKEN');
    if (!token) throw new HttpError('尚未設定 FINMIND_TOKEN；台股約 10 秒即時快照需要 FinMind Sponsor 權限。', 503);
    const requestUrl = new URL(req.url);
    const symbols = [...new Set(String(requestUrl.searchParams.get('symbols') || '')
      .split(',').map(s => s.trim()).filter(s => /^\d{4,6}$/.test(s)))].slice(0, 120);
    const upstream = new URL(ENDPOINT);
    if (symbols.length) symbols.forEach(id => upstream.searchParams.append('data_id', id));
    else upstream.searchParams.set('data_id', '');
    const data = await fetchJson(upstream.toString(), {
      timeout: 18000,
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!data || data.status !== 200 || !Array.isArray(data.data)) {
      const msg = String(data?.msg || '').slice(0, 200);
      throw new HttpError(msg ? `FinMind 即時資料未成功：${msg}` : 'FinMind 即時資料未成功；請確認 Sponsor 權限與 Token。', 502);
    }
    const quotes = data.data.map(normalize).filter(Boolean);
    if (!quotes.length) throw new HttpError('FinMind 即時快照沒有可用資料；請確認股票代號、交易時段或 Sponsor 權限。', 502);
    return json({
      quotes,
      realtime: true,
      intervalSeconds: 10,
      label: 'FinMind 台股即時快照 · 約 10 秒更新',
      fetchedAt: new Date().toISOString()
    }, 200, 'no-store');
  } catch (error) {
    return fail(error);
  }
};

export const config = { path: '/api/realtime' };
