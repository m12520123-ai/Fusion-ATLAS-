
import { fetchJson, finmind, getTwQuotes, getHistory, num, field, rocDate, HttpError, isoDateInZone } from './providers.mjs';

// Public-source adapters. Missing or rejected feeds are errors, never invented data.
// URL list and field schema references: docs/SOURCES.md.
export const OFFICIAL = {
  companies: [
    ['TWSE', 'https://openapi.twse.com.tw/v1/opendata/t187ap03_L'],
    ['TPEX', 'https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O']
  ],
  revenue: [
    ['TWSE', 'https://openapi.twse.com.tw/v1/opendata/t187ap05_L'],
    ['TPEX', 'https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap05_O']
  ],
  valuation: [
    ['TWSE', 'https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL'],
    ['TPEX', 'https://www.tpex.org.tw/openapi/v1/tpex_mainboard_peratio_analysis']
  ],
  announcements: [
    ['TWSE', 'https://openapi.twse.com.tw/v1/opendata/t187ap04_L'],
    ['TPEX', 'https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap04_O']
  ],
  index: [['TWSE', 'https://openapi.twse.com.tw/v1/exchangeReport/FMTQIK']]
};
export const SETS = {
  institutions: {dataset:'TaiwanStockInstitutionalInvestorsBuySell',days:100},
  margin: {dataset:'TaiwanStockMarginPurchaseShortSale',days:100},
  holders: {dataset:'TaiwanStockHoldingSharesPer',days:130},
  shareholding: {dataset:'TaiwanStockShareholding',days:100},
  pe: {dataset:'TaiwanStockPER',days:400},
  revenue: {dataset:'TaiwanStockMonthRevenue',days:850},
  financials: {dataset:'TaiwanStockFinancialStatements',days:1100},
  balance: {dataset:'TaiwanStockBalanceSheet',days:1100},
  cashflow: {dataset:'TaiwanStockCashFlowsStatement',days:1100},
  dividend: {dataset:'TaiwanStockDividend',days:760},
  disposition: {dataset:'TaiwanStockDispositionSecuritiesPeriod',days:80,global:true},
  suspension: {dataset:'TaiwanStockMarginShortSaleSuspension',days:100,global:true},
  news: {dataset:'TaiwanStockNews',days:7,global:true},
  etf: {dataset:'TaiwanStockActiveETFHolding',days:20}
};
const memo = new Map();
export async function cached(key, seconds, fn) {
  const hit=memo.get(key);
  if(hit && Date.now()<hit.until) return structuredClone(await hit.promise);
  const promise=Promise.resolve().then(fn);
  memo.set(key,{until:Date.now()+seconds*1000,promise});
  try { const v=await promise; if(memo.size>300) memo.delete(memo.keys().next().value); return structuredClone(v); }
  catch(e){memo.delete(key);throw e;}
}
export function clearCache(){memo.clear();}
export const clean = row => Object.fromEntries(Object.entries(row||{}).map(([k,v])=>[k.trim(),v]));
export const f=(row,...names)=>field(clean(row),...names);
export function monthDate(value) {
  const s=String(value||'').replace(/\D/g,'');
  if(s.length===5)return `${Number(s.slice(0,3))+1911}-${s.slice(3)}`;
  if(s.length===6&&Number(s.slice(0,4))>=1900)return `${s.slice(0,4)}-${s.slice(4)}`;
  return null;
}
export function normalizeOfficial(kind, raw, market, sourceURL) {
  if(!Array.isArray(raw))throw new HttpError(`${market} ${kind} 回傳的不是資料陣列`);
  const normalized = raw.map(clean).map(r=>{
    const source=`${market} OpenAPI`;
    const common={market,source,sourceURL};
    const id=String(f(r,'公司代號','Code','SecuritiesCompanyCode','SecurityCode','CompanyCode')||'').trim();
    const name=String(f(r,'公司簡稱','公司名稱','Name','CompanyName','SecuritiesCompanyName','SecuritiesName')||id);
    if(kind==='index'){
      const date=rocDate(f(r,'Date','日期'));
      if(!date)return null;
      return {...common,id:'TAIEX',name:'加權指數',date,value:num(f(r,'TAIEX','Index','發行量加權股價指數')),change:num(f(r,'Change','漲跌點數')),amount:num(f(r,'TradeValue','成交金額'))};
    }
    if(!/^[\w.-]{1,16}$/.test(id))return null;
    const date=rocDate(f(r,'Date','出表日期','資料日期'));
    if(kind==='companies')return {...common,id,name,fullName:String(f(r,'公司名稱','CompanyName')||name),
      date,industry:String(f(r,'產業別','SecuritiesIndustryCode','IndustryCode','Industry')||''),
      shares:num(f(r,'已發行普通股數或TDR原股發行股數','已發行普通股數','IssueShares','IssuedShares')),
      chairman:String(f(r,'董事長','Chairman')||''),website:String(f(r,'網址','WebAddress','Website')||''),
      listed:rocDate(f(r,'上市日期','上櫃日期','DateOfListing')),currency:'TWD'};
    if(kind==='valuation')return {...common,id,name,date,
      pe:num(f(r,'PEratio','PriceEarningRatio','PriceEarningsRatio','本益比')),
      pb:num(f(r,'PBratio','PriceBookRatio','股價淨值比')),
      dividendYield:num(f(r,'DividendYield','YieldRatio','殖利率(%)','殖利率'))};
    if(kind==='revenue')return {...common,id,name,date,period:monthDate(f(r,'資料年月','YearMonth','RevenuePeriod')),
      revenue:num(f(r,'營業收入-當月營收','CurrentMonthRevenue','CurrentMonth'))!==null?num(f(r,'營業收入-當月營收','CurrentMonthRevenue','CurrentMonth'))*1000:null,
      yoy:num(f(r,'營業收入-去年同月增減(%)','LastYearMonthlyIncrease','YoY')),
      mom:num(f(r,'營業收入-上月比較增減(%)','LastMonthMonthlyIncrease','MoM')),unit:'TWD'};
    if(kind==='announcements')return {...common,id,name,date:rocDate(f(r,'發言日期','AnnouncementDate','Date'))||date,
      time:String(f(r,'發言時間','AnnouncementTime')||''),eventDate:rocDate(f(r,'事實發生日','EventDate')),
      title:String(f(r,'主旨','Subject','Title')||''),body:String(f(r,'說明','Description','Content')||'').slice(0,16000)};
    return null;
  }).filter(Boolean);
  if(raw.length && !normalized.length)throw new HttpError(`${market} ${kind} 欄位格式與預期不符；未將解析失敗當成沒有資料`,502);
  return normalized;
}
export async function official(kind){
  if(!OFFICIAL[kind])throw new HttpError('沒有這個官方資料集',400);
  return cached(`official:${kind}`,kind==='companies'?21600:900,async()=>{
    const results=await Promise.allSettled(OFFICIAL[kind].map(async([m,url])=>normalizeOfficial(kind,await fetchJson(url,{timeout:18000}),m,url)));
    const rows=[],warnings=[],coverage={};
    results.forEach((r,i)=>{const m=OFFICIAL[kind][i][0];coverage[m]=r.status==='fulfilled'?'ok':'error';
      if(r.status==='fulfilled')rows.push(...r.value);else warnings.push(`${m}：${r.reason?.message||'資料取得失敗'}`);});
    if(!rows.length && results.every(r=>r.status==='rejected'))throw new HttpError(`此官方來源暫不可用：${warnings.join('；')}`,502);
    return {rows,warnings,coverage,source:'TWSE / TPEx OpenAPI',fetchedAt:new Date().toISOString(),mode:'official'};
  });
}
export function validStock(stock){return /^\d{4,6}[A-Z]?$/.test(stock);}
export async function dataset(kind,stock=''){
  const def=SETS[kind];
  if(!def)throw new HttpError('不支援此資料集',400);
  if(stock&&!validStock(stock))throw new HttpError('台股代號格式不符',400);
  if(!stock&&!def.global)throw new HttpError('請先指定股票',400);
  return cached(`data:${kind}:${stock}`,900,async()=>{
    const end=isoDateInZone('Asia/Taipei'), start=new Date(end+'T00:00:00Z');
    start.setUTCDate(start.getUTCDate()-def.days);
    const params={start_date:start.toISOString().slice(0,10),end_date:end};
    if(stock)params.data_id=stock;
    const raw=await finmind(def.dataset,params);
    const rows=raw.filter(r=>r&&typeof r==='object'&&(!stock||!r.stock_id||String(r.stock_id)===stock))
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,5000);
    return {rows,source:`FinMind ${def.dataset}`,sourceURL:'https://finmind.github.io/tutor/TaiwanMarket/DataList/',fetchedAt:new Date().toISOString(),mode:'official',stock,kind};
  });
}
export async function quotes(market='TW'){
  if(market==='TW')return cached('quotes:TW',600,getTwQuotes);
  return null;
}
export async function history(stock,market){
  return cached(`history:${market}:${stock}`,market==='TW'?1800:300,async()=>{
    const data=await getHistory(stock,market);
    // No partial current-day daily candle during regular Taiwan trading hours.
    if(market==='TW'){
      const today=isoDateInZone('Asia/Taipei');
      const hour=Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Taipei',hour:'numeric',hourCycle:'h23'}).format(new Date()));
      if(hour<14)data.rows=data.rows.filter(x=>x.date<today);
    }
    return data;
  });
}
