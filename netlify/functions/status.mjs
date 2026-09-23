import { json, env } from './_shared.mjs';

export default async () => {
  return json({
    ok: true,
    version: '3.2-netlify',
    platform: 'netlify-functions',
    overseasConfigured: Boolean(env('TWELVE_DATA_API_KEY')),
    aiConfigured: Boolean(env('OPENAI_API_KEY') && env('OPENAI_MODEL')),
    historicalTokenConfigured: Boolean(env('FINMIND_TOKEN')),
    realtimeConfigured: true,
    realtime: true,
    realtimeProvider: 'TWSE MIS getStockInfo (personal research; undocumented endpoint)',
    realtimeIntervalSeconds: 5
  }, 200, 'public, max-age=0, s-maxage=30');
};

export const config = { path: '/api/status' };
