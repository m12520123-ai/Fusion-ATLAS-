import { json, env } from './_shared.mjs';

export default async () => {
  const finmindToken = Boolean(env('FINMIND_TOKEN'));
  return json({
    ok: true,
    version: '3.1-netlify',
    platform: 'netlify-functions',
    overseasConfigured: Boolean(env('TWELVE_DATA_API_KEY')),
    aiConfigured: Boolean(env('OPENAI_API_KEY') && env('OPENAI_MODEL')),
    historicalTokenConfigured: finmindToken,
    realtimeConfigured: finmindToken,
    realtime: finmindToken,
    realtimeProvider: finmindToken ? 'FinMind taiwan_stock_tick_snapshot (Sponsor required)' : null,
    realtimeIntervalSeconds: 10
  }, 200, 'public, max-age=0, s-maxage=30');
};

export const config = { path: '/api/status' };
