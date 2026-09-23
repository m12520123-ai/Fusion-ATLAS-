// Synthetic regression data only. Never imported by server/functions or site/.
import { bars } from './fixtures.mjs';
export function chartFixture(symbol='AAPL',market='US') {
 const rows=bars(symbol,240),last=rows.at(-1);
 const clock={US:{zone:'America/New_York',currency:'USD',exchange:'NMS',start:'13:30:00',end:'20:00:00'},JP:{zone:'Asia/Tokyo',currency:'JPY',exchange:'JPX',start:'00:00:00',end:'06:30:00'},KR:{zone:'Asia/Seoul',currency:'KRW',exchange:'KSC',start:'00:00:00',end:'06:30:00'}}[market];
 const ts=(date,t)=>Date.parse(date+'T'+t+'Z')/1000;
 return {chart:{result:[{meta:{symbol,currency:clock.currency,exchangeName:clock.exchange,fullExchangeName:market+' TEST Exchange',exchangeTimezoneName:clock.zone,longName:'TEST '+symbol,
   regularMarketPrice:last.close,regularMarketTime:ts(last.date,clock.end),regularMarketVolume:last.volume,
   chartPreviousClose:999999,currentTradingPeriod:{regular:{start:ts(last.date,clock.start),end:ts(last.date,clock.end)}}},
   timestamp:rows.map(r=>ts(r.date,clock.start)),indicators:{quote:[Object.fromEntries(['open','high','low','close','volume'].map(k=>[k,rows.map(r=>r[k])]))],adjclose:[{adjclose:rows.map(r=>r.close*.98)}]}}],error:null}};
}
export function tinyFixture(symbol='AAPL',market='US') {
 const p=chartFixture(symbol,market),r=p.chart.result[0];
 r.timestamp=r.timestamp.slice(-3);
 for(const k of Object.keys(r.indicators.quote[0]))r.indicators.quote[0][k]=r.indicators.quote[0][k].slice(-3);
 r.indicators.adjclose[0].adjclose=r.indicators.adjclose[0].adjclose.slice(-3);
 return p;
}
export async function yahooMockFetch(input){
 const url=new URL(String(input));
 const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json'}});
 if(url.hostname!=='query1.finance.yahoo.com')throw Error('Unexpected Yahoo fixture host');
 if(url.pathname.startsWith('/v8/finance/chart/')){
  const s=decodeURIComponent(url.pathname.split('/').at(-1)),m=s.endsWith('.T')?'JP':/\.(KS|KQ)$/.test(s)?'KR':'US';
  if(s==='NOEXIST')return json({chart:{result:null,error:{code:'Not Found'}}},404);
  return json(chartFixture(s,m));
 }
 if(url.pathname==='/v1/finance/search')return json({quotes:[{symbol:'7203.T',quoteType:'EQUITY',exchange:'JPX',longname:'TEST Toyota',isYahooFinance:true},{symbol:'PLTR',quoteType:'EQUITY',exchange:'NYQ',longname:'TEST Palantir',isYahooFinance:true},{symbol:'247540.KQ',quoteType:'EQUITY',exchange:'KOE',longname:'TEST KOSDAQ',isYahooFinance:true}]});
 return json({error:'Unknown Yahoo test route'},404);
}
