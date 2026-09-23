
export const VERSION='10.0.0';
export const KEY='atlas-map-v9-user';
export const finite=v=>typeof v==='number'&&Number.isFinite(v);
export const safeURL=v=>{try{const u=new URL(String(v));return /^https?:$/.test(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
export const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
export const today=()=>{const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return `${p.find(x=>x.type==='year').value}-${p.find(x=>x.type==='month').value}-${p.find(x=>x.type==='day').value}`;};
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function defaults(){return {schema:9,watch:[],themeWatch:[],trades:[],notes:[],events:[],studies:[],creators:[],rules:[],relations:[],customThemes:[],settings:{theme:'light',font:'normal',color:'red',autoRefresh:15},notifications:[]};}
export function loadUser(){
 try{const raw=localStorage.getItem(KEY);return raw?validateUser(JSON.parse(raw)):defaults();}
 catch(e){return {...defaults(),loadError:'儲存資料無法讀取；未覆寫原紀錄，請先匯出舊版備份。'};}
}
export function saveUser(data){localStorage.setItem(KEY,JSON.stringify(data));}
export function validateUser(x){
 if(!x||x.schema!==9||typeof x!=='object')throw Error('不是 ATLAS 9 備份。');
 const d=defaults();
 for(const k of ['watch','themeWatch']){if(!Array.isArray(x[k])||x[k].length>5000)throw Error('收藏格式錯誤');d[k]=[...new Set(x[k].filter(v=>typeof v==='string'&&/^[\w.-]{1,40}$/.test(v)&&!['constructor','__proto__','prototype'].includes(v)))];}
 for(const k of ['notes','events','studies','creators','rules','relations','customThemes','notifications']){
   if(!Array.isArray(x[k])||x[k].length>10000)throw Error('備份資料筆數或格式錯誤');
   d[k]=x[k].filter(v=>v&&typeof v==='object'&&!Array.isArray(v)).map(v=>JSON.parse(JSON.stringify(v)));
 }
 if(!Array.isArray(x.trades)||x.trades.length>10000)throw Error('交易格式錯誤');
 for(const t of d.customThemes){
  if(typeof t.id!=='string'||!/^[\w.-]{1,40}$/.test(t.id)||typeof t.name!=='string'||!Array.isArray(t.stages)||t.stages.length!==4||!t.stages.every(v=>typeof v==='string'))throw Error('自訂題材格式錯誤');
  for(const k of ['name','en','desc','url','icon'])t[k]=String(t[k]||'');
 }
 for(const c of d.creators)if(typeof c.name!=='string')throw Error('作者名稱格式錯誤');
 d.trades=x.trades.map(validateTrade);ledger(d.trades);
 if(x.settings&&typeof x.settings==='object')d.settings={
   theme:['dark','light','system'].includes(x.settings.theme)?x.settings.theme:'light',
   font:['normal','large','largest'].includes(x.settings.font)?x.settings.font:'normal',
   color:x.settings.color==='green'?'green':'red',
   autoRefresh:[0,5,15,30].includes(Number(x.settings.autoRefresh))?Number(x.settings.autoRefresh):15
 };
 return d;
}
export function validateTrade(t){
 const id=String(t?.stock||''),date=String(t?.date||'');
 if(!/^[\w.-]{1,16}$/.test(id)||['__proto__','constructor','prototype'].includes(id))throw Error('股票代號無效');
 if(!validDate(date)||date>today())throw Error('交易日期無效或在未來');
 if(!['buy','sell'].includes(t.side)||!Number.isInteger(Number(t.qty))||Number(t.qty)<=0)throw Error('買賣別或股數錯誤；請輸入整股股數');
 if(!finite(Number(t.price))||Number(t.price)<=0||Number(t.price)>1e9)throw Error('成交價錯誤');
 if(!['TWD','USD','JPY','KRW'].includes(t.currency))throw Error('幣別錯誤');
 const r={id:String(t.id||uid()),stock:id,date,side:t.side,qty:Number(t.qty),price:Number(t.price),currency:t.currency,name:String(t.name||id).slice(0,100),createdAt:Number(t.createdAt)||Date.now()};
 for(const k of ['fee','tax']){r[k]=Number(t[k]||0);if(!finite(r[k])||r[k]<0||r[k]>1e10)throw Error('費用／稅額必須為非負數');}
 return r;
}
export function ledger(trades){
 const positions=new Map(),sorted=[...trades].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt-b.createdAt);
 for(const t of sorted){
  const key=t.stock+'|'+t.currency;let p=positions.get(key)||{stock:t.stock,name:t.name,currency:t.currency,qty:0,cost:0,realized:0};
  if(t.side==='buy'){p.qty+=t.qty;p.cost+=t.qty*t.price+t.fee+t.tax;}
  else{
   if(t.qty>p.qty)throw Error(`${t.date} ${t.stock} 賣出超過當時持有股數 ${p.qty}`);
   const basis=p.cost/p.qty*t.qty;p.realized+=t.qty*t.price-t.fee-t.tax-basis;p.qty-=t.qty;p.cost=p.qty?p.cost-basis:0;
  }positions.set(key,p);
 }return [...positions.values()].map(p=>({...p,avgCost:p.qty?p.cost/p.qty:null}));
}
export function importLegacy(){
 const raw=localStorage.getItem('atlas-state-v1');
 if(!raw)throw Error('這個瀏覽器沒有找到舊版資料；可從舊版匯出後再匯入。');
 const x=JSON.parse(raw),d=defaults();d.watch=Array.isArray(x.watch)?x.watch:[];
 d.trades=(x.trades||[]).map(t=>({...t,currency:t.currency||(/^\d{4,6}[A-Z]?$/.test(t.stock)?'TWD':t.stock.endsWith('.T')?'JPY':t.stock.endsWith('.KS')?'KRW':'USD')}));
 d.notes=(x.notes||[]).map(n=>({...n,type:'note'}));return validateUser(d);
}
export function cacheGet(key){
 try{return JSON.parse(localStorage.getItem('atlas-map-cache:'+key)||'null');}catch{return null;}
}
export function cachePut(key,data){
 try{
   localStorage.setItem('atlas-map-cache:'+key,JSON.stringify({data,savedAt:new Date().toISOString()}));
 }catch{} // Quote cache is optional; personal writes use explicit error handling.
}
export function clearMarketCache(){
 for(const k of Object.keys(localStorage))if(k.startsWith('atlas-map-cache:'))localStorage.removeItem(k);
}
export class ApiError extends Error{
 constructor(message,status=0){super(message);this.name='ApiError';this.status=status;}
}
export class API{
 constructor(){this.pending=new Map();this.access='';}
 async get(path,{method='GET',body,timeout=32000,cache=true}={}){
   const key=method+':'+path;
   if(method==='GET'&&this.pending.has(key))return this.pending.get(key);
   const job=(async()=>{
    const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeout);
    try{
     const headers={accept:'application/json'};
     if(this.access)headers['x-atlas-token']=this.access;
     if(body)headers['content-type']='application/json';
     const res=await fetch('/api/atlas/'+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:ctl.signal,cache:'no-store'});
     const type=res.headers.get('content-type')||'';
     if(!type.includes('application/json'))throw new ApiError(res.status===404?'新版 API 尚未部署，請查看「資料設定 → 連線檢查」。':'伺服器回傳網頁而不是 JSON；請確認 Netlify 發布的是 v10。',res.status);
     const data=await res.json();
     if(!res.ok||data.error){const error=new ApiError(data.error||`HTTP ${res.status}`,res.status);error.code=data.code;error.provider=data.provider;error.retryAfterSeconds=data.retryAfterSeconds;throw error;}
     return data;
    }catch(e){if(e.name==='AbortError')throw new ApiError('資料來源逾時；已保留原有資料，可按重試。',504);throw e;}
    finally{clearTimeout(timer);}
   })();
   this.pending.set(key,job);
   try{return await job;}finally{this.pending.delete(key);}
 }
}
export function csvParse(text){
 const rows=[];let row=[],cell='',quoted=false;
 text=String(text).replace(/^\uFEFF/,'');
 for(let i=0;i<text.length;i++){const c=text[i];
  if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===','&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }if(quoted)throw Error('CSV 引號未關閉');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);
 if(!rows.length)return [];const heads=rows.shift().map(x=>x.trim());
 if(heads.some(x=>['__proto__','constructor','prototype'].includes(x)))throw Error('不允許的欄位');
 return rows.map(r=>Object.fromEntries(heads.map((h,i)=>[h,r[i]||''])));
}
export function csvEncode(rows,columns){
 if(!rows.length)return '\ufeff';const h=columns||Object.keys(rows[0]);
 const cell=v=>{let s=String(v??'');if(/^[=+@\-]/.test(s)&&!/^-\d/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
 return '\ufeff'+[h,...rows.map(r=>h.map(k=>r[k]))].map(a=>a.map(cell).join(',')).join('\r\n');
}
export function download(name,text,type='application/json'){
 const a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000);
}
