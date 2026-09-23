import { fail, getHistory, json } from './_shared.mjs';

export default async (req) => {
  try {
    const url = new URL(req.url);
    const stock = String(url.searchParams.get('stock') || '').trim();
    const market = String(url.searchParams.get('market') || 'TW').toUpperCase();
    const data = await getHistory(stock, market);
    return json(data, 200, 'public, max-age=0, s-maxage=3600, stale-while-revalidate=3600');
  } catch (error) { return fail(error); }
};

export const config = { path: '/api/history' };
