
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import handler from '../server/functions/atlas.mjs';
import {num,rocDate,normalizeBars,normalizeQuotes,env,finmind} from '../server/lib/providers.mjs';
import {normalizeOfficial,monthDate,clearCache,official} from '../server/lib/data.mjs';
import {validateTrade,ledger,validateUser,defaults,safeURL,csvParse,csvEncode,validDate} from '../site/atlas-store.mjs';
import {chipDays,revenueRows,treemap} from '../site/atlas-charts.mjs';
import {mockFetch,bars} from './fixtures.mjs';
const ctx={};vm.createContext(ctx);vm.runInContext(readFileSync(new URL('../site/atlas-engine.js',import.meta.url),'utf8'),ctx);const E=ctx.FusionEngine;
const fetchSaved=globalThis.fetch;
async function call(path,{method='GET',body,headers={}}={}){
 const req=new Request('https://atlas.test/api/atlas/'+path,{method,headers,body:body?JSON.stringify(body):undefined});
 const res=await handler(req,{});return {res,data:await res.json()};
}
test.after(()=>globalThis.fetch=fetchSaved);
test('number conversion retains missing values',()=>{
 assert.equal(num('--'),null);assert.equal(num(''),null);assert.equal(num(null),null);assert.equal(num(false),null);assert.equal(num('1,234.50'),1234.5);assert.equal(num('-1.2'),-1.2);
});
test('ROC and calendar dates',()=>{assert.equal(rocDate('1150922'),'2026-09-22');assert.equal(rocDate('115/09/22'),'2026-09-22');assert.equal(monthDate('11508'),'2026-08');assert.equal(validDate('2026-02-30'),false);});
test('normalized quotes express volumes in thousand shares',()=>{
 const a=normalizeQuotes([{Code:'2330',Name:'TEST',Date:'1150922',ClosingPrice:'101',Change:'1',TradeVolume:'10000',TradeValue:'1000100'}],'TWSE')[0];
 assert.equal(a.volume,10);assert.equal(a.previousClose,100);assert.equal(a.change,1);assert.equal(a.quoteType,'end-of-day');
});
test('no-price row does not become zero',()=>{const q=normalizeQuotes([{Code:'2330',Name:'TEST',Date:'1150922',ClosingPrice:'--',Change:'--'}],'TWSE')[0];assert.equal(q.price,null);assert.equal(q.change,null);assert.equal(q.amount,null);});
test('daily bars reject duplicate dates',()=>{const r=bars().slice(0,1);assert.throws(()=>normalizeBars([r[0],r[0]],{date:'date',open:'open',high:'high',low:'low',close:'close',volume:'volume'}));});
test('monthly revenues convert source thousand TWD to TWD',()=>{
 const r=normalizeOfficial('revenue',[{'公司代號':'2330','公司名稱':'TEST','資料年月':'11508','營業收入-當月營收':'123,456','營業收入-去年同月增減(%)':'--'}],'TWSE','')[0];
 assert.equal(r.revenue,123456000);assert.equal(r.yoy,null);assert.equal(r.period,'2026-08');
});
test('official field whitespace accepted',()=>{const r=normalizeOfficial('valuation',[{'Code ':'2330','Name':'TEST','Date':'1150922','PEratio':'18.2','PBratio':'--','DividendYield':'3.2'}],'TWSE','')[0];assert.equal(r.pe,18.2);assert.equal(r.pb,null);});
test('corporate profiles retain declared share count',()=>{const r=normalizeOfficial('companies',[{'公司代號':'2330','公司名稱':'TEST','已發行普通股數或TDR原股發行股數':'10,000'}],'TWSE','')[0];assert.equal(r.shares,10000);});
test('untrusted URL schemes and credentials rejected',()=>{for(const v of ['javascript:alert(1)','data:text/html,X','https://token:secret@example.com'])assert.equal(safeURL(v),'');assert.equal(safeURL('https://www.twse.com.tw/'),'https://www.twse.com.tw/');});
test('CSV quoted multiline roundtrip',()=>{const a=[{name:'a,b',text:'line1\nline2 "x"'}];assert.deepEqual(csvParse(csvEncode(a)),a);});
test('CSV spreadsheet formulas neutralized on export',()=>{assert.ok(csvEncode([{x:'=HYPERLINK("x")'}]).includes("'=HYPERLINK"));assert.throws(()=>csvParse('a\n"unclosed'));});
const buy=(stock='2330',qty=100,price=50)=>validateTrade({stock,date:'2026-01-01',name:'TEST',side:'buy',qty,price,fee:20,tax:0,currency:'TWD',createdAt:1});
test('ledger includes acquisition fee in average cost',()=>{assert.equal(ledger([buy()])[0].avgCost,50.2);});
test('ledger rejects overselling',()=>{assert.throws(()=>ledger([buy(),{...buy(),side:'sell',qty:101,createdAt:2}]));});
test('ledger realizes cost correctly on sale',()=>{const p=ledger([buy(),{...buy(),side:'sell',qty:50,price:60,fee:10,tax:10,createdAt:2}])[0];assert.equal(p.realized,470);assert.equal(p.qty,50);});
test('currencies do not combine',()=>{const p=ledger([buy(),{...buy(),currency:'USD'}]);assert.equal(p.length,2);});
test('backup import schema checked',()=>{assert.throws(()=>validateUser({schema:8}));assert.deepEqual(validateUser(defaults()),defaults());});
test('technical rule missing is not false/zero',()=>{assert.equal(E.evaluateRules({rsi:null},[{field:'rsi',op:'=',value:0}]).pass,null);});
test('OR can be true with other missing condition',()=>{assert.equal(E.evaluateRules({rsi:60},[{field:'rsi',op:'>',value:50},{field:'pe',op:'<',value:10}],'any').pass,true);});
test('AND false + missing is false',()=>{assert.equal(E.evaluateRules({rsi:60},[{field:'rsi',op:'<',value:50},{field:'pe',op:'<',value:10}]).pass,false);});
test('OHLC contradictory data rejected',()=>{assert.throws(()=>E.validateBars([{date:'2026-01-01',open:10,high:9,low:8,close:10,volume:100}]));});
test('insufficient history never gives fabricated signal score',()=>{assert.equal(E.analyze(bars().slice(0,2)).score,null);});
test('sufficient history produces indicators and bounded score',()=>{const a=E.analyze(bars());assert.ok(Number.isFinite(a.metrics.rsi));assert.ok(a.score>=0&&a.score<=100);});
test('weekly aggregation preserves volume',()=>{const a=bars().slice(0,50),w=E.aggregate(a,'week');assert.equal(w.reduce((s,r)=>s+r.volume,0),a.reduce((s,r)=>s+r.volume,0));});
test('backtest enforces next-day execution',()=>{const a=E.backtest(bars(),{strategy:'trend',feePct:.1,taxPct:0,slippagePct:.1,stopPct:8,targetPct:15,capital:100000,holdBars:20});assert.ok(a.trades.every(t=>t.entryDate>t.signalDate));assert.ok(Number.isFinite(a.totalReturn));});
test('fundamental lookahead not permitted in custom backtest',()=>{assert.throws(()=>E.backtest(bars(),{strategy:'custom',rules:[{field:'pe',op:'>',value:5}]}));});
test('dealer subgroups not double counted',()=>{const a=chipDays([{date:'2026-01-01',name:'Dealer',buy:1000,sell:0},{date:'2026-01-01',name:'Dealer_self',buy:800,sell:0},{date:'2026-01-01',name:'Dealer_Hedging',buy:200,sell:0}]);assert.equal(a[0].dealer,1);});
test('monthly revenue fiscal period is not publication date',()=>{const a=revenueRows([{date:'2026-09-10',revenue_year:2026,revenue_month:8,revenue:120},{date:'2025-09-10',revenue_year:2025,revenue_month:8,revenue:100}]);assert.equal(a.at(-1).period,'2026-08');assert.ok(Math.abs(a.at(-1).yoy-20)<1e-6);});
test('treemap stays inside area',()=>{const a=treemap([{weight:1},{weight:2},{weight:3}],0,0,1000,520);assert.ok(a.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=1000.001&&r.y+r.h<=520.001));});
test('status does not confuse token configured with data verified',async()=>{
 process.env.FINMIND_TOKEN='test-value';const {data}=await call('status');assert.equal(data.historicalTokenConfigured,true);assert.equal(data.quoteDataVerified,false);assert.equal(data.realtime,false);assert.ok(!JSON.stringify(data).includes('test-value'));delete process.env.FINMIND_TOKEN;
});
test('new custom status URL works',async()=>{const {data,res}=await call('status');assert.equal(res.status,200);assert.equal(data.version,'10.0.0');});
test('quote endpoint adapts actual provider-format test fixtures',async()=>{globalThis.fetch=mockFetch;clearCache();const {data,res}=await call('quotes?market=TW');assert.equal(res.status,200);assert.ok(data.quotes.length>=50);assert.equal(data.realtime,false);});
test('history endpoint returns source labeled daily OHLC',async()=>{globalThis.fetch=mockFetch;clearCache();const {data,res}=await call('history?stock=2330&market=TW');assert.equal(res.status,200);assert.ok(data.rows.length>100);assert.equal(data.adjusted,false);});
test('data endpoints all have rows and timestamps',async()=>{globalThis.fetch=mockFetch;clearCache();for(const path of ['official?kind=companies','official?kind=valuation','official?kind=revenue','official?kind=index','official?kind=announcements','dataset?kind=institutions&stock=2330','dataset?kind=margin&stock=2330','dataset?kind=financials&stock=2330']){const {data,res}=await call(path);assert.equal(res.status,200,path);assert.ok(data.rows.length>0,path);assert.ok(data.fetchedAt,path);}});
test('optional access token protects data not health',async()=>{process.env.ATLAS_ACCESS_TOKEN='test-access';assert.equal((await call('quotes?market=TW')).res.status,401);assert.equal((await call('status')).res.status,200);assert.equal((await call('quotes?market=TW',{headers:{'x-atlas-token':'test-access'}})).res.headers.get('cache-control'),'no-store');delete process.env.ATLAS_ACCESS_TOKEN;});
test('FinMind token is sent via auth header not URL',async()=>{
 process.env.FINMIND_TOKEN='unit-test-token';let seen;globalThis.fetch=async(url,options)=>{seen={url:String(url),options};return new Response(JSON.stringify({status:200,data:[]}),{headers:{'content-type':'application/json'}});};await finmind('TaiwanStockPrice',{data_id:'2330'});assert.ok(!seen.url.includes('unit-test-token'));assert.equal(seen.options.headers.Authorization,'Bearer unit-test-token');delete process.env.FINMIND_TOKEN;globalThis.fetch=mockFetch;
});
test('provider failure stays an error not synthetic quotes',async()=>{clearCache();globalThis.fetch=async()=>new Response('offline',{status:503});const {res,data}=await call('quotes?market=TW');assert.equal(res.status,502);assert.ok(data.error);assert.equal(data.quotes,undefined);globalThis.fetch=mockFetch;clearCache();});
test('partial official feed still supplies successful source with warning',async()=>{globalThis.fetch=async(u,o)=>String(u).includes('tpex')?new Response('down',{status:503}):mockFetch(u,o);clearCache();const r=await official('companies');assert.ok(r.rows.length);assert.equal(r.coverage.TPEX,'error');assert.ok(r.warnings.length);globalThis.fetch=mockFetch;clearCache();});
test('invalid route/data parameters are rejected',async()=>{assert.equal((await call('missing')).res.status,404);assert.equal((await call('dataset?kind=bad')).res.status,400);assert.equal((await call('history?stock=../secret&market=TW')).res.status,400);});
test('AI without settings is not faked',async()=>{delete process.env.ATLAS_ACCESS_TOKEN;delete process.env.OPENAI_API_KEY;assert.equal((await call('ai',{method:'POST',body:{question:'test',consent:true}})).res.status,503);});

test('schema drift does not become successful empty data',()=>{assert.throws(()=>normalizeOfficial('companies',[{unexpected:'x'}],'TWSE',''));assert.deepEqual(normalizeOfficial('companies',[],'TWSE',''),[]);});
test('CSV exports only explicitly requested columns',()=>{assert.deepEqual(csvParse(csvEncode([{x:'1',privateField:'2'}],['x'])),[{x:'1'}]);});
test('malformed custom themes fail backup validation',()=>{const a=defaults();a.customThemes=[{id:'t',name:'test',stages:{bad:true}}];assert.throws(()=>validateUser(a));});
