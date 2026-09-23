/* Fusion analytics engine. No network, no dependencies; works in browser and Node. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FusionEngine = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
'use strict';
const finite = v => typeof v === 'number' && Number.isFinite(v);
const mean = a => a.length && a.every(finite) ? a.reduce((x,y)=>x+y,0)/a.length : null;
const last = a => a.length ? a[a.length-1] : null;
function validateBars(input, {demo=false}={}) {
  if (!Array.isArray(input) || input.length > 20000) throw Error('日線格式錯誤或超過 20,000 筆');
  const seen=new Set();
  const rows=input.map((r,i)=>{
    if(!r || typeof r!=='object') throw Error(`第 ${i+1} 筆不是物件`);
    const date=String(r.date||'');
    if(!demo && (!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)) throw Error(`第 ${i+1} 筆日期錯誤`);
    if(seen.has(date)) throw Error('日線日期重複：'+date);
    seen.add(date);
    const o={date};
    for(const k of ['open','high','low','close']) {
      const v=r[k]; if(!finite(v)||v<=0)throw Error(`第 ${i+1} 筆 ${k} 必須為正數`);o[k]=v;
    }
    if(o.high<Math.max(o.open,o.close,o.low)||o.low>Math.min(o.open,o.close))throw Error(`第 ${i+1} 筆高低價矛盾`);
    o.volume=r.volume===null||r.volume===undefined?null:r.volume;
    if(o.volume!==null&&(!finite(o.volume)||o.volume<0))throw Error(`第 ${i+1} 筆成交量錯誤`);
    return o;
  });
  if(!demo)rows.sort((a,b)=>a.date.localeCompare(b.date));
  return rows;
}
function smooth(values,n,alpha) {
  if(!Number.isInteger(n)||n<1)throw Error('週期必須為正整數');
  const out=Array(values.length).fill(null);let seed=[],v=null;
  values.forEach((x,i)=>{
    if(!finite(x)){seed=[];v=null;return;}
    if(v===null){seed.push(x);if(seed.length<n)return;v=mean(seed);}
    else v=alpha*x+(1-alpha)*v;
    out[i]=v;
  });return out;
}
function sma(values,n) {
  if(!Number.isInteger(n)||n<1)throw Error('週期必須為正整數');
  const out=Array(values.length).fill(null);let sum=0,missing=0;
  for(let i=0;i<values.length;i++){if(finite(values[i]))sum+=values[i];else missing++;
    if(i>=n){if(finite(values[i-n]))sum-=values[i-n];else missing--;}
    if(i>=n-1&&missing===0)out[i]=sum/n;
  }return out;
}
const ema=(values,n)=>smooth(values,n,2/(n+1));
const rma=(values,n)=>smooth(values,n,1/n);
const cross=(a,b,i)=>i>0&&[a[i],b[i],a[i-1],b[i-1]].every(finite)?a[i]>b[i]&&a[i-1]<=b[i-1]:null;
function compute(rows){
 const c=rows.map(r=>r.close),N=rows.length;
 const ma5=sma(c,5),ma20=sma(c,20),ma60=sma(c,60),ema12=ema(c,12),ema26=ema(c,26);
 const dif=c.map((_,i)=>finite(ema12[i])&&finite(ema26[i])?ema12[i]-ema26[i]:null);
 const dea=ema(dif,9),hist=dif.map((x,i)=>finite(x)&&finite(dea[i])?2*(x-dea[i]):null);
 const gains=c.map((x,i)=>i?Math.max(x-c[i-1],0):null),losses=c.map((x,i)=>i?Math.max(c[i-1]-x,0):null);
 const gain=rma(gains,14),loss=rma(losses,14);
 const rsi=gain.map((g,i)=>!finite(g)||!finite(loss[i])?null:g===0&&loss[i]===0?50:loss[i]===0?100:100-100/(1+g/loss[i]));
 const tr=[],pd=[],md=[],k=[],d=[],high20=[],low20=[],ratio=[],bollUp=[],bollLow=[];
 let kv=50,dv=50;
 for(let i=0;i<N;i++){
  const r=rows[i],p=rows[i-1];
  tr.push(p?Math.max(r.high-r.low,Math.abs(r.high-p.close),Math.abs(r.low-p.close)):null);
  const up=p?r.high-p.high:0,down=p?p.low-r.low:0;
  pd.push(p?(up>down&&up>0?up:0):null);md.push(p?(down>up&&down>0?down:0):null);
  if(i>=8){const a=rows.slice(i-8,i+1),h=Math.max(...a.map(x=>x.high)),l=Math.min(...a.map(x=>x.low));
   const rsv=h===l?50:(r.close-l)/(h-l)*100;kv=(2*kv+rsv)/3;dv=(2*dv+kv)/3;k.push(kv);d.push(dv);
  }else{k.push(null);d.push(null);}
  high20.push(i>=20?Math.max(...rows.slice(i-20,i).map(x=>x.high)):null);
  low20.push(i>=20?Math.min(...rows.slice(i-20,i).map(x=>x.low)):null);
  const avg=i>=20?mean(rows.slice(i-20,i).map(x=>x.volume)):null;
  ratio.push(finite(avg)&&avg>0&&finite(r.volume)?r.volume/avg:null);
  if(i>=19){const m=ma20[i],sd=Math.sqrt(mean(c.slice(i-19,i+1).map(x=>(x-m)**2)));bollUp.push(m+2*sd);bollLow.push(m-2*sd);}
  else{bollUp.push(null);bollLow.push(null);}
 }
 const atr=rma(tr,14),pr=rma(pd,14),mr=rma(md,14);
 const pdi=pr.map((x,i)=>finite(x)&&finite(atr[i])?(atr[i]===0?0:100*x/atr[i]):null);
 const mdi=mr.map((x,i)=>finite(x)&&finite(atr[i])?(atr[i]===0?0:100*x/atr[i]):null);
 const dx=pdi.map((x,i)=>!finite(x)||!finite(mdi[i])?null:x+mdi[i]===0?0:100*Math.abs(x-mdi[i])/(x+mdi[i]));
 return {close:c,ma5,ma20,ma60,ema12,ema26,dif,dea,hist,rsi,k,d,atr,pdi,mdi,adx:rma(dx,14),high20,low20,ratio,bollUp,bollLow};
}
function metricsAt(rows,t,i,extra={}){
 if(i<0||i>=rows.length)return {};
 const finiteGt=(a,b)=>finite(a)&&finite(b)?a>b:null;
 const m={close:rows[i].close,volume:rows[i].volume,ma5:t.ma5[i],ma20:t.ma20[i],ma60:t.ma60[i],rsi:t.rsi[i],k:t.k[i],d:t.d[i],dif:t.dif[i],dea:t.dea[i],macd:t.hist[i],pdi:t.pdi[i],mdi:t.mdi[i],adx:t.adx[i],atr:t.atr[i],volumeRatio:t.ratio[i],
  trend:finite(t.ma20[i])?rows[i].close>t.ma20[i]&&t.ma5[i]>t.ma20[i]:null,
  kdCross:cross(t.k,t.d,i),dmiCross:cross(t.pdi,t.mdi,i),macdCross:cross(t.dif,t.dea,i),
  kdBull:finiteGt(t.k[i],t.d[i]),dmiBull:finiteGt(t.pdi[i],t.mdi[i]),macdBull:finiteGt(t.dif[i],t.dea[i]),
  breakout:finite(t.high20[i])?rows[i].close>t.high20[i]:null,
  pullback:i>0&&finite(t.ma20[i-1])&&finite(t.ma20[i])?rows[i-1].low<=t.ma20[i-1]&&rows[i].close>t.ma20[i]&&rows[i].close>rows[i-1].close:null,
  change:i>0?(rows[i].close/rows[i-1].close-1)*100:null,
  foreignStreak:extra.foreignStreak??null,trustStreak:extra.trustStreak??null,dealerStreak:extra.dealerStreak??null,
  largeHolderChange:extra.largeHolderChange??null,pe:extra.pe??null,pb:extra.pb??null,dividendYield:extra.dividendYield??null
 };return m;
}
function analyze(rows,opts={}){
 if(!Array.isArray(rows)||rows.length<2)return {available:false,score:null,status:'missing',checks:[],metrics:{},series:null};
 const series=compute(rows),m=metricsAt(rows,series,rows.length-1,opts.extra||{});
 const checks=[
  {key:'trend',label:'MA5／MA20 多頭',value:m.trend},
  {key:'kdBull',label:'K 在 D 上方',value:m.kdBull},
  {key:'dmiBull',label:'+DI 在 −DI 上方',value:m.dmiBull},
  {key:'macdBull',label:'DIF 在訊號線上方',value:m.macdBull},
  {key:'volumeRatio',label:`量比 ≥ ${opts.volumeMultiplier||1.8}`,value:finite(m.volumeRatio)?m.volumeRatio>=(opts.volumeMultiplier||1.8):null}
 ];
 const known=checks.filter(x=>x.value!==null).length,passed=checks.filter(x=>x.value===true).length;
 const score=known===5?passed*20:null;
 const status=known<5?'missing':passed===5?'achieved':passed>=3?'near':'conflict';
 const low=last(series.low20),high=last(series.high20),atr=m.atr,c=last(rows).close;
 return {available:known===5,score,status,checks,metrics:m,series,passed,known,
   levels:{support:low,resistance:high,atrStop:finite(atr)?Math.max(.01,c-2*atr):null,atrTarget:finite(atr)?c+3*atr:null},
   crosses:{kd:m.kdCross,dmi:m.dmiCross,macd:m.macdCross},date:last(rows).date};
}
const RULE_FIELDS={
 close:'收盤價',change:'日漲跌 %',volumeRatio:'成交量／前20日均量',rsi:'RSI(14)',adx:'ADX(14)',
 trend:'MA 多頭',kdCross:'KD 今日黃金交叉',dmiCross:'DMI 今日黃金交叉',macdCross:'MACD 今日黃金交叉',
 kdBull:'K > D',dmiBull:'+DI > −DI',macdBull:'DIF > 訊號線',breakout:'突破前20日高點',pullback:'回測MA20後上漲',
 foreignStreak:'外資連買日數',trustStreak:'投信連買日數',dealerStreak:'自營商連買日數',
 largeHolderChange:'大戶持股變化 %點',pe:'本益比',pb:'股價淨值比',dividendYield:'殖利率 %'
};
function evaluateRules(metrics,rules,join='all'){
 if(!Array.isArray(rules)||!rules.length)return {pass:null,results:[],missing:0};
 const results=rules.map(r=>{
   let x=metrics[r.field],v=r.value;
   if(x===undefined||x===null||(!finite(x)&&typeof x!=='boolean'))return {field:r.field,pass:null};
   if(typeof x==='boolean')x=Number(x);
   if(typeof v==='boolean')v=Number(v);
   if(!finite(v))return {field:r.field,pass:null};
   const ops={'>':()=>x>v,'>=':()=>x>=v,'<':()=>x<v,'<=':()=>x<=v,'=':()=>x===v,'!=':()=>x!==v};
   return {field:r.field,pass:ops[r.op]?ops[r.op]():null,value:x};
 });
 const vals=results.map(r=>r.pass),missing=vals.filter(x=>x===null).length;
 const pass=join==='any'?(vals.includes(true)?true:missing?null:false):(vals.includes(false)?false:missing?null:true);
 return {pass,results,missing};
}
function backtest(rows,config={}){
 if(!Array.isArray(rows)||rows.length<70)throw Error('至少需要70筆有效日線，前60筆作為暖機，不參與交易。');
 const cfg={strategy:'trend',feePct:.1,taxPct:0,slippagePct:.1,stopPct:5,targetPct:10,holdBars:10,capital:100000,rules:[],join:'all',...config};
 for(const k of ['feePct','taxPct','slippagePct','stopPct','targetPct'])if(!finite(cfg[k])||cfg[k]<0||cfg[k]>50)throw Error('費用與風險參數必須介於0至50%');
 if(!Number.isInteger(cfg.holdBars)||cfg.holdBars<1||cfg.holdBars>1000||!finite(cfg.capital)||cfg.capital<=0)throw Error('持有期或初始資金錯誤');
 if(!['trend','breakout','kd','dmi','macd','custom'].includes(cfg.strategy))throw Error('未知策略');
 if(cfg.strategy==='custom'&&cfg.rules.some(r=>['foreignStreak','trustStreak','dealerStreak','largeHolderChange','pe','pb','dividendYield'].includes(r.field)))throw Error('回測未提供逐日籌碼／基本面時間序列，不能使用這些條件以免偷看未來。');
 const t=compute(rows),signal=i=>{
  const m=metricsAt(rows,t,i);
  if(cfg.strategy==='custom')return evaluateRules(m,cfg.rules,cfg.join).pass===true;
  return ({trend:m.trend,breakout:m.breakout,kd:m.kdCross,dmi:m.dmiCross,macd:m.macdCross})[cfg.strategy]===true;
 };
 let cash=cfg.capital,position=null,pending=null,peak=cash,maxDD=0,signals=0,skipped=0,untriggered=0;
 const trades=[],equity=[],fee=cfg.feePct/100,tax=cfg.taxPct/100,slip=cfg.slippagePct/100;
 function sell(i,price,reason){
   const fill=price*(1-slip),proceeds=position.qty*fill*(1-fee-tax),profit=proceeds-position.outlay;
   trades.push({signalDate:position.signalDate,entryDate:position.entryDate,exitDate:rows[i].date,entry:position.entry,exit:fill,qty:position.qty,profit,returnPct:profit/position.outlay*100,bars:i-position.entryIndex+1,reason});
   cash+=proceeds;position=null;
 }
 for(let i=60;i<rows.length;i++){
  const r=rows[i];let exited=false;
  if(pending?.side==='sell'&&position){sell(i,r.open,'條件／持有期到期，次日開盤');exited=true;}
  if(pending?.side==='buy'&&!position&&!exited){
   const entry=r.open*(1+slip),qty=Math.floor(cash/(entry*(1+fee)));
   if(qty>0){const outlay=qty*entry*(1+fee);position={entry,qty,outlay,entryIndex:i,entryDate:r.date,signalDate:rows[i-1].date};cash-=outlay;}
  }pending=null;
  if(position){
   const stop=position.entry*(1-cfg.stopPct/100),target=position.entry*(1+cfg.targetPct/100);
   if(cfg.stopPct>0&&r.low<=stop){sell(i,r.open<stop?r.open:stop,'停損（同根雙觸價先停損）');exited=true;}
   else if(cfg.targetPct>0&&r.high>=target){sell(i,r.open>target?r.open:target,'停利');exited=true;}
  }
  if(i===rows.length-1&&position){sell(i,r.close,'樣本結束收盤結清');exited=true;}
  const s=signal(i);
  if(s)signals++;else untriggered++;
  if(i<rows.length-1){
   if(position&&(i-position.entryIndex+1>=cfg.holdBars||(finite(t.ma20[i])&&r.close<t.ma20[i])))pending={side:'sell'};
   if(s&&!position&&!exited)pending={side:'buy'};
   else if(s)skipped++;
  }
  const value=cash+(position?position.qty*r.close*(1-fee-tax):0);
  peak=Math.max(peak,value);maxDD=Math.max(maxDD,(peak-value)/peak*100);
  equity.push({date:r.date,value});
 }
 const wins=trades.filter(x=>x.profit>0).length,profits=trades.filter(x=>x.profit>0).reduce((s,x)=>s+x.profit,0),losses=-trades.filter(x=>x.profit<0).reduce((s,x)=>s+x.profit,0);
 return {trades,equity,totalReturn:(cash/cfg.capital-1)*100,maxDrawdown:maxDD,winRate:trades.length?wins/trades.length*100:null,profitFactor:losses?profits/losses:null,signals,skipped,untriggered,sample:trades.length,sufficient:trades.length>=100,config:cfg,
 benchmarkReturn:(last(rows).close/rows[60].open-1)*100};
}
function streak(values){
 if(!values.length||!finite(last(values))||last(values)===0)return 0;
 const sign=Math.sign(last(values));let n=0;
 for(let i=values.length-1;i>=0;i--){if(!finite(values[i])||Math.sign(values[i])!==sign)break;n++;}
 return sign*n;
}
function aggregate(rows,unit='day'){
 if(unit==='day')return rows;
 const map=new Map();
 for(const r of rows){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date))throw Error('週/月K需要真實日期，示範序號不適用');
  let key;
  if(unit==='month')key=r.date.slice(0,7);
  else{const d=new Date(r.date+'T00:00:00Z');if(!Number.isFinite(d.getTime()))throw Error('週/月K需要真實日期，示範序號不適用');
   d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);key=d.toISOString().slice(0,10);}
  const prev=map.get(key);
  if(!prev)map.set(key,{...r});
  else{prev.high=Math.max(prev.high,r.high);prev.low=Math.min(prev.low,r.low);prev.close=r.close;prev.date=r.date;prev.volume=finite(prev.volume)&&finite(r.volume)?prev.volume+r.volume:null;}
 }
 return [...map.values()];
}
return Object.freeze({finite,mean,sma,ema,rma,cross,compute,analyze,metricsAt,evaluateRules,RULE_FIELDS,backtest,validateBars,streak,aggregate});
});
