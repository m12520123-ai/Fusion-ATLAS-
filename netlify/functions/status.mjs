import { json, env } from './_shared.mjs';

export default async () => json({
  ok: true,
  version: '3.0-netlify',
  platform: 'netlify-functions',
  overseasConfigured: Boolean(env('TWELVE_DATA_API_KEY')),
  aiConfigured: Boolean(env('OPENAI_API_KEY') && env('OPENAI_MODEL')),
  historicalTokenConfigured: Boolean(env('FINMIND_TOKEN')),
  realtime: false
}, 200, 'public, max-age=0, s-maxage=60');

export const config = { path: '/api/status' };
