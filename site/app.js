/* Stock Atlas: original, dependency-free research workspace. */
(() => {
'use strict';
const D=window.ATLAS_DATA, $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const nf=(v,d=0)=>finite(v)?v.toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';
const pct=v=>finite(v)?`${v>0?'+':''}${v.toFixed(2)}%`:'—';
const tone=v=>v>0?'up':v<0?'down':'muted';
const money=v=>finite(v)?(Math.abs(v)>=1e8?nf(v/1e8,2)+' 億':Math.abs(v)>=1e4?nf(v/1e4,1)+' 萬':nf(v)):'—';
const safeURL=v=>{try{const u=new URL(v);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password?u.href:'';}catch{return '';}};
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const reservedId=v=>['__proto__','constructor','prototype'].includes(v);
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const paths={home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16',grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',compare:'M8 3v18M16 3v18M3 7h7M14 17h7M3 17h7M14 7h7',wallet:'M3 6h17v14H3Zm0 0V4l14-2v4M16 11h5v5h-5Zm1 2.5h1',note:'M5 3h14v18H5Zm3 5h8M8 12h8M8 16h5',spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4m-2-2h4',settings:'m10 3-.8 2.7-2.4 1.4L4 6.4 2 10l2 2-2 2 2 3.6 2.8-.7 2.4 1.4.8 2.7h4l.8-2.7 2.4-1.4 2.8.7 2-3.6-2-2 2-2-2-3.6-2.8.7-2.4-1.4L14 3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',arrow:'M5 12h14m-5-5 5 5-5 5',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',plus:'M12 5v14M5 12h14',close:'m6 6 12 12M18 6 6 18',check:'m5 12 4 4L19 6',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20 14A8 8 0 0 1 10 4 9 9 0 1 0 20 14',menu:'M4 6h16M4 12h16M4 18h16',info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7v.2',refresh:'M20 7V3l-3 3A8 8 0 0 0 4 9m0 8v4l3-3a8 8 0 0 0 13-3M4 21h4M20 3h-4',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',bell:'M6 8a6 6 0 0 1 12 0v7l3 3H3l3-3Zm4 13h4',cpu:'M6 6h12v12H6Zm3 3h6v6H9ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',chip:'M5 5h14v14H5ZM8 8h8v8H8ZM8 2v3m8-3v3M8 19v3m8-3v3M2 8h3m-3 8h3m14-8h3m-3 8h3',layers:'m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',wind:'M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h6a2 2 0 1 1-2 2',bolt:'m13 2-9 12h7l-1 8 10-13h-8Z',network:'M9 3h6v6H9ZM3 15h6v6H3Zm12 0h6v6h-6ZM12 9v3m-6 3v-3h12v3',car:'m5 6 2-3h10l2 3 2 4v8H3v-8ZM3 10h18M6 14h2m8 0h2M5 18v3m14-3v3',robot:'M5 7h14v13H5ZM12 7V3m-2 0h4M8 11v2m8-2v2M9 17h6M2 10v7m20-7v7',filter:'M3 5h18l-7 8v6l-4 2v-8Z',chart:'M3 3v18h18M6 15l4-5 4 3 6-8',lock:'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4M12 14v3',minus:'M5 12h14',mail:'M3 5h18v14H3Zm0 0 9 8 9-8'};
const icon=(name,cls='')=>`<svg class="icon ${esc(cls||(name==='star'?'star':'i-'+name))}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
const navs=[['home','市場總覽','home'],['map','產業地圖','map'],['heat','市場熱力圖','grid'],['screener','個股篩選','filter'],['watch','我的自選','star'],['compare','個股比較','compare'],['portfolio','交易紀錄','wallet'],['notes','研究筆記','note'],['assistant','研究助手','spark'],['settings','設定與資料','settings']];
const defaults={version:1,watch:['2330','2382','3017','2308'],compare:['2330','2382','3017'],trades:[],notes:[],alerts:[],theme:'dark',color:'red',density:'comfortable',apiBase:''};
let storageFailed=false;
function validateState(x){
 if(!x||typeof x!=='object'||Array.isArray(x)||x.version!==1)throw Error('不支援的備份格式');
 const out={...defaults};
 for(const k of ['watch','compare']){if(!Array.isArray(x[k])||x[k].some(v=>typeof v!=='string'||reservedId(v)||!/^[A-Za-z0-9._-]{1,16}$/.test(v)))throw Error('清單格式錯誤');out[k]=[...new Set(x[k])].slice(0,k==='compare'?4:5000);}
 out.theme=['light','dark'].includes(x.theme)?x.theme:'dark';out.color=x.color==='green'?'green':'red';out.density=x.density==='compact'?'compact':'comfortable';out.apiBase=typeof x.apiBase==='string'?x.apiBase:'';
 if(out.apiBase&&!safeURL(out.apiBase))throw Error('API 位址格式不正確');
 for(const k of ['trades','notes','alerts']){if(!Array.isArray(x[k])||x[k].length>10000)throw Error('資料格式或筆數不正確');}
 out.trades=x.trades.map(t=>{if(!t||reservedId(t.stock)||!/^[A-Za-z0-9._-]{1,16}$/.test(t.stock)||!['buy','sell'].includes(t.side)||!validDate(t.date)||!Number.isInteger(t.qty)||t.qty<=0||t.qty>1e10||!finite(t.price)||t.price<=0||t.price>1e9||!finite(t.fee)||t.fee<0||!finite(t.tax)||t.tax<0)throw Error('交易欄位有誤');return {id:String(t.id||uid()).slice(0,100),stock:t.stock,name:String(t.name||t.stock).slice(0,80),side:t.side,date:t.date,qty:t.qty,price:t.price,fee:t.fee,tax:t.tax,createdAt:finite(t.createdAt)?t.createdAt:0};});
 ledger(out.trades);
 out.notes=x.notes.map(n=>{if(!n||typeof n.title!=='string'||typeof n.body!=='string')throw Error('筆記格式錯誤');return{id:String(n.id||uid()).slice(0,100),title:n.title.slice(0,180),body:n.body.slice(0,10000),tag:String(n.tag||'').slice(0,40),url:safeURL(n.url),date:String(n.date||today()).slice(0,10)};});
 out.alerts=x.alerts.map(a=>{if(!a||typeof a.stock!=='string'||!finite(a.price)||a.price<=0||!['above','below'].includes(a.dir))throw Error('提醒格式錯誤');return{id:String(a.id||uid()).slice(0,100),stock:a.stock.slice(0,16),dir:a.dir,price:a.price,lastKey:''};});
 return out;
}
function ledger(trades){
 const pos=Object.create(null),events=[...trades].sort((a,b)=>a.date.localeCompare(b.date)||(a.createdAt||0)-(b.createdAt||0));let realized=0;
 for(const t of events){let p=pos[t.stock]||(pos[t.stock]={id:t.stock,name:t.name,qty:0,cost:0,realized:0});
 if(t.side==='buy'){p.qty+=t.qty;p.cost+=t.qty*t.price+t.fee+t.tax;}
 else{if(t.qty>p.qty)throw Error(`${t.date} ${t.stock} 賣出 ${t.qty} 股，超過當時持有的 ${p.qty} 股。`);const basis=p.cost/p.qty*t.qty,profit=t.qty*t.price-t.fee-t.tax-basis;p.qty-=t.qty;p.cost=p.qty?p.cost-basis:0;p.realized+=profit;realized+=profit;}
 }return {positions:Object.values(pos),realized};
}
let state;
try{const raw=localStorage.getItem('atlas-state-v1');state=raw?validateState(JSON.parse(raw)):structuredClone(defaults);}catch{state=structuredClone(defaults);storageFailed=true;}
function save(){try{localStorage.setItem('atlas-state-v1',JSON.stringify(state));}catch{storageFailed=true;toast('瀏覽器無法儲存，請用「匯出備份」保留資料。',true);}}
let view='home',mapTheme='ai',heatTheme='all',heatDirection='all',heatWeight='amount',mapZoom=1,mapStyle='map',mode='unconnected',liveQuotes={},liveMeta=null,apiToken='',quoteBusy=false;
let realtimeConfigured=false,realtimeBusy=false,realtimeTimer=null,realtimeLastAt='';
let sortKey='amount',sortDir=-1,filters={q:'',theme:'all',market:'all',min:'',max:'',change:'',watch:false},selectedStock=null,stockRange=66,stockHist=null,histLoading=false,histError='',histTicket=0;
let searchPurpose='stock',focusReturn=null,chat=[{role:'assistant',label:'離線研究整理 · 非生成式 AI',text:'歡迎來到股脈。輸入股票代號、公司名稱或產業主題，我會整理目前資料中的分類、漲跌、同題材公司，以及需要再查證的地方。\n\n示範模式的價格與分類不代表真實市場。我不提供買賣指令，也不把預先規則假裝成 AI。'}],aiOnline=false,aiConsent=false,chatBusy=false;
const historyCache=new Map();let comparisonSeries={};
const catalog=id=>D.stocks.find(s=>s.id===id);
function stock(id){return mode==='demo'?catalog(id):(liveQuotes[id]?{...catalog(id),id,...liveQuotes[id],tags:catalog(id)?.tags||[],role:catalog(id)?.role||'尚未分類'}:null);}
function universe(){return mode==='demo'?D.stocks:Object.keys(liveQuotes).map(stock).filter(Boolean);}
const theme=id=>D.themes.find(t=>t.id===id)||D.themes[0];
const themeStocks=id=>universe().filter(s=>s.tags.includes(id));
const avgChange=ss=>{const a=ss.filter(s=>finite(s.change));return a.length?a.reduce((a,s)=>a+s.change,0)/a.length:null;};
const dataLabel=()=>mode==='demo'?'合成示範 · 非真實行情':mode==='unconnected'?'尚未連線 · 無行情':mode==='imported'?'使用者匯入 · 未獨立查證':'外部日線資料 · 非即時';
const priceLabel=()=>mode==='demo'?'示範價':mode==='unconnected'?'未取得行情':'載入價格';
const sourceTag=()=>`<span class="tag ${mode==='demo'?'demo':'lime'}">${dataLabel()}</span>`;
function toast(text,error=false){const el=document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=text;$('#toast-root').append(el);setTimeout(()=>el.remove(),5200);}
function setAppearance(){document.documentElement.dataset.theme=state.theme;document.documentElement.dataset.color=state.color;document.documentElement.dataset.density=state.density;}
function go(v){view=navs.some(n=>n[0]===v)?v:'home';closeOverlay();render();window.scrollTo(0,0);try{history.replaceState(null,'','#'+view);}catch{}if(view==='compare'&&mode==='official')loadComparison();}
function pageHead(eyebrow,title,sub,actions=''){return `<div class="page-head between"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${sub}</p></div>${actions?`<div class="flex wrap">${actions}</div>`:''}</div>`;}
const btn=(label,action,ic='',extra='',cls='')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${ic?icon(ic):''}${label}</button>`;
function notice(){return `<div class="notice">${icon('info')}<span>${mode==='demo'?'<strong>示範模式</strong>　所有價格、漲跌與走勢皆為模擬；公司分類僅用來展示操作，未逐一驗證。':'<strong>盤後模式</strong>　價格來源：TWSE / TPEx；資料日期依各市場回傳為準，並非即時報價。題材分類仍為示意。'} <button data-action="nav" data-view="settings" style="font-size:inherit;color:var(--accent);padding:0 3px">資料說明 ↗</button></span></div>`;}
function render(){
 setAppearance();const current=navs.find(n=>n[0]===view);
 $('#app').innerHTML=`<aside class="sidebar" aria-label="主選單"><a href="#home" class="brand" data-action="nav" data-view="home"><span class="brandmark">${icon('chart')}</span><span class="brand-name">股脈<small>STOCK ATLAS</small></span></a><div class="nav-section">EXPLORE / 探索市場</div><nav class="nav-list">${navs.slice(0,4).map(navItem).join('')}</nav><div class="nav-section" style="margin-top:19px">WORKSPACE / 我的研究</div><nav class="nav-list">${navs.slice(4,9).map(navItem).join('')}</nav><div class="sidebar-bottom"><div class="sidebar-note"><strong>${icon('lock')} 你的研究，留在你的裝置</strong>自選、交易與筆記儲存在此瀏覽器。記得定期匯出備份。</div>${navItem(navs[9])}<div class="flex" style="padding:17px 12px 0"><span class="avatar">ME</span><div style="font-size:11px">個人研究空間<small class="muted" style="display:block;font-size:9px">LOCAL WORKSPACE</small></div></div></div></aside><div class="mobile-backdrop" data-action="menu-close"></div><div class="workspace"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="開啟選單">${icon('menu')}</button><div class="breadcrumb">研究工作台 <span>/　${current[1]}</span></div><div class="flex top-controls"><button class="search-trigger" data-action="search" aria-label="搜尋股票或題材">${icon('search')}<span>搜尋股票、代號或產業</span><kbd>⌘ K</kbd></button><div class="top-status"><span class="status-dot"></span>${mode==='demo'?'示範資料':'盤後資料'}</div><button class="icon-btn" data-action="toggle-theme" aria-label="切換深淺色">${icon(state.theme==='dark'?'sun':'moon')}</button><button class="icon-btn" data-action="alerts" aria-label="查看價格提醒">${icon('bell')}</button><span class="avatar">ME</span></div></header><main id="content">${({home:renderHome,map:renderMap,heat:renderHeat,screener:renderScreener,watch:renderWatch,compare:renderCompare,portfolio:renderPortfolio,notes:renderNotes,assistant:renderAssistant,settings:renderSettings}[view])()}</main><footer class="footer"><div>© ${new Date().getFullYear()} 股脈 ATLAS · 獨立研究工具，與 AI 智慧產業地圖無隸屬關係。<br>示範內容不構成投資建議；連線前請確認資料授權與來源。</div><div><button data-action="nav" data-view="settings">資料來源與使用說明 ↗</button>　<span>BUILD 01.0</span></div></footer><nav class="bottom-nav" aria-label="手機導覽">${[['home','總覽','home'],['map','地圖','map'],['screener','篩選','filter'],['watch','自選','star'],['portfolio','交易','wallet']].map(n=>`<button class="${view===n[0]?'active':''}" data-action="nav" data-view="${n[0]}">${icon(n[2])}<span>${n[1]}</span></button>`).join('')}</nav></div>`;
 requestAnimationFrame(layoutHeatmaps);
}
function navItem(n){const count=n[0]==='watch'?state.watch.length:n[0]==='compare'?state.compare.length:null;return `<button class="nav-item ${view===n[0]?'active':''}" data-action="nav" data-view="${n[0]}" ${view===n[0]?'aria-current="page"':''}>${icon(n[2])}${n[1]}${count!==null?`<span class="count">${count}</span>`:''}</button>`;}
function kpi(label,value,sub,ic,cl=''){return `<div class="kpi"><div class="kpi-label">${icon(ic)}${label}</div><div class="kpi-value mono ${cl}">${value}</div><div class="kpi-bottom">${sub}</div></div>`;}
function themeCards(ids=D.themes.map(t=>t.id)){return `<div class="theme-cards">${ids.map(id=>{const t=theme(id),ss=themeStocks(id),v=avgChange(ss);return `<button class="theme-card" data-action="theme" data-id="${id}" style="--c:${t.accent}"><div class="icon-top"><span class="theme-icon" style="--c:${t.accent}">${icon(t.icon)}</span>${icon('external')}</div><div class="card-en">${t.en}</div><h3>${t.name}</h3><div class="card-bottom"><span>${ss.length} 家公司</span><span class="mono ${tone(v)}">${pct(v)}</span></div></button>`;}).join('')}</div>`;}
function heatLegend(){return `<div class="heat-legend"><span>面積＝${mode==='demo'?'示範':''}成交額 · 點擊查看個股</span><span class="legend-swatches"><span>−</span>${[-6,-3,-1,0,1,3,6].map(v=>`<i class="swatch" style="--c:${heatColor(v)}"></i>`).join('')}<span>＋</span></span></div>`;}
function renderHome(){
 const all=universe(),up=all.filter(s=>s.change>0).length,down=all.filter(s=>s.change<0).length,rank=D.themes.map(t=>({...t,v:avgChange(themeStocks(t.id)),count:themeStocks(t.id).length})).sort((a,b)=>(b.v??-999)-(a.v??-999));
 return `${pageHead('YOUR MARKET. CONNECTED.','看懂產業，再研究股票。',`從 ${D.themes.length} 個研究主題出發，串起公司、產業與你的觀察。`,btn('更新盤後行情','sync','refresh','',quoteBusy?'':'')+btn('探索產業地圖','nav','arrow','data-view="map"','primary'))}${notice()}<div class="kpis">${kpi(mode==='demo'?'示範公司':'行情涵蓋',nf(all.length)+'<small>家</small>','依目前資料模式統計','layers')}${kpi('上漲公司',nf(up)+'<small>家</small>',`占有效漲跌資料 ${nf(up/Math.max(1,all.filter(s=>finite(s.change)).length)*100,1)}%`,'chart','up')}${kpi('下跌公司',nf(down)+'<small>家</small>',`另有 ${all.length-up-down} 家平盤或缺資料`,'chart','down')}${kpi('我的自選',String(state.watch.length)+'<small>檔</small>',`${state.compare.length} 檔正在比較 · 僅此裝置`,'star')}</div><div class="dashboard-grid"><section class="panel"><div class="panel-head"><div><h2>交易熱度，一眼掌握</h2><div class="sub">${mode==='demo'?'模擬成交額領先個股 · 非真實市場表現':'成交額領先個股 · 依各市場最近交易日'}</div></div>${btn('完整熱力圖','nav','external','data-view="heat"','small ghost')}</div><div class="panel-body"><div class="heatmap" data-heat="home"></div>${heatLegend()}</div></section><div class="stack"><section class="panel"><div class="panel-head"><div><h2>題材觀察</h2><div class="sub">成分股簡單平均 · 不是投資排名</div></div>${icon('chart')}</div><div class="panel-body" style="padding-top:0">${rank.slice(0,5).map((t,i)=>`<button class="rank-row" data-action="theme" data-id="${t.id}"><span class="rank-no mono">0${i+1}</span><span class="theme-icon" style="--c:${t.accent}">${icon(t.icon)}</span><span class="rank-info"><strong>${t.name}</strong><small>${t.count} 家示意分類公司</small></span><span class="rank-pct mono ${tone(t.v)}">${pct(t.v)}</span></button>`).join('')}</div></section></div></div><div class="section-top"><h2>沿著產業，發現研究路徑</h2><button data-action="nav" data-view="map">全部主題 ${icon('arrow')}</button></div>${themeCards(['ai','pack','cool','robot'])}<div class="dashboard-bottom"><section class="panel"><div class="panel-head"><h2>我的觀察清單</h2>${btn('管理自選','nav','arrow','data-view="watch"','small ghost')}</div><div class="panel-body">${state.watch.length?`<table class="mini-table"><tbody>${state.watch.slice(0,4).map(id=>{const s=stock(id);return `<tr><td><button class="stock-name-btn" data-action="stock" data-id="${esc(id)}">${esc(s?.name||catalog(id)?.name||id)}<small>${esc(id)}</small></button></td><td class="right mono">${nf(s?.price,2)}</td><td class="right mono ${tone(s?.change)}">${pct(s?.change)}</td><td class="right"><button class="icon-btn" data-action="compare-toggle" data-id="${esc(id)}" aria-label="加入比較">${icon('compare')}</button></td></tr>`;}).join('')}</tbody></table>`:'<p class="muted tiny">尚未加入自選。搜尋公司，按星號即可收藏。</p>'}</div></section><section class="journal-banner"><div class="eyebrow">THINK IN CONNECTIONS</div><h3>不只看價格，也留下判斷依據。</h3><p>把你的研究假設、原始來源與待確認問題記錄下來。下次回看，才知道自己當時為什麼關注。</p>${btn('寫一則研究筆記','note-new','plus','','small')}${state.notes.length?`<div class="tiny muted space">已累積 ${state.notes.length} 則個人研究筆記</div>`:''}</section></div>`;
}
function heatColor(v){if(!finite(v)||v===0)return '#344353';let up=v>0;if(state.color==='green')up=!up;const a=Math.min(Math.abs(v)/6,1);return up?`hsl(351 37% ${28+a*18}%)`:`hsl(161 35% ${22+a*13}%)`;}
function treemap(items,x,y,w,h,out=[]){if(!items.length)return out;if(items.length===1){out.push({...items[0],x,y,w,h});return out;}const sum=items.reduce((a,s)=>a+s.weight,0);let acc=0,cut=1;for(let i=0;i<items.length-1;i++){acc+=items[i].weight;cut=i+1;if(acc>=sum/2)break;}const ratio=acc/sum;if(w>=h){treemap(items.slice(0,cut),x,y,w*ratio,h,out);treemap(items.slice(cut),x+w*ratio,y,w*(1-ratio),h,out);}else{treemap(items.slice(0,cut),x,y,w,h*ratio,out);treemap(items.slice(cut),x,y+h*ratio,w,h*(1-ratio),out);}return out;}
function heatItems(home=false){let ss=universe().filter(s=>finite(s.price));if(!home){if(heatTheme!=='all')ss=ss.filter(s=>s.tags.includes(heatTheme));if(heatDirection==='up')ss=ss.filter(s=>s.change>0);if(heatDirection==='down')ss=ss.filter(s=>s.change<0);}const key=home?'amount':heatWeight;return ss.sort((a,b)=>(b[key]||0)-(a[key]||0)).slice(0,home?(innerWidth<760?8:16):60).map(s=>({...s,weight:Math.max(1,s[key]||1)}));}
function layoutHeatmaps(){for(const el of $$('[data-heat]')){const ss=heatItems(el.dataset.heat==='home');if(!ss.length){el.innerHTML='<div class="empty"><h3>沒有符合條件的資料</h3><p>調整題材或漲跌篩選後再試一次。</p></div>';continue;}const r=el.getBoundingClientRect();if(!r.width)continue;el.innerHTML=treemap(ss,0,0,r.width,r.height).map(s=>`<button class="heat-cell ${s.w<94||s.h<83?'mini':''} ${s.w<67||s.h<56?'micro':''}" data-action="stock" data-id="${esc(s.id)}" style="left:${s.x/r.width*100}%;top:${s.y/r.height*100}%;width:${s.w/r.width*100}%;height:${s.h/r.height*100}%;background:${heatColor(s.change)}" title="${esc(s.name)} ${esc(s.id)} · ${pct(s.change)} · ${dataLabel()}" aria-label="${esc(s.name)} ${esc(s.id)}，漲跌 ${pct(s.change)}"><span class="heat-name">${esc(s.name)}</span><span class="heat-id mono">${esc(s.id)}</span><span class="heat-change mono">${pct(s.change)}</span></button>`).join('');}}
function renderMap(){const t=theme(mapTheme),ss=themeStocks(t.id);return `${pageHead('INDUSTRY EXPLORER','把零散公司，放回產業脈絡。','點選公司即可查看資料、加入自選或進行比較。')}${notice()}<div class="chip-row">${D.themes.map(x=>`<button class="chip ${x.id===mapTheme?'active':''}" data-action="theme" data-id="${x.id}">${icon(x.icon)}${x.name}</button>`).join('')}</div><section class="panel"><div class="map-intro"><span class="theme-icon" style="--c:${t.accent}">${icon(t.icon)}</span><div><div class="eyebrow" style="margin-bottom:3px;font-size:8px">${t.en}</div><h2>${t.name}</h2><p>${t.desc}</p></div></div><div class="map-toolbar"><span>${ss.length} 家公司 · 角色分層示意，非合作關係圖</span><div class="flex"><div class="segment"><button data-action="map-style" data-style="map" class="${mapStyle==='map'?'active':''}">地圖</button><button data-action="map-style" data-style="list" class="${mapStyle==='list'?'active':''}">列表</button></div>${mapStyle==='map'?`<button class="icon-btn" data-action="zoom-out" aria-label="縮小地圖">${icon('minus')}</button><span class="mono" id="zoom-label">${Math.round(mapZoom*100)}%</span><button class="icon-btn" data-action="zoom-in" aria-label="放大地圖">${icon('plus')}</button>`:''}</div></div>${mapStyle==='map'?`<div class="map-scroll"><div class="map-board" style="zoom:${mapZoom}">${t.stages.map((stage,i)=>`<div class="map-column" style="--c:${t.accent}"><div class="stage-head"><span class="stage-number mono">0${i+1}</span>${stage}</div>${ss.filter(s=>D.stage(s,t.id)===i).map(node).join('')||'<p class="tiny dim">尚無示範公司</p>'}</div>`).join('')}</div></div>`:stockTable(ss)}<div class="map-foot">${icon('info')} 箭頭只表示閱讀順序；同一主題不代表已證實供貨、客戶關係或營收占比。分類可在 data.js 編輯。</div></section><div class="section-top"><h2>延伸到其他研究主題</h2></div>${themeCards(D.themes.filter(x=>x.id!==mapTheme).slice(0,4).map(x=>x.id))}`;}
function node(s){return `<article class="node"><div class="node-main"><button data-action="stock" data-id="${esc(s.id)}"><div class="node-name">${esc(s.name)}</div><div class="node-id mono">${esc(s.id)} · ${s.market}</div></button><button class="icon-btn ${state.watch.includes(s.id)?'on':''}" data-action="watch-toggle" data-id="${esc(s.id)}" aria-label="${state.watch.includes(s.id)?'移出':'加入'}自選">${icon('star')}</button></div><div class="node-role">示範角色 · ${esc(s.role)}</div><div class="node-bottom"><span class="mono">${nf(s.price,2)}</span><span class="mono ${tone(s.change)}">${pct(s.change)}</span></div></article>`;}
function renderHeat(){return `${pageHead('MARKET HEATMAP','讓市場的溫度，看得見。','顏色代表漲跌，面積代表成交額或成交量；顯示符合條件的前 60 檔。',btn('匯出目前資料','export-heat','download'))}${notice()}<div class="filterbar"><select id="heat-theme" aria-label="熱力圖產業"><option value="all">全部產業</option>${D.themes.map(t=>`<option value="${t.id}" ${heatTheme===t.id?'selected':''}>${t.name}</option>`).join('')}</select><select id="heat-direction" aria-label="漲跌篩選"><option value="all" ${heatDirection==='all'?'selected':''}>全部漲跌</option><option value="up" ${heatDirection==='up'?'selected':''}>只看上漲</option><option value="down" ${heatDirection==='down'?'selected':''}>只看下跌</option></select><select id="heat-weight" aria-label="方塊大小依據"><option value="amount" ${heatWeight==='amount'?'selected':''}>面積：成交額</option><option value="volume" ${heatWeight==='volume'?'selected':''}>面積：成交量（千股）</option></select>${sourceTag()}</div><div class="panel"><div class="panel-body" style="padding-top:18px"><div class="heatmap full-heat" data-heat="full"></div><div class="heat-legend"><span>點選方塊開啟個股 · 面積依 ${heatWeight==='amount'?'成交額':'成交量'} 計算</span><span>${mode==='demo'?'所有數字均為模擬':'各市場最近交易日可能不同'}</span></div></div></div><div class="panel heat-table">${stockTable(heatItems())}</div>`;}
function filtered(){let ss=universe().filter(s=>(!filters.q||`${s.id} ${s.name} ${s.role} ${s.tags.map(id=>theme(id).name).join(' ')}`.toLowerCase().includes(filters.q.toLowerCase()))&&(filters.theme==='all'||s.tags.includes(filters.theme))&&(filters.market==='all'||s.market===filters.market)&&(!filters.watch||state.watch.includes(s.id))&&(filters.min===''||(finite(s.price)&&s.price>=Number(filters.min)))&&(filters.max===''||(finite(s.price)&&s.price<=Number(filters.max)))&&(filters.change===''||(finite(s.change)&&s.change>=Number(filters.change))));return ss.sort((a,b)=>{if(sortKey==='name'||sortKey==='id')return String(a[sortKey]).localeCompare(String(b[sortKey]),'zh-TW')*sortDir;const av=a[sortKey],bv=b[sortKey];return (finite(av)?finite(bv)?av-bv:1:finite(bv)?-1:0)*sortDir;});}
function stockTable(ss,sortable=false){const cols=[['id','股票'],['role','示範角色'],['price',priceLabel()],['change','漲跌幅'],['volume','成交量（千股）'],['amount','成交額']];return `<div class="table-scroll"><table class="data-table"><thead><tr>${cols.map(([k,n],i)=>`<th class="${i>=2?'right':''}">${sortable&&k!=='role'?`<button data-action="sort" data-key="${k}">${n} ${sortKey===k?(sortDir<0?'↓':'↑'):'↕'}</button>`:n}</th>`).join('')}<th>自選 / 比較</th></tr></thead><tbody>${ss.length?ss.slice(0,500).map(s=>`<tr><td><button class="stock-name-btn" data-action="stock" data-id="${esc(s.id)}">${esc(s.name)}<small>${esc(s.id)} · ${s.market}</small></button></td><td><span class="tag">${esc(s.role)}</span></td><td class="right mono">${nf(s.price,2)}</td><td class="right mono ${tone(s.change)}">${pct(s.change)}</td><td class="right mono">${nf(s.volume,1)}</td><td class="right mono">${money(s.amount)}</td><td><div class="table-actions"><button class="icon-btn ${state.watch.includes(s.id)?'on':''}" data-action="watch-toggle" data-id="${esc(s.id)}" aria-label="${state.watch.includes(s.id)?'移出':'加入'}自選">${icon('star')}</button><button class="icon-btn ${state.compare.includes(s.id)?'on':''}" data-action="compare-toggle" data-id="${esc(s.id)}" aria-label="${state.compare.includes(s.id)?'移出':'加入'}比較">${icon('compare')}</button></div></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty"><h3>沒有符合條件的股票</h3><p>調整篩選條件或先更新行情。</p></div></td></tr>'}</tbody></table></div><div class="table-footer"><span>共 ${ss.length} 檔${ss.length>500?' · 表格僅顯示前 500 檔，匯出包含全部':''}</span><span>${dataLabel()}</span></div>`;}
function renderScreener(){return `${pageHead('STOCK SCREENER','把研究範圍，縮到剛剛好。','用產業、市場、價格與漲跌交叉篩選，再加入比較。',btn('匯出 CSV','export-screen','download'))}${notice()}<div class="filterbar"><input id="screen-q" aria-label="搜尋公司或代號" placeholder="搜尋公司、代號或題材…" value="${esc(filters.q)}"><select id="screen-theme" aria-label="產業篩選"><option value="all">全部產業</option>${D.themes.map(t=>`<option value="${t.id}" ${filters.theme===t.id?'selected':''}>${t.name}</option>`).join('')}</select><select id="screen-market" aria-label="市場篩選"><option value="all">上市＋上櫃</option><option value="TWSE" ${filters.market==='TWSE'?'selected':''}>上市 TWSE</option><option value="TPEX" ${filters.market==='TPEX'?'selected':''}>上櫃 TPEx</option></select><label><input id="screen-watch" type="checkbox" ${filters.watch?'checked':''}>只看自選</label>${btn('清除篩選','screen-reset','','','small ghost')}</div><div class="filterbar"><label>價格 ≥ <input id="screen-min" type="number" min="0" step="0.01" value="${esc(filters.min)}" style="width:88px" placeholder="不限"></label><label>價格 ≤ <input id="screen-max" type="number" min="0" step="0.01" value="${esc(filters.max)}" style="width:88px" placeholder="不限"></label><label>漲跌 ≥ <input id="screen-change" type="number" step="0.01" value="${esc(filters.change)}" style="width:80px" placeholder="不限">%</label></div><section class="panel" id="screen-results">${stockTable(filtered(),true)}</section>`;}
function renderWatch(){const ss=state.watch.map(stock).filter(Boolean),missing=state.watch.length-ss.length;return `${pageHead('MY WATCHLIST','你的關注，集中在這裡。','星號收藏會保留在此瀏覽器；可匯出 CSV 或完整備份。',btn('匯出清單','export-watch','download')+btn('加入股票','search','plus','data-purpose="watch"','primary'))}${notice()}${missing?`<div class="notice info">${icon('info')} ${missing} 檔自選在目前資料模式中沒有行情；切回示範或更新官方資料後查看。</div>`:''}<section class="panel">${state.watch.length?stockTable(ss):`<div class="empty">${icon('star')}<h3>建立你的第一份觀察清單</h3><p>搜尋股票後按下星號，或從產業地圖挑選研究標的。</p>${btn('搜尋股票','search','search','data-purpose="watch"','primary')}</div>`}</section><div class="section-top"><h2>一起研究，不只單看一檔</h2>${btn('開啟比較','nav','arrow','data-view="compare"','small ghost')}</div><div class="journal-banner"><p>比較清單目前有 ${state.compare.length} 檔。按表格右側的比較圖示，就能同時檢視最多 4 家公司的資料與題材交集。</p></div>`;}function lineChart(series,height=225){
 const valid=series.filter(s=>s.data?.length>1);if(!valid.length)return '<div class="empty"><p>尚無可用走勢資料。</p></div>';
 let dates=valid[0].data.map(x=>x.date).filter(d=>valid.every(s=>s.data.some(x=>x.date===d)));
 if(dates.length<2)return '<div class="empty"><p>各股沒有足夠的共同交易日期，無法畫出比較線。</p></div>';
 const W=720,H=height,L=40,R=20,T=18,B=29;
 const rows=valid.map(s=>{const map=new Map(s.data.map(d=>[d.date,d.close]));const base=map.get(dates[0]);return{...s,values:dates.map(d=>map.get(d)/base*100)};});
 let min=Math.min(...rows.flatMap(s=>s.values)),max=Math.max(...rows.flatMap(s=>s.values));const pad=Math.max(1,(max-min)*.12);min-=pad;max+=pad;
 const x=i=>L+i/(dates.length-1)*(W-L-R),y=v=>T+(max-v)/(max-min)*(H-T-B);
 return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="共同日期的股價指數化比較圖，起點為100">${Array.from({length:5},(_,i)=>{const v=min+(max-min)*i/4;return `<line class="chart-grid" x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"/><text class="chart-label" x="${L-7}" y="${y(v)+3}" text-anchor="end">${nf(v,0)}</text>`;}).join('')}${rows.map(s=>`<path d="${s.values.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')}" fill="none" stroke="${s.color}" stroke-width="2.2" stroke-linejoin="round"/>`).join('')}<text class="chart-label" x="${L}" y="${H-4}">${esc(dates[0])}</text><text class="chart-label" x="${W-R}" y="${H-4}" text-anchor="end">${esc(dates.at(-1))}</text><line x1="${L}" x2="${W-R}" y1="${y(100)}" y2="${y(100)}" stroke="var(--muted)" opacity=".4" stroke-dasharray="4 5"/></svg>`;
}
function candleChart(rows){
 if(!rows||rows.length<2)return '<div class="empty"><p>尚無足夠的 K 線資料。</p></div>';
 const a=rows.slice(-stockRange),W=510,H=238,L=44,R=8,T=15,B=50,ph=H-T-B;
 let lo=Math.min(...a.map(d=>d.low)),hi=Math.max(...a.map(d=>d.high));const span=hi-lo||1;lo-=span*.08;hi+=span*.08;
 const y=v=>T+(hi-v)/(hi-lo)*ph,step=(W-L-R)/a.length,cw=Math.max(1,step*.58),maxVol=Math.max(...a.map(d=>d.volume||0),1);
 return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${mode==='demo'?'模擬':'歷史日線'}蠟燭圖，${a.length}筆。可停留於K棒查看開高低收。">${Array.from({length:5},(_,i)=>{const v=lo+(hi-lo)*i/4;return `<line class="chart-grid" x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}"/><text class="chart-label" x="${L-6}" y="${y(v)+3}" text-anchor="end">${nf(v,hi>200?0:1)}</text>`;}).join('')}${a.map((d,i)=>{const x=L+step*(i+.5),c=d.close>=d.open?'var(--up)':'var(--down)',body=Math.max(1.1,Math.abs(y(d.close)-y(d.open)));return `<g><title>${esc(d.date)}｜開 ${nf(d.open,2)} 高 ${nf(d.high,2)} 低 ${nf(d.low,2)} 收 ${nf(d.close,2)}｜${nf(d.volume)} 股</title><line x1="${x}" x2="${x}" y1="${y(d.high)}" y2="${y(d.low)}" stroke="${c}"/><rect x="${x-cw/2}" y="${Math.min(y(d.open),y(d.close))}" width="${cw}" height="${body}" fill="${c}"/><rect x="${x-cw/2}" y="${H-20-(d.volume||0)/maxVol*24}" width="${cw}" height="${(d.volume||0)/maxVol*24}" fill="${c}" opacity=".35"/><rect x="${x-step/2}" y="${T}" width="${step}" height="${H-T-18}" fill="transparent"/></g>`;}).join('')}<text class="chart-label" x="${L}" y="${H-3}">${esc(a[0].date)}</text><text class="chart-label" x="${W-R}" y="${H-3}" text-anchor="end">${esc(a.at(-1).date)}</text></svg>`;
}
const lineColors=['#b9ef76','#70cbe9','#f4b57c','#c7acf0'];
function renderCompare(){
 const ids=state.compare,ss=ids.map(id=>stock(id)||{id,name:catalog(id)?.name||id,tags:catalog(id)?.tags||[],role:catalog(id)?.role||'未知',market:'—'});
 const common=ss.length?ss[0].tags.filter(t=>ss.every(s=>s.tags.includes(t))):[];
 return `${pageHead('SIDE BY SIDE','同一個畫面，看見彼此差異。','最多同時比較 4 檔；共同題材不代表價格連動，也不代表供應關係。',btn('清空比較','compare-clear','trash')+btn('加入比較','search','plus','data-purpose="compare"','primary'))}${notice()}${ids.length?`<section class="panel"><div class="table-scroll"><div class="compare-grid" style="--cols:${ids.length}"><div class="compare-label">比較公司</div>${ss.map((s,i)=>`<div class="compare-value"><div class="between"><span class="legend-line" style="--c:${lineColors[i]}"></span><button class="icon-btn" data-action="compare-toggle" data-id="${esc(s.id)}" aria-label="移除${esc(s.name)}">${icon('close')}</button></div><h3><button data-action="stock" data-id="${esc(s.id)}" style="padding:0">${esc(s.name)}</button></h3><small class="mono muted">${esc(s.id)} · ${s.market}</small></div>`).join('')}${[['price',priceLabel(),s=>`<span class="big mono">${nf(s.price,2)}</span>`],['change','漲跌幅',s=>`<span class="mono ${tone(s.change)}">${pct(s.change)}</span>`],['volume','成交量（千股）',s=>nf(s.volume,1)],['amount','成交額',s=>money(s.amount)],['role','示範角色',s=>esc(s.role)],['tags','研究題材',s=>`<div class="flex wrap">${s.tags.map(t=>`<span class="tag">${theme(t).name}</span>`).join('')||'未分類'}</div>`],['date','行情資料日期',s=>mode==='demo'?'示範・無真實日期':esc(s.date||'無行情')]].map(([k,n,fn])=>`<div class="compare-label">${n}</div>${ss.map(s=>`<div class="compare-value">${fn(s)}</div>`).join('')}`).join('')}</div></div></section><section class="panel space"><div class="panel-head"><div><h2>走勢放在同一個基準</h2><div class="sub">共同交易日起點＝100 · 最近 66 筆 · 非報酬回測</div></div>${sourceTag()}</div><div class="compare-chart" id="compare-chart">${renderComparisonChart()}</div></section><div class="journal-banner space"><h3>共同題材</h3><div class="flex wrap space">${common.length?common.map(t=>`<button class="chip" data-action="theme" data-id="${t}">${theme(t).name}</button>`).join(''):'<span class="muted tiny">目前沒有共同的示範題材。</span>'}</div><p>比較用於整理資料差異，沒有綜合評分、勝出股票或買賣訊號。盤後價格未還原除權息，不能直接視為投資報酬。</p></div>`:`<section class="panel"><div class="empty">${icon('compare')}<h3>從兩家公司開始比較</h3><p>搜尋股票，或從任一個股視窗按「加入比較」。</p>${btn('選擇股票','search','plus','data-purpose="compare"','primary')}</div></section>`}`;
}
function renderComparisonChart(){
 const ss=state.compare.map((id,i)=>({label:stock(id)?.name||catalog(id)?.name||id,color:lineColors[i],data:mode==='demo'&&catalog(id)?D.history(id).slice(-66):comparisonSeries[id]}));
 const missing=ss.filter(s=>!s.data?.length).map(s=>s.label);
 return lineChart(ss)+`<div class="flex wrap space">${ss.map(s=>`<span class="legend-item"><i class="legend-line" style="--c:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div><p class="chart-caption">${mode==='demo'?'全部為模擬走勢，不對應真實交易日期。':'歷史日線由 FinMind 回傳；未還原除權息。'}${missing.length?` 尚無歷史資料：${missing.map(esc).join('、')}。`:''}</p>`;
}
async function loadComparison(){const ticket=mode;await Promise.all(state.compare.map(async id=>{try{comparisonSeries[id]=await getHistory(id);}catch{comparisonSeries[id]=[];}}));if(view==='compare'&&mode===ticket&&$('#compare-chart'))$('#compare-chart').innerHTML=renderComparisonChart();}
function renderPortfolio(){
 const {positions,realized}=ledger(state.trades),held=positions.filter(p=>p.qty>0);let cost=0,value=0,unrealized=0,unpriced=0;
 for(const p of held){const q=stock(p.id);cost+=p.cost;if(finite(q?.price)){const v=p.qty*q.price;value+=v;unrealized+=v-p.cost;}else unpriced++;}
 return `${pageHead('TRADE JOURNAL','把每次交易，變成可回顧的紀錄。','移動加權平均成本；交易數量以「股」為單位，手續費與稅額由你填入。',btn('匯入 CSV','trade-import','upload')+btn('新增交易','trade-new','plus','','primary'))}<div class="notice">${icon('info')}<span>${mode==='demo'?'<strong>注意：目前估值使用模擬價格。</strong> 實際交易請切換至官方行情後再評估損益。':'估值依最近收盤價；未實現損益未扣未來賣出費用。'} 交易僅記錄在瀏覽器，不會送至券商。${unpriced?` 有 ${unpriced} 檔缺行情，市值與未實現損益僅包含可估值部位。`:''}</span></div><div class="portfolio-summary">${kpi('持股帳面成本',nf(cost,0),`${held.length} 檔持有中`,'wallet')}${kpi(mode==='demo'?'示範未實現損益':'可估值未實現損益',`${unrealized>0?'+':''}${nf(unrealized,0)}`,`可估值市值 ${nf(value,0)} 元`,'chart',tone(unrealized))}${kpi('累計已實現損益',`${realized>0?'+':''}${nf(realized,0)}`,'依你的實際買賣與已填費用計算','compare',tone(realized))}</div><section class="panel"><div class="panel-head"><h2>目前持股</h2>${sourceTag()}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>股票</th><th class="right">持有股數</th><th class="right">平均成本</th><th class="right">${priceLabel()}</th><th class="right">未實現損益</th><th></th></tr></thead><tbody>${held.length?held.map(p=>{const q=stock(p.id),pl=finite(q?.price)?q.price*p.qty-p.cost:null;return `<tr><td><button class="stock-name-btn" data-action="stock" data-id="${esc(p.id)}">${esc(q?.name||p.name||p.id)}<small>${esc(p.id)}</small></button></td><td class="right mono">${nf(p.qty)}</td><td class="right mono">${nf(p.cost/p.qty,2)}</td><td class="right mono">${nf(q?.price,2)}</td><td class="right mono ${tone(pl)}">${finite(pl)?`${pl>0?'+':''}${nf(pl,0)}`:'缺行情'}</td><td>${btn('記錄賣出','trade-new','','data-id="'+esc(p.id)+'" data-side="sell"','small')}</td></tr>`;}).join(''):'<tr><td colspan="6"><div class="empty"><h3>尚無持股紀錄</h3><p>新增買入紀錄後，系統會自動整理股數與平均成本。</p></div></td></tr>'}</tbody></table></div></section><section class="panel space"><div class="panel-head"><h2>交易明細</h2>${btn('匯出 CSV','export-trades','download','','small ghost')}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>日期</th><th>股票</th><th>類別</th><th class="right">股數</th><th class="right">成交價</th><th class="right">費用＋稅</th><th></th></tr></thead><tbody>${state.trades.length?[...state.trades].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).map(t=>`<tr><td class="mono">${esc(t.date)}</td><td>${esc(t.name||t.stock)} <small class="muted">${esc(t.stock)}</small></td><td><span class="tag ${t.side==='buy'?'lime':''}">${t.side==='buy'?'買入':'賣出'}</span></td><td class="right mono">${nf(t.qty)}</td><td class="right mono">${nf(t.price,2)}</td><td class="right mono">${nf(t.fee+t.tax,2)}</td><td><button class="icon-btn" data-action="trade-delete" data-id="${esc(t.id)}" aria-label="刪除交易">${icon('trash')}</button></td></tr>`).join(''):'<tr><td colspan="7"><div class="empty"><p>沒有交易紀錄；這裡不會放入假的持股。</p></div></td></tr>'}</tbody></table></div></section>`;
}
function renderNotes(){return `${pageHead('RESEARCH NOTEBOOK','記下觀察，而不只記住價格。','整理假設、原始來源與待查問題；筆記不會自動傳給 AI。',btn('新增筆記','note-new','plus','','primary'))}${state.notes.length?`<div class="note-grid">${[...state.notes].reverse().map(n=>`<article class="note-card"><div class="between"><span class="tag lime">${esc(n.tag||'個人研究')}</span><span class="note-meta mono">${esc(n.date)}</span></div><h3>${esc(n.title)}</h3><p>${esc(n.body)}</p><div class="note-bottom">${n.url?`<a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">查看原始來源 ↗</a>`:'<span class="tiny dim">未附來源</span>'}<div class="flex">${btn('編輯','note-edit','note','data-id="'+esc(n.id)+'"','small ghost')}<button class="icon-btn" data-action="note-delete" data-id="${esc(n.id)}" aria-label="刪除筆記">${icon('trash')}</button></div></div></article>`).join('')}</div>`:`<div class="panel"><div class="empty">${icon('note')}<h3>讓下一次的自己，看懂這次的想法。</h3><p>例如：觀察哪些指標？資料來自哪裡？什麼情況會改變原本看法？</p>${btn('寫下第一則筆記','note-new','plus','','primary')}</div></div>`}<div class="notice info space">${icon('lock')} 內容只儲存在此瀏覽器。清除瀏覽器資料會刪除筆記；請在設定頁匯出備份。</div>`;}
function renderAssistant(){return `${pageHead('RESEARCH ASSISTANT','從一個問題，展開你的研究。','預設為透明的規則式整理。連接自己的後端並同意傳送後，才會呼叫生成式 AI。')}${notice()}<div class="assistant-layout"><section class="panel chat-panel"><div class="between" style="margin-bottom:20px"><span class="tag ${aiOnline?'lime':''}">${icon('spark')}${aiOnline?'線上 AI · 需後端設定':'離線整理 · 非生成式 AI'}</span><div class="segment"><button data-action="ai-mode" data-mode="offline" class="${!aiOnline?'active':''}">離線</button><button data-action="ai-mode" data-mode="online" class="${aiOnline?'active':''}">線上 AI</button></div></div><div class="chat-messages" id="chat-messages">${chat.map(chatMessage).join('')}</div>${aiOnline?`<label class="check-label"><input type="checkbox" id="ai-consent" ${aiConsent?'checked':''}>我同意把本次問題及問題中提到的股票資料，經後端傳給 OpenAI；不傳送交易紀錄與個人筆記。</label>`:''}<form class="chat-form" id="chat-form"><input id="chat-input" placeholder="例如：比較台積電和廣達的產業角色" maxlength="1200" aria-label="研究問題" required ${chatBusy?'disabled':''}><button class="btn primary" type="submit" ${chatBusy?'disabled':''}>${chatBusy?'<span class="spinner"></span>':icon('arrow')}<span>${chatBusy?'整理中':'送出'}</span></button></form></section><aside><div class="journal-banner"><div class="eyebrow">ASK BETTER QUESTIONS</div><h3>先問脈絡，再看數字。</h3><p>這裡不預測股價，也不產生買賣推薦。線上 AI 僅依傳入的資料回答，仍需查核。</p>${['台積電在什麼研究主題裡？','AI 伺服器有哪些示範角色？','比較廣達與奇鋐','電源與儲能還需要查哪些資料？'].map(q=>`<button class="prompt-card" data-action="prompt" data-q="${esc(q)}">${q} ↗</button>`).join('')}</div></aside></div>`;}
function chatMessage(m){return `<div class="chat-message ${m.role==='user'?'user':''}">${m.label?`<strong>${esc(m.label)}</strong>`:''}${esc(m.text)}</div>`;}
function renderSettings(){return `${pageHead('MAKE IT YOURS','你的工作台，你的使用方式。','外觀與研究內容保留在裝置；API 金鑰只放在自己的後端。')}<div class="settings-grid"><section class="panel settings-card"><h2>顯示偏好</h2><div class="setting-row"><div><strong>介面主題</strong><small>深色適合長時間檢視；淺色便於閱讀。</small></div><select id="pref-theme" aria-label="介面主題"><option value="dark" ${state.theme==='dark'?'selected':''}>深色模式</option><option value="light" ${state.theme==='light'?'selected':''}>淺色模式</option></select></div><div class="setting-row"><div><strong>漲跌顏色</strong><small>表格、K 線與熱力圖一起切換。</small></div><select id="pref-color" aria-label="漲跌顏色"><option value="red" ${state.color==='red'?'selected':''}>紅漲綠跌</option><option value="green" ${state.color==='green'?'selected':''}>綠漲紅跌</option></select></div><div class="setting-row"><div><strong>資訊密度</strong><small>調整列表與地圖卡片間距。</small></div><select id="pref-density" aria-label="資訊密度"><option value="comfortable" ${state.density==='comfortable'?'selected':''}>舒適</option><option value="compact" ${state.density==='compact'?'selected':''}>精簡</option></select></div><div class="setting-row"><div><strong>安裝到主畫面</strong><small>HTTPS 網站可使用離線介面；API 仍需網路。</small></div>${btn('安裝說明','install','download','','small')}</div></section><section class="panel settings-card"><h2>行情連線</h2><div class="connection-box"><strong>${dataLabel()}</strong>${liveMeta?esc(liveMeta.label||'已載入盤後快照'):'目前使用內建示範資料。啟動隨附 server.py 後，可嘗試更新官方盤後行情。'}${liveMeta?.warnings?.length?`<p class="up">${liveMeta.warnings.map(esc).join('；')}</p>`:''}</div><form id="connection-form" class="space"><div class="field"><label for="api-base">自己的後端位址（同源部署留空）</label><input id="api-base" type="url" placeholder="https://your-private-api.example" value="${esc(state.apiBase)}"><small>靜態預覽不含伺服器。不要填入原網站 API 或未授權的服務。</small></div><div class="field space"><label for="api-token">自架後端存取碼（非 OpenAI 金鑰）</label><input id="api-token" type="password" autocomplete="off" placeholder="個人本機使用可留空" value="${esc(apiToken)}"><small>只存放在此頁記憶體，重整即清除；不要在公開網站分發私人存取碼。</small></div><div class="flex wrap space"><button class="btn" type="submit">儲存並測試</button>${btn('更新盤後行情','sync','refresh','','primary')}${btn('返回示範','demo','','','ghost')}</div></form></section><section class="panel settings-card"><h2>資料備份</h2><p class="muted tiny">備份包含自選、比較、交易、筆記與提醒。不含 API 金鑰或即時行情。匯入會覆蓋目前裝置資料，並先驗證交易是否超賣。</p><div class="flex wrap space">${btn('匯出完整備份','backup-export','download','','primary')}${btn('匯入備份','backup-import','upload')}</div><div class="divider"></div><div class="between"><div><h3>清除本機研究資料</h3><p class="muted tiny">此操作不能復原，建議先備份。</p></div>${btn('清除','reset','trash','','danger small')}</div></section><section class="panel settings-card"><h2>資料來源與限制</h2><div class="source-list"><a href="https://openapi.twse.com.tw/" target="_blank" rel="noopener noreferrer">TWSE OpenAPI · 上市盤後行情 ↗</a><a href="https://www.tpex.org.tw/openapi/" target="_blank" rel="noopener noreferrer">TPEx OpenAPI · 上櫃盤後行情 ↗</a><a href="https://finmind.github.io/tutor/TaiwanMarket/Technical/" target="_blank" rel="noopener noreferrer">FinMind 官方文件 · 歷史日線 ↗</a><a href="https://developers.openai.com/api/docs/" target="_blank" rel="noopener noreferrer">OpenAI 官方文件 · 選用 AI 後端 ↗</a><p>股脈是獨立實作，不使用原網站程式、商標或付費資料。內建 40 家公司的價格與分類皆用於展示，並未完成真實供應鏈研究。</p><p>日線未還原除權息。行情來源可能延遲、缺值或拒絕請求；查詢失敗會明確顯示，不會把示範數字當作官方資料。</p><p>本版未提供會員付款、跨裝置同步、新聞訂閱、券商下單或背景推播。正式對外營運仍需資料授權確認、登入控管與部署驗證。</p></div></section></div>`;}
function setOverlay(html,drawer=false){if(!$('#overlay-root').children.length)focusReturn=document.activeElement;$('#overlay-root').innerHTML=`<div class="overlay-backdrop ${drawer?'drawer-backdrop':''}" data-action="backdrop">${html}</div>`;document.body.style.overflow='hidden';requestAnimationFrame(()=>{$('input,button,select,textarea,a',$('#overlay-root'))?.focus();});}
function closeOverlay(){histTicket++;selectedStock=null;$('#overlay-root').innerHTML='';document.body.style.overflow='';if(focusReturn?.isConnected)focusReturn.focus();focusReturn=null;}
function modal(title,body){histTicket++;selectedStock=null;setOverlay(`<section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${title}</h2><button class="icon-btn" data-action="close" aria-label="關閉">${icon('close')}</button></header><div class="modal-body">${body}</div></section>`);}
function openSearch(purpose='stock'){
 histTicket++;selectedStock=null;searchPurpose=purpose;
 setOverlay(`<section class="modal search-modal" role="dialog" aria-modal="true" aria-label="搜尋股票"><div class="search-input-wrap">${icon('search')}<input id="global-search" placeholder="輸入股票代號、公司或產業…" aria-label="搜尋內容" autocomplete="off"><button class="icon-btn" data-action="close" aria-label="關閉搜尋">${icon('close')}</button></div><div class="search-results" id="search-results"></div><div class="search-hint">${purpose==='compare'?'選取後加入比較，最多 4 檔':purpose==='watch'?'選取後加入自選清單':'選取查看個股或產業'} · Esc 關閉 · ${dataLabel()}</div></section>`);searchResults('');
}
function searchResults(q){const needle=q.trim().toLowerCase();const ts=searchPurpose==='stock'?D.themes.filter(t=>needle&&(t.name.toLowerCase().includes(needle)||t.en.toLowerCase().includes(needle))):[];let ss=universe().filter(s=>!needle||`${s.id} ${s.name} ${s.tags.map(id=>theme(id).name).join(' ')}`.toLowerCase().includes(needle)).slice(0,25);
 $('#search-results').innerHTML=ts.map(t=>`<button class="search-result" data-action="theme" data-id="${t.id}"><span class="theme-icon" style="--c:${t.accent}">${icon(t.icon)}</span><span class="result-info"><strong>${t.name}</strong><small>產業主題 · ${themeStocks(t.id).length} 家公司</small></span>${icon('arrow')}</button>`).join('')+ss.map(s=>`<button class="search-result" data-action="search-select" data-id="${esc(s.id)}"><span class="theme-icon">${icon('chart')}</span><span class="result-info"><strong>${esc(s.name)} <small class="mono">${esc(s.id)} · ${s.market} · ${esc(s.role)}</small></strong></span><span class="mono ${tone(s.change)}">${pct(s.change)}</span></button>`).join('')||'<div class="empty"><h3>找不到符合項目</h3><p>示範版包含 40 家公司；連線後可查詢官方回傳的公司。</p></div>';
}
function openStock(id){const s=stock(id);if(!s){toast('目前資料模式沒有這檔股票的行情。請更新行情或切換模式。',true);return;}selectedStock=id;stockHist=mode==='demo'?D.history(id):historyCache.get(id)||null;histError='';histLoading=mode==='official'&&!stockHist;const ticket=++histTicket;drawStock();if(histLoading)getHistory(id).then(rows=>{if(selectedStock===id&&ticket===histTicket){stockHist=rows;histLoading=false;drawStock();}}).catch(e=>{if(selectedStock===id&&ticket===histTicket){histLoading=false;histError=e.message;drawStock();}});}
function drawStock(){const s=stock(selectedStock);if(!s)return;
 const selectedId=selectedStock,chart=histLoading?'<div class="loading"><span class="spinner"></span>讀取歷史日線…</div>':histError?`<div class="empty"><p>${esc(histError)}</p>${btn('重新讀取','history-retry','refresh','','small')}</div>`:candleChart(stockHist);
 setOverlay(`<section class="stock-drawer" role="dialog" aria-modal="true" aria-label="${esc(s.name)}個股資料"><div class="drawer-top">${sourceTag()}<button class="icon-btn" data-action="close" aria-label="關閉個股">${icon('close')}</button></div><div class="drawer-content"><div class="stock-title"><div><h2>${esc(s.name)}</h2><small class="mono">${esc(s.id)} · ${s.market} · ${mode==='demo'?'模擬資料':esc(s.date||'日期未知')}</small></div><div class="flex"><button class="icon-btn ${state.watch.includes(s.id)?'on':''}" data-action="watch-toggle" data-id="${esc(s.id)}" aria-label="${state.watch.includes(s.id)?'移出':'加入'}自選">${icon('star')}</button></div></div><div class="price-big mono">${nf(s.price,2)} <small class="muted" style="font-size:11px;letter-spacing:0">TWD · ${priceLabel()}</small></div><div class="price-change mono ${tone(s.change)}">${pct(s.change)} <span class="muted" style="font-size:10px">${mode==='demo'?'模擬漲跌，不代表實際市場':'較前一交易日；來源 '+esc(s.source||'')}</span></div><div class="between"><h3 style="font-size:12px">${mode==='demo'?'示範 K 線':'歷史日 K 線'}</h3><div class="segment">${[[22,'1M'],[66,'3M'],[132,'6M'],[240,'1Y']].map(([v,l])=>`<button class="${stockRange===v?'active':''}" data-action="range" data-range="${v}">${l}</button>`).join('')}</div></div><div class="chart-wrap space" id="stock-chart">${chart}</div><p class="chart-caption">${mode==='demo'?'D1–D240 為合成資料序號，非實際日期。':'FinMind 日成交資訊，未還原除權息；期間以交易筆數近似。'} ${state.color==='red'?'紅漲綠跌':'綠漲紅跌'}。</p><div class="metrics-grid"><div class="metric"><label>成交量（千股）</label><span class="mono">${nf(s.volume,1)}</span></div><div class="metric"><label>成交額</label><span class="mono">${money(s.amount)}</span></div><div class="metric"><label>題材數</label><span class="mono">${s.tags.length} <small>示範分類</small></span></div></div><div class="flex wrap space">${btn(state.compare.includes(s.id)?'移出比較':'加入比較','compare-toggle','compare','data-id="'+esc(s.id)+'"','primary')}${btn('新增交易','trade-new','plus','data-id="'+esc(s.id)+'"')}${btn('寫筆記','note-new','note','data-stock="'+esc(s.id)+'"')}</div><h3 class="drawer-section-title">研究主題與角色</h3><div class="flex wrap">${s.tags.map(t=>`<button class="chip" data-action="theme" data-id="${t}">${theme(t).name}</button>`).join('')||'<span class="muted tiny">尚未分類</span>'}</div><p class="research-text space">示範角色：${esc(s.role)}。此分類是互動展示標籤，不是已查核的供應鏈結論。研究時應回查公司年報、法說及重大訊息，不據此推定客戶或營收占比。</p><h3 class="drawer-section-title">價格條件提醒</h3><form id="alert-form" data-stock="${esc(selectedId)}"><div class="alert-row"><select id="alert-dir" aria-label="提醒條件"><option value="above">高於等於</option><option value="below">低於等於</option></select><input id="alert-price" type="number" min="0.001" step="any" placeholder="目標價格" aria-label="目標價格" required><button class="btn" type="submit">新增</button></div></form><p class="tiny muted">只在開啟網站、加入條件或更新資料時檢查，不會背景推播。示範模式會以模擬價比對。</p>${state.alerts.filter(a=>a.stock===s.id).map(a=>`<div class="alert-item"><span>${a.dir==='above'?'≥':'≤'} ${nf(a.price,2)}</span><button class="icon-btn" data-action="alert-delete" data-id="${esc(a.id)}" aria-label="刪除提醒">${icon('trash')}</button></div>`).join('')}</div></section>`,true);
 selectedStock=selectedId;
}
function tradeModal(id='',side='buy'){
 const ss=[...new Map([...D.stocks.filter(s=>groupOf(s)===fx.market),...Object.values(fx.catalog||{}).filter(s=>groupOf(s)===fx.market),...fx.imported.quotes.filter(s=>groupOf(s)===fx.market),...universe()].map(s=>[s.id,s])).values()],opts=ss.map(s=>`<option value="${esc(s.id)}" ${s.id===id?'selected':''}>${esc(s.id)} ${esc(s.name)}</option>`).join('');
 modal('新增交易紀錄',`<p class="muted tiny" style="margin-bottom:18px">不連接券商。請填入實際交易資料；數量單位為股，1 張通常為 1,000 股。</p><form id="trade-form"><div class="input-row"><div class="field full"><label for="trade-stock">股票</label><select id="trade-stock" required>${opts}</select></div><div class="field"><label for="trade-date">交易日期</label><input id="trade-date" type="date" value="${today()}" max="${today()}" required></div><div class="field"><label for="trade-side">買賣</label><select id="trade-side"><option value="buy" ${side==='buy'?'selected':''}>買入</option><option value="sell" ${side==='sell'?'selected':''}>賣出</option></select></div><div class="field"><label for="trade-qty">交易股數（非張數）</label><input id="trade-qty" type="number" min="1" step="1" placeholder="例如 1000" required></div><div class="field"><label for="trade-price">實際成交單價</label><input id="trade-price" type="number" min="0.0001" step="any" placeholder="填入成交價格" required></div><div class="field"><label for="trade-fee">實際手續費（元）</label><input id="trade-fee" type="number" min="0" step="any" value="0" required></div><div class="field"><label for="trade-tax">實際交易稅（元）</label><input id="trade-tax" type="number" min="0" step="any" value="0" required></div></div><p class="tiny muted space">已實現損益會扣除買入成本、手續費與已填稅額。此版不推定稅率，不自動納入股利、拆併股或換股。</p><div class="form-error" id="trade-error" role="alert"></div><div class="modal-footer">${btn('取消','close')}<button class="btn primary" type="submit">儲存交易</button></div></form>`);
}
function noteModal(id='',stockId=''){const n=state.notes.find(n=>n.id===id),s=stock(stockId);modal(n?'編輯研究筆記':'新增研究筆記',`<form id="note-form" data-id="${esc(id)}"><div class="field"><label for="note-title">標題</label><input id="note-title" maxlength="180" required value="${esc(n?.title||(s?s.name+' 研究觀察':''))}" placeholder="這次想確認什麼？"></div><div class="input-row space"><div class="field"><label for="note-tag">標籤</label><input id="note-tag" maxlength="40" value="${esc(n?.tag||(s?s.id:''))}" placeholder="公司 / 產業"></div><div class="field"><label for="note-date">研究日期</label><input id="note-date" type="date" value="${esc(n?.date||today())}" required></div></div><div class="field space"><label for="note-body">觀察與待確認事項</label><textarea id="note-body" maxlength="10000" rows="7" required placeholder="研究假設：&#10;支持資料：&#10;待確認問題：&#10;改變看法的條件：">${esc(n?.body||'')}</textarea></div><div class="field space"><label for="note-url">原始來源（選填，僅 http / https）</label><input id="note-url" type="url" value="${esc(n?.url||'')}" placeholder="https://…"></div><div class="form-error" id="note-error" role="alert"></div><div class="modal-footer">${btn('取消','close')}<button class="btn primary" type="submit">儲存筆記</button></div></form>`);}async function api(path,options={}){
 if(location.protocol==='file:'&&!state.apiBase)throw Error('這是離線 HTML 預覽。請解壓縮完整網站，使用隨附啟動檔開啟後，再連線。');
 const base=state.apiBase?state.apiBase.replace(/\/+$/,'')+'/':new URL('./',location.href).href;
 const url=new URL('api/'+path,base),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),options.long?60000:28000);
 try{const res=await fetch(url,{method:options.method||'GET',headers:{...(options.body?{'Content-Type':'application/json'}:{}),...(apiToken?{'X-Atlas-Token':apiToken}:{})},body:options.body?JSON.stringify(options.body):undefined,signal:controller.signal,cache:'no-store'});let obj;try{obj=await res.json();}catch{throw Error('此網址沒有 ATLAS API。靜態網站可使用匯入資料與示範；外部來源需要隨附後端。');}if(!res.ok)throw Error(obj.error||`連線失敗（${res.status}）`);return obj;}catch(e){if(e.name==='AbortError')throw Error('資料來源回應逾時，現有資料未被替換。');if(e instanceof TypeError)throw Error('無法連接後端，請確認伺服器、網址與 CORS 設定。');throw e;}finally{clearTimeout(timer);}
}
async function syncQuotes(options={}){
 if(quoteBusy)return false;quoteBusy=true;
 const quiet=options.quiet===true,market=fx.market;
 if(!quiet)toast('\u6b63\u5728\u66f4\u65b0\u76e4\u5f8c\u8cc7\u6599\uff1b\u6210\u529f\u5f8c\u624d\u6703\u5207\u63db\u8cc7\u6599\u6a21\u5f0f\u3002');
 try{
  let path='quotes?market='+encodeURIComponent(market);
  if(market!=='TW'){
   const ids=[...new Set([...D.stocks.filter(s=>groupOf(s)===market).map(s=>s.id),...state.watch.filter(id=>groupOf(catalog(id)||remoteCatalog.get(id)||fx.catalog?.[id])===market)])].slice(0,8);
   if(!ids.length)throw Error('\u9019\u500b\u5e02\u5834\u9084\u6c92\u6709\u53ef\u66f4\u65b0\u7684\u80a1\u7968\u4ee3\u865f\u3002');
   path+='&symbols='+encodeURIComponent(ids.join(','));
  }
  const res=await api(path),qs={};if(!Array.isArray(res.quotes))throw Error('\u5f8c\u7aef\u884c\u60c5\u683c\u5f0f\u4e0d\u6b63\u78ba');
  for(const q of res.quotes){
   if(!q||!/^[A-Za-z0-9._-]{1,16}$/.test(q.id)||typeof q.name!=='string'||(finite(q.price)&&q.price<=0))continue;
   const qm=String(q.market||market).toUpperCase(),normalizedMarket=qm==='TPEX'?'TPEX':qm==='TWSE'?'TWSE':market;
   qs[q.id]={id:q.id,name:q.name,market:normalizedMarket,currency:q.currency||currencyOf({market:normalizedMarket}),price:finite(q.price)?q.price:null,change:finite(q.change)?q.change:null,volume:finite(q.volume)?q.volume:null,amount:finite(q.amount)?q.amount:null,source:String(q.source||'official'),date:String(q.date||'')};
  }
  if(!Object.keys(qs).length)throw Error('\u4f86\u6e90\u672a\u56de\u50b3\u53ef\u7528\u884c\u60c5\uff0c\u4e0d\u5207\u63db\u8cc7\u6599\u6a21\u5f0f\u3002');
  const keep={};for(const [id,q] of Object.entries(liveQuotes))if(groupOf(q)!==market)keep[id]=q;
  liveQuotes={...keep,...qs};mode='official';saveModePreference('official');liveMeta={label:res.label||'',warnings:res.warnings||[],fetchedAt:res.fetchedAt};comparisonSeries={};analyticsCache.clear();render();if(selectedStock&&stock(selectedStock))openStock(selectedStock);checkAlerts();if(view==='compare')loadComparison();
  if(!quiet)toast(`\u5df2\u8f09\u5165 ${Object.keys(qs).length} \u6a94\u8cc7\u6599${res.warnings?.length?'\uff0c\u90e8\u5206\u4f86\u6e90\u672a\u6210\u529f':''}\u3002`);
  return true;
 }catch(e){if(!quiet)toast(e.message,true);else throw e;return false;}finally{quoteBusy=false;}
}
function taipeiClock(){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Taipei',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());
 const pick=t=>parts.find(p=>p.type===t)?.value||'';return {weekday:pick('weekday'),hour:Number(pick('hour')),minute:Number(pick('minute'))};
}
function twMarketOpen(){const t=taipeiClock(),m=t.hour*60+t.minute;return !['Sat','Sun'].includes(t.weekday)&&m>=9*60&&m<=13*60+30;}
function realtimeSymbols(){
 const ids=new Set(D.stocks.filter(s=>groupOf(s)==='TW').map(s=>s.id));
 state.watch.forEach(id=>{const s=liveQuotes[id]||catalog(id);if(s&&groupOf(s)==='TW')ids.add(id);});
 if(selectedStock){const s=liveQuotes[selectedStock]||catalog(selectedStock);if(s&&groupOf(s)==='TW')ids.add(selectedStock);}
 return [...ids].filter(id=>/^\d{4,6}$/.test(id)).slice(0,120);
}
function applyRealtimeBar(q){
 if(!q?.bar||!historyCache.has(q.id))return;
 const b=q.bar,rows=[...historyCache.get(q.id)],i=rows.findIndex(r=>r.date===b.date);
 if(i>=0)rows[i]=b;else if(!rows.length||b.date>rows.at(-1).date)rows.push(b);
 historyCache.set(q.id,rows);analyticsCache.delete(q.id);comparisonSeries={};
}
async function syncRealtime(options={}){
 if(realtimeBusy||fx.market!=='TW'||mode==='demo'||mode==='imported')return false;
 if(!options.force&&!twMarketOpen())return false;
 realtimeBusy=true;
 try{
  const ids=realtimeSymbols();if(!ids.length)return false;
  const res=await api('realtime?symbols='+encodeURIComponent(ids.join(',')));
  if(!Array.isArray(res.quotes)||!res.quotes.length)throw Error('即時來源沒有回傳可用行情。');
  let updated=0;
  for(const q of res.quotes){
   const old=liveQuotes[q.id];if(!old)continue;
   liveQuotes[q.id]={...old,price:finite(q.price)?q.price:old.price,change:finite(q.change)?q.change:old.change,volume:finite(q.volume)?q.volume:old.volume,amount:finite(q.amount)?q.amount:old.amount,date:String(q.date||old.date||''),source:String(q.source||old.source||'FinMind realtime'),realtime:true,realtimeTime:String(q.time||'')};
   applyRealtimeBar(q);updated++;
  }
  if(updated){mode='official';realtimeLastAt=res.fetchedAt||new Date().toISOString();liveMeta={...(liveMeta||{}),label:`${res.label||'FinMind 台股即時快照'}${res.quotes[0]?.time?' · '+res.quotes[0].time:''}`,fetchedAt:realtimeLastAt,realtime:true};analyticsCache.clear();render();if(selectedStock&&stock(selectedStock))drawStock();checkAlerts();}
  if(options.force)toast(updated?`即時更新 ${updated} 檔；盤中約每 10 秒自動刷新。`:'沒有可套用的即時標的。');
  return updated>0;
 }catch(e){
  if(options.force)toast(e.message,true);
  else {console.warn('realtime polling stopped:',e.message);clearInterval(realtimeTimer);realtimeTimer=null;toast('即時更新未啟用：'+e.message,true);}
  return false;
 }finally{realtimeBusy=false;}
}
function scheduleRealtimePolling(){
 if(realtimeTimer){clearInterval(realtimeTimer);realtimeTimer=null;}
 if(!realtimeConfigured||fx.market!=='TW'||mode==='demo'||mode==='imported')return;
 if(twMarketOpen())syncRealtime().catch(()=>{});
 realtimeTimer=setInterval(()=>{if(document.hidden||fx.market!=='TW'||!twMarketOpen())return;syncRealtime().catch(()=>{});},10000);
}
async function getHistory(id){if(historyCache.has(id))return historyCache.get(id);const market=groupOf(stock(id)||catalog(id)||remoteCatalog.get(id)||fx.catalog?.[id])||fx.market;const res=await api('history?market='+encodeURIComponent(market)+'&stock='+encodeURIComponent(id));if(!Array.isArray(res.rows))throw Error('歷史資料格式不正確');const rows=res.rows.filter(d=>typeof d.date==='string'&&['open','high','low','close'].every(k=>finite(d[k])&&d[k]>0)&&d.high>=Math.max(d.open,d.close)&&d.low<=Math.min(d.open,d.close)).sort((a,b)=>a.date.localeCompare(b.date));if(rows.length<2)throw Error('沒有足夠歷史資料，或資料來源未授權。');historyCache.set(id,rows);return rows;}
function toggleWatch(id){if(!stock(id)&&!state.watch.includes(id))return;const exists=state.watch.includes(id);state.watch=exists?state.watch.filter(x=>x!==id):[...state.watch,id];save();render();if(selectedStock)drawStock();toast(exists?'已移出自選清單':'已加入自選清單');}
function toggleCompare(id){const exists=state.compare.includes(id);if(!exists&&state.compare.length>=4){toast('最多比較 4 檔，請先移除一檔。',true);return false;}if(!exists&&!stock(id))return false;state.compare=exists?state.compare.filter(x=>x!==id):[...state.compare,id];save();render();if(selectedStock)drawStock();if(view==='compare'&&mode==='official')loadComparison();toast(exists?'已移出比較':'已加入比較清單');return true;}
function checkAlerts(){for(const a of state.alerts){const s=stock(a.stock);if(!finite(s?.price))continue;const hit=a.dir==='above'?s.price>=a.price:s.price<=a.price,key=`${mode}:${s.date||'demo'}:${s.price}`;if(hit&&a.lastKey!==key){a.lastKey=key;toast(`${mode==='demo'?'【示範條件】':'【盤後條件】'}${s.name} ${nf(s.price,2)} 已符合 ${a.dir==='above'?'≥':'≤'} ${nf(a.price,2)}。`);}}save();}
function alertsModal(){modal('價格條件提醒',`<div class="notice info">${icon('info')}僅在本網站開啟或更新資料時檢查；不會在背景監控，不是即時到價服務。</div>${state.alerts.length?state.alerts.map(a=>{const s=stock(a.stock)||catalog(a.stock);return `<div class="alert-item"><span>${esc(s?.name||a.stock)} ${esc(a.stock)}　${a.dir==='above'?'≥':'≤'} ${nf(a.price,2)}</span><button class="icon-btn" data-action="alert-delete" data-id="${esc(a.id)}" aria-label="刪除提醒">${icon('trash')}</button></div>`;}).join(''):'<p class="muted tiny">尚無提醒。從任一個股視窗新增價格條件。</p>'}<div class="modal-footer">${btn('檢查目前條件','alerts-check','refresh','','primary')}</div>`);}
function offlineResearch(q){
 const needle=q.toLowerCase(),matches=universe().filter(s=>needle.includes(s.name.toLowerCase())||new RegExp('(^|[^0-9A-Za-z])'+s.id+'([^0-9A-Za-z]|$)','i').test(q)).slice(0,4);const ts=D.themes.filter(t=>needle.includes(t.name.toLowerCase())||needle.includes(t.en.toLowerCase())||(t.id==='ai'&&/\bai\b/i.test(q)));
 let text=`資料狀態：${dataLabel()}。以下由程式規則整理，並非生成式 AI。\n\n`;
 if(matches.length){text+=matches.map(s=>`${s.name}（${s.id}）\n・${priceLabel()}：${nf(s.price,2)} ${currencyOf(s)}；漲跌 ${pct(s.change)}。\n・示範角色：${s.role}。\n・示範主題：${s.tags.map(t=>theme(t).name).join('、')||'尚未分類'}。\n・來源：${mode==='demo'?'合成數字，無真實交易日期':s.source+'，'+s.date}。`).join('\n\n');if(matches.length>1){const tags=matches[0].tags.filter(t=>matches.every(s=>s.tags.includes(t)));text+='\n\n共同示範題材：'+(tags.map(t=>theme(t).name).join('、')||'沒有交集')+'。這不表示公司有供貨關係，也不能推導價格連動。';}}
 else if(ts.length){text+=ts.slice(0,2).map(t=>`${t.name}\n角色分層：${t.stages.join(' → ')}。\n示範公司：${themeStocks(t.id).map(s=>s.name+' '+s.id).join('、')||'目前沒有行情'}。\n這些只是展示分類，不代表已查證的產業名單。`).join('\n\n');}
 else{text+='目前只能依已載入的股票或題材做整理。可以輸入「2330」、「比較廣達與奇鋐」或「AI 伺服器有哪些角色」。\n\n尚未連接新聞、公司法說或財報資料，因此不會編造最新消息或財務比率。';}
 return text+'\n\n下一步可查證：公司原始年報與法說、產品營收比重、資料日期及題材關聯依據。可將查到的原始來源存進研究筆記。';
}
async function sendChat(q){if(chatBusy||!q.trim())return;if(aiOnline&&!aiConsent){toast('請先勾選同意傳送本次問題及提及公司的資料。',true);return;}q=q.trim().slice(0,1200);chat.push({role:'user',text:q});chatBusy=true;render();
 try{let text,label;if(aiOnline){const ss=universe().filter(s=>q.includes(s.name)||q.includes(s.id)).slice(0,4).map(s=>({id:s.id,name:s.name,price:s.price,change:s.change,source:mode==='demo'?'synthetic_demo':s.source,date:s.date,tags:s.tags.map(t=>theme(t).name),classification:'illustrative_unverified'}));const res=await api('analyze',{method:'POST',body:{question:q,dataMode:mode,stocks:ss},long:true});if(typeof res.text!=='string')throw Error('AI 回覆格式不正確');text=res.text;label='線上 AI · '+(res.model||'自架設定模型')+' · 仍需查核';}else{text=offlineResearch(q);label='離線研究整理 · 非生成式 AI';}chat.push({role:'assistant',label,text});}catch(e){chat.push({role:'assistant',label:'未取得 AI 回應',text:e.message+'\n不會把離線範本文字偽裝成線上 AI 結果。'});}finally{chatBusy=false;render();const el=$('#chat-messages');if(el)el.scrollTop=el.scrollHeight;}
}
function downloadFile(name,text,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function csvCell(v){let s=String(v??'');if(/^[=+@\t\r]/.test(s)||(/^[-]/.test(s)&&!/^[-]\d+(\.\d+)?$/.test(s)))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
function exportCSV(name,headers,rows){downloadFile(name,'\uFEFF'+[headers,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n'),'text/csv;charset=utf-8');}
function exportStocks(ss,name){exportCSV(name,['stock','name','market','currency','price','change_percent','volume_thousand_shares','amount_native_currency','classification_demo','source','date'],ss.map(s=>[s.id,s.name,s.market,currencyOf(s),s.price,s.change,s.volume,s.amount,s.role,mode==='demo'?'SYNTHETIC_DEMO_NOT_REAL':s.source,s.date||'DEMO']));}
function parseCSV(text){text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted){quoted=false;}else if(cell===''){quoted=true;}else throw Error('CSV 引號格式不正確');}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x!==''))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw Error('CSV 含未結束的引號');if(cell!==''||row.length){row.push(cell);rows.push(row);}return rows;}
function readFile(accept,handler){const input=document.createElement('input');input.type='file';input.accept=accept;input.hidden=true;document.body.append(input);input.onchange=async()=>{try{const file=input.files?.[0];if(!file)return;if(file.size>8*1024*1024)throw Error('檔案上限為 8 MB');await handler(await file.text());}catch(e){toast(e.message,true);}finally{input.remove();}};input.click();setTimeout(()=>{if(input.isConnected&&!input.files?.length)input.remove();},120000);}
function importTrades(){readFile('.csv',text=>{const rows=parseCSV(text);if(rows.length<2)throw Error('CSV 沒有交易資料');const headers=rows[0].map(h=>h.trim());for(const key of ['date','stock','side','qty','price'])if(!headers.includes(key))throw Error('CSV 缺少欄位：'+key);const get=(r,k)=>r[headers.indexOf(k)]??'';const now=Date.now(),added=rows.slice(1).map((r,i)=>{const id=get(r,'stock').trim(),side=get(r,'side').trim();return{id:uid(),stock:id,name:get(r,'name')||stock(id)?.name||id,date:get(r,'date'),side:side==='買入'?'buy':side==='賣出'?'sell':side,qty:Number(get(r,'qty')),price:Number(get(r,'price')),fee:Number(get(r,'fee')||0),tax:Number(get(r,'tax')||0),createdAt:now+i};});if(added.some(t=>t.date>today()))throw Error('交易日期不可在未來');const candidate=validateState({...state,trades:[...state.trades,...added]});if(!confirm(`將新增 ${added.length} 筆交易（不會自動去重）。確定匯入？`))return;state=candidate;save();render();toast(`已匯入 ${added.length} 筆交易。`);});}
function updateScreen(){if($('#screen-results'))$('#screen-results').innerHTML=stockTable(filtered(),true);}
function deleteTrade(id){if(!confirm('確定刪除這筆交易？刪除買入可能影響後續賣出的有效性。'))return;try{const next=state.trades.filter(t=>t.id!==id);ledger(next);state.trades=next;save();render();toast('交易已刪除');}catch(e){toast('不能刪除：'+e.message,true);}}
function handleAction(el,e){const a=el.dataset.action,id=el.dataset.id;
 switch(a){
 case 'nav':e.preventDefault();go(el.dataset.view);break;
 case 'menu':$('.sidebar')?.classList.add('open');break;
 case 'menu-close':$('.sidebar')?.classList.remove('open');break;
 case 'close':closeOverlay();break;
 case 'backdrop':if(e.target===el)closeOverlay();break;
 case 'search':openSearch(el.dataset.purpose||'stock');break;
 case 'search-select':{const p=searchPurpose;closeOverlay();if(p==='watch'){if(!state.watch.includes(id))toggleWatch(id);else toast('已經在自選清單中');}else if(p==='compare'){if(!state.compare.includes(id))toggleCompare(id);go('compare');}else openStock(id);break;}
 case 'stock':openStock(id);break;
 case 'theme':mapTheme=id;mapZoom=1;go('map');break;
 case 'watch-toggle':toggleWatch(id);break;
 case 'compare-toggle':toggleCompare(id);break;
 case 'compare-clear':if(!state.compare.length||confirm('清空比較清單？自選清單不受影響。')){state.compare=[];save();render();}break;
 case 'map-style':mapStyle=el.dataset.style;render();break;
 case 'zoom-in':mapZoom=Math.min(1.8,mapZoom+.15);render();break;
 case 'zoom-out':mapZoom=Math.max(.7,mapZoom-.15);render();break;
 case 'sort':if(sortKey===el.dataset.key)sortDir*=-1;else{sortKey=el.dataset.key;sortDir=-1;}updateScreen();break;
 case 'screen-reset':filters={q:'',theme:'all',market:'all',min:'',max:'',change:'',watch:false};render();break;
 case 'toggle-theme':state.theme=state.theme==='dark'?'light':'dark';save();render();if(selectedStock)drawStock();break;
 case 'range':stockRange=Number(el.dataset.range);chartPinned=null;drawStock();break;
 case 'history-retry':if(selectedStock){historyCache.delete(selectedStock);openStock(selectedStock);}break;
 case 'sync':if(realtimeConfigured&&fx.market==='TW')syncRealtime({force:true});else syncQuotes();break;
 case 'demo':mode='demo';closeOverlay();render();checkAlerts();toast('已切回示範資料，所有價格為合成數值。');break;
 case 'export-screen':exportStocks(filtered(),'atlas-screen-'+mode+'.csv');break;
 case 'export-heat':exportStocks(heatItems(),'atlas-heatmap-'+mode+'.csv');break;
 case 'export-watch':exportStocks(state.watch.map(stock).filter(Boolean),'atlas-watchlist-'+mode+'.csv');break;
 case 'export-trades':exportCSV('atlas-trades.csv',['date','stock','name','side','qty','price','fee','tax'],state.trades.map(t=>[t.date,t.stock,t.name,t.side,t.qty,t.price,t.fee,t.tax]));break;
 case 'trade-new':tradeModal(id||'',el.dataset.side||'buy');break;
 case 'trade-delete':deleteTrade(id);break;
 case 'trade-import':importTrades();break;
 case 'note-new':noteModal('',el.dataset.stock||'');break;
 case 'note-edit':noteModal(id);break;
 case 'note-delete':if(confirm('確定刪除此筆記？')){state.notes=state.notes.filter(n=>n.id!==id);save();render();toast('筆記已刪除');}break;
 case 'alerts':alertsModal();break;
 case 'alerts-check':checkAlerts();toast('已依目前載入的價格檢查全部條件。');break;
 case 'alert-delete':state.alerts=state.alerts.filter(a=>a.id!==id);save();if(selectedStock)drawStock();else alertsModal();break;
 case 'ai-mode':aiOnline=el.dataset.mode==='online';render();break;
 case 'prompt':if($('#chat-input')){$('#chat-input').value=el.dataset.q;$('#chat-input').focus();}break;
 case 'backup-export':{const clean={...state,apiBase:'',alerts:state.alerts.map(a=>({...a,lastKey:''}))};downloadFile('atlas-backup-'+today()+'.json',JSON.stringify(clean,null,2),'application/json');toast('備份不含 API 存取碼或行情快照。');break;}
 case 'backup-import':readFile('.json',text=>{const candidate=validateState(JSON.parse(text));if(confirm(`將以備份覆蓋本機資料：${candidate.watch.length} 檔自選、${candidate.trades.length} 筆交易、${candidate.notes.length} 則筆記。確定繼續？`)){state=candidate;mode='demo';apiToken='';save();closeOverlay();render();toast('備份已還原，資料模式回到未連線。');}});break;
 case 'reset':if(confirm('清除自選、比較、交易、筆記、提醒與顯示設定？此操作無法復原。')){state={...structuredClone(defaults),watch:[],compare:[]};apiToken='';mode='demo';save();render();toast('本機研究資料已清除');}break;
 case 'install':modal('加入手機主畫面',`<p class="research-text">請先把 site 資料夾部署為 HTTPS 網站，或以本機 localhost 開啟。\n\niPhone：在 Safari 的分享選單選「加入主畫面」。\nAndroid / 電腦 Chrome：在瀏覽器選單尋找「安裝應用程式」或「加入主畫面」。\n\n離線模式保留介面與本機研究資料；官方行情、歷史資料與線上 AI 仍需要網路及後端。\n下載後的單檔 HTML 用於預覽，不等於已發布的手機 App。</p><div class="modal-footer">${btn('了解','close','','','primary')}</div>`);break;
 }
}

/* ===================== FUSION WORKSPACE 2.0 ===================== */
const E=window.FusionEngine;
const MARKET_NAMES={TW:'台股',US:'美股',JP:'日股',KR:'韓股'};
const groupOf=s=>['TWSE','TPEX','TW'].includes(s?.market)?'TW':(s?.market||'TW');
const currencyOf=s=>s?.currency||({TW:'TWD',US:'USD',JP:'JPY',KR:'KRW'}[groupOf(s)]||'TWD');
const fxDefaults={version:2,market:'TW',favoriteThemes:[],rules:[{field:'trend',op:'=',value:1},{field:'volumeRatio',op:'>=',value:1.8}],ruleJoin:'all',ruleSets:[],events:[],news:[],creators:[],reports:[],relationships:[],profiles:{},alertLog:[],signalLog:[],imported:{quotes:[],histories:{},source:''},config:{profitTarget:30,lossLimit:-20,volumeMultiplier:1.8,checkTime:'21:00',font:'normal',notify:false},lastCheck:'',catalog:{}};
function validateExtra(v){
 if(!v||v.version!==2||typeof v!=='object'||JSON.stringify(v).length>8000000)throw Error('整合版資料格式錯誤或超過8MB');
 const x={...structuredClone(fxDefaults),...v};
 if(!MARKET_NAMES[x.market])x.market='TW';
 for(const k of ['favoriteThemes','rules','ruleSets','events','news','creators','reports','relationships','alertLog','signalLog'])if(!Array.isArray(x[k])||x[k].length>5000)throw Error('資料集合錯誤：'+k);
 for(const r of x.rules)if(!E.RULE_FIELDS[r.field]||!['>','>=','<','<=','=','!='].includes(r.op)||!finite(r.value))throw Error('選股規則錯誤');
 x.config={...fxDefaults.config,...x.config};
 for(const k of ['profitTarget','lossLimit','volumeMultiplier'])if(!finite(x.config[k]))throw Error('提醒參數錯誤');
 if(x.config.profitTarget<0||x.config.profitTarget>1000||x.config.lossLimit>=0||x.config.lossLimit< -100||x.config.volumeMultiplier<=0||x.config.volumeMultiplier>50)throw Error('提醒參數超出範圍');
 if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(x.config.checkTime))throw Error('提醒時間錯誤');
 x.catalog=x.catalog&&typeof x.catalog==='object'&&!Array.isArray(x.catalog)?x.catalog:{};
 x.profiles=x.profiles&&typeof x.profiles==='object'&&!Array.isArray(x.profiles)?x.profiles:{};
 for(const k of ['events','news','creators','reports','relationships'])x[k]=x[k].map(r=>{
  if(!r||typeof r!=='object'||Array.isArray(r))throw Error('紀錄格式錯誤');
  return {...r,url:safeURL(r.url||''),id:String(r.id||uid()).slice(0,100),title:String(r.title||'').slice(0,250),body:String(r.body||'').slice(0,20000)};
 });
 if(!x.imported||typeof x.imported!=='object'||!Array.isArray(x.imported.quotes)||!x.imported.histories||typeof x.imported.histories!=='object'||Array.isArray(x.imported.histories))throw Error('匯入行情欄位錯誤');
 if(!['all','any'].includes(x.ruleJoin))throw Error('規則關係錯誤');
 for(const set of x.ruleSets){if(!set||!Array.isArray(set.rules)||!['all','any'].includes(set.join)||set.rules.length>12||typeof set.name!=='string')throw Error('已儲存規則錯誤');for(const r of set.rules)if(!E.RULE_FIELDS[r.field]||!['>','>=','<','<=','=','!='].includes(r.op)||!finite(r.value))throw Error('已儲存規則條件錯誤');}
 if(x.rules.length>12)throw Error('最多12條規則');
 x.config.font=['normal','large','xlarge'].includes(x.config.font)?x.config.font:'normal';
 for(const r of x.events)if(!validDate(r.date))throw Error('事件日期錯誤');
 for(const q of x.imported.quotes){if(!q||reservedId(q.id)||!/^[A-Za-z0-9._-]{1,16}$/.test(q.id)||!['TW','TWSE','TPEX','US','JP','KR'].includes(q.market)||!validDate(q.date)||(q.price!==null&&(!finite(q.price)||q.price<=0)))throw Error('已儲存匯入報價錯誤');}
 if(x.imported?.histories){for(const [id,bars] of Object.entries(x.imported.histories)){if(reservedId(id)||!/^[A-Za-z0-9._-]{1,16}$/.test(id))throw Error('股票代號錯誤');x.imported.histories[id]=E.validateBars(bars);}}
 return x;
}
let fx;try{const raw=localStorage.getItem('fusion-workspace-v2');fx=raw?validateExtra(JSON.parse(raw)):structuredClone(fxDefaults);}catch{fx=structuredClone(fxDefaults);}
function saveFx(){try{localStorage.setItem('fusion-workspace-v2',JSON.stringify(fx));}catch{toast('整合版紀錄未能儲存，請先匯出備份。',true);}}
let radarStatus='all',radarQ='',detailTab='chart',chartIndicator='kd',chartUnit='day',chartPinned=null,screenTab='rules',heatTab='heat',focusTab='news',calendarType='all',calendarMonth=today().slice(0,7),detailExtras={},loadBusy=false,ruleResult=null,backtestResult=null,backtestId='2330',rotationFrame=20,rotationTimer=null;
const analyticsCache=new Map(),remoteCatalog=new Map(),extraCache=new Map(),historyMeta=new Map();
const getBaseStock=stock;
stock=function(id){
 if(mode==='demo')return catalog(id)||null;
 const quote=mode==='unconnected'?null:(liveQuotes[id]||(mode==='imported'?fx.imported.quotes.find(s=>s.id===id):null)),
 c=catalog(id)||remoteCatalog.get(id)||fx.catalog?.[id]||fx.imported.quotes.find(s=>s.id===id);
 return quote?{...c,...quote,id,tags:c?.tags||quote.tags||[],role:c?.role||'待建立研究',currency:quote.currency||currencyOf(c)}:
 c?{...c,price:null,change:null,volume:null,amount:null,date:null,source:'unconnected'}:null;
};
universe=function(){
 const a=mode==='demo'?D.stocks:mode==='official'||mode==='imported'?
 [...new Set([...Object.keys(liveQuotes),...(mode==='imported'?fx.imported.quotes.map(q=>q.id):[])])].map(stock).filter(Boolean):
 [...D.stocks.map(s=>stock(s.id)),...remoteCatalog.values()].filter(Boolean);
 return a.filter(s=>groupOf(s)===fx.market);
};
function barsOf(id){return mode==='demo'?(catalog(id)?D.history(id):[]):historyCache.get(id)||(mode==='imported'?fx.imported.histories[id]:[])||[];}
function analysisOf(id){
 const rows=barsOf(id),extra=detailExtras[id]?.metrics||{};
 const key=`${mode}:${id}:${rows.length}:${rows.at(-1)?.close}:${fx.config.volumeMultiplier}:${JSON.stringify(extra)}`;
 if(!analyticsCache.has(key))analyticsCache.set(key,E.analyze(rows,{volumeMultiplier:fx.config.volumeMultiplier,extra}));
 return analyticsCache.get(key);
}
function scoreBadge(a){return `<span class="score ${a.status}">${a.score===null?'—':a.score}<small>${a.score===null?'待資料':' / 100'}</small></span>`;}
const statusText=s=>({achieved:'達標',near:'接近',conflict:'衝突',missing:'待資料'}[s]||'待資料');
function statusBadge(a){return `<span class="tag status-${a.status}"><i></i>${statusText(a.status)}</span>`;}
function miniSpark(id){
 const values=barsOf(id).slice(-25).map(r=>r.close);
 if(values.length<2)return '<span class="tiny muted">尚無日線</span>';
 const lo=Math.min(...values),range=Math.max(...values)-lo||1,up=values.at(-1)>=values[0];
 return `<svg viewBox="0 0 110 32" class="sparkline" aria-label="${mode==='demo'?'合成示範':'最近25筆'}走勢"><path d="${values.map((v,i)=>(i?'L':'M')+(i/(values.length-1)*106+2).toFixed(1)+','+(29-(v-lo)/range*26).toFixed(1)).join(' ')}" fill="none" stroke="var(--${up?'up':'down'})" stroke-width="1.7"/></svg>`;
}
function marketSwitch(){return `<div class="market-switch" aria-label="市場">${Object.entries(MARKET_NAMES).map(([id,n])=>`<button data-action="fu-market" data-id="${id}" class="${fx.market===id?'active':''}">${n}<small>${id}</small></button>`).join('')}</div>`;}
function emptyBox(title,body,action='fu-import',label='匯入資料'){return `<div class="empty">${icon('layers')}<h3>${title}</h3><p>${body}</p>${action?btn(label,action,'plus','','primary'):''}</div>`;}
notice=function(){const rt=mode==='official'&&liveMeta?.realtime;return `<div class="notice ${mode==='demo'?'demo-notice':''}">${icon('info')}<span>${mode==='demo'?'<strong>操作示範</strong>　價格、K線與訊號全部由合成資料計算，D001 等為序號，不是真實行情。':mode==='unconnected'?'<strong>尚未連接行情</strong>　不顯示假報價或替代K線。請連接後端或匯入你的歷史資料。':rt?'<strong>台股即時模式</strong>　FinMind Sponsor 快照約 10 秒更新；盤中技術指標含當日暫時 K 棒，收盤前仍可能變動。':'<strong>資料模式：'+(mode==='imported'?'使用者匯入':'外部盤後行情')+'</strong>　依每檔來源與資料日期顯示；缺值不補造。'} <button data-action="nav" data-view="settings">資料設定 ↗</button></span></div>`;};
navs.splice(0,navs.length,
 ['home','市場總覽','home'],['radar','明日訊號雷達','bolt'],['map','產業供應鏈','map'],['heat','熱力圖・輪動','grid'],['screener','積木選股','filter'],['backtest','策略回測','chart'],
 ['calendar','事件行事曆','layers'],['focus','焦點・法說研究','note'],['risk','處置・風險中心','bell'],
 ['watch','自選與題材','star'],['compare','四檔比較','compare'],['portfolio','持股・交易健檢','wallet'],['notes','研究筆記','note'],['assistant','研究助手','spark'],['settings','設定與資料','settings']);
render=function(){
 setAppearance();document.documentElement.dataset.font=fx.config.font;
 const current=navs.find(n=>n[0]===view)||navs[0];
 const routes={home:renderFusionHome,radar:renderRadar,map:renderFusionMap,heat:renderFusionHeat,screener:renderRules,backtest:renderBacktest,calendar:renderCalendar,focus:renderFocus,risk:renderRisk,watch:renderFusionWatch,compare:renderCompare,portfolio:renderFusionPortfolio,notes:renderNotes,assistant:renderAssistant,settings:renderFusionSettings};
 $('#app').innerHTML=`<aside class="sidebar fusion-sidebar" aria-label="主選單"><a class="brand" href="#home" data-action="nav" data-view="home"><span class="brandmark">${icon('chart')}</span><span class="brand-name">明日智選<small>ATLAS / FUSION</small></span></a><div class="nav-section">MARKET INTELLIGENCE</div><nav class="nav-list">${navs.slice(0,6).map(navItem).join('')}</nav><div class="nav-section">RESEARCH & EVENTS</div><nav class="nav-list">${navs.slice(6,9).map(navItem).join('')}</nav><div class="nav-section">MY WORKSPACE</div><nav class="nav-list">${navs.slice(9,14).map(navItem).join('')}</nav><div class="sidebar-bottom">${navItem(navs.at(-1))}<div class="local-badge"><span class="status-dot"></span> 個人研究空間 <small>LOCAL</small></div></div></aside><div class="mobile-backdrop" data-action="menu-close"></div><div class="workspace"><header class="topbar"><button class="icon-btn mobile-menu" data-action="menu" aria-label="開啟選單">${icon('menu')}</button><div class="breadcrumb">工作台 <span>/ ${current[1]}</span></div><div class="flex top-controls"><button class="search-trigger" data-action="search" aria-label="搜尋股票">${icon('search')}<span>搜尋股票、代號或題材</span><kbd>⌘ K</kbd></button><button class="icon-btn" data-action="toggle-theme" aria-label="切換深淺色">${icon(state.theme==='dark'?'sun':'moon')}</button><button class="icon-btn notification-button" data-action="fu-alerts" aria-label="通知中心">${icon('bell')}${fx.alertLog.some(x=>!x.read)?'<i></i>':''}</button><span class="avatar">ME</span></div></header><div class="marketbar">${marketSwitch()}<div class="data-state"><span class="status-dot ${mode==='demo'?'amber':''}"></span>${mode==='demo'?'合成示範':mode==='unconnected'?'尚未連線':mode==='imported'?'使用者匯入':liveMeta?.realtime?'即時約10秒':'外部盤後資料'}<span class="market-time">${esc(liveMeta?.label||'不自動下單')}</span>${btn(realtimeConfigured&&fx.market==='TW'?'立即更新':'更新','sync','refresh','','small ghost')}</div></div><main id="content">${(routes[view]||routes.home)()}</main><footer class="footer"><div>明日智選 ATLAS · 獨立整合實作，與兩個參考站無隸屬關係。<br>條件分數不是勝率；資料可能延遲。研究與交易紀錄僅存於此瀏覽器。</div><button data-action="nav" data-view="settings">資料來源與完成狀態 ↗　 BUILD 03.1</button></footer><nav class="bottom-nav" aria-label="手機導覽">${[['home','總覽','home'],['radar','雷達','bolt'],['map','地圖','map'],['watch','自選','star'],['portfolio','持股','wallet']].map(n=>`<button class="${view===n[0]?'active':''}" data-action="nav" data-view="${n[0]}">${icon(n[2])}<span>${n[1]}</span></button>`).join('')}</nav></div>`;
 requestAnimationFrame(layoutHeatmaps);
};
function rankedRadar(){
 return universe().map(s=>({s,a:analysisOf(s.id)})).sort((x,y)=>(y.a.score??-1)-(x.a.score??-1)||(y.s.amount||0)-(x.s.amount||0));
}
function renderFusionHome(){
 const all=universe(),valid=all.filter(s=>finite(s.change)),up=valid.filter(s=>s.change>0).length,down=valid.filter(s=>s.change<0).length;
 const ranked=rankedRadar(),known=ranked.filter(x=>x.a.available),near=known.filter(x=>x.a.score>=60),themes=D.themes.map(t=>({...t,v:avgChange(themeStocks(t.id)),count:themeStocks(t.id).length})).filter(t=>t.count).sort((a,b)=>(b.v??-999)-(a.v??-999));
 return `<section class="fusion-hero"><div><div class="eyebrow">RADAR × ATLAS · ONE WORKSPACE</div><h1>先看產業，<span>再看訊號。</span></h1><p>從產業脈絡到明日觀察，把每一個研究步驟接起來。</p><div class="flex wrap">${btn('開啟訊號雷達','nav','bolt','data-view="radar"','primary')}${btn('探索產業地圖','nav','map','data-view="map"')}</div></div><div class="hero-radar" aria-hidden="true"><div class="orbit o1"></div><div class="orbit o2"></div><div class="orbit o3"></div><div class="radar-sweep"></div><span class="radar-node n1">SIGNAL</span><span class="radar-node n2">INDUSTRY</span><span class="radar-core">${icon('chart')}</span><small>CONNECTED INTELLIGENCE</small></div></section>${notice()}${mode==='unconnected'?`<div class="connect-banner"><div><strong>你的研究空間已就緒</strong><p>先連接資料，或明確切換到操作示範。真實模式不會使用合成價格。</p></div><div class="flex wrap">${btn('連接資料','nav','settings','data-view="settings"','primary')}${btn('檢視操作示範','demo')}</div></div>`:''}<div class="kpis">${kpi('目前市場涵蓋',nf(all.length)+'<small>檔</small>',`${MARKET_NAMES[fx.market]} · ${valid.length} 檔有漲跌資料`,'layers')}${kpi('上漲 / 下跌',`${nf(up)}<small> / ${nf(down)}</small>`,'依載入資料計算，非全市場指數','chart','up')}${kpi('達標 / 接近',nf(near.length)+'<small>檔</small>',`${known.length} 檔具備足夠日線`,'bolt')}${kpi('自選追蹤',nf(state.watch.length)+'<small>檔</small>',`${fx.favoriteThemes.length} 個收藏題材 · 跨市場`,'star')}</div><div class="fusion-dashboard"><section class="panel"><div class="panel-head"><div><h2>明日觀察雷達</h2><div class="sub">五組可解釋條件 · 分數不是勝率</div></div>${btn('全部訊號','nav','arrow','data-view="radar"','small ghost')}</div><div class="radar-mini-list">${ranked.slice(0,5).map(({s,a})=>`<button class="radar-mini-row" data-action="stock" data-id="${esc(s.id)}"><span class="stock-initial">${esc(s.name.slice(0,1))}</span><span class="radar-mini-name"><strong>${esc(s.name)}</strong><small>${esc(s.id)} · ${esc(s.role)}</small></span>${miniSpark(s.id)}<span class="mono ${tone(s.change)}">${pct(s.change)}</span>${scoreBadge(a)}</button>`).join('')}</div><div class="panel-tail">${icon('info')} 先查資料與條件，再判斷是否值得深入研究。</div></section><section class="panel breadth-panel"><div class="panel-head"><div><h2>市場廣度</h2><div class="sub">${MARKET_NAMES[fx.market]} · 載入資料的漲跌分布</div></div><span class="tag">${valid.length} 檔</span></div><div class="panel-body">${breadthChart(valid)}<div class="breadth-summary"><span><i class="dot-up"></i>上漲 <b>${up}</b></span><span><i class="dot-down"></i>下跌 <b>${down}</b></span><span>持平 <b>${valid.length-up-down}</b></span></div></div><div class="panel-tail">不將示範目錄誤稱為上市櫃全市場。</div></section></div><div class="fusion-dashboard space"><section class="panel"><div class="panel-head"><div><h2>產業熱度地圖</h2><div class="sub">面積依本市場成交額 · 點擊進入完整分析</div></div>${btn('熱力圖與輪動','nav','external','data-view="heat"','small ghost')}</div><div class="panel-body"><div class="heatmap" data-heat="home"></div>${heatLegend()}</div></section><section class="panel"><div class="panel-head"><div><h2>題材動態</h2><div class="sub">成分股漲跌簡單平均</div></div>${icon('network')}</div><div class="panel-body">${themes.slice(0,5).map((t,i)=>`<button class="rank-row" data-action="theme" data-id="${t.id}"><span class="rank-no mono">0${i+1}</span><span class="theme-icon" style="--c:${t.accent}">${icon(t.icon)}</span><span class="rank-info"><strong>${t.name}</strong><small>${t.count} 檔分類展示</small></span><span class="rank-pct mono ${tone(t.v)}">${pct(t.v)}</span></button>`).join('')}</div></section></div><div class="section-top"><h2>一條完整的研究路徑</h2><span class="tiny muted">同一檔股票，同一份紀錄</span></div><div class="workflow-grid">${[['01','產業脈絡','map','map'],['02','訊號驗證','radar','bolt'],['03','策略回測','backtest','chart'],['04','持股追蹤','portfolio','wallet']].map(([n,label,v,i])=>`<button data-action="nav" data-view="${v}" class="workflow-card"><span>${n}</span>${icon(i)}<strong>${label}</strong>${icon('arrow')}</button>`).join('')}</div>`;
}
function breadthChart(ss){
 const defs=[[-Infinity,-5,'≤−5'],[-5,-3,'−5~−3'],[-3,-1,'−3~−1'],[-1,0,'−1~0'],[0,0,'0'],[0,1,'0~1'],[1,3,'1~3'],[3,5,'3~5'],[5,Infinity,'>5']];
 const counts=defs.map(([lo,hi],i)=>ss.filter(s=>i===4?s.change===0:i===0?s.change<=-5:i===8?s.change>5:lo<0?s.change>lo&&s.change<=hi&&s.change!==0:s.change>lo&&s.change<=hi).length);
 const max=Math.max(...counts,1);
 return `<div class="breadth-chart">${counts.map((n,i)=>`<div><span>${n}</span><i style="height:${Math.max(n?3:0,n/max*105)}px;background:${i<4?'var(--down)':i>4?'var(--up)':'var(--dim)'}"></i><small>${defs[i][2]}</small></div>`).join('')}</div>`;
}
function radarTable(items){
 return `<div class="table-scroll"><table class="data-table radar-table"><thead><tr><th>股票</th><th>25筆走勢</th><th class="right">價格</th><th class="right">量比</th><th>MA</th><th>KD</th><th>DMI</th><th>MACD</th><th>狀態</th><th>條件分</th><th>收藏</th></tr></thead><tbody>${items.length?items.map(({s,a})=>`<tr><td><button class="stock-name-btn" data-action="stock" data-id="${esc(s.id)}">${esc(s.name)}<small>${esc(s.id)} · ${currencyOf(s)}</small></button></td><td>${miniSpark(s.id)}</td><td class="right mono">${nf(s.price,2)}</td><td class="right mono">${nf(a.metrics.volumeRatio,2)}×</td>${['trend','kdBull','dmiBull','macdBull'].map(k=>`<td><span class="condition-dot ${a.metrics[k]===true?'pass':a.metrics[k]===false?'fail':''}">${a.metrics[k]===true?'✓':a.metrics[k]===false?'−':'?'}</span></td>`).join('')}<td>${statusBadge(a)}</td><td>${scoreBadge(a)}</td><td><button class="icon-btn ${state.watch.includes(s.id)?'on':''}" data-action="watch-toggle" data-id="${esc(s.id)}" aria-label="切換自選">${icon('star')}</button></td></tr>`).join(''):'<tr><td colspan="11"><div class="empty"><h3>目前沒有符合條件的股票</h3><p>調整狀態篩選，或先載入真實日線。</p></div></td></tr>'}</tbody></table></div>`;
}
function renderRadar(){
 const all=rankedRadar(),items=all.filter(x=>(radarStatus==='all'||x.a.status===radarStatus)&&(!radarQ||(x.s.id+x.s.name).toLowerCase().includes(radarQ.toLowerCase())));
 return `${pageHead('TOMORROW SIGNAL RADAR','每一個訊號，都有依據。','趨勢、動能與量能分開檢查。台股籌碼另在個股頁查看，不套用到美股。',btn('載入前20檔日線','fu-scan','refresh')+btn('留下訊號快照','fu-signal-log','note','','primary'))}${notice()}<div class="radar-rule-summary"><span>${icon('chart')}MA5 / MA20</span><span>KD(9,3,3)</span><span>DMI(14)</span><span>MACD(12,26,9)</span><span>量比 ≥ ${fx.config.volumeMultiplier}×</span>${btn('規則說明','fu-method','','','small ghost')}</div><div class="filterbar"><div class="segment">${[['all','全部'],['achieved','達標'],['near','接近'],['conflict','衝突'],['missing','待資料']].map(([v,n])=>`<button class="${radarStatus===v?'active':''}" data-action="fu-radar-status" data-id="${v}">${n} ${v==='all'?all.length:all.filter(x=>x.a.status===v).length}</button>`).join('')}</div><input id="fu-radar-search" placeholder="股票代號或名稱" value="${esc(radarQ)}" aria-label="雷達搜尋">${btn('匯出雷達','fu-radar-export','download','','small')}</div><section class="panel" id="fu-radar-results">${radarTable(items)}</section><div class="notice space">${icon('info')} 達標＝5/5；接近＝3或4/5；衝突＝0至2/5。這是本版獨立定義的條件，不是兩站的私有演算法、AI預測或明日報酬保證。<br>當日黃金交叉與已在多頭位置不同，個股頁會分別顯示。</div>`;
}

const legacyMap=renderMap,legacyHeat=renderHeat,legacyScreener=renderScreener,legacySettings=renderSettings,legacyCompare=renderCompare;
function linkHTML(url,label='原始來源'){const u=safeURL(url);return u?`<a class="source-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`:'<span class="tiny muted">未附來源，待查核</span>';}
function renderFusionMap(){
 const saved=fx.favoriteThemes.includes(mapTheme),edges=fx.relationships.filter(r=>r.theme===mapTheme);
 let html=legacyMap();
 return html+`<section class="panel space"><div class="panel-head"><div><h2>有來源的公司關聯</h2><div class="sub">只列出你記錄的關係，不把共同題材當成客戶／供應商。</div></div><div class="flex">${btn(saved?'已收藏題材':'收藏題材','fu-theme-fav','star','data-id="'+mapTheme+'"','small')}${btn('新增關聯','fu-record-new','plus','data-kind="relationships"','small primary')}</div></div>${edges.length?`<div class="relation-list">${edges.map(r=>`<div class="relation-row"><button data-action="stock" data-id="${esc(r.from)}">${esc(stock(r.from)?.name||r.from)}</button><span>→ ${esc(r.title)} →</span><button data-action="stock" data-id="${esc(r.to)}">${esc(stock(r.to)?.name||r.to)}</button><small>${esc(r.date||'未標日期')} · 使用者紀錄</small>${linkHTML(r.url)}${btn('編輯','fu-record-edit','note',`data-kind="relationships" data-id="${esc(r.id)}"`,'small ghost')}</div>`).join('')}</div>`:emptyBox('先建立可追溯的關係','新增公司之間的關係、依據日期與原始來源。未查核的產業分類仍只作展示。','fu-record-new','新增關係')}</section>`;
}
function rotationData(){
 const all=universe().filter(s=>barsOf(s.id).length>=50),series=new Map(all.map(s=>[s.id,new Map(barsOf(s.id).map(r=>[r.date,r.close]))]));
 if(!all.length)return [];
 let dates=barsOf(all[0].id).map(r=>r.date);
 for(const s of all.slice(1))dates=dates.filter(d=>series.get(s.id).has(d));
 if(dates.length<45)return [];
 const end=dates.length-1-(20-rotationFrame),ret=(s,idx)=>idx>=20?100*(series.get(s.id).get(dates[idx])/series.get(s.id).get(dates[idx-20])-1):null;
 const benchmark=idx=>E.mean(all.map(s=>ret(s,idx)));
 return D.themes.map(t=>{
   const members=all.filter(s=>s.tags.includes(t.id));if(!members.length)return null;
   const points=[];
   for(let i=end-5;i<=end;i++){
    if(i<25)continue;
    const strength=E.mean(members.map(s=>ret(s,i)))-benchmark(i),old=E.mean(members.map(s=>ret(s,i-5)))-benchmark(i-5);
    points.push({x:strength,y:strength-old,date:dates[i]});
   }
   return points.length?{...t,points,count:members.length}:null;
 }).filter(Boolean);
}
function rotationChart(){
 const items=rotationData();if(!items.length)return emptyBox('尚無足夠的共同日期日線','輪動以同市場資料的共同日期計算，至少需要45筆。先在雷達載入日線。','fu-scan','載入日線');
 const maxX=Math.max(...items.flatMap(t=>t.points.map(p=>Math.abs(p.x))),2)*1.2,maxY=Math.max(...items.flatMap(t=>t.points.map(p=>Math.abs(p.y))),2)*1.2;
 const x=v=>400+v/maxX*325,y=v=>220-v/maxY*170;
 return `<svg viewBox="0 0 800 445" class="rotation-svg" role="img" aria-label="題材相對強度與動能變化四象限"><rect x="70" y="45" width="330" height="175" fill="var(--accent)" opacity=".025"/><rect x="400" y="45" width="330" height="175" fill="var(--accent)" opacity=".07"/><rect x="70" y="220" width="330" height="175" fill="var(--up)" opacity=".04"/><rect x="400" y="220" width="330" height="175" fill="var(--violet)" opacity=".04"/><path d="M70 220H730M400 45V395" stroke="var(--border)" stroke-dasharray="4 5"/><text x="90" y="70" class="quadrant-label">改善中</text><text x="650" y="70" class="quadrant-label">領先中</text><text x="90" y="382" class="quadrant-label">落後中</text><text x="650" y="382" class="quadrant-label">降溫中</text><text x="400" y="430" text-anchor="middle" class="chart-label">相對20筆報酬差（百分點） →</text><text x="15" y="218" class="chart-label" transform="rotate(-90 15 218)">相對強度的5筆變化 →</text>${items.map((t,i)=>{const p=t.points.at(-1);return `<g data-action="theme" data-id="${t.id}" tabindex="0" role="button" aria-label="${t.name}"><path d="${t.points.map((p,i)=>(i?'L':'M')+x(p.x).toFixed(1)+','+y(p.y).toFixed(1)).join(' ')}" fill="none" stroke="${t.accent}" stroke-width="1.8" opacity=".5"/><circle cx="${x(p.x)}" cy="${y(p.y)}" r="6" fill="${t.accent}"/><text x="${x(p.x)+9}" y="${y(p.y)+(i%2?13:-8)}" fill="var(--text)" font-size="11">${t.name}</text><title>${t.name}｜${p.date}｜相對強度 ${p.x.toFixed(2)}｜動能 ${p.y.toFixed(2)}</title></g>`;}).join('')}</svg>`;
}
function renderFusionHeat(){
 const tabs=`<div class="tabbar"><button class="${heatTab==='heat'?'active':''}" data-action="fu-heat-tab" data-id="heat">成交熱力圖</button><button class="${heatTab==='rotation'?'active':''}" data-action="fu-heat-tab" data-id="rotation">題材輪動軌跡</button></div>`;
 if(heatTab==='heat')return tabs+legacyHeat().replace('成交量（千股）','成交量（千股）');
 return `${tabs}${pageHead('RELATIVE STRENGTH & MOMENTUM','題材的動能，往哪裡移動？','同市場等權報酬作比較基準；這是價格動能，不是實際資金流入／流出。')}${notice()}<section class="panel"><div class="panel-head"><h2>相對強度 × 動能變化</h2><div class="flex">${btn(rotationTimer?'暫停':'播放軌跡','fu-rotation-play','chart','','small')}<input type="range" id="fu-rotation-range" min="0" max="20" value="${rotationFrame}" aria-label="輪動歷史時間"><span class="tiny" id="fu-rotation-stamp">近 ${20-rotationFrame} 筆</span></div></div><div class="panel-body" id="fu-rotation-chart">${rotationChart()}</div></section><div class="notice space">${icon('info')} 橫軸＝題材成分股20筆平均報酬−目前市場目錄等權平均；縱軸＝該差值的5筆變化。非官方指數、非市值加權、非特定平台專有輪動演算法。</div>`;
}
function ruleFieldsHTML(selected){return Object.entries(E.RULE_FIELDS).map(([k,v])=>`<option value="${k}" ${selected===k?'selected':''}>${v}</option>`).join('');}
function ruleRowsHTML(){return fx.rules.map((r,i)=>`<div class="rule-row"><span class="rule-index mono">${String(i+1).padStart(2,'0')}</span><select class="fu-rule-field" data-i="${i}" aria-label="條件${i+1}指標">${ruleFieldsHTML(r.field)}</select><select class="fu-rule-op" data-i="${i}" aria-label="條件${i+1}比較方式">${['>=','>','<=','<','=','!='].map(o=>`<option ${o===r.op?'selected':''}>${esc(o)}</option>`).join('')}</select><input class="fu-rule-value" data-i="${i}" type="number" step="any" value="${r.value}" aria-label="條件${i+1}門檻"><button class="icon-btn" data-action="fu-rule-delete" data-id="${i}" aria-label="刪除此條件">${icon('close')}</button></div>`).join('');}
function executeRules(){
 const ss=universe().map(s=>({s,a:analysisOf(s.id)}));
 ruleResult=ss.map(x=>({...x,test:E.evaluateRules(x.a.metrics,fx.rules,fx.ruleJoin)}));
}
function renderRules(){
 const tabs=`<div class="tabbar"><button class="${screenTab==='rules'?'active':''}" data-action="fu-screen-tab" data-id="rules">積木條件</button><button class="${screenTab==='basic'?'active':''}" data-action="fu-screen-tab" data-id="basic">價格與產業篩選</button></div>`;
 if(screenTab==='basic')return tabs+legacyScreener().replace('上市＋上櫃','目前市場').replace('</select><label><input id="screen-watch"',`${fx.market!=='TW'?`<option value="${fx.market}">${MARKET_NAMES[fx.market]}</option>`:''}</select><label><input id="screen-watch"`);
 const matching=ruleResult?.filter(x=>x.test.pass===true)||[],missing=ruleResult?.filter(x=>x.test.missing>0).length||0;
 return `${tabs}${pageHead('BUILD YOUR OWN SCREEN','把想法，組成可執行的條件。','AND / OR 組合、儲存常用規則；籌碼與基本面缺資料時不會當作0或達標。',btn('載入日線','fu-scan','refresh'))}${notice()}<div class="rule-layout"><section class="panel"><div class="panel-head"><h2>規則工作台</h2><select id="fu-rule-join" aria-label="條件關係"><option value="all" ${fx.ruleJoin==='all'?'selected':''}>全部符合 AND</option><option value="any" ${fx.ruleJoin==='any'?'selected':''}>任一符合 OR</option></select></div><div class="panel-body"><div class="flex wrap space-bottom">${[['trend','多頭量能'],['breakout','盤整突破'],['pullback','回測後上漲'],['chips','法人連買']].map(([id,n])=>btn(n,'fu-rule-preset','',`data-id="${id}"`,'small')).join('')}</div><div id="fu-rule-rows">${ruleRowsHTML()}</div><div class="flex wrap space">${btn('新增條件','fu-rule-add','plus','','small')}${btn('執行篩選','fu-rule-run','filter','','primary')}${btn('儲存規則','fu-rule-save','note','','small')}</div><p class="tiny muted space">布林條件使用「= 1」表示成立，「= 0」表示不成立。量比計算不包含當日量。</p></div></section><aside class="panel"><div class="panel-head"><h2>我的常用規則</h2><span class="tag">${fx.ruleSets.length}</span></div><div class="panel-body">${fx.ruleSets.length?fx.ruleSets.map(r=>`<div class="saved-rule"><button data-action="fu-rule-load" data-id="${esc(r.id)}"><strong>${esc(r.name)}</strong><small>${r.rules.length} 個條件 · ${r.join==='any'?'OR':'AND'}</small></button><button class="icon-btn" data-action="fu-rule-set-delete" data-id="${esc(r.id)}" aria-label="刪除規則">${icon('trash')}</button></div>`).join(''):'<p class="tiny muted">儲存後即可快速重複使用，也會包含在完整備份中。</p>'}</div></aside></div><section class="panel space"><div class="panel-head"><div><h2>${ruleResult?`篩選結果 · ${matching.length} 檔符合`:'執行後顯示結果'}</h2><div class="sub">${ruleResult?`${ruleResult.length} 檔檢查 · ${missing} 檔有缺資料條件`:'不會在尚未執行前先顯示假結果'}</div></div>${btn('匯出結果','fu-rules-export','download','','small ghost')}</div>${ruleResult?radarTable(matching):emptyBox('先設定你的觀察條件','規則透明可查核；執行僅在目前載入的市場資料上進行。','fu-rule-run','執行篩選')}</section>`;
}
function simplePlot(values,{height=210,label='資料曲線'}={}){
 if(values.length<2)return emptyBox('資料不足','需要至少兩筆資料。','','');
 const min=Math.min(...values),max=Math.max(...values),range=max-min||1,W=800,H=height,L=60,R=18,T=20,B=26,x=i=>L+i/(values.length-1)*(W-L-R),y=v=>T+(max-v)/range*(H-T-B);
 return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">${[0,.25,.5,.75,1].map(f=>`<line x1="${L}" x2="${W-R}" y1="${y(min+f*range)}" y2="${y(min+f*range)}" class="chart-grid"/><text x="${L-7}" y="${y(min+f*range)+4}" text-anchor="end" class="chart-label">${nf(min+f*range,0)}</text>`).join('')}<path d="${values.map((v,i)=>(i?'L':'M')+x(i).toFixed(1)+','+y(v).toFixed(1)).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.3"/></svg>`;
}
function renderBacktest(){
 const r=backtestResult,c=r?.config||{strategy:'trend',feePct:.1,taxPct:0,slippagePct:.1,stopPct:5,targetPct:10,holdBars:10,capital:100000};
 return `${pageHead('VALIDATE, THEN BELIEVE','回測條件，不回測想像。','收盤產生訊號，下一筆開盤成交；逐筆納入費用、滑價與風險條件。')}${notice()}<section class="panel"><div class="panel-body top-pad"><form id="fu-backtest-form" class="backtest-form"><div class="field"><label>股票</label><select id="fu-bt-stock">${universe().map(s=>`<option value="${esc(s.id)}" ${backtestId===s.id?'selected':''}>${esc(s.id)} ${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>策略</label><select id="fu-bt-strategy">${[['trend','MA5/20多頭'],['breakout','突破前20筆高點'],['kd','KD黃金交叉'],['dmi','DMI黃金交叉'],['macd','MACD黃金交叉'],['custom','目前積木規則']].map(([id,n])=>`<option value="${id}" ${c.strategy===id?'selected':''}>${n}</option>`).join('')}</select></div>${[['capital','初始資金',100000,1],['holdBars','最多持有筆數',10,1],['feePct','單邊費率 %',.1,.01],['taxPct','賣出稅率 %',0,.01],['slippagePct','單邊滑價 %',.1,.01],['stopPct','停損 %',5,.1],['targetPct','停利 %',10,.1]].map(([id,n,d,step])=>`<div class="field"><label for="fu-bt-${id}">${n}</label><input id="fu-bt-${id}" type="number" value="${c[id]??d}" step="${step}" min="${id==='capital'||id==='holdBars'?1:0}" max="${id==='capital'?10000000000:id==='holdBars'?1000:50}" required></div>`).join('')}<button type="submit" class="btn primary">執行回測</button></form><p class="tiny muted space">費率只是可修改的測試參數，並非法定費率。單一部位、整股、不加碼；同根K棒同時碰停損停利，採停損先發生。</p><div id="fu-bt-error" class="form-error" role="alert"></div></div></section>${r?`<div class="kpis space">${kpi('測試區間報酬',pct(r.totalReturn),`基準買入持有 ${pct(r.benchmarkReturn)}`,'chart',tone(r.totalReturn))}${kpi('最大回撤',nf(r.maxDrawdown,2)+'<small>%</small>','逐筆收盤估值 · 已計成本','chart')}${kpi('已結束交易',String(r.sample)+'<small>筆</small>',r.sufficient?'樣本≥100仍不保證未來':'未達100筆，不足以宣稱穩定勝率','layers')}${kpi('樣本內勝率',nf(r.winRate,1)+'<small>%</small>','僅描述本次樣本，不代表下一筆機率','info')}</div><section class="panel"><div class="panel-head"><div><h2>資金曲線</h2><div class="sub">${r.equity[0]?.date} — ${r.equity.at(-1)?.date} · ${mode==='demo'?'合成資料':'載入日線'} · 非除權息總報酬</div></div>${btn('匯出逐筆結果','fu-bt-export','download','','small')}</div><div class="panel-body">${simplePlot(r.equity.map(x=>x.value),{label:'回測資金曲線'})}</div></section><div class="notice space">${icon('info')} 符合條件 ${r.signals} 次；未符合 ${r.untriggered} 次；已持有／同日離場等略過 ${r.skipped} 次。最後一筆收盤強制結清；不包含放空、公司行動或倖存者偏差修正。</div><section class="panel"><div class="panel-head"><h2>逐筆交易</h2><span class="tag">${esc(backtestId)}</span></div><div class="table-scroll"><table class="data-table"><thead><tr><th>訊號日</th><th>進場</th><th>出場</th><th class="right">進場價</th><th class="right">出場價</th><th class="right">損益</th><th>出場原因</th></tr></thead><tbody>${r.trades.map(t=>`<tr><td>${esc(t.signalDate)}</td><td>${esc(t.entryDate)}</td><td>${esc(t.exitDate)}</td><td class="right mono">${nf(t.entry,2)}</td><td class="right mono">${nf(t.exit,2)}</td><td class="right mono ${tone(t.profit)}">${nf(t.profit,2)}</td><td>${esc(t.reason)}</td></tr>`).join('')||'<tr><td colspan="7">本次沒有成交紀錄。</td></tr>'}</tbody></table></div></section>`:emptyBox('用資料驗證你的規則','至少70筆日線，前60筆暖機。真實日線未載入時可連接來源，或自行匯入。','fu-import','匯入日線')}`;
}
function renderCalendar(){
 const date=new Date(calendarMonth+'-01T12:00:00Z'),days=new Date(date.getUTCFullYear(),date.getUTCMonth()+1,0).getUTCDate(),offset=(date.getUTCDay()+6)%7;
 const events=fx.events.filter(e=>calendarType==='all'||e.type===calendarType);
 return `${pageHead('MARKET EVENT CALENDAR','把事件，放進研究節奏。','法說會、除權息、重大訊息與自己的追蹤事件；所有日期依你匯入或登錄的來源。',btn('匯出行事曆','fu-calendar-export','download')+btn('新增事件','fu-record-new','plus','data-kind="events"','primary'))}<div class="filterbar">${btn('上個月','fu-month','','data-dir="-1"')}<input type="month" id="fu-calendar-month" value="${calendarMonth}" aria-label="行事曆月份">${btn('下個月','fu-month','','data-dir="1"')}<select id="fu-calendar-type" aria-label="事件類型">${[['all','全部事件'],['法說會','法說會'],['除權息','除權息'],['重大訊息','重大訊息'],['融券回補','融券回補'],['內部人申報','內部人申報'],['自訂','自訂提醒']].map(([id,n])=>`<option value="${id}" ${calendarType===id?'selected':''}>${n}</option>`).join('')}</select></div><section class="panel calendar-panel"><div class="calendar-grid">${['一','二','三','四','五','六','日'].map(d=>`<div class="calendar-daylabel">${d}</div>`).join('')}${Array.from({length:offset},()=>'<div class="calendar-cell outside"></div>').join('')}${Array.from({length:days},(_,i)=>{const d=calendarMonth+'-'+String(i+1).padStart(2,'0'),ev=events.filter(e=>e.date===d);return `<div class="calendar-cell ${d===today()?'today':''}"><span>${i+1}</span>${ev.map(e=>`<button class="calendar-event" data-action="fu-record-edit" data-kind="events" data-id="${esc(e.id)}"><small>${esc(e.type)}</small>${esc(e.stock||'')} ${esc(e.title)}</button>`).join('')}</div>`;}).join('')}</div></section><section class="panel space"><div class="panel-head"><h2>事件清單</h2><span class="tag">來源可追溯</span></div>${events.filter(e=>e.date.startsWith(calendarMonth)).length?events.filter(e=>e.date.startsWith(calendarMonth)).sort((a,b)=>a.date.localeCompare(b.date)).map(e=>recordCard(e,'events')).join(''):emptyBox('這個月份還沒有事件','這裡不會編造公司法說或配息日期。可新增自己的事件並附來源，也可匯入完整研究資料。','fu-record-new','新增事件')}</section>`;
}
function recordCard(r,kind){
 return `<article class="record-card"><div class="between"><div class="flex wrap"><span class="tag">${esc(r.type||r.quarter||r.author||r.theme||'研究紀錄')}</span><small class="muted mono">${esc(r.date||'')}</small>${r.stock?`<button class="chip small" data-action="stock" data-id="${esc(r.stock)}">${esc(r.stock)}</button>`:''}</div><div class="flex">${btn('編輯','fu-record-edit','note',`data-kind="${kind}" data-id="${esc(r.id)}"`,'small ghost')}<button class="icon-btn" data-action="fu-record-delete" data-kind="${kind}" data-id="${esc(r.id)}" aria-label="刪除紀錄">${icon('trash')}</button></div></div><h3>${esc(r.title)}</h3>${r.body?`<p class="research-text">${esc(r.body)}</p>`:''}<div class="between">${linkHTML(r.url)}${kind==='creators'?btn(r.following?'已追蹤':'追蹤','fu-follow','star',`data-id="${esc(r.id)}"`,'small'):''}<span class="tiny muted">使用者整理 · 非平台已查證結論</span></div></article>`;
}
function renderFocus(){
 const kind={news:'news',reports:'reports',creators:'creators'}[focusTab]||'news',label={news:'產業焦點',reports:'法說研究',creators:'創作者來源'}[kind];
 return `${pageHead('RESEARCH IN CONTEXT','資訊留下來源，研究才有脈絡。','整理新聞、法說與創作者觀點；不搬運原站的付費圖解或完整文章。',btn('新增'+label,'fu-record-new','plus',`data-kind="${kind}"`,'primary'))}<div class="tabbar">${[['news','每日焦點'],['reports','法說筆記與比較'],['creators','創作者追蹤']].map(([id,n])=>`<button class="${focusTab===id?'active':''}" data-action="fu-focus-tab" data-id="${id}">${n}</button>`).join('')}</div>${kind==='news'?`<div class="connect-banner"><div><strong>從資料來源更新新聞標題</strong><p>只取得標題、日期與連結；內容仍以原始來源為準。</p></div>${btn('載入台股新聞','fu-news-sync','refresh')}</div>`:kind==='reports'?`<div class="connect-banner"><div><strong>同公司、跨季度的研究比較</strong><p>用自己的法說筆記比對；空白欄位不推測成長數據。</p></div>${btn('比較兩份法說筆記','fu-report-compare','compare')}</div>`:''}<section class="panel">${fx[kind].length?[...fx[kind]].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r=>recordCard(r,kind)).join(''):emptyBox('建立你的'+label,'可以保存標題、日期、公司代號、研究摘要與原始連結。這裡目前沒有自動產生的新聞或分析。','fu-record-new','新增'+label)}</section>`;
}
function renderRisk(){
 const rows=extraCache.get('disposition')?.rows||[],source=extraCache.get('disposition')?.source||'';
 const held=ledger(state.trades).positions.filter(p=>p.qty>0),alerts=holdingAlerts();
 return `${pageHead('RISK & REGULATORY WATCH','把風險，放在決策之前。','持股風險與官方處置公告分開呈現；不把技術訊號當成官方注意／處置認定。',btn('更新官方處置資料','fu-disposition','refresh'))}<div class="kpis">${kpi('持有標的',nf(held.length)+'<small>檔</small>','依本機交易紀錄','wallet')}${kpi('條件提醒',nf(alerts.length)+'<small>則</small>',`獲利+${fx.config.profitTarget}%／損失${fx.config.lossLimit}%`,'bell')}${kpi('官方處置紀錄',rows.length?nf(rows.length):'—',rows.length?'來源已回傳紀錄':'尚未載入，不代表沒有處置股','info')}${kpi('通知紀錄',nf(fx.alertLog.length)+'<small>則</small>','僅開啟網站時檢查','note')}</div><section class="panel"><div class="panel-head"><h2>持股條件提醒</h2>${btn('檢查目前資料','fu-check-alerts','refresh','','small')}</div>${alerts.length?alerts.map(a=>`<div class="risk-row">${icon('bell')}<button data-action="stock" data-id="${esc(a.stock)}">${esc(a.name)}</button><span>${esc(a.message)}</span><span class="tag">${mode==='demo'?'合成價估值':'載入價估值'}</span></div>`).join(''):emptyBox('目前沒有觸發的持股條件','尚無持股或沒有足夠行情時不會產生假提醒。','nav','前往持股')}</section><section class="panel space"><div class="panel-head"><div><h2>官方公告處置紀錄</h2><div class="sub">${esc(source||'等待官方來源')}</div></div><span class="tag">台股專用</span></div>${rows.length?rawTable(rows):emptyBox('尚未取得官方處置資料','需可用的 FinMind 權限；供應商拒絕時會保留錯誤，不會改用自行猜測的名單。','fu-disposition','連接官方來源')}<div class="panel-tail">尚未實作「接近官方處置門檻」預測：完整標準與歷史違規次數須另行查核。現有模組呈現來源公告與自己的風險條件。</div></section>`;
}
function renderFusionWatch(){
 return `${pageHead('WATCHLIST & THEMES','個股與題材，一起追蹤。','所有市場的自選分組呈現。收藏題材能直接返回產業地圖。',btn('匯出清單','export-watch','download')+btn('加入股票','search','plus','data-purpose="watch"','primary'))}${notice()}<section class="panel"><div class="panel-head"><h2>收藏題材</h2><span class="tag">${fx.favoriteThemes.length}</span></div><div class="panel-body"><div class="flex wrap">${fx.favoriteThemes.length?fx.favoriteThemes.map(id=>`<button class="chip" data-action="theme" data-id="${id}">${icon(theme(id).icon)}${theme(id).name}</button>`).join(''):'<p class="tiny muted">在產業地圖下方按「收藏題材」。</p>'}</div></div></section>${Object.keys(MARKET_NAMES).map(m=>{const ss=state.watch.map(id=>stock(id)||catalog(id)).filter(s=>s&&groupOf(s)===m);return ss.length?`<section class="panel space"><div class="panel-head"><h2>${MARKET_NAMES[m]}自選</h2><span class="tag">${ss.length} 檔</span></div>${radarTable(ss.map(s=>({s,a:analysisOf(s.id)})))}</section>`:'';}).join('')||emptyBox('建立第一份觀察清單','在雷達、產業地圖或個股页點星號即可收藏。','search','加入股票')}`;
}
function holdingAlerts(){
 return ledger(state.trades).positions.filter(p=>p.qty>0&&finite(stock(p.id)?.price)&&p.cost>0).flatMap(p=>{
  const q=stock(p.id),change=(q.price*p.qty/p.cost-1)*100;
  return change>=fx.config.profitTarget||change<=fx.config.lossLimit?[{stock:p.id,name:q.name,value:change,message:`帳面損益 ${pct(change)}，${change>0?'達獲利':'達虧損'}提醒條件。不是自動停利／停損委託。`}]:[];
 });
}
function renderFusionPortfolio(){
 const positions=ledger(state.trades).positions,held=positions.filter(p=>p.qty>0);
 const groups=Object.keys(MARKET_NAMES).map(m=>{const ps=positions.filter(p=>groupOf(stock(p.id)||catalog(p.id))===m);let cost=0,value=0,unreal=0,missing=0;ps.filter(p=>p.qty>0).forEach(p=>{cost+=p.cost;const q=stock(p.id);if(finite(q?.price)){value+=q.price*p.qty;unreal+=q.price*p.qty-p.cost;}else missing++;});return {m,ps,cost,value,unreal,missing,realized:ps.reduce((a,p)=>a+p.realized,0)};}).filter(g=>g.ps.length);
 return `${pageHead('PORTFOLIO & TRADE JOURNAL','你的部位，你的研究紀錄。','台幣、美元、日圓與韓元分開計算；不以未設定匯率混算資產。',btn('匯入交易CSV','trade-import','upload')+btn('新增交易／持股','trade-new','plus','','primary'))}${notice()}${groups.length?groups.map(g=>`<section class="panel currency-summary space-bottom"><div class="panel-head"><h2>${MARKET_NAMES[g.m]} · ${currencyOf({market:g.m})}</h2><span class="tag">${g.ps.filter(p=>p.qty>0).length} 檔持有</span></div><div class="portfolio-summary panel-body">${kpi('持股成本',nf(g.cost,0),`缺行情 ${g.missing} 檔`,'wallet')}${kpi('可估值未實現損益',nf(g.unreal,0),`可估值市值 ${nf(g.value,0)}`,'chart',tone(g.unreal))}${kpi('已實現損益',nf(g.realized,0),'依輸入費用與稅額計算','compare',tone(g.realized))}</div></section>`).join(''):''}<section class="panel"><div class="panel-head"><h2>目前持股與健檢</h2>${btn('提醒設定','nav','settings','data-view="settings"','small ghost')}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>股票</th><th>幣別</th><th class="right">股數</th><th class="right">均價</th><th class="right">現價</th><th class="right">帳面損益</th><th>檢查</th><th></th></tr></thead><tbody>${held.map(p=>{const q=stock(p.id),pl=finite(q?.price)?q.price*p.qty-p.cost:null,rate=finite(pl)&&p.cost?pl/p.cost*100:null,g=groups.find(g=>g.m===groupOf(q)),weight=g?.cost?p.cost/g.cost*100:0;return `<tr><td><button class="stock-name-btn" data-action="stock" data-id="${esc(p.id)}">${esc(q?.name||p.name)}<small>${esc(p.id)}</small></button></td><td>${currencyOf(q)}</td><td class="right mono">${nf(p.qty)}</td><td class="right mono">${nf(p.cost/p.qty,2)}</td><td class="right mono">${nf(q?.price,2)}</td><td class="right mono ${tone(pl)}">${nf(pl,0)}<br><small>${pct(rate)}</small></td><td><span class="tag">${weight>=40?'同幣別成本集中≥40%':'未達集中提示'}</span>${rate!==null&&(rate>=fx.config.profitTarget||rate<=fx.config.lossLimit)?'<span class="tag demo">損益條件觸發</span>':''}</td><td>${btn('記錄賣出','trade-new','',`data-id="${esc(p.id)}" data-side="sell"`,'small')}</td></tr>`;}).join('')||'<tr><td colspan="8"><div class="empty"><h3>目前持股為 0</h3><p>不放入虛構持股。新增你自己的買入紀錄後開始追蹤。</p></div></td></tr>'}</tbody></table></div><div class="panel-tail">集中度＝個股成本／同幣別持股成本；40%是本工具提示門檻，非適合每人的配置建議。未實現損益不含未來賣出成本。</div></section><section class="panel space"><div class="panel-head"><h2>交易明細</h2>${btn('匯出CSV','export-trades','download','','small')}</div><div class="table-scroll"><table class="data-table"><thead><tr><th>日期</th><th>股票／幣別</th><th>方向</th><th class="right">股數</th><th class="right">成交價</th><th class="right">費用＋稅</th><th></th></tr></thead><tbody>${[...state.trades].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).map(t=>`<tr><td>${esc(t.date)}</td><td>${esc(t.name||t.stock)}<small> ${esc(t.stock)} · ${currencyOf(stock(t.stock)||catalog(t.stock))}</small></td><td><span class="tag">${t.side==='buy'?'買入':'賣出'}</span></td><td class="right mono">${nf(t.qty)}</td><td class="right mono">${nf(t.price,2)}</td><td class="right mono">${nf(t.fee+t.tax,2)}</td><td><button class="icon-btn" data-action="trade-delete" data-id="${esc(t.id)}" aria-label="刪除交易">${icon('trash')}</button></td></tr>`).join('')||'<tr><td colspan="7">尚無交易紀錄。</td></tr>'}</tbody></table></div></section>`;
}
renderCompare=function(){return legacyCompare().replace('同一個畫面，看見彼此差異。','產業、走勢、訊號，一起比較。').replace('最多同時比較 4 檔；共同題材不代表價格連動，也不代表供應關係。','最多4檔，價格各依原幣別；走勢以共同日期歸一至100，不換算匯率或股息。').replaceAll('成交量（千股）','成交量（千股）')+`<section class="panel space"><div class="panel-head"><h2>同一組技術條件</h2><span class="tag">分數不等於勝率</span></div>${radarTable(state.compare.map(id=>stock(id)).filter(Boolean).map(s=>({s,a:analysisOf(s.id)})))}</section>`;};

getHistory=async function(id){
 if(mode==='demo')return D.history(id);
 if(historyCache.has(id))return historyCache.get(id);
 if(mode==='imported'&&fx.imported.histories[id]){const rows=fx.imported.histories[id];historyCache.set(id,rows);return rows;}
 const sourceMode=mode,s=stock(id)||catalog(id),market=groupOf(s),res=await api('history?stock='+encodeURIComponent(id)+'&market='+market);
 if(mode!==sourceMode)throw Error('資料模式已改變，忽略上一個日線回應。');
 const rows=E.validateBars(res.rows);if(rows.length<2)throw Error('來源未回傳足夠日線');
 historyCache.set(id,rows);historyMeta.set(id,{source:res.source||'外部來源',adjusted:res.adjusted===true,date:rows.at(-1).date});
 analyticsCache.clear();return rows;
};
openStock=function(id){
 let s=stock(id);if(!s){toast('尚無此代號，請先搜尋或匯入資料。',true);return;}
 const changed=selectedStock!==id;selectedStock=id;if(changed){detailTab='chart';chartPinned=null;chartUnit='day';}
 stockHist=barsOf(id);histLoading=mode==='official'&&!stockHist.length;histError='';
 const ticket=++histTicket;drawStock();
 if(histLoading)getHistory(id).then(rows=>{if(selectedStock===id&&ticket===histTicket){stockHist=rows;histLoading=false;drawStock();}}).catch(e=>{if(selectedStock===id&&ticket===histTicket){histLoading=false;histError=e.message;drawStock();}});
};
function technicalChart(rows){
 if(rows.length<2)return emptyBox('尚無有效K線','請連接資料或匯入歷史日線；這裡不會用合成價格替代。','fu-history-load','載入真實日線');
 let full=rows;try{if(chartUnit!=='day')full=E.aggregate(rows,chartUnit);}catch{return emptyBox('示範序號不轉換週／月K','週/月K需要有真實交易日期的資料。','','');}
 const a=full.slice(-stockRange),offset=full.length-a.length,t=E.compute(full),W=820,H=370,L=55,R=20,T=20,B=90,step=(W-L-R)/a.length,cw=Math.max(1,step*.62);
 let lo=Math.min(...a.map(r=>r.low)),hi=Math.max(...a.map(r=>r.high));const span=hi-lo||1;lo-=span*.08;hi+=span*.08;const y=v=>T+(hi-v)/(hi-lo)*(H-T-B),x=i=>L+step*(i+.5),maxVol=Math.max(...a.map(r=>r.volume||0),1);
 const pinned=chartPinned!==null?Math.min(chartPinned,a.length-1):a.length-1,row=a[pinned];
 const pathFor=arr=>a.map((_,i)=>finite(arr[i+offset])?`${i===0||!finite(arr[i+offset-1])?'M':'L'}${x(i).toFixed(1)},${y(arr[i+offset]).toFixed(1)}`:'').join(' ');
 return `<div class="ohlc-bar"><strong>${esc(row.date)}</strong><span>開 <b>${nf(row.open,2)}</b></span><span>高 <b>${nf(row.high,2)}</b></span><span>低 <b>${nf(row.low,2)}</b></span><span>收 <b>${nf(row.close,2)}</b></span><span>量 ${nf(row.volume)}股</span></div><svg viewBox="0 0 ${W} ${H}" class="chart-svg technical-main" role="img" aria-label="${mode==='demo'?'合成操作示範':'來源日線'}K線與均線，點擊K棒固定十字線">${[0,.25,.5,.75,1].map(f=>`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${y(lo+f*(hi-lo))}" y2="${y(lo+f*(hi-lo))}"/><text class="chart-label" x="${L-8}" y="${y(lo+f*(hi-lo))+4}" text-anchor="end">${nf(lo+f*(hi-lo),hi>300?0:1)}</text>`).join('')}${a.map((r,i)=>{const c=r.close>=r.open?'var(--up)':'var(--down)';return `<g><line x1="${x(i)}" x2="${x(i)}" y1="${y(r.high)}" y2="${y(r.low)}" stroke="${c}"/><rect x="${x(i)-cw/2}" y="${Math.min(y(r.open),y(r.close))}" width="${cw}" height="${Math.max(1,Math.abs(y(r.open)-y(r.close)))}" fill="${c}"/><rect x="${x(i)-cw/2}" y="${H-25-(r.volume||0)/maxVol*42}" width="${cw}" height="${(r.volume||0)/maxVol*42}" fill="${c}" opacity=".4"/></g>`;}).join('')}${[['ma5','var(--gold)'],['ma20','var(--violet)'],['ma60','var(--cyan)']].map(([k,c])=>`<path d="${pathFor(t[k])}" fill="none" stroke="${c}" stroke-width="1.5"/>`).join('')}${chartPinned!==null?`<path d="M${x(pinned)} ${T}V${H-22}M${L} ${y(row.close)}H${W-R}" stroke="var(--muted)" stroke-dasharray="3 4" opacity=".7"/>`:''}${a.map((r,i)=>`<rect data-action="fu-pin" data-id="${i}" x="${L+i*step}" y="${T}" width="${step}" height="${H-T-22}" fill="transparent"><title>${esc(r.date)} 開${nf(r.open,2)} 高${nf(r.high,2)} 低${nf(r.low,2)} 收${nf(r.close,2)}</title></rect>`).join('')}<text class="chart-label" x="${L}" y="${H-3}">${esc(a[0].date)}</text><text class="chart-label" x="${W-R}" y="${H-3}" text-anchor="end">${esc(a.at(-1).date)}</text></svg><div class="chart-keys"><span style="color:var(--gold)">● MA5</span><span style="color:var(--violet)">● MA20</span><span style="color:var(--cyan)">● MA60</span><small>點K棒固定十字線；切換範圍即可重設</small></div>${indicatorChart(full,t)}`;
}
function indicatorChart(rows,t){
 const def={kd:[['k','K','var(--gold)'],['d','D','var(--violet)']],dmi:[['pdi','+DI','var(--cyan)'],['mdi','−DI','var(--up)'],['adx','ADX','var(--gold)']],macd:[['dif','DIF','var(--cyan)'],['dea','訊號','var(--violet)']],rsi:[['rsi','RSI','var(--gold)']]}[chartIndicator];
 const offset=Math.max(0,rows.length-stockRange),a=rows.slice(offset),vals=def.flatMap(([k])=>t[k].slice(offset)).filter(finite);
 if(chartIndicator==='macd')vals.push(...t.hist.slice(offset).filter(finite));
 if(vals.length<2)return '<p class="tiny muted">指標暖機資料不足。</p>';
 let lo=chartIndicator==='kd'||chartIndicator==='rsi'?0:Math.min(...vals,0),hi=chartIndicator==='kd'||chartIndicator==='rsi'?100:Math.max(...vals,1),span=hi-lo||1;
 const W=820,H=150,L=55,R=20,T=12,B=20,x=i=>L+(i+.5)/a.length*(W-L-R),y=v=>T+(hi-v)/span*(H-T-B);
 return `<div class="indicator-section"><div class="flex wrap"><div class="segment">${[['kd','KD'],['dmi','DMI'],['macd','MACD'],['rsi','RSI']].map(([id,n])=>`<button class="${chartIndicator===id?'active':''}" data-action="fu-indicator" data-id="${id}">${n}</button>`).join('')}</div>${def.map(([k,n,c])=>`<span class="tiny mono" style="color:${c}">${n} ${nf(t[k].at(-1),2)}</span>`).join('')}</div><svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${chartIndicator.toUpperCase()}技術副圖">${[lo,(hi+lo)/2,hi].map(v=>`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text class="chart-label" x="${L-8}" y="${y(v)+4}" text-anchor="end">${nf(v,1)}</text>`).join('')}${chartIndicator==='macd'?a.map((_,i)=>{const v=t.hist[i+offset];return finite(v)?`<rect x="${x(i)-2}" y="${Math.min(y(0),y(v))}" width="4" height="${Math.abs(y(v)-y(0))}" fill="var(--${v>=0?'up':'down'})" opacity=".4"/>`:'';}).join(''):''}${def.map(([k,n,c])=>`<path d="${a.map((_,i)=>finite(t[k][i+offset])?`${i===0||!finite(t[k][i+offset-1])?'M':'L'}${x(i).toFixed(1)},${y(t[k][i+offset]).toFixed(1)}`:'').join(' ')}" fill="none" stroke="${c}" stroke-width="1.7"/>`).join('')}</svg></div>`;
}
function rawTable(rows,max=60){
 if(!rows?.length)return '<p class="tiny muted panel-body">來源未回傳資料。</p>';
 const keys=[...new Set(rows.slice(0,10).flatMap(r=>Object.keys(r)))].slice(0,12);
 return `<div class="table-scroll"><table class="data-table"><thead><tr>${keys.map(k=>`<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,max).map(r=>`<tr>${keys.map(k=>`<td>${esc(typeof r[k]==='object'?JSON.stringify(r[k]):r[k]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="panel-tail">${rows.length} 筆，畫面最多顯示 ${max} 筆；保留來源欄位，不把缺值填0。</div>`;
}
function detailBody(s,a){
 const m=a.metrics,rows=stockHist||[],source=mode==='demo'?'合成資料 · D序號不代表交易日期':historyMeta.get(s.id)?.source||fx.imported.source||s.source||'尚無來源';
 if(detailTab==='chart')return `<div class="between wrap"><h3>${mode==='demo'?'操作示範 K 線':'歷史 K 線'}</h3><div class="flex wrap"><div class="segment">${[['day','日'],['week','週'],['month','月']].map(([id,n])=>`<button class="${chartUnit===id?'active':''}" data-action="fu-chart-unit" data-id="${id}">${n}</button>`).join('')}</div><div class="segment">${[[22,'1M'],[66,'3M'],[132,'6M'],[300,'ALL']].map(([r,n])=>`<button class="${stockRange===r?'active':''}" data-action="range" data-range="${r}">${n}</button>`).join('')}</div></div></div><div class="space">${histLoading?'<div class="loading"><span class="spinner"></span>讀取來源日線…</div>':histError?`<div class="notice">${esc(histError)}</div>${btn('重新讀取','fu-history-load','refresh')}`:technicalChart(rows)}</div><p class="chart-caption">${esc(source)} · ${historyMeta.get(s.id)?.adjusted?'來源標示已調整價格':'未確認除权息調整，非總報酬'} · 不提供未授權的即時分K</p><h3 class="drawer-section-title">最近10筆資料</h3>${rawTable([...rows.slice(-10)].reverse(),10)}`;
 if(detailTab==='technical')return `<h3>技術指標全覽</h3><div class="metrics-grid">${[['ma5','MA5'],['ma20','MA20'],['ma60','MA60'],['rsi','RSI(14)'],['k','K(9,3)'],['d','D(3)'],['pdi','+DI(14)'],['mdi','−DI(14)'],['adx','ADX(14)'],['dif','DIF(12,26)'],['dea','MACD訊號(9)'],['atr','ATR(14)'],['volumeRatio','量比：前20筆']].map(([k,n])=>`<div class="metric"><label>${n}</label><span class="mono">${nf(m[k],2)}</span></div>`).join('')}</div><h3 class="drawer-section-title">今日黃金交叉事件</h3><div class="flex wrap">${[['kd','KD'],['dmi','DMI'],['macd','MACD']].map(([id,n])=>`<span class="tag ${a.crosses?.[id]?'lime':''}">${n} ${a.crosses?.[id]===true?'今日交叉':a.crosses?.[id]===false?'今日未交叉':'資料不足'}</span>`).join('')}</div><p class="research-text">黃金交叉需前一筆不在上方、當筆穿越；「已在多頭區」不等於「今天才交叉」。RSI、DMI採Wilder平滑，MACD以EMA計算。不同平台初始化或還原權息方式可能造成數值差異。</p>${btn('完整公式說明','fu-method','info','','small')}`;
 if(detailTab==='diagnosis')return `<div class="diagnosis-head">${scoreBadge(a)}<div><h3>條件符合程度 ${statusText(a.status)}</h3><p>每項20分，全部具備資料才顯示總分；不是AI機率。</p></div></div><div class="check-list">${a.checks.map(c=>`<div><span class="condition-dot ${c.value===true?'pass':c.value===false?'fail':''}">${c.value===true?'✓':c.value===false?'−':'?'}</span><strong>${c.label}</strong><span>${c.value===true?'符合':c.value===false?'不符合':'缺資料'}</span></div>`).join('')}</div><div class="notice space">${icon('info')} 5項皆符合也不代表隔日上漲。此分數只整理已載入的價格與成交量；不含未取得的籌碼、基本面或新聞。</div>${btn('用這檔做回測','fu-stock-backtest','chart',`data-id="${s.id}"`,'primary')}`;
 if(detailTab==='plan'){
  const lev=a.levels||{},lo60=rows.length>=60?Math.min(...rows.slice(-60).map(r=>r.low)):null,hi60=rows.length>=60?Math.max(...rows.slice(-60).map(r=>r.high)):null;
  return `<h3>支撐、壓力與風險觀察</h3><div class="metrics-grid">${[['前20筆低點',lev.support],['前20筆高點',lev.resistance],['近60筆低點',lo60],['近60筆高點',hi60],['收盤 − 2ATR',lev.atrStop],['收盤 ＋ 3ATR',lev.atrTarget]].map(([n,v])=>`<div class="metric"><label>${n}</label><span class="mono">${nf(v,2)}</span></div>`).join('')}</div><p class="research-text">這些是機械式觀察價位，不是買進、賣出或停損委託。跳空、價格限制與流動性都可能讓成交價不同；不保證支撐／壓力有效。</p><form id="fu-size-form" class="position-size"><h3>風險股數試算</h3><div class="input-row space">${[['entry','觀察價格',s.price||''],['stop','風險界線',lev.atrStop?lev.atrStop.toFixed(2):''],['budget','可承擔損失金額','']].map(([id,n,v])=>`<div class="field"><label>${n}（${currencyOf(s)}）</label><input id="fu-size-${id}" type="number" min=".0001" step="any" value="${v}" required></div>`).join('')}</div><button class="btn space" type="submit">計算整股數</button><p id="fu-size-result" class="research-text"></p></form>`;
 }
 if(detailTab==='theme'){
  const p=fx.profiles[s.id]||{};
  return `<div class="between"><h3>公司產業研究卡</h3>${btn('編輯研究','fu-profile','note',`data-id="${s.id}"`,'small')}</div><div class="flex wrap space">${s.tags.map(t=>`<button class="chip" data-action="theme" data-id="${t}">${theme(t).name}</button>`).join('')}</div><p class="tiny muted space">目錄分類僅作展示；下列內容由你依來源填寫，未填不編造。</p>${[['role','角色與定位'],['products','產品／服務'],['customers','客戶／供應關係'],['strengths','競爭優勢與成長動能'],['risks','風險與不確定性']].map(([k,n])=>`<h3 class="drawer-section-title">${n}</h3><p class="research-text">${esc(p[k]||'尚未建立可查證的研究資料。')}</p>`).join('')}<div class="space">${linkHTML(p.url)} <small>${esc(p.date||'')}</small></div>`;
 }
 if(detailTab==='fundamentals'){
  const data=detailExtras[s.id]?.fundamentals;
  return `<h3>基本面與財務資料</h3><div class="flex wrap space">${[['pe','估值／殖利率'],['revenue','月營收'],['financials','財務報表'],['dividend','股利政策']].map(([id,n])=>btn(n,'fu-fundamentals','',`data-kind="${id}" data-id="${s.id}"`,'small')).join('')}</div><p class="research-text">${groupOf(s)!=='TW'?'此版海外基本面尚未接入供應商；仍可在產業研究卡填寫具來源的資料。':'資料依FinMind回傳的公告／期間顯示，不能把最新一期已知資料回填到歷史回測。'}</p>${data?`<p class="tiny muted">${esc(data.source)} ${esc(data.fetchedAt||'')}</p>${rawTable(data.rows)}`:emptyBox('尚未取得基本面','選擇要載入的資料，需後端連線與有效權限。','','')}`;
 }
 const data=detailExtras[s.id]?.chips;
 return `<h3>籌碼與法人追蹤</h3>${groupOf(s)!=='TW'?'<div class="notice space">台灣三大法人與券商分點規則不套用到海外股票。本頁不顯示偽造的美股法人資料。</div>':`<div class="flex wrap space">${[['institutions','三大法人'],['broker','券商分點'],['holders','大戶／散戶'],['margin','融資融券']].map(([id,n])=>btn(n,'fu-chips','',`data-kind="${id}" data-id="${s.id}"`,'small')).join('')}</div>${detailExtras[s.id]?.metrics?`<div class="metrics-grid">${[['foreignStreak','外資連續淨買賣'],['trustStreak','投信連續淨買賣'],['dealerStreak','自營商連續淨買賣']].map(([k,n])=>`<div class="metric"><label>${n}</label><span>${nf(detailExtras[s.id].metrics[k])} 日</span></div>`).join('')}</div><p class="tiny muted">正值＝連買，負值＝連賣；僅按已回傳且連續的交易日期。未齊全時不宣稱完整紀錄。</p>`:''}${data?`<p class="tiny muted space">${esc(data.source)} · ${esc(data.fetchedAt||'')}</p>${rawTable(data.rows)}`:emptyBox('尚未取得籌碼資料','分點等資料依供應商權限，可能需要付費方案；不從原站擷取付費內容。','','')}`}`;
}
drawStock=function(){
 const id=selectedStock,s=stock(id);if(!s)return;const a=analysisOf(id),oldScroll=$('.stock-drawer')?.scrollTop||0;
 setOverlay(`<section class="stock-drawer fusion-drawer" role="dialog" aria-modal="true" aria-label="${esc(s.name)}個股分析"><div class="drawer-top">${sourceTag()}<div class="flex"><button class="icon-btn" data-action="fu-stock-prev" aria-label="上一檔">${icon('minus')}</button><button class="icon-btn" data-action="fu-stock-next" aria-label="下一檔">${icon('plus')}</button><button class="icon-btn" data-action="close" aria-label="關閉個股">${icon('close')}</button></div></div><div class="drawer-content"><div class="stock-title"><div><h2>${esc(s.name)}</h2><small class="mono">${esc(s.id)} · ${MARKET_NAMES[groupOf(s)]} · ${mode==='demo'?'操作示範':esc(s.date||'尚無報價日期')}</small></div><div class="flex">${statusBadge(a)}<button class="icon-btn ${state.watch.includes(id)?'on':''}" data-action="watch-toggle" data-id="${esc(id)}" aria-label="切換自選">${icon('star')}</button></div></div><div class="between wrap"><div><div class="price-big mono">${nf(s.price,2)} <small>${currencyOf(s)}</small></div><div class="price-change ${tone(s.change)}">${pct(s.change)} <span class="muted">${mode==='demo'?'合成漲跌':'依載入資料'}</span></div></div><div class="flex wrap">${btn(state.compare.includes(id)?'移出比較':'加入比較','compare-toggle','compare',`data-id="${esc(id)}"`,'small')}${btn('交易','trade-new','plus',`data-id="${esc(id)}"`,'small')}${btn('筆記','note-new','note',`data-stock="${esc(id)}"`,'small')}</div></div><div class="detail-tabs" role="tablist">${[['chart','看盤'],['technical','技術'],['diagnosis','診斷'],['plan','風險價位'],['theme','產業'],['fundamentals','基本'],['chips','籌碼']].map(([v,n])=>`<button role="tab" aria-selected="${detailTab===v}" class="${detailTab===v?'active':''}" data-action="fu-detail-tab" data-id="${v}">${n}</button>`).join('')}</div><div class="detail-body">${detailBody(s,a)}</div><section class="price-alert-section"><h3>價格條件提醒</h3><form id="alert-form" data-stock="${esc(id)}"><div class="alert-row space"><select id="alert-dir" aria-label="提醒條件"><option value="above">≥ 高於等於</option><option value="below">≤ 低於等於</option></select><input id="alert-price" type="number" min=".001" step="any" aria-label="提醒價格" placeholder="條件價格" required><button class="btn" type="submit">新增</button></div></form><p class="tiny muted">僅在開啟／更新時檢查，不是背景即時推播。</p>${state.alerts.filter(r=>r.stock===id).map(r=>`<div class="alert-item">${r.dir==='above'?'≥':'≤'} ${nf(r.price,2)} ${currencyOf(s)}<button class="icon-btn" data-action="alert-delete" data-id="${esc(r.id)}" aria-label="刪除價格提醒">${icon('trash')}</button></div>`).join('')}</section></div></section>`,true);
 selectedStock=id;requestAnimationFrame(()=>{const d=$('.stock-drawer');if(d)d.scrollTop=oldScroll;});
};
function renderFusionSettings(){
 return `${pageHead('DATA & WORKSPACE CONTROL','每一份資料，都說清楚。','先選資料模式，再進行研究。API金鑰留在後端，備份不含金鑰。')}<section class="panel settings-card"><h2>資料模式</h2><div class="flex wrap space">${btn('真實資料工作區','fu-real-mode','lock','','primary')}${btn('明確切換操作示範','demo','chart')}${btn('匯入行情／日線','fu-import','upload')}${btn('下載匯入範本','fu-template','download')}</div><p class="research-text">真實工作區沒有資料就顯示空白，不會自動補成示範。示範版所有價格、走勢、量能、指標與回測都不是實際行情；從真實資料切到示範會清除當次畫面的外部行情快取，不刪除研究紀錄。</p></section><div class="settings-grid space"><section class="panel settings-card"><h2>提醒與顯示設定</h2><form id="fu-config-form"><div class="input-row space">${[['profitTarget','獲利提醒 %'],['lossLimit','虧損提醒 %'],['volumeMultiplier','爆量倍率（前20筆）']].map(([id,n])=>`<div class="field"><label>${n}</label><input id="fu-config-${id}" type="number" value="${fx.config[id]}" step=".1" required></div>`).join('')}<div class="field"><label>每天開頁檢查時間（台北）</label><input id="fu-config-checkTime" type="time" value="${fx.config.checkTime}" required></div></div><div class="field space"><label>字體大小</label><select id="fu-config-font">${[['normal','一般'],['large','放大'],['xlarge','最大']].map(([v,n])=>`<option value="${v}" ${fx.config.font===v?'selected':''}>${n}</option>`).join('')}</select></div><div class="flex wrap space"><button type="submit" class="btn primary">儲存設定</button>${btn('開啟瀏覽器通知','fu-notification-permission','bell','','small')}</div><p class="tiny muted space">排程僅在網頁開啟時生效；關閉、手機休眠或未更新資料時不保證執行。台股即時模式僅在網頁開啟、頁籤可見且交易時段輪詢；關閉網站不會背景下載，也不會下單。</p></form></section><section class="panel settings-card"><h2>整合完成狀態</h2><div class="capability-list">${[['可操作','雷達／技術／自訂規則／回測／地圖／輪動'],['可操作','自選／跨市場交易／筆記／行事曆／研究來源'],['需資料','台股日線／三大法人／分點／財務／新聞／官方處置'],['需金鑰','海外搜尋與日線、生成式AI'],['已支援','FinMind Sponsor 台股約10秒快照（需 Token）'],['未完成','會員收費、雲端同步、背景推播、盤中分K'],['未完成','原站付費研究圖庫、官方處置門檻預測、截圖持股辨識']].map(([st,t])=>`<div><span class="tag ${st==='可操作'?'lime':''}">${st}</span><p>${t}</p></div>`).join('')}</div><p class="tiny muted">保留功能入口不代表擁有原站的付費內容與市場資料授權。外部連線需在你的網路與帳號下驗收。</p></section></div>${legacySettings().replace(/^.*?<div class="settings-grid">/s,'<div class="settings-grid space">').replaceAll('股脈','明日智選 ATLAS').replace('內建 40 家公司的價格與分類皆用於展示','內建多市場公司的價格與分類皆用於展示').replace('新聞訂閱、','').replace('跨裝置同步、','跨裝置同步、').replace('目前使用內建示範資料。啟動隨附 server.py 後，可嘗試更新官方盤後行情。','同源 Netlify Functions 會自動連接。台股盤後來源 TWSE/TPEx；海外需在 Netlify 環境變數設定 TWELVE_DATA_API_KEY。').replace('備份包含自選、比較、交易、筆記與提醒。','整合備份另含積木規則、事件、法說、創作者、研究卡與匯入日線。')}`;
}

/* Actions, persistence and data boundaries. No provider key is stored in the browser. */
function saveModePreference(next){try{localStorage.setItem('fusion-data-mode-v3',next);}catch{}}
function modePreference(){try{return localStorage.getItem('fusion-data-mode-v3')||'official';}catch{return 'official';}}
function resetData(next='unconnected'){
 saveModePreference(next==='unconnected'?'official':next);
 mode=next;liveQuotes={};liveMeta=null;historyCache.clear();historyMeta.clear();comparisonSeries={};analyticsCache.clear();detailExtras={};extraCache.clear();ruleResult=null;backtestResult=null;histTicket++;stockHist=null;histError='';histLoading=false;
}
function normalizeImport(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj)||JSON.stringify(obj).length>7000000)throw Error('行情匯入須為JSON物件，且不超過7MB。');
 const source=String(obj.source||'使用者匯入，未獨立查證').slice(0,200),histories={},quotes=[],seen=new Set();
 if(!Array.isArray(obj.quotes)||!obj.histories||typeof obj.histories!=='object'||Array.isArray(obj.histories))throw Error('需要 quotes 陣列與 histories 物件。');
 if(obj.quotes.length>5000||Object.keys(obj.histories).length>300)throw Error('最多5000筆報價與300檔日線。');
 for(const q of obj.quotes){
  if(!q||typeof q.id!=='string'||reservedId(q.id)||!/^[A-Za-z0-9._-]{1,16}$/.test(q.id)||seen.has(q.id))throw Error('股票代號錯誤或重複。');
  if(!['TW','TWSE','TPEX','US','JP','KR'].includes(q.market)||!validDate(q.date)||q.date>today()||(q.price!==null&&(!finite(q.price)||q.price<=0)))throw Error(q.id+' 的市場、實際資料日期或價格不正確。');
  for(const k of ['change','volume','amount'])if(q[k]!=null&&(!finite(q[k])||k!=='change'&&q[k]<0))throw Error(q.id+' 的 '+k+' 不正確。');
  const currency=currencyOf({market:q.market});if(q.currency&&q.currency!==currency)throw Error(q.id+' 幣別與市場不一致。');
  seen.add(q.id);quotes.push({id:q.id,name:String(q.name||q.id).slice(0,100),market:q.market,currency,date:q.date,price:q.price,change:q.change??null,volume:q.volume??null,amount:q.amount??null,source:String(q.source||source).slice(0,200)});
 }
 for(const [id,raw] of Object.entries(obj.histories)){
  if(!seen.has(id))throw Error(id+' 日線缺少同代號報價與市場資料。');
  const rows=E.validateBars(raw);if(rows.length<2)throw Error(id+' 至少需要2筆日線。');
  if(rows.at(-1).date>today())throw Error(id+' 含未來日期。');
  histories[id]=rows;
 }
 if(!quotes.length)throw Error('檔案沒有報價。範本請先填入你有權使用的實際資料。');
 return {source,quotes,histories,adjusted:obj.adjusted===true};
}
function applyImport(obj){
 const validated=normalizeImport(obj);resetData('imported');fx.imported=validated;
 for(const q of validated.quotes)liveQuotes[q.id]=q;
 for(const [id,rows] of Object.entries(validated.histories)){historyCache.set(id,rows);historyMeta.set(id,{source:validated.source,date:rows.at(-1).date,adjusted:obj.adjusted===true});}
 liveMeta={label:validated.source,warnings:['使用者匯入；未獨立驗證價格與來源'],fetchedAt:new Date().toISOString()};
 saveFx();closeOverlay();render();checkFusionAlerts(false);return validated;
}
function backupPayload(){return {fusionVersion:2,createdAt:new Date().toISOString(),atlas:{...state,apiBase:'',alerts:state.alerts.map(a=>({...a,lastKey:''}))},workspace:fx};}
function restorePayload(obj){
 const legacy=obj?.version===1,candidate=validateState(legacy?obj:obj?.atlas);
 const extra=legacy?structuredClone(fxDefaults):validateExtra(obj?.workspace);
 if(!legacy&&obj?.fusionVersion!==2)throw Error('不是支援的整合版備份。');
 if(extra.imported.quotes.length)extra.imported=normalizeImport(extra.imported);
 state=candidate;fx=extra;apiToken='';resetData('unconnected');save();saveFx();closeOverlay();render();
}
function dataImportModal(){
 modal('匯入自己的行情與日線',`<p class="research-text">匯入你有權使用的 JSON 資料，所有來源會標記為「使用者匯入」。報價 volume 的單位是千股，日線 volume 的單位是股。真正工作區不接受 D001 等示範日期。</p><pre class="code-sample">{\n  "source": "資料供應者與擷取日期",\n  "quotes": [ /* id, name, market, date,\n    price, change, volume, amount */ ],\n  "histories": { "代號": [ /* date,\n    open, high, low, close, volume */ ] }\n}</pre><div class="modal-footer">${btn('下載空白範本','fu-template','download')}${btn('選擇JSON檔','fu-import-file','upload','','primary')}${fx.imported.quotes.length?btn('恢復已保存匯入資料','fu-restore-import','refresh'):''}</div><p class="tiny muted">可另外從設定頁匯入整合備份（包含事件、研究與交易）。目前不直接辨識持股截圖。</p>`);
}
syncQuotes=async function(){
 if(quoteBusy)return;quoteBusy=true;
 const m=fx.market;
 try{
  let path='quotes?market='+m;
  if(m!=='TW'){
   const ids=[...new Set([...state.watch,...state.compare])].filter(id=>groupOf(stock(id)||catalog(id))===m).slice(0,8);
   if(!ids.length)throw Error('請先把這個市場的股票加入自選，再更新行情。海外最多8檔，需自己的 Twelve Data API 權限。');
   if(!confirm(`更新 ${ids.length} 檔${MARKET_NAMES[m]}日線報價，會呼叫你設定的資料供應商並使用其額度。繼續？`))return;
   path+='&symbols='+encodeURIComponent(ids.join(','));
  }
  toast('正在要求資料；失敗不會切換成示範。');
  const res=await api(path,{long:true});
  const qs=normalizeImport({source:res.label||'外部盤後來源',quotes:res.quotes,histories:{}});
  if(mode!=='official')resetData('official');
  for(const q of qs.quotes)liveQuotes[q.id]=q;
  liveMeta={label:res.label||'外部日線快照',warnings:res.warnings||[],fetchedAt:res.fetchedAt};
  analyticsCache.clear();render();checkFusionAlerts(false);toast(`已載入 ${qs.quotes.length} 筆資料${res.warnings?.length?'，部分來源未成功':''}。資料不是即時報價。`);
 }catch(err){toast(err.message,true);}finally{quoteBusy=false;}
};
async function fetchBarsReal(id){
 if(!id)throw Error('未選擇股票。');
 if(mode==='demo'){
  if(!confirm('這將離開示範並切換至真實資料工作區。來源失敗時會保留空白。繼續？'))return [];
  resetData();
 }
 const rows=await getHistory(id);
 // A quote is derived only from the returned real daily bars, never from the demo catalogue.
 const s=catalog(id)||remoteCatalog.get(id)||stock(id),last=rows.at(-1),prev=rows.at(-2),old=liveQuotes[id];
 if(mode==='unconnected')mode='official';
 if(!old||last.date>=old.date)liveQuotes[id]={...s,id,price:last.close,change:prev?.close?(last.close/prev.close-1)*100:null,volume:last.volume==null?null:last.volume/1000,amount:null,date:last.date,currency:currencyOf(s),source:historyMeta.get(id)?.source||'外部日線',tags:s?.tags||[]};
 analyticsCache.clear();return rows;
}
async function scanUniverse(){
 if(loadBusy)return;
 const ids=universe().slice().sort((a,b)=>(b.amount||0)-(a.amount||0)).slice(0,20).map(s=>s.id);
 if(!ids.length){toast('目前市場没有可掃描股票。',true);return;}
 if(mode!=='demo'&&!confirm(`分析目前市場前 ${ids.length} 檔；缺少日線時會逐檔向後端請求，可能使用資料供應商額度。繼續？`))return;
 loadBusy=true;render();let failed=0,ok=0,error='';
 try{
  for(const id of ids){try{if(mode!=='demo')await fetchBarsReal(id);analysisOf(id);ok++;}catch(e){failed++;error=e.message;}}
  const samples=ids.map(id=>({id,...analysisOf(id)})).map(a=>({id:a.id,score:a.score,status:a.status,date:a.date||null}));
  fx.signalLog.unshift({id:uid(),time:new Date().toISOString(),mode,market:fx.market,count:ok,failed,samples});fx.signalLog=fx.signalLog.slice(0,100);saveFx();
  toast(`掃描完成：${ok}檔可讀取，${failed}檔未取得。${failed?' '+error:''}`,failed>0);
 }finally{loadBusy=false;render();}
}
const originalSearchResults=searchResults;
searchResults=function(q){
 originalSearchResults(q);
 const box=$('#search-results');if(box)box.insertAdjacentHTML('beforeend',`<div class="search-api"><p class="tiny muted">本機目錄未包含的股票，可查詢資料供應商。海外搜尋需自己的權限。</p>${btn('從資料來源搜尋','fu-search-remote','search',`data-q="${esc(q)}"`,'small')}</div>`);
};
async function remoteSearch(q){
 if(!q?.trim()){toast('請先輸入代號或名稱。',true);return;}
 try{
  const res=await api('search?market='+fx.market+'&q='+encodeURIComponent(q.trim()));
  if(!Array.isArray(res.results))throw Error('搜尋回應格式錯誤。');
  const list=res.results.filter(s=>s&&/^[A-Za-z0-9._-]{1,16}$/.test(s.id));
  for(const s of list){const item={id:s.id,name:String(s.name||s.id),market:s.market,currency:currencyOf(s),exchange:String(s.exchange||''),tags:[],role:'待建立研究',price:null,change:null,volume:null,amount:null};remoteCatalog.set(s.id,item);fx.catalog[s.id]=item;}saveFx();
  const box=$('#search-results');if(box)box.innerHTML=`<p class="tiny muted panel-body">外部目錄 · ${list.length} 筆 · 不是即時價格</p>${list.map(s=>`<button class="search-result" data-action="search-select" data-id="${esc(s.id)}"><span><strong>${esc(s.name)}</strong><small>${esc(s.id)} · ${esc(s.exchange||s.market)}</small></span>${icon('arrow')}</button>`).join('')||'<p>來源沒有符合項目。</p>'}`;
 }catch(e){toast(e.message,true);}
}
const originalTradeModal=tradeModal;
tradeModal=function(id='',side='buy'){
 if(id){const s=stock(id)||catalog(id);if(s)fx.market=groupOf(s);}
 originalTradeModal(id,side);
 const label=$('#trade-stock')?.closest('form')?.previousElementSibling;
 if(label)label.textContent='不連接券商。金額全部依股票原幣別；數量為整股，不是張數。不同市場不可混用同一幣別成本。';
};
renderComparisonChart=function(){
 const ss=state.compare.map((id,i)=>({label:stock(id)?.name||catalog(id)?.name||id,color:lineColors[i],data:barsOf(id).slice(-66)}));
 return lineChart(ss)+`<div class="flex wrap space">${ss.map(s=>`<span class="legend-item"><i class="legend-line" style="--c:${s.color}"></i>${esc(s.label)}</span>`).join('')}</div><p class="chart-caption">${mode==='demo'?'所有比較走勢都是合成資料。':'使用各檔已載入來源日線；未載入的股票不產生替代走勢。'}共同日期基期100；未還原除權息、股利或匯率。</p>`;
};
const recordKinds=['events','news','reports','creators','relationships'];
function inferKind(kind){return recordKinds.includes(kind)?kind:view==='calendar'?'events':view==='map'?'relationships':['news','reports','creators'].includes(focusTab)?focusTab:'news';}
function recordEditor(kind,id=''){
 kind=inferKind(kind);const r=fx[kind].find(x=>x.id===id)||{},title={events:'市場事件',news:'產業焦點',reports:'法說筆記',creators:'創作者來源',relationships:'供應鏈關係'}[kind];
 const field=(key,label,type='text',value='',required=false)=>`<div class="field"><label for="fu-rec-${key}">${label}</label><input id="fu-rec-${key}" type="${type}" value="${esc(r[key]??value)}" maxlength="${key==='url'?2000:250}" ${type==='number'?'step="any"':''} ${required?'required':''}></div>`;
 modal((id?'編輯':'新增')+title,`<form id="fu-record-form" data-kind="${kind}" data-id="${esc(id)}">${field('title','標題','text','',true)}<div class="input-row space">${field('date','來源日期','date',today(),true)}${kind==='relationships'?field('from','上游公司代號','text','',true)+field('to','下游公司代號','text','',true):field('stock','公司代號（選填）')}${kind==='events'?`<div class="field"><label>事件類型</label><select id="fu-rec-type">${['法說會','除權息','重大訊息','融券回補','內部人申報','自訂'].map(x=>`<option ${r.type===x?'selected':''}>${x}</option>`).join('')}</select></div>`:''}${kind==='reports'?field('quarter','季度，例如 2026Q2'):''}${kind==='creators'?field('author','作者名稱'):''}${kind==='relationships'?`<div class="field"><label>產業題材</label><select id="fu-rec-theme">${D.themes.map(t=>`<option value="${t.id}" ${(r.theme||mapTheme)===t.id?'selected':''}>${t.name}</option>`).join('')}</select></div>`:''}</div>${kind==='reports'?`<div class="input-row space">${field('revenue','營收（自行定義同一單位）','number')}${field('margin','毛利率 %','number')}${field('eps','每股盈餘（原幣別）','number')}</div><p class="tiny muted">比較時請自行確認幣別、期間與單位一致；未填欄位留空。</p>`:''}<div class="field space"><label>摘要／支持依據／待查證事項</label><textarea id="fu-rec-body" rows="6" maxlength="20000">${esc(r.body||'')}</textarea></div><div class="space">${field('url','原始來源網址','url')}</div><div id="fu-record-error" class="form-error"></div><div class="modal-footer">${btn('取消','close')}<button type="submit" class="btn primary">儲存</button></div></form>`);
}
function profileEditor(id){
 const p=fx.profiles[id]||{},s=stock(id)||catalog(id);if(!s)return;
 modal(esc(s.name)+'｜公司研究卡',`<form id="fu-profile-form" data-id="${esc(id)}">${[['role','角色／定位'],['products','產品／服務'],['customers','有來源的客戶／供應關係'],['strengths','優勢／成長動能'],['risks','風險與不確定性']].map(([k,n])=>`<div class="field space"><label>${n}</label><textarea id="fu-prof-${k}" rows="3" maxlength="5000">${esc(p[k]||'')}</textarea></div>`).join('')}<div class="input-row space"><div class="field"><label>來源</label><input id="fu-prof-url" type="url" value="${esc(p.url||'')}"></div><div class="field"><label>研究日期</label><input id="fu-prof-date" type="date" value="${esc(p.date||today())}" required></div></div><button type="submit" class="btn primary space">儲存研究卡</button></form>`);
}
function reportCompare(){
 if(fx.reports.length<2){toast('請先建立至少兩份法說筆記。',true);return;}
 const opts=fx.reports.map(r=>`<option value="${esc(r.id)}">${esc(r.stock||'')} ${esc(r.quarter||r.date)} ${esc(r.title)}</option>`).join('');
 modal('跨季度法說筆記比較',`<form id="fu-report-compare-form"><div class="input-row"><div class="field"><label>第一份</label><select id="fu-rc-a">${opts}</select></div><div class="field"><label>第二份</label><select id="fu-rc-b">${opts}</select></div></div><button type="submit" class="btn primary space">比較</button></form><div id="fu-report-result"></div>`);
 $('#fu-rc-b').selectedIndex=1;
}
function calendarExport(){
 const safe=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Fusion Atlas//Research Calendar//ZH','CALSCALE:GREGORIAN'];
 for(const r of fx.events){if(!validDate(r.date))continue;const d=new Date(r.date+'T00:00:00Z');d.setUTCDate(d.getUTCDate()+1);
 lines.push('BEGIN:VEVENT','UID:'+safe(r.id)+'@fusion-atlas.local','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;VALUE=DATE:'+r.date.replaceAll('-',''),'DTEND;VALUE=DATE:'+d.toISOString().slice(0,10).replaceAll('-',''),'SUMMARY:'+safe((r.stock?r.stock+' ':'')+r.title),'DESCRIPTION:'+safe(r.body),'URL:'+safeURL(r.url),'END:VEVENT');}
 lines.push('END:VCALENDAR');downloadFile('Fusion-Research-Calendar.ics',lines.join('\r\n')+'\r\n','text/calendar');
}
async function dataRequest(kind,id){
 if(id&&groupOf(stock(id)||catalog(id))!=='TW')throw Error('此資料集只適用台股；海外不套用台灣籌碼規則。');
 const res=await api('dataset?kind='+kind+(id?'&stock='+encodeURIComponent(id):''),{long:true});
 if(!Array.isArray(res.rows))throw Error('來源格式錯誤。');return res;
}
async function loadDetailData(kind,id,tab){
 try{
  toast('正在向你設定的資料來源讀取；供應商權限不足會顯示錯誤。');
  const res=await dataRequest(kind,id);detailExtras[id]||={};detailExtras[id][tab]=res;
  if(res.metrics)detailExtras[id].metrics={...(detailExtras[id].metrics||{}),...res.metrics};
  analyticsCache.clear();if(selectedStock===id)drawStock();
 }catch(e){toast(e.message,true);}
}
function checkFusionAlerts(manual=true){
 const notices=holdingAlerts().map(x=>({...x,key:'profit:'+x.stock+':'+(x.value>=0?'up':'down')}));
 for(const id of state.watch){const a=analysisOf(id),m=a.metrics||{};if(!a.available)continue;
  if(finite(m.volumeRatio)&&m.volumeRatio>=fx.config.volumeMultiplier)notices.push({stock:id,message:`量比 ${nf(m.volumeRatio,2)}，達設定 ${fx.config.volumeMultiplier} 倍。`,key:'volume:'+id});
  for(const [k,n] of [['foreignStreak','外資'],['trustStreak','投信'],['dealerStreak','自營商']])if(finite(m[k])&&Math.abs(m[k])>=3)notices.push({stock:id,message:`${n}連續${m[k]>0?'淨買超':'淨賣超'} ${Math.abs(m[k])} 筆交易日。`,key:k+id});
  for(const [k,n] of [['kdCross','KD'],['dmiCross','DMI'],['macdCross','MACD']])if(m[k]===true)notices.push({stock:id,message:n+' 本次日線向上交叉。',key:k+id});
 }
 for(const r of fx.events)if(r.date===today())notices.push({stock:r.stock||'',message:r.title,key:'event:'+r.id});
 let added=0;
 for(const n of notices){const date=stock(n.stock)?.date||analysisOf(n.stock).date||today(),key=mode+':'+date+':'+n.key;
  if(fx.alertLog.some(r=>r.key===key))continue;
  fx.alertLog.unshift({id:uid(),key,stock:n.stock,message:n.message,time:new Date().toISOString(),mode,dataDate:date});added++;
  if(fx.config.notify&&'Notification' in window&&Notification.permission==='granted')try{new Notification('明日智選 ATLAS｜'+(mode==='demo'?'示範提醒':'條件提醒'),{body:n.stock+' '+n.message,tag:key});}catch{}
 }
 fx.alertLog=fx.alertLog.slice(0,500);saveFx();checkAlerts();if(manual){render();toast(`依目前資料檢查完成：${notices.length} 個條件符合，${added} 則新紀錄。不是即時監控。`);}
}
function notificationsModal(){
 modal('研究通知紀錄',`<p class="tiny muted">只檢查已載入資料，不代表最新交易時點；示範提醒與真實提醒分開標示。</p>${fx.alertLog.length?fx.alertLog.slice(0,80).map(r=>`<div class="record-card"><div class="flex"><span class="tag ${r.mode==='demo'?'demo':''}">${r.mode==='demo'?'合成示範':'載入資料'}</span><small>${esc(r.dataDate)}</small></div><h3>${esc(r.stock)} ${esc(r.message)}</h3><small class="muted">${esc(r.time)}</small></div>`).join(''):'<div class="empty">還沒有條件通知。</div>'}<div class="modal-footer">${btn('檢查目前資料','fu-check-alerts','refresh')}${btn('價格提醒清單','fu-legacy-alerts','bell')}</div>`);
}
const legacyAction=handleAction;
handleAction=function(el,e){
 const a=el.dataset.action,id=el.dataset.id;
 if(a?.startsWith('fu-'))e.preventDefault();
 switch(a){
 case 'fu-market':if(MARKET_NAMES[id]){fx.market=id;filters.market='all';ruleResult=null;backtestResult=null;backtestId=(mode==='demo'?D.stocks:universe()).find(s=>groupOf(s)===id)?.id||D.stocks.find(s=>groupOf(s)===id)?.id||'';saveFx();closeOverlay();render();scheduleRealtimePolling();}return;
 case 'demo':resetData('demo');closeOverlay();render();toast('目前是操作示範：所有價格、指標、回測均為合成資料。');return;
 case 'fu-real-mode':resetData();closeOverlay();render();syncQuotes().catch(()=>{});toast('真實資料工作區已開啟。缺資料保留空白。');return;
 case 'fu-import':dataImportModal();return;
 case 'fu-import-file':readFile('.json',text=>{const res=applyImport(JSON.parse(text));toast(`已匯入 ${res.quotes.length} 檔報價、${Object.keys(res.histories).length} 檔日線。`);});return;
 case 'fu-restore-import':try{applyImport(structuredClone(fx.imported));toast('已恢復你保存的匯入資料。');}catch(err){toast(err.message,true);}return;
 case 'fu-template':downloadFile('Fusion-Quotes-Template.json',JSON.stringify({schema:'fusion-quotes-v1',source:'請填你有權使用的資料供應者；quotes.volume=千股，histories.volume=股',adjusted:false,quotes:[],histories:{}},null,2),'application/json');toast('空白範本已建立；欄位範例見README與匯入畫面。');return;
 case 'fu-method':modal('條件與指標計算方式',`<div class="research-text">本版獨立實作，不宣稱還原原站私有演算法。\n\nMA：收盤＞MA20 且 MA5＞MA20。\nKD：9筆RSV，K/D初值50，以1/3平滑；條件為 K＞D。\nDMI：14筆Wilder平滑，條件為 +DI＞−DI。\nMACD：EMA12−EMA26，訊號線EMA9；條件為 DIF＞訊號線。\n量比：當筆量／之前20筆平均量，不含當筆。\n\n全部5項可計算才顯示分數；每項20分。達標5項、接近3–4項、衝突0–2項；不是機率。\n\n今日黃金交叉另檢查「上筆≤、本筆＞」，與已在多頭位置不同。資料空缺不當作0。日線未還原除權息，停牌與調整可能影響計算。</div>`);return;
 case 'fu-radar-export':{const items=rankedRadar().filter(x=>(radarStatus==='all'||x.a.status===radarStatus)&&(!radarQ||(x.s.id+x.s.name).toLowerCase().includes(radarQ.toLowerCase())));exportCSV('Fusion-Radar-'+mode+'.csv',['mode','market','id','name','currency','price','barDate','score_not_probability','status','volumeRatio'],items.map(({s,a})=>[mode,groupOf(s),s.id,s.name,currencyOf(s),s.price,a.date,a.score,a.status,a.metrics.volumeRatio]));return;}
 case 'fu-rules-export':if(!ruleResult){toast('請先執行篩選。',true);return;}exportStocks(ruleResult.filter(x=>x.test.pass===true).map(x=>x.s),'Fusion-Rules-'+mode+'.csv');return;
 case 'fu-radar-status':radarStatus=id;render();return;
 case 'fu-scan':case 'fu-scan-radar':scanUniverse();return;
 case 'fu-signal-log':modal('訊號掃描紀錄',fx.signalLog.length?fx.signalLog.map(r=>`<div class="record-card"><h3>${esc(r.market)} · ${r.mode==='demo'?'合成示範':'載入資料'} · ${r.count}檔</h3><small>${esc(r.time)}</small>${rawTable(r.samples,20)}</div>`).join(''):emptyBox('尚無掃描紀錄','在訊號雷達按「掃描前20檔」建立本次快照。','',''));return;
 case 'fu-theme-fav':{const t=id||mapTheme;fx.favoriteThemes=fx.favoriteThemes.includes(t)?fx.favoriteThemes.filter(x=>x!==t):[...fx.favoriteThemes,t];saveFx();render();return;}
 case 'fu-heat-tab':heatTab=id;render();return;
 case 'fu-rotation-play':if(rotationTimer){clearInterval(rotationTimer);rotationTimer=null;}else{rotationTimer=setInterval(()=>{if(view!=='heat'||heatTab!=='rotation'){clearInterval(rotationTimer);rotationTimer=null;return;}rotationFrame=(rotationFrame+1)%21;render();},450);}render();return;
 case 'fu-screen-tab':screenTab=id;render();return;
 case 'fu-rule-add':if(fx.rules.length>=12){toast('最多12條規則。',true);return;}fx.rules.push({field:'rsi',op:'<',value:70});saveFx();ruleResult=null;render();return;
 case 'fu-rule-delete':fx.rules.splice(Number(id),1);saveFx();ruleResult=null;render();return;
 case 'fu-rule-run':executeRules();render();return;
 case 'fu-rule-preset':{const presets={trend:[{field:'trend',op:'=',value:1},{field:'volumeRatio',op:'>=',value:1.8}],breakout:[{field:'breakout',op:'=',value:1},{field:'volumeRatio',op:'>=',value:1.8}],pullback:[{field:'pullback',op:'=',value:1},{field:'rsi',op:'<',value:70}],institutions:[{field:'foreignStreak',op:'>=',value:3},{field:'trustStreak',op:'>=',value:3}]};fx.rules=presets[id==='chips'?'institutions':id]||presets.trend;fx.ruleJoin='all';ruleResult=null;saveFx();render();return;}
 case 'fu-rule-save':{const name=prompt('為這組規則命名：','我的選股條件');if(name?.trim()){fx.ruleSets.push({id:uid(),name:name.trim().slice(0,80),rules:structuredClone(fx.rules),join:fx.ruleJoin});saveFx();render();}return;}
 case 'fu-rule-load':{const set=fx.ruleSets.find(r=>r.id===id);if(set){fx.rules=structuredClone(set.rules);fx.ruleJoin=set.join;ruleResult=null;saveFx();render();}return;}
 case 'fu-rule-set-delete':case 'fu-rule-remove':fx.ruleSets=fx.ruleSets.filter(r=>r.id!==id);saveFx();render();return;
 case 'fu-stock-backtest':backtestId=id;if(stock(id))fx.market=groupOf(stock(id));go('backtest');return;
 case 'fu-bt-export':case 'fu-backtest-export':if(backtestResult)downloadFile('Fusion-Backtest-'+mode+'.json',JSON.stringify({mode,stock:backtestId,...backtestResult},null,2),'application/json');return;
 case 'fu-record-new':recordEditor(el.dataset.kind);return;
 case 'fu-record-edit':recordEditor(el.dataset.kind,id);return;
 case 'fu-record-delete':{const kind=inferKind(el.dataset.kind);if(confirm('刪除這筆研究紀錄？')){fx[kind]=fx[kind].filter(r=>r.id!==id);saveFx();render();}return;}
 case 'fu-profile':profileEditor(id);return;
 case 'fu-follow':{const r=fx.creators.find(r=>r.id===id);if(r){r.following=!r.following;saveFx();render();}return;}
 case 'fu-month':{const d=new Date(calendarMonth+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+Number(el.dataset.dir));calendarMonth=d.toISOString().slice(0,7);render();return;}
 case 'fu-calendar-export':calendarExport();return;
 case 'fu-focus-tab':focusTab=id;render();return;
 case 'fu-report-compare':reportCompare();return;
 case 'fu-news-sync':(async()=>{try{const res=await dataRequest('news');const items=res.rows.map(r=>({id:'source-'+String(r.link||r.url||r.title).slice(-160),title:String(r.title||''),body:'',url:safeURL(r.link||r.url),date:String(r.date||'').slice(0,10),stock:String(r.stock_id||''),author:String(r.source||''),origin:res.source})).filter(r=>r.title);for(const r of items)if(!fx.news.some(n=>n.url&&n.url===r.url||n.title===r.title&&n.date===r.date))fx.news.push(r);fx.news=fx.news.slice(-1000);saveFx();render();toast(`來源回傳 ${items.length} 則新聞標題。`);}catch(e){toast(e.message,true);}})();return;
 case 'fu-disposition':(async()=>{try{const res=await dataRequest('disposition');extraCache.set('disposition',res);render();toast(`來源回傳 ${res.rows.length} 筆處置紀錄。`);}catch(e){toast(e.message,true);}})();return;
 case 'fu-detail-tab':detailTab=id;chartPinned=null;drawStock();return;
 case 'fu-indicator':chartIndicator=id;drawStock();return;
 case 'fu-chart-unit':chartUnit=id;chartPinned=null;drawStock();return;
 case 'fu-pin':chartPinned=Number(id);drawStock();return;
 case 'fu-pin-clear':chartPinned=null;drawStock();return;
 case 'fu-stock-prev':case 'fu-stock-next':{const ids=universe().map(s=>s.id),i=ids.indexOf(selectedStock),n=ids[(i+(a==='fu-stock-prev'?-1:1)+ids.length)%ids.length];if(n)openStock(n);return;}
 case 'fu-history-load':case 'fu-load-history':case 'fu-history':{const target=id||selectedStock||backtestId;if(loadBusy)return;loadBusy=true;(async()=>{try{await fetchBarsReal(target);render();if(selectedStock===target)openStock(target);toast('已取得來源日線；未以合成走勢填補。');}catch(e){toast(e.message,true);}finally{loadBusy=false;}})();return;}
 case 'fu-fundamentals':loadDetailData(el.dataset.kind,id,'fundamentals');return;
 case 'fu-chips':loadDetailData(el.dataset.kind,id,'chips');return;
 case 'fu-check-alerts':checkFusionAlerts(true);return;
 case 'alerts':case 'fu-alerts':case 'fu-notifications':notificationsModal();return;
 case 'fu-legacy-alerts':alertsModal();return;
 case 'fu-search-remote':remoteSearch(el.dataset.q||$('#global-search')?.value);return;
 case 'fu-notification-permission':(async()=>{if(!('Notification' in window)){toast('這個瀏覽器未提供通知介面。',true);return;}try{const permission=await Notification.requestPermission();fx.config.notify=permission==='granted';saveFx();toast(fx.config.notify?'已授權網頁開啟時的通知，不含背景推播。':'未取得通知權限。');}catch(e){toast('通知權限無法開啟。',true);}})();return;
 case 'backup-export':downloadFile('Fusion-Workspace-'+today()+'.json',JSON.stringify(backupPayload(),null,2),'application/json');toast('已匯出整合備份；不含API金鑰或存取碼。');return;
 case 'backup-import':readFile('.json',text=>{const obj=JSON.parse(text);validateState(obj?.version===1?obj:obj?.atlas);if(obj?.version!==1)validateExtra(obj?.workspace);if(confirm('此備份將覆蓋本機自選、交易、筆記、規則、事件與研究紀錄。確定還原？')){restorePayload(obj);toast('已還原。行情模式回到未連線；已保存匯入資料可在設定中恢復。');}});return;
 case 'reset':if(confirm('清除本瀏覽器所有ATLAS資料，含交易、筆記與整合研究？無法復原。')){state={...structuredClone(defaults),watch:[],compare:[]};fx=structuredClone(fxDefaults);apiToken='';resetData();save();saveFx();closeOverlay();render();}return;
 case 'nav':if(!el.dataset.view){go('portfolio');return;}break;
 }
 legacyAction(el,e);
};
document.addEventListener('input',e=>{
 if(e.target.id==='fu-radar-search'){radarQ=e.target.value;const p=e.target.selectionStart;render();const input=$('#fu-radar-search');input?.focus();input?.setSelectionRange(p,p);}
 if(e.target.id==='fu-rotation-range'){rotationFrame=Number(e.target.value);const box=$('#fu-rotation-chart');if(box){box.innerHTML=rotationChart();const stamp=$('#fu-rotation-stamp');if(stamp)stamp.textContent='近 '+(20-rotationFrame)+' 筆';}else render();}
});
document.addEventListener('change',e=>{
 const target=e.target,id=target.id;
 if(target.classList.contains('fu-rule-field')||target.classList.contains('fu-rule-op')||target.classList.contains('fu-rule-value')){const r=fx.rules[Number(target.dataset.i)];if(!r)return;if(target.classList.contains('fu-rule-field'))r.field=target.value;else if(target.classList.contains('fu-rule-op'))r.op=target.value;else r.value=Number(target.value);ruleResult=null;saveFx();return;}
 if(id==='fu-rule-join'){fx.ruleJoin=target.value;saveFx();ruleResult=null;}
 if(id==='fu-calendar-month'){calendarMonth=target.value;render();}
 if(id==='fu-calendar-type'){calendarType=target.value;render();}
 if(id==='fu-bt-stock'){backtestId=target.value;backtestResult=null;}
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!form.id.startsWith('fu-'))return;e.preventDefault();
 try{
 if(form.id==='fu-config-form'){
  const cfg={...fx.config};for(const k of ['profitTarget','lossLimit','volumeMultiplier'])cfg[k]=Number($('#fu-config-'+k).value);cfg.checkTime=$('#fu-config-checkTime').value;cfg.font=$('#fu-config-font').value;
  const candidate=validateExtra({...fx,config:cfg});fx=candidate;analyticsCache.clear();saveFx();render();toast('已儲存顯示與提醒參數。');
 }
 if(form.id==='fu-record-form'){
  const kind=inferKind(form.dataset.kind),id=form.dataset.id||uid(),old=fx[kind].find(r=>r.id===id)||{},r={...old,id};
  for(const k of ['title','date','stock','type','quarter','author','theme','from','to','body','url']){const el=$('#fu-rec-'+k);if(el)r[k]=el.value.trim();}
  if(!r.title||!validDate(r.date))throw Error('請填標題與有效日期。');
  if(r.url&&!safeURL(r.url))throw Error('請使用有效的 http / https 來源。');
  if(kind==='relationships'&&(!/^[A-Za-z0-9._-]{1,16}$/.test(r.from)||!/^[A-Za-z0-9._-]{1,16}$/.test(r.to)))throw Error('供應链上下游請使用有效股票代號。');
  if(r.stock&&!/^[A-Za-z0-9._-]{1,16}$/.test(r.stock))throw Error('公司代號格式不正確。');
  if(kind==='reports')for(const k of ['revenue','margin','eps']){const v=$('#fu-rec-'+k).value.trim();r[k]=v===''?null:Number(v);if(r[k]!==null&&!finite(r[k]))throw Error('財務數字不正確。');}
  const index=fx[kind].findIndex(x=>x.id===id);if(index>=0)fx[kind][index]=r;else fx[kind].push(r);saveFx();closeOverlay();render();toast('紀錄已儲存。');
 }
 if(form.id==='fu-profile-form'){const p={};for(const k of ['role','products','customers','strengths','risks','url','date'])p[k]=$('#fu-prof-'+k).value.trim();if(p.url&&!safeURL(p.url))throw Error('來源網址不正確。');fx.profiles[form.dataset.id]=p;saveFx();openStock(form.dataset.id);detailTab='theme';drawStock();}
 if(form.id==='fu-size-form'){const entry=Number($('#fu-size-entry').value),stop=Number($('#fu-size-stop').value),budget=Number($('#fu-size-budget').value);if(!(entry>stop&&stop>0&&budget>0))throw Error('多頭試算需觀察價格大於風險界線，且金額大於0。');const qty=Math.floor(budget/(entry-stop));$('#fu-size-result').textContent=`風險股數上限 ${nf(qty)} 股；名目部位 ${nf(qty*entry,2)}。未含費用、跳空或滑價，實際損失可能超過設定金額。`;}
 if(form.id==='fu-report-compare-form'){
  const a=fx.reports.find(r=>r.id===$('#fu-rc-a').value),b=fx.reports.find(r=>r.id===$('#fu-rc-b').value);if(!a||!b||a.id===b.id)throw Error('請選不同的两份筆記。');if(!a.stock||a.stock!==b.stock)throw Error('請選擇同一公司且已填代號的兩份筆記。');
  $('#fu-report-result').innerHTML=`<div class="table-scroll space"><table class="data-table"><thead><tr><th>欄位</th><th>${esc(a.quarter||a.date)}</th><th>${esc(b.quarter||b.date)}</th><th>差額 B−A</th></tr></thead><tbody>${[['revenue','營收（自訂同單位）'],['margin','毛利率（百分點）'],['eps','每股盈餘（原幣別）']].map(([k,n])=>`<tr><td>${n}</td><td>${nf(a[k],2)}</td><td>${nf(b[k],2)}</td><td>${finite(a[k])&&finite(b[k])?nf(b[k]-a[k],2):'—'}</td></tr>`).join('')}<tr><td>研究摘要</td><td class="wrap-cell">${esc(a.body)}</td><td class="wrap-cell">${esc(b.body)}</td><td>請自行確認可比較性</td></tr></tbody></table></div>`;
 }
 if(form.id==='fu-backtest-form'){
  backtestId=$('#fu-bt-stock').value;const rows=barsOf(backtestId);if(rows.length<70)throw Error('至少需要70筆日線。先於個股頁載入／匯入，或明確切換示範。');
  const cfg={strategy:$('#fu-bt-strategy').value,rules:fx.rules,join:fx.ruleJoin};for(const k of ['capital','holdBars','feePct','taxPct','slippagePct','stopPct','targetPct'])cfg[k]=Number($('#fu-bt-'+k).value);
  backtestResult=E.backtest(rows,cfg);render();toast(`回測完成 ${backtestResult.sample} 筆交易。這不是未來勝率。`);
 }
 }catch(err){const box=$('#fu-record-error')||$('#fu-bt-error');if(box)box.textContent=err.message;toast(err.message,true);}
});
setInterval(()=>{
 if(document.visibilityState!=='visible')return;
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),key=today()+':'+mode;
 if(parts>=fx.config.checkTime&&fx.lastCheck!==key){fx.lastCheck=key;saveFx();checkFusionAlerts(false);}
},60000);
window.addEventListener('storage',e=>{if(e.key==='fusion-workspace-v2'&&e.newValue)try{fx=validateExtra(JSON.parse(e.newValue));analyticsCache.clear();render();}catch{toast('其他分頁的整合資料格式不符，未載入。',true);}});
async function warmRadar(limit=8){
 if(loadBusy||mode==='demo'||mode==='imported')return;
 const ids=universe().slice().sort((a,b)=>(b.amount||0)-(a.amount||0)).slice(0,limit).map(s=>s.id);
 if(!ids.length)return;
 loadBusy=true;render();
 try{
  for(let i=0;i<ids.length;i+=4){await Promise.allSettled(ids.slice(i,i+4).map(id=>fetchBarsReal(id)));}
 }finally{loadBusy=false;analyticsCache.clear();render();}
}
async function bootstrapData(){
 if(window.ATLAS_PREVIEW_DEMO||location.protocol==='file:')return;
 const pref=modePreference();
 if(pref==='demo'){resetData('demo');render();return;}
 if(pref==='imported'&&fx.imported.quotes.length){try{applyImport(structuredClone(fx.imported));return;}catch{}}
 try{
  const status=await api('status');aiOnline=Boolean(status.aiConfigured);realtimeConfigured=Boolean(status.realtimeConfigured||status.realtime);
  const ok=await syncQuotes({quiet:true});
  if(ok&&(view==='home'||view==='radar'))warmRadar(8).catch(()=>{});
  if(ok)scheduleRealtimePolling();
 }catch(e){if(mode==='unconnected')toast('\u5f8c\u7aef\u5c1a\u672a\u9023\u7dda\uff1a'+e.message,true);}
}
mode=window.ATLAS_PREVIEW_DEMO?'demo':'unconnected';
window.FusionTest=Object.freeze({engine:E,getWorkspace:()=>structuredClone(fx),source:()=>mode,stocks:()=>universe().map(s=>({...s})),bars:barsOf,analyze:analysisOf,normalizeImport,applyImport,backup:backupPayload,restore:restorePayload,resetData,validateExtra,go,runRules:executeRules,alertCheck:checkFusionAlerts});

document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||el.disabled)return;handleAction(el,e);});
document.addEventListener('input',e=>{const id=e.target.id;if(id==='global-search'){searchResults(e.target.value);return;}const fm={'screen-q':'q','screen-min':'min','screen-max':'max','screen-change':'change'};if(fm[id]){filters[fm[id]]=e.target.value;updateScreen();}});
document.addEventListener('change',e=>{const id=e.target.id,v=e.target.value;
 if(id==='heat-theme'){heatTheme=v;render();}if(id==='heat-direction'){heatDirection=v;render();}if(id==='heat-weight'){heatWeight=v;render();}
 if(id==='screen-theme'){filters.theme=v;updateScreen();}if(id==='screen-market'){filters.market=v;updateScreen();}if(id==='screen-watch'){filters.watch=e.target.checked;updateScreen();}
 if(id==='pref-theme'){state.theme=v;save();render();}if(id==='pref-color'){state.color=v;save();render();}if(id==='pref-density'){state.density=v;save();render();}if(id==='ai-consent')aiConsent=e.target.checked;
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!['trade-form','note-form','alert-form','chat-form','connection-form'].includes(form.id))return;e.preventDefault();
 if(form.id==='trade-form'){
  try{const id=$('#trade-stock').value,s=stock(id),t={id:uid(),stock:id,name:s?.name||id,date:$('#trade-date').value,side:$('#trade-side').value,qty:Number($('#trade-qty').value),price:Number($('#trade-price').value),fee:Number($('#trade-fee').value),tax:Number($('#trade-tax').value),createdAt:Date.now()};if(t.date>today())throw Error('交易日期不可在未來');const next=validateState({...state,trades:[...state.trades,t]});state=next;save();closeOverlay();go('portfolio');toast('交易已儲存，成本與損益已重新計算。');}catch(err){$('#trade-error').textContent=err.message;}
 }
 if(form.id==='note-form'){
  const raw=$('#note-url').value.trim(),url=raw?safeURL(raw):'';if(raw&&!url){$('#note-error').textContent='來源只接受有效的 http / https 網址。';return;}const id=form.dataset.id||uid(),n={id,title:$('#note-title').value.trim(),body:$('#note-body').value.trim(),tag:$('#note-tag').value.trim(),date:$('#note-date').value,url};if(!n.title||!n.body){$('#note-error').textContent='請填寫標題與內容。';return;}const index=state.notes.findIndex(n=>n.id===id);if(index>=0)state.notes[index]=n;else state.notes.push(n);save();closeOverlay();go('notes');toast('研究筆記已儲存');
 }
 if(form.id==='alert-form'){const price=Number($('#alert-price').value);if(!finite(price)||price<=0){toast('價格必須大於 0。',true);return;}state.alerts.push({id:uid(),stock:form.dataset.stock,price,dir:$('#alert-dir').value,lastKey:''});save();drawStock();checkAlerts();}
 if(form.id==='chat-form')sendChat($('#chat-input').value);
 if(form.id==='connection-form'){
  try{const raw=$('#api-base').value.trim();if(raw){const u=new URL(raw);if(!safeURL(raw)||u.search||u.hash)throw Error('後端位址須為 http / https，且不含查詢參數或片段。');state.apiBase=u.href.replace(/\/+$/,'');}else state.apiBase='';apiToken=$('#api-token').value.trim();save();const res=await api('status');toast('後端連線成功；'+(res.aiConfigured?'生成式 AI 已設定。':'尚未設定生成式 AI，可使用離線整理。'));}catch(err){toast(err.message,true);}
 }
});
document.addEventListener('keydown',e=>{
 if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();return;}
 if(e.key==='Escape'){closeOverlay();$('.sidebar')?.classList.remove('open');return;}
 const dialog=$('[role=dialog]');if(e.key==='Tab'&&dialog){const f=$$('button,input,select,textarea,a[href],[tabindex="0"]',dialog).filter(x=>!x.disabled&&x.getClientRects().length);if(!f.length)return;const first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
 if(e.key==='ArrowDown'&&document.activeElement?.id==='global-search'){e.preventDefault();$('#search-results button')?.focus();}
});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(layoutHeatmaps,120);});
window.addEventListener('hashchange',()=>{const hash=location.hash.slice(1);if(hash&&hash!==view)go(hash);});
window.addEventListener('storage',e=>{if(e.key==='atlas-state-v1'&&e.newValue){try{state=validateState(JSON.parse(e.newValue));render();}catch{toast('另一分頁的資料格式有誤，未載入。',true);}}});
const hash=location.hash.slice(1);if(navs.some(n=>n[0]===hash))view=hash;
render();bootstrapData();if(storageFailed)toast('本機儲存不可用或舊資料格式不符；請使用備份功能保留資料。',true);checkAlerts();
if(!window.ATLAS_STANDALONE&&'serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
window.AtlasTest=Object.freeze({ledger,parseCSV,validateState,treemap,offlineResearch,filtered,source:()=>mode,state:()=>structuredClone(state)});
})();