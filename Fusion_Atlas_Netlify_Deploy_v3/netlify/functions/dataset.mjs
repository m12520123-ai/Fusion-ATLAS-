import { DATASETS, fail, finmind, getHistory, institutionMetrics, isoDateInZone, json } from './_shared.mjs';

export default async (req) => {
  try {
    const url = new URL(req.url);
    const kind = String(url.searchParams.get('kind') || '');
    const stock = String(url.searchParams.get('stock') || '').trim();
    if (!DATASETS[kind]) return json({ error: '\u4e0d\u652f\u63f4\u7684\u8cc7\u6599\u96c6\u3002' }, 400);
    if (stock && !/^\d{4,6}$/.test(stock)) return json({ error: '\u53f0\u80a1\u8cc7\u6599\u96c6\u53ea\u63a5\u53d7 4-6 \u78bc\u4ee3\u865f\u3002' }, 400);
    if (!stock && !['news', 'disposition'].includes(kind)) return json({ error: '\u6b64\u8cc7\u6599\u96c6\u9700\u8981\u80a1\u7968\u4ee3\u865f\u3002' }, 400);
    const [dataset, days] = DATASETS[kind];
    const end = isoDateInZone('Asia/Taipei');
    const start = new Date(end + 'T00:00:00Z');
    start.setUTCDate(start.getUTCDate() - days);
    const params = { start_date: start.toISOString().slice(0, 10), end_date: end };
    if (stock) params.data_id = stock;
    let rows = await finmind(dataset, params);
    rows = rows.filter(r => r && typeof r === 'object');
    if (stock) rows = rows.filter(r => String(r.stock_id || stock) === stock);
    rows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    rows = rows.slice(0, 5000);
    const result = { rows, source: `FinMind / ${dataset}`, fetchedAt: new Date().toISOString() };
    if (kind === 'institutions' && stock) {
      try {
        const hist = await getHistory(stock, 'TW');
        result.metrics = institutionMetrics(rows, hist.rows.map(r => r.date));
      } catch { result.metrics = { foreignStreak: null, trustStreak: null, dealerStreak: null }; }
    }
    return json(result, 200, 'public, max-age=0, s-maxage=900');
  } catch (error) { return fail(error); }
};

export const config = { path: '/api/dataset' };
