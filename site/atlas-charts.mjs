
import { finite } from './atlas-store.mjs';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const nf=(v,d=0)=>finite(v)?v.toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
export const pct=v=>finite(v)?`${v>0?'+':''}${v.toFixed(2)}%`:'—';
export const tone=v=>finite(v)?v>0?'up':v<0?'down':'muted':'muted';
export const money=v=>finite(v)?Math.abs(v)>=1e8?nf(v/1e8,2)+' 億':Math.abs(v)>=1e4?nf(v/1e4,1)+' 萬':nf(v,2):'—';
export function spark(values,{width=110,height=33,color='var(--accent)',label='歷史走勢'}={}){
 const a=values.filter(finite);if(a.length<2)return '<small>尚無歷史資料</small>';
 const min=Math.min(...a),max=Math.max(...a),range=max-min||1;
 const points=a.map((v,i)=>`${(i/(a.length-1)*(width-4)+2).toFixed(1)},${(height-3-(v-min)/range*(height-6)).toFixed(1)}`).join(' ');
 return `<svg role="img" aria-label="${esc(label)}" class="spark" viewBox="0 0 ${width} ${height}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.7" vector-effect="non-scaling-stroke"/></svg>`;
}
export function lineChart(series,{height=250,width=860,labels=[],yLabel='',zero=false}={}){
 const values=series.flatMap(x=>x.values.filter(finite));if(!values.length)return '<div class="empty">沒有足夠資料繪圖</div>';
 let lo=Math.min(...values),hi=Math.max(...values);if(zero){lo=Math.min(lo,0);hi=Math.max(hi,0);}const range=hi-lo||1;lo-=range*.07;hi+=range*.07;
 const left=68,right=15,top=20,bottom=30,H=height-top-bottom,W=width-left-right;
 const y=v=>top+H-(v-lo)/(hi-lo)*H;let svg=`<svg role="img" aria-label="${esc(yLabel||'歷史資料折線')}" class="chart" viewBox="0 0 ${width} ${height}">`;
 for(let i=0;i<5;i++){const v=lo+(hi-lo)*i/4;svg+=`<line class="gridline" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text x="${left-7}" y="${y(v)+3}" text-anchor="end">${esc(Math.abs(v)>=1e6?money(v):nf(v,2))}</text>`;}
 const colors=['var(--accent)','var(--up)','var(--down)','#d8a637'];
 series.forEach((s,j)=>{const n=s.values.length;let path='',on=false;s.values.forEach((v,i)=>{if(!finite(v)){on=false;return;}path+=`${on?'L':'M'}${left+(n>1?i/(n-1):.5)*W},${y(v)} `;on=true;});
 svg+=`<path d="${path}" fill="none" stroke="${s.color||colors[j%4]}" stroke-width="2" vector-effect="non-scaling-stroke"/>`;});
 if(labels.length)for(const i of [...new Set([0,Math.floor((labels.length-1)/2),labels.length-1])])svg+=`<text x="${left+(labels.length>1?i/(labels.length-1):.5)*W}" y="${height-8}" text-anchor="${i===0?'start':i===labels.length-1?'end':'middle'}">${esc(labels[i])}</text>`;
 return svg+'</svg><div class="legend">'+series.map((s,i)=>`<i style="background:${s.color||colors[i%4]}"></i>${esc(s.name)}`).join(' ')+'</div>';
}
export function barsChart(rows,{value='value',label='label',height=220,width=850,unit=''}={}){
 const a=rows.filter(r=>finite(r[value])).slice(-30);if(!a.length)return '<div class="empty">沒有可畫出的數值</div>';
 const max=Math.max(0,...a.map(r=>r[value])),min=Math.min(0,...a.map(r=>r[value])),range=max-min||1;
 const left=65,right=15,top=20,bottom=32,H=height-top-bottom,W=width-left-right;
 const y=v=>top+(max-v)/range*H,step=W/a.length;
 let svg=`<svg class="chart" role="img" aria-label="${esc(unit)}長條圖" viewBox="0 0 ${width} ${height}">`;
 for(let i=0;i<=4;i++){const v=min+range*i/4;svg+=`<line class="gridline" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text x="${left-5}" y="${y(v)+3}" text-anchor="end">${nf(v,Math.abs(v)<10?2:0)}</text>`;}
 a.forEach((r,i)=>{const v=r[value];svg+=`<rect x="${left+i*step+step*.2}" y="${Math.min(y(v),y(0))}" width="${step*.6}" height="${Math.max(1,Math.abs(y(v)-y(0)))}" rx="2" fill="${v>=0?'var(--accent)':'var(--down)'}"><title>${esc(r[label])}：${nf(v,2)} ${esc(unit)}</title></rect>`;
 if(a.length<=8||i%Math.ceil(a.length/6)===0||i===a.length-1)svg+=`<text x="${left+(i+.5)*step}" y="${height-10}" text-anchor="middle">${esc(r[label])}</text>`;});
 return svg+'</svg>';
}
export function candles(rows,E,{unit='day',range=90,indicator='kd',pinned=null}={}){
 if(rows.length<2)return '<div class="empty">取得歷史日 K 後顯示圖表。</div>';
 let a=E.aggregate(rows,unit);const c=E.compute(a);const start=Math.max(0,a.length-range);a=a.slice(start);
 const width=940,height=385,left=65,right=18,top=16,H=240,W=width-left-right;
 const lo=Math.min(...a.map(r=>r.low)),hi=Math.max(...a.map(r=>r.high)),padding=(hi-lo)*.08||1,min=lo-padding,max=hi+padding;
 const y=v=>top+(max-v)/(max-min)*H,step=W/a.length;
 let out=`<svg role="img" aria-label="開高低收 K 線與移動平均線" class="chart candles-svg" viewBox="0 0 ${width} ${height}">`;
 for(let i=0;i<=5;i++){const v=min+(max-min)*i/5;out+=`<line class="gridline" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text x="${left-8}" y="${y(v)+3}" text-anchor="end">${nf(v,1)}</text>`;}
 const maxV=Math.max(1,...a.map(r=>r.volume||0));
 a.forEach((r,i)=>{
  const x=left+(i+.5)*step,col=r.close>=r.open?'var(--up)':'var(--down)';
  out+=`<g class="candle" data-candle="${i+start}"><rect x="${x-step*.5}" y="0" width="${step}" height="365" fill="transparent"/><line x1="${x}" x2="${x}" y1="${y(r.high)}" y2="${y(r.low)}" stroke="${col}"/><rect x="${x-step*.3}" y="${Math.min(y(r.open),y(r.close))}" width="${Math.max(1,step*.6)}" height="${Math.max(1,Math.abs(y(r.open)-y(r.close)))}" fill="${col}"/><title>${r.date} 開${r.open} 高${r.high} 低${r.low} 收${r.close} 量${r.volume??'—'}股</title><rect x="${x-step*.3}" y="${350-(r.volume||0)/maxV*64}" width="${Math.max(1,step*.6)}" height="${(r.volume||0)/maxV*64}" fill="${col}" opacity=".48"/></g>`;
 });
 [['ma5','#d9a63b'],['ma20','#7474ea'],['ma60','#4ab5ac']].forEach(([key,col])=>{
  let d='',on=false;c[key].slice(start).forEach((v,i)=>{if(!finite(v)){on=false;return;}const yy=y(v);if(yy<top||yy>top+H){on=false;return;}d+=`${on?'L':'M'}${left+(i+.5)*step},${yy} `;on=true;});out+=`<path d="${d}" stroke="${col}" fill="none" stroke-width="1.5"/>`;
 });
 out+='<text x="12" y="306">成交量</text>';
 for(const i of [...new Set([0,Math.floor(a.length/2),a.length-1])])out+=`<text x="${left+(i+.5)*step}" y="379" text-anchor="${i===0?'start':i===a.length-1?'end':'middle'}">${a[i].date}</text>`;
 if(pinned!==null&&pinned>=start&&pinned<start+a.length){const x=left+(pinned-start+.5)*step;out+=`<line x1="${x}" x2="${x}" y1="${top}" y2="352" stroke="var(--muted)" stroke-dasharray="4 4"/>`;}
 out+='</svg><div class="legend"><i style="background:#d9a63b"></i>MA5 <i style="background:#7474ea"></i>MA20 <i style="background:#4ab5ac"></i>MA60</div>';
 const ds={kd:[['K',c.k],['D',c.d]],macd:[['DIF',c.dif],['訊號',c.dea],['MACD ×2',c.hist]],rsi:[['RSI(14)',c.rsi]],dmi:[['+DI',c.pdi],['−DI',c.mdi],['ADX',c.adx]]};
 if(ds[indicator])out+=lineChart(ds[indicator].map(([name,v])=>({name,values:v.slice(start)})),{height:150,labels:a.map(r=>r.date),yLabel:indicator.toUpperCase()});
 return out;
}
export function treemap(items,x=0,y=0,w=100,h=100){
 if(!items.length)return [];
 if(items.length===1)return [{...items[0],x,y,w,h}];
 const total=items.reduce((s,i)=>s+i.weight,0);let sum=0,k=0;
 while(k<items.length-1&&sum<total/2){sum+=items[k].weight;k++;}
 const r=sum/total;
 return w>=h?[...treemap(items.slice(0,k),x,y,w*r,h),...treemap(items.slice(k),x+w*r,y,w*(1-r),h)]
 :[...treemap(items.slice(0,k),x,y,w,h*r),...treemap(items.slice(k),x,y+h*r,w,h*(1-r))];
}
export function chipDays(rows){
 const days=new Map();
 for(const r of rows){if(!r.date)continue;let d=days.get(r.date)||{date:r.date,foreign:null,trust:null,dealer:null,parts:{}};
  const b=Number(r.buy),s=Number(r.sell);if(!Number.isFinite(b)||!Number.isFinite(s))continue;const v=(b-s)/1000;
  if(r.name==='Foreign_Investor')d.foreign=v;
  if(r.name==='Investment_Trust')d.trust=v;
  if(['Dealer','Dealer_self','Dealer_Hedging'].includes(r.name))d.parts[r.name]=v;
  days.set(r.date,d);
 }
 return [...days.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(d=>{
  d.dealer=finite(d.parts.Dealer_self)&&finite(d.parts.Dealer_Hedging)?d.parts.Dealer_self+d.parts.Dealer_Hedging:d.parts.Dealer??null;
  d.total=[d.foreign,d.trust,d.dealer].every(finite)?d.foreign+d.trust+d.dealer:null;return d;
 });
}
export function revenueRows(raw){
 const byPeriod=new Map();
 for(const r of raw){
  const year=Number(r.revenue_year),month=Number(r.revenue_month);
  if(year<1900||month<1||month>12)continue;
  const period=`${year}-${String(month).padStart(2,'0')}`;
  if(finite(Number(r.revenue)))byPeriod.set(period,{period,revenue:Number(r.revenue),published:r.date});
 }
 const a=[...byPeriod.values()].sort((a,b)=>a.period.localeCompare(b.period));
 return a.map((r,i)=>{const yr=Number(r.period.slice(0,4)),m=Number(r.period.slice(5)),prior=byPeriod.get(`${yr-1}-${String(m).padStart(2,'0')}`);
 const prevPeriod=new Date(Date.UTC(yr,m-2,1)).toISOString().slice(0,7),prev=byPeriod.get(prevPeriod);
 return {...r,yoy:prior&&prior.revenue>0?(r.revenue/prior.revenue-1)*100:null,mom:prev&&prev.revenue>0?(r.revenue/prev.revenue-1)*100:null};});
}
