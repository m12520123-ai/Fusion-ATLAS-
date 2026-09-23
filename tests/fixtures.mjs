
// DETERMINISTIC TEST FIXTURES. NOT ACTUAL MARKET DATA. NEVER IMPORTED BY DEPLOYED FUNCTIONS.
import {CATALOG} from '../site/atlas-catalog.mjs';
export const TEST_DATE='2026-09-22';
export const stocks=CATALOG.stocks.filter(s=>['TWSE','TPEX'].includes(s.market));
export function bars(id='2330',n=240){
 const start=new Date('2025-10-01T00:00:00Z');let index=0,a=[];const seed=Number(id.replace(/\D/g,''))%35||1;
 while(a.length<n){const d=new Date(start);d.setUTCDate(start.getUTCDate()+index++);if([0,6].includes(d.getUTCDay()))continue;
  const i=a.length,close=Math.round((100+seed+i*.12+Math.sin(i/9)*5+Math.sin(i/2)*.7)*100)/100,open=Math.round((close+Math.sin(i)*1.2)*100)/100;
  a.push({date:d.toISOString().slice(0,10),open,high:Math.max(open,close)+2,low:Math.min(open,close)-2,close,volume:Math.round(1000000+Math.abs(Math.sin(i))*1000000)});
 }return a.filter(r=>r.date<=TEST_DATE);
}
const response=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}});
export async function mockFetch(input,options={}){
 const url=new URL(String(input)),path=url.pathname;
 if(url.hostname==='openapi.twse.com.tw'||url.hostname==='www.tpex.org.tw'){
  const m=url.hostname.includes('tpex')?'TPEX':'TWSE',ss=stocks.filter(s=>s.market===m);
  if(path.includes('STOCK_DAY_ALL')||path.includes('daily_close_quotes'))return response(ss.map((s,i)=>({Date:'1150922',Code:s.id,Name:s.name,ClosingPrice:String(bars(s.id).at(-1).close),Change:String(Math.round(Math.sin(i+1)*35)/10),TradeVolume:String((i+1)*1200000),TradeValue:String((i+1)*1800000000)})));
  if(path.includes('t187ap03'))return response(ss.map(s=>({'出表日期':'1150922','公司代號':s.id,'公司簡稱':s.name,'公司名稱':s.name+' 測試公司','產業別':'24','已發行普通股數或TDR原股發行股數':'1000000000','上市日期':'0900101','董事長':'測試資料','網址':'https://www.twse.com.tw/'})));
  if(path.includes('t187ap05'))return response(ss.map((s,i)=>({'出表日期':'1150922','資料年月':'11508','公司代號':s.id,'公司名稱':s.name,'營業收入-當月營收':String(1000000+i*10000),'營業收入-去年同月增減(%)':'12.3','營業收入-上月比較增減(%)':'3.4'})));
  if(path.includes('BWIBBU')||path.includes('peratio'))return response(ss.map((s,i)=>({Date:'1150922',Code:s.id,Name:s.name,PEratio:String(12+i*.4),PBratio:'2.2',DividendYield:'3.2'})));
  if(path.includes('t187ap04'))return response(ss.slice(0,9).map((s,i)=>({'出表日期':'1150922','發言日期':'1150922','事實發生日':'1150922','公司代號':s.id,'公司名稱':s.name,'主旨':'[測試公告] '+s.name+' 董事會／營运訊息展示','說明':'僅為介面驗收建立的合成公告，不是公司的真實消息。','發言時間':String(100000+i*100)})));
  if(path.includes('FMTQIK'))return response(bars().slice(-60).map((r,i)=>({Date:r.date.replaceAll('-',''),TAIEX:String(20000+i*30+Math.sin(i/4)*300),Change:String(Math.cos(i)*20),TradeValue:'200000000000'})));
  return response({error:'Unknown test official endpoint'},404);
 }
 if(url.hostname==='api.finmindtrade.com'){
  const d=url.searchParams.get('dataset'),id=url.searchParams.get('data_id')||'2330',bs=bars(id);
  let rows=[];
  if(d==='TaiwanStockPrice')rows=bs.map(r=>({...r,stock_id:id,max:r.high,min:r.low,Trading_Volume:r.volume}));
  else if(d==='TaiwanStockInstitutionalInvestorsBuySell')rows=bs.slice(-60).flatMap((r,i)=>['Foreign_Investor','Investment_Trust','Dealer_self','Dealer_Hedging'].map((name,j)=>({stock_id:id,date:r.date,name,buy:Math.round(150000+Math.sin(i/4+j)*80000),sell:Math.round(130000+Math.cos(i/3+j)*60000)})));
  else if(d==='TaiwanStockMarginPurchaseShortSale')rows=bs.slice(-60).map((r,i)=>({date:r.date,stock_id:id,MarginPurchaseTodayBalance:10000+i*23,ShortSaleTodayBalance:1200+i*8}));
  else if(d==='TaiwanStockMonthRevenue'){
   for(let i=0;i<30;i++){const dt=new Date(Date.UTC(2024,2+i,1)),y=dt.getUTCFullYear(),m=dt.getUTCMonth()+1,pub=new Date(Date.UTC(y,m,10));rows.push({stock_id:id,date:pub.toISOString().slice(0,10),revenue_year:y,revenue_month:m,revenue:1000000000+i*15000000+Math.sin(i)*5000000});}
  }else if(d==='TaiwanStockFinancialStatements')rows=['2025-03-31','2025-06-30','2025-09-30','2025-12-31','2026-03-31','2026-06-30'].flatMap((date,i)=>[{date,stock_id:id,type:'EPS',value:2+i*.2,origin_name:'每股盈餘'},{date,stock_id:id,type:'Revenue',value:1000000+i*40000,origin_name:'營業收入'}]);
  else if(d==='TaiwanStockBalanceSheet'||d==='TaiwanStockCashFlowsStatement')rows=[{date:'2026-06-30',stock_id:id,type:d==='TaiwanStockBalanceSheet'?'TotalAssets':'CashFlowsFromOperatingActivities',value:12500000}];
  else if(d==='TaiwanStockPER')rows=bs.slice(-50).map((r,i)=>({date:r.date,stock_id:id,PER:20+i*.03,PBR:3.1,dividend_yield:2.3}));
  else if(d==='TaiwanStockDividend')rows=[{date:'2026-06-01',stock_id:id,CashExDividendTradingDate:'2026-09-24',CashDividendPaymentDate:'2026-10-15',CashEarningsDistribution:3,StockExDividendTradingDate:''}];
  else if(d==='TaiwanStockNews')rows=stocks.slice(0,10).map((s,i)=>({date:TEST_DATE,stock_id:s.id,title:'[測試新聞] '+s.name+' 資料來源展示',link:'https://www.twse.com.tw/',source:'測試資料'})).filter(r=>!url.searchParams.get('data_id')||r.stock_id===id);
  else if(d==='TaiwanStockDispositionSecuritiesPeriod')rows=[{date:TEST_DATE,stock_id:'9999',name:'測試標的，非實際處置股',start_date:'2026-09-22',end_date:'2026-10-06'}];
  else if(d==='TaiwanStockHoldingSharesPer')rows=[{date:TEST_DATE,stock_id:id,HoldingSharesLevel:'1-999',people:20000,percent:12.4}];
  else if(d==='TaiwanStockShareholding')rows=[{date:TEST_DATE,stock_id:id,ForeignInvestmentShares:234567,ForeignInvestmentRemainingSharesRatio:25}];
  else if(d==='TaiwanStockActiveETFHolding')rows=[{date:TEST_DATE,stock_id:id,holding_stock_id:'2330',holding_stock_name:'測試持股資料',holding_stock_weight:12.3}];
  else if(d==='TaiwanStockMarginShortSaleSuspension')rows=[];
  return response({status:200,msg:'test data only',data:rows});
 }
 if(url.hostname==='api.twelvedata.com')return response({code:403,status:'error',message:'Unconfigured test overseas'},403);
 throw Error('Unexpected mock URL '+url.origin+url.pathname);
}
