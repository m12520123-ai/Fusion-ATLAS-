import { fail, json, searchMarket } from './_shared.mjs';

export default async (req) => {
  try {
    const url = new URL(req.url);
    const market = String(url.searchParams.get('market') || 'TW').toUpperCase();
    const q = String(url.searchParams.get('q') || '');
    return json(await searchMarket(q, market), 200, 'public, max-age=0, s-maxage=300');
  } catch (error) { return fail(error); }
};

export const config = { path: '/api/search' };
