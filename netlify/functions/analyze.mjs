import { env, fail, json } from './_shared.mjs';

export default async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
    const key = env('OPENAI_API_KEY'), model = env('OPENAI_MODEL');
    if (!key || !model) return json({ error: '\u5c1a\u672a\u8a2d\u5b9a OPENAI_API_KEY / OPENAI_MODEL\u3002' }, 503);
    const body = await req.json();
    const question = String(body?.question || '').trim().slice(0, 1200);
    if (!question) return json({ error: '\u8acb\u8f38\u5165\u554f\u984c\u3002' }, 400);
    const stocks = Array.isArray(body?.stocks) ? body.stocks.slice(0, 4) : [];
    const prompt = [
      '\u4f60\u662f\u4e2d\u7acb\u7684\u80a1\u5e02\u7814\u7a76\u6574\u7406\u52a9\u624b\u3002\u4e0d\u63d0\u4f9b\u8cb7\u8ce3\u6307\u4ee4\u3001\u4e0d\u8072\u7a31\u9810\u6e2c\u672a\u4f86\u5831\u916c\u3002',
      `Data mode: ${String(body?.dataMode || '')}`,
      `Stocks: ${JSON.stringify(stocks)}`,
      `Question: ${question}`,
      '\u8acb\u7528\u7e41\u9ad4\u4e2d\u6587\uff0c\u5340\u5206\u300c\u5df2\u63d0\u4f9b\u7684\u8cc7\u6599\u300d\u8207\u300c\u5c1a\u5f85\u67e5\u8b49\u300d\u3002'
    ].join('\n');
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model, input: prompt, max_output_tokens: 800 })
    });
    if (!upstream.ok) return json({ error: `OpenAI API HTTP ${upstream.status}` }, 502);
    const data = await upstream.json();
    const text = String(data.output_text || '').trim();
    if (!text) return json({ error: '\u6c92\u6709\u53d6\u5f97 AI \u6587\u5b57\u56de\u8986\u3002' }, 502);
    return json({ text, model }, 200, 'no-store');
  } catch (error) { return fail(error); }
};

export const config = { path: '/api/analyze' };
