import { fail, getHistory, getTwQuotes, json } from './_shared.mjs';

export default async (req) => {
  try {
    const url = new URL(req.url);
    const market = String(url.searchParams.get('market') || 'TW').toUpperCase();
    if (['TW', 'TWSE', 'TPEX'].includes(market)) {
      const data = await getTwQuotes();
      if (market === 'TWSE' || market === 'TPEX') data.quotes = data.quotes.filter(q => q.market === market);
      return json(data, 200, 'public, max-age=0, s-maxage=300, stale-while-revalidate=300');
    }
    if (!['US', 'JP', 'KR'].includes(market)) return json({ error: '\u672a\u77e5\u5e02\u5834\u3002' }, 400);
    const symbols = [...new Set(String(url.searchParams.get('symbols') || '').split(',').map(s => s.trim()).filter(Boolean))].slice(0, 8);
    if (!symbols.length) return json({ error: '\u6d77\u5916\u884c\u60c5\u9700\u8981 1-8 \u500b\u80a1\u7968\u4ee3\u865f\u3002' }, 400);
    const settled = await Promise.allSettled(symbols.map(id => getHistory(id, market)));
    const quotes = [], warnings = [];
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        const data = r.value, rows = data.rows, prev = rows.at(-2), last = rows.at(-1);
        quotes.push({ id: symbols[i], name: data.name || symbols[i], market, currency: data.currency, price: last.close, change: prev?.close ? (last.close / prev.close - 1) * 100 : null, volume: last.volume == null ? null : last.volume / 1000, amount: null, date: last.date, source: data.source });
      } else warnings.push(`${symbols[i]}: ${r.reason?.message || '\u53d6\u5f97\u5931\u6557'}`);
    });
    if (!quotes.length) return json({ error: warnings.slice(0, 2).join('; ') || '\u6d77\u5916\u884c\u60c5\u53d6\u5f97\u5931\u6557\u3002' }, 502);
    return json({ quotes, warnings, label: 'Twelve Data \u00b7 \u6d77\u5916\u6700\u8fd1\u5b8c\u6210\u65e5\u7dda', fetchedAt: new Date().toISOString(), realtime: false }, 200, 'public, max-age=0, s-maxage=900');
  } catch (error) { return fail(error); }
};

export const config = { path: '/api/quotes' };
