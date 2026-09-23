
import {CATALOG} from './atlas-catalog.mjs?v=10.0.0';
import {VERSION,API,ApiError,loadUser,saveUser,validateUser,validateTrade,ledger,importLegacy,cacheGet,cachePut,clearMarketCache,today,uid,safeURL,validDate,finite,download,csvParse,csvEncode} from './atlas-store.mjs?v=10.0.0';
import {esc,nf,pct,tone,money,spark,lineChart,barsChart,candles,treemap,chipDays,revenueRows} from './atlas-charts.mjs?v=10.0.0';
const E=globalThis.FusionEngine,$=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const api=new API();let user=loadUser(), market='TW', feedStore=new Map(), quoteMap=new Map(), companyMap=new Map(), histMap=new Map(), analyses=new Map(), quoteState={state:'loading',error:'',cache:false},apiStatus=null;
let activeTheme='ai',category='all',topicQuery='',companyTab='basic',financeTab='revenue',chipTab='institutions',chartUnit='day',chartRange=90,chartIndicator='kd',pinned=null,heatWeight='amount',heatMode='stocks',rotationStep=100;
let screenerQuery='',screenerPreset='all',screenerPage=0,screenerJoin='all',screenerRules=[{field:'trend',op:'=',value:1}],screenerBusy=false,scanAbort=false,scanDone=0,scanTotal=0,calendarMonth=today().slice(0,7),calendarView='month',portfolioTab='holdings',researchTab='studies',feedTab='announcements',feedLimit=8,sortKey='amount',sortDir=-1,backtestResult=null,aiAnswer='',aiBusy=false,refreshTimer=null;
let lastToast='',lastToastAt=0,modalReturn=null;
const paths={home:'M3 10 12 3l9 7v10h-6v-7H9v7H3Z',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16',grid:'M3 3h7v7H3Zm11 0h7v7h-7ZM3 14h7v7H3Zm11 0h7v7h-7Z',search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',star:'m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',wallet:'M3 6h17v14H3Zm0 0V4l14-2v4M16 11h5v5h-5Z',note:'M5 3h14v18H5Zm3 5h8M8 12h8M8 16h5',spark:'m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4ZM20 2v4m-2-2h4',settings:'M4 7h16M4 17h16M9 3v8m6 2v8',arrow:'M5 12h14m-5-5 5 5-5 5',external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',plus:'M12 5v14M5 12h14',close:'m6 6 12 12M18 6 6 18',check:'m5 12 4 4L19 6',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5',sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',moon:'M20 14A8 8 0 0 1 10 4 9 9 0 1 0 20 14',info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7v.2',refresh:'M20 7V3l-3 3A8 8 0 0 0 4 9m0 8v4l3-3a8 8 0 0 0 13-3M4 21h4M20 3h-4',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',bell:'M6 8a6 6 0 0 1 12 0v7l3 3H3l3-3Zm4 13h4',cpu:'M6 6h12v12H6Zm3 3h6v6H9ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',chip:'M5 5h14v14H5ZM8 8h8v8H8ZM8 2v3m8-3v3M8 19v3m8-3v3M2 8h3m-3 8h3m14-8h3m-3 8h3',layers:'m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',wind:'M3 8h12a3 3 0 1 0-3-3M2 12h17a3 3 0 1 1-3 3M4 17h6a2 2 0 1 1-2 2',bolt:'m13 2-9 12h7l-1 8 10-13h-8Z',network:'M9 3h6v6H9ZM3 15h6v6H3Zm12 0h6v6h-6ZM12 9v3m-6 3v-3h12v3',car:'m5 6 2-3h10l2 3 2 4v8H3v-8ZM3 10h18M6 14h2m8 0h2M5 18v3m14-3v3',robot:'M5 7h14v13H5ZM12 7V3m-2 0h4M8 11v2m8-2v2M9 17h6M2 10v7m20-7v7',filter:'M3 5h18l-7 8v6l-4 2v-8Z',chart:'M3 3v18h18M6 15l4-5 4 3 6-8',lock:'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4M12 14v3',calendar:'M4 5h16v16H4ZM8 2v6m8-6v6M4 10h16',people:'M9 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0M17 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0M1 21v-4a5 5 0 0 1 10 0v4m1 0v-4a5 5 0 0 1 10 0v4',minus:'M5 12h14'};
const icon=(n)=>`<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[n]||paths.layers}"/></svg>`;
const navs=[['focus','每日焦點','home'],['themes','題材總覽','map'],['companies','公司資料庫','grid'],['chain','供應鏈','network'],['creators','財經創作者','people'],['heat','熱力圖','grid'],['calendar','行事曆','calendar'],['research','法說解析','note'],['risk','處置股','bell'],['screener','選股','filter'],['ai','AI 分析','spark'],['portfolio','我的持股','wallet']];
const routes=()=>{const a=location.hash.slice(1).split('/');return [a[0]||'focus',...a.slice(1).map(x=>{try{return decodeURIComponent(x);}catch{return x;}})];};
const marketOf=s=>['TWSE','TPEX','TW'].includes(s?.market)?'TW':s?.market||'TW';
const curr=m=>({TW:'TWD',US:'USD',JP:'JPY',KR:'KRW'})[m]||'TWD';
const symbolMarket=id=>/\.T$/i.test(id)?'JP':/\.(KS|KQ)$/i.test(id)?'KR':/^\d{4,6}[A-Z]?$/.test(id)?'TW':'US';
const stock=id=>({id,name:id,market:symbolMarket(id),currency:curr(symbolMarket(id)),...CATALOG.stocks.find(s=>s.id===id),...companyMap.get(id),...quoteMap.get(id),id,tags:CATALOG.stocks.find(s=>s.id===id)?.tags||[]});
function stocks(m=market){const ids=new Set([...CATALOG.stocks.map(s=>s.id),...quoteMap.keys(),...companyMap.keys(),...user.watch,...user.trades.map(t=>t.stock)]);return [...ids].map(stock).filter(s=>s.name&&marketOf(s)===m);}
const themes=()=>[...CATALOG.themes,...user.customThemes];
const theme=id=>themes().find(t=>t.id===id)||themes()[0];
const members=id=>stocks().filter(s=>s.tags?.includes(id)||user.relations.some(r=>r.theme===id&&r.stock===s.id));
const dates=()=>[...new Set(stocks().filter(s=>s.source&&s.date).map(s=>s.date))].sort();
const currentSourceDate=()=>dates().at(-1)||'尚無行情日期';
const quotedStocks=()=>stocks().filter(s=>finite(s.price));
const meanChange=ss=>{const vals=ss.map(s=>s.change).filter(finite);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;};
const getFeed=k=>feedStore.get(k)||{state:'idle'};
const dataRows=k=>getFeed(k).data?.rows||[];
const sourceLink=(url,label)=>safeURL(url)?`<a href="${esc(safeURL(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ${icon('external')}</a>`:'';
const feedSource=(key)=>{const f=getFeed(key);return f.data?`<div class="source">來源：${esc(f.data.source||'公開資料')} · 取得時間 ${esc(String(f.data.fetchedAt||'').replace('T',' ').slice(0,19))} UTC${f.data.warnings?.length?`<br>部分來源未取得：${esc(f.data.warnings.join('；'))}`:''}</div>`:'';};
function save(){try{saveUser(user);}catch{toast('個人資料儲存失敗，請立即匯出備份。',true);}}
function toast(text,error=false){if(text===lastToast&&Date.now()-lastToastAt<4500)return;lastToast=text;lastToastAt=Date.now();const e=document.createElement('div');e.className='toast'+(error?' error':'');e.textContent=text;$('#toasts').append(e);setTimeout(()=>e.remove(),6000);}
function head(title,sub,en,actions=''){return `<div class="pagehead"><div><div class="eyebrow">${esc(en)}</div><h1>${title}</h1><p>${sub}</p></div><div class="row wrap">${actions}</div></div>`;}
function empty(title,body,action='',error=false){return `<div class="empty ${error?'error':''}">${icon(error?'info':'layers')}<strong>${esc(title)}</strong><p>${esc(body)}</p>${action}</div>`;}
function loading(text='正在取得來源資料…'){return `<div class="loading"><span class="spinner"></span>${esc(text)}</div>`;}
function metrics(items){return `<div class="grid g4 metrics">${items.map(([label,value,sub,cls='',ic='chart'])=>`<div class="card metric"><div class="label">${esc(label)}</div><div class="value num ${cls}">${value}</div><small>${esc(sub)}</small><div class="metric-icon">${icon(ic)}</div></div>`).join('')}</div>`;}
function feedContent(key,renderFn,help=''){
 const f=getFeed(key);if(f.state==='loading'||f.state==='idle')return loading();
 if(f.state==='error')return empty('此項資料尚未取得',f.error,`<button class="secondary" data-action="retry-feed" data-key="${esc(key)}">${icon('refresh')}重試此資料</button>${help}`,true);
 if(!f.data?.rows?.length)return empty('來源回傳 0 筆資料','這不是連線失敗；目前資料區間／篩選條件沒有記錄。',help);
 return renderFn(f.data.rows)+feedSource(key);
}
function quoteStamp(s){return [s?.date,s?.time,s?.timezone].filter(Boolean).join(' ')||'\u5c1a\u7121\u5831\u50f9\u6642\u9593';}
function currentQuoteStamp(){return quoteStamp(quotedStocks().sort((a,b)=>String(b.sourceTimestamp||b.date||'').localeCompare(String(a.sourceTimestamp||a.date||'')))[0]);}
function notice(){
 if(quoteState.state==='loading')return `<div class="notice">${icon('refresh')}<span>\u6b63\u5728\u8b80\u53d6 ${esc(market)} \u884c\u60c5${quoteState.total?`\uff08${quoteState.progress||0}/${quoteState.total}\uff09`:''}\u3002${market==='TW'?'\u53f0\u80a1\u5b98\u65b9\u76e4\u5f8c\u8cc7\u6599':'Yahoo \u5831\u50f9\u8207\u65e5 K \u5206\u6279\u8f09\u5165'}\uff1b\u4e0d\u4ee5\u793a\u7bc4\u6578\u503c\u4ee3\u66ff\u3002</span></div>`;
 if(quoteState.state==='error')return `<div class="notice error">${icon('info')}<span><b>\u672c\u5e02\u5834\u884c\u60c5\u5c1a\u672a\u53d6\u5f97</b>\u3000${esc(quoteState.error)}</span><a href="#settings">\u6aa2\u67e5\u9023\u7dda</a></div>`;
 const q=quotedStocks(),old=q.filter(s=>s.stale).length;
 const label=quoteState.cache?'\u820a\u5feb\u53d6\uff0c\u975e\u525b\u66f4\u65b0':market==='TW'?'\u5b98\u65b9\u76e4\u5f8c\u884c\u60c5':'Yahoo Finance \u6700\u8fd1\u53ef\u7528\u5831\u50f9';
 const detail=market==='TW'?`\u8cc7\u6599\u65e5\u671f ${esc(currentSourceDate())}`:`\u5831\u50f9\u6642\u9593 ${esc(currentQuoteStamp())}\uff1b\u4f9d\u4ea4\u6613\u6240\u53ef\u80fd\u5ef6\u9072`;
 return `<div class="notice ${quoteState.cache?'warn':''}">${icon('info')}<span><b>${label}</b>\u3000${detail}\u3002${nf(q.length)} \u6a94\u6709\u50f9\u683c${old?`\uff08${old} \u6a94\u70ba\u820a\u8cc7\u6599\uff09`:''}\uff1b\u975e\u5168\u5e02\u5834\uff0c\u4e0d\u4fdd\u8b49\u5373\u6642\u3002${quoteState.warnings?.length?`<br><b>\u90e8\u5206\u672a\u66f4\u65b0\uff1a</b>${esc(quoteState.warnings.slice(0,2).join('\uff1b'))}`:''}</span><a href="#settings">\u4f86\u6e90\u8207\u72c0\u614b</a></div>`;
}

function applyAppearance(){const s=user.settings;document.documentElement.dataset.theme=s.theme==='system'?(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):s.theme;document.documentElement.dataset.font=s.font;document.documentElement.dataset.color=s.color;}
function render(){
 applyAppearance();const [route]=routes(),active=route==='theme'?'themes':route==='company'?'themes':route;
 const q=quotedStocks(),con=quoteState.state==='loading'?'正在載入':q.length?`${quoteState.cache?'舊快取 · ':''}${market==='TW'?'盤後':'Yahoo Finance'} ${currentSourceDate()}`:quoteState.state==='error'?'此市場資料取得失敗':'待取得行情';
 const main=renderPage();
 const focus=document.activeElement?.id,selection=document.activeElement?.selectionStart;
 $('#app').innerHTML=`${globalThis.ATLAS_TEST_MODE?'<div class="test-ribbon">介面驗收用測試資料 · 非真實行情 · 此模式不會包含在正式資料來源</div>':''}
 <header class="top"><div class="top-inner"><a class="brand" href="#focus"><span class="brand-icon">${icon('map')}</span><span><strong>明日智選 · 產業地圖</strong><small>INDUSTRY RESEARCH ATLAS</small></span></a><div class="header-search">${icon('search')}<input id="global-search" readonly aria-label="搜尋公司、代號或題材" placeholder="搜尋公司、代號或題材" data-action="open-search"><span class="kbd">⌘ K</span></div><div class="top-actions"><button class="square" title="我的收藏" aria-label="我的收藏" data-action="nav" data-route="watch">${icon('star')}</button><button class="square" title="切換深淺色" aria-label="切換深淺色" data-action="toggle-theme">${icon(document.documentElement.dataset.theme==='dark'?'sun':'moon')}</button><button class="square" title="資料與帳戶設定" aria-label="資料與帳戶設定" data-action="nav" data-route="settings">${icon('settings')}</button></div></div><div class="nav-wrap"><nav class="nav" aria-label="主要導覽">${navs.map(([id,name,i])=>`<a href="#${id}" class="${active===id?'active':''}">${icon(i)}${name}</a>`).join('')}</nav></div></header>
 <div class="marketbar"><div class="market-inner"><div class="segmented" aria-label="市場">${[['TW','台股'],['US','美股'],['JP','日股'],['KR','韓股']].map(([id,n])=>`<button data-action="market" data-market="${id}" class="${market===id?'selected':''}" aria-pressed="${market===id}">${n} <small>${id}</small></button>`).join('')}</div><div class="connection"><span class="dot ${quoteState.state==='loading'?'busy':q.length?'ok':'error'}"></span><span>${esc(con)}</span><span class="sep"></span><span class="small-extra">研究工具 · 不自動下單</span><button class="linkbtn" data-action="refresh" ${quoteState.state==='loading'?'disabled':''}>${icon('refresh')}更新</button></div></div></div>
 <main id="main">${main}</main><footer class="footer"><div class="row between"><span>明日智選 ATLAS · 產業研究地圖 v${VERSION}</span><span><a href="#settings">資料來源與連線</a>　<a href="#coverage">功能完成範圍</a>　<a href="./start.html">更新修復</a></span></div><p style="margin:8px 0 0">獨立開發的個人研究工具，與 AIStockMap 無隸屬關係。價格以來源標示日期為準；公司題材為可編輯研究分類，並非已查核的供貨關係。資料與運算不構成投資建議。個人紀錄儲存在這個瀏覽器，請定期匯出。</p></footer><nav class="mobile-nav" aria-label="手機快捷">${[['focus','焦點','home'],['themes','題材','map'],['heat','熱力','grid'],['watch','收藏','star'],['portfolio','持股','wallet']].map(([id,n,i])=>`<a href="#${id}" class="${active===id?'active':''}">${icon(i)}${n}</a>`).join('')}</nav>`;
 if(focus&&$('#'+focus)&&!['global-search'].includes(focus)){$('#'+focus).focus({preventScroll:true});try{$('#'+focus).setSelectionRange(selection,selection);}catch{}}
}
function renderPage(){
 const [r,id,m]=routes();
 if(r==='focus'||r==='')return focusPage();
 if(r==='themes')return themesPage();
 if(r==='companies')return head('公司資料庫','搜尋已取得的市場公司名錄；題材標籤可另外建立。','COMPANY DIRECTORY','<button class="primary" data-action="open-search">搜尋全部公司</button>')+notice()+stockTable(stocks().slice(0,100))+'<p class="source">此表先列前 100 檔。上方搜尋可查全部已取得公司；海外只有來源與方案涵蓋的代號。</p>';
 if(r==='theme')return themePage(id);
 if(r==='chain')return chainPage();
 if(r==='company')return companyPage(id,m);
 if(r==='heat')return heatPage();
 if(r==='screener'||r==='radar')return screenerPageHTML();
 if(r==='watch')return watchPage();
 if(r==='portfolio')return portfolioPage();
 if(r==='calendar')return calendarPage();
 if(r==='research'||r==='creators')return researchPage(r);
 if(r==='risk')return riskPage();
 if(r==='ai')return aiPage();
 if(r==='settings')return settingsPage();
 if(r==='coverage')return coveragePage();
 return empty('找不到此分頁','請從上方導覽開啟頁面。','<a href="#focus">返回每日焦點</a>');
}
function focusPage(){
 const qs=quotedStocks(),up=qs.filter(s=>s.change>0).length,down=qs.filter(s=>s.change<0).length,amount=qs.map(s=>s.amount).filter(finite).reduce((s,x)=>s+x,0);
 const ix=dataRows('official:index').filter(x=>finite(x.value)).sort((a,b)=>a.date.localeCompare(b.date)),latest=ix.at(-1);
 const topThemes=themes().map(t=>({...t,avg:meanChange(members(t.id)),n:members(t.id).filter(s=>finite(s.change)).length})).filter(t=>t.n).sort((a,b)=>b.avg-a.avg).slice(0,6);
 const hot=[...qs].sort((a,b)=>market==='TW'?(b.amount||0)-(a.amount||0):(b.volume||0)-(a.volume||0)).slice(0,7);
 return head('每日產業焦點','從市場變化找到題材，再沿供應鏈深入研究。','DAILY INDUSTRY BRIEF',`<button data-action="nav" data-route="themes" class="primary">${icon('map')}探索題材</button>`)
 +notice()+metrics([['加權指數',latest?nf(latest.value,2):'—',latest?latest.date+' · TWSE':'官方指數待取得',latest?tone(latest.change):'','chart'],['上漲 / 下跌',`${nf(up)} <small>/ ${nf(down)}</small>`,qs.length?`${qs.length} 檔有價資料，不等同全市場成分股`:'行情載入後計算','','grid'],['成交金額',amount?money(amount):'—','已取得股票金額合計，不作指數成交額','','wallet'],['研究收藏',nf(user.watch.length),`${user.themeWatch.length} 個題材 · 儲存於本機`,'','star']])
 +`<div class="main-aside section"><div><div class="card"><div class="card-head"><h2>${market==='TW'?'市場走勢':'台股加權指數（參考，非本市場指數）'}</h2><span class="badge">TWSE · 每日收盤</span></div><div class="pad">${ix.length>1?lineChart([{name:'加權指數',values:ix.map(x=>x.value)}],{labels:ix.map(x=>x.date),height:210}):feedContent('official:index',()=>empty('指數資料不足','不以個股代替大盤指數。'))}</div></div><div class="section-title"><h2>產業與公司快訊</h2><span class="badge">來源日期為準</span></div><div class="card"><div class="tabs">${[['announcements','重大訊息'],['news','財經新聞'],['notes','我的研究']].map(([v,t])=>`<button class="${feedTab===v?'selected':''}" data-action="feed-tab" data-tab="${v}">${t}</button>`).join('')}</div>${focusFeed()}</div><div class="section-title"><h2>研究入口</h2><a href="#themes">全部題材 →</a></div><div class="grid g3">${themes().slice(0,3).map(themeCard).join('')}</div></div>
 <aside><div class="card"><div class="card-head"><h3>題材相對表現</h3><a href="#heat" class="tiny">熱力圖 →</a></div>${topThemes.length?topThemes.map((t,i)=>`<div class="rank-item"><span class="rank-number">${i+1}</span><a href="#theme/${t.id}">${esc(t.name)}</a><span class="delta ${tone(t.avg)}">${pct(t.avg)}</span></div>`).join(''):empty('等待題材行情','取得成分公司價格後，依等權平均計算。')}<div class="source">可編輯分類；僅納入有漲跌幅的公司，非實際資金流量。</div></div>
 <div class="card section"><div class="card-head"><h3>成交焦點</h3><span class="badge">已取得資料</span></div>${hot.length?hot.map((s,i)=>`<div class="rank-item"><span class="rank-number">${i+1}</span><div><a href="#company/${s.id}/${marketOf(s)}">${esc(s.name)}</a><small style="display:block">${s.id}</small></div><span class="delta ${tone(s.change)}">${pct(s.change)}</span></div>`).join(''):empty('尚無行情','資料載入後顯示，不使用假數字。')}</div>
 <div class="card pad section"><h3>建立你的研究路徑</h3><p class="muted tiny">題材 → 供應鏈 → 個股 → 財務／籌碼 → 收藏與持股。每項資料可查看來源，失敗時可單獨重試。</p><a href="#settings">查看各資料的連線狀態 →</a></div></aside></div>`;
}
function focusFeed(){
 if(feedTab==='notes')return user.notes.length?user.notes.slice().reverse().slice(0,10).map(n=>`<div class="study"><h3>${esc(n.title)}</h3><p>${esc(String(n.body||'').slice(0,220))}</p><button class="smallbtn" data-action="open-note" data-id="${esc(n.id)}">查看筆記</button></div>`).join(''):empty('尚未建立研究筆記','選擇個股後，可以在研究圖表分頁新增筆記。','<button data-action="add-note" class="secondary">新增筆記</button>');
 const key=feedTab==='news'?'dataset:news:':'official:announcements';
 return feedContent(key,rows=>rows.slice(0,feedLimit).map((r,i)=>{
  const d=String(r.date||''),url=safeURL(r.link||r.url||r.sourceURL),title=r.title||'未提供標題',nm=r.name||r.stock_id||r.id||'';
  return `<article class="feed-item"><div class="feed-date">${esc(d.slice(5,10))}<br><small>${esc(d.slice(0,4))}</small></div><div class="grow"><h3>${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)}</a>`:esc(title)}</h3><div class="row wrap"><span class="badge">${esc(nm)}</span><small>${esc(r.source||getFeed(key).data.source)}</small>${r.body?`<button class="linkbtn" data-action="announcement" data-index="${i}" data-key="${esc(key)}">看公告內容 →</button>`:''}</div></div></article>`;
 }).join('')+(rows.length>feedLimit?'<div class="pad"><button data-action="more-focus">載入更多快訊</button></div>':''));
}
function themeCard(t){
 const ss=members(t.id),avg=meanChange(ss),covered=ss.filter(s=>finite(s.change)).length;
 return `<article class="card theme-card"><button class="square ${user.themeWatch.includes(t.id)?'starred':''}" aria-label="收藏${esc(t.name)}" data-action="watch-theme" data-id="${t.id}">${icon('star')}</button><span class="theme-icon">${icon(t.icon||'layers')}</span><a href="#theme/${t.id}"><h3>${esc(t.name)}</h3></a><span class="en">${esc(t.en||'RESEARCH THEME')}</span><p>${esc(t.desc)}</p><div class="row between"><span class="badge">${ss.length} 家研究索引</span><b class="${tone(avg)} num">${pct(avg)}</b></div><div class="foot"><small>行情涵蓋 ${covered}/${ss.length}</small><a href="#theme/${t.id}" class="linkbtn">展開題材 →</a></div></article>`;
}
function themesPage(){
 const ts=themes().filter(t=>(category==='all'||user.themeWatch.includes(t.id))&&(!topicQuery||(t.name+t.en+t.desc).toLowerCase().includes(topicQuery.toLowerCase())));
 return head('題材總覽','先看產業結構，再看公司在其中的位置。分類可自行維護。','INDUSTRY THEMES',`<button data-action="add-theme">${icon('plus')}新增題材</button><button data-action="nav" data-route="chain" class="primary">${icon('network')}供應鏈視圖</button>`)
 +`<div class="filterbar"><div class="chips"><button class="chip ${category==='all'?'selected':''}" data-action="theme-category" data-value="all">全部題材 ${themes().length}</button><button class="chip ${category==='watch'?'selected':''}" data-action="theme-category" data-value="watch">${icon('star')}我的題材 ${user.themeWatch.length}</button></div><input id="topic-filter" placeholder="找題材、產品、產業…" value="${esc(topicQuery)}"></div>
 <div class="notice">${icon('info')}<span>這是可編輯的研究分類起始庫，<b>不是原站全部題材資料庫</b>。分類與上下游位置尚未逐筆查核，請以公司公告及你補上的來源為準。</span></div><div class="grid g4">${ts.length?ts.map(themeCard).join(''):empty('沒有符合的題材','請調整關鍵字或新增題材。')}</div>`;
}
function stageOf(s,t){
 const own=user.relations.find(r=>r.stock===s.id&&r.theme===t.id);if(own)return Math.min(3,Math.max(0,Number(own.stage)||0));
 const role=s.role||'';if(/設計|晶片|IP|材料/.test(role))return 0;if(/晶圓|製造|封装|封裝|設備/.test(role))return 1;if(/系統|整合|品牌|平台|服務|ETF/.test(role))return 3;return 2;
}
function chainHTML(t){
 return `<div class="chain-area"><div class="chain">${(t.stages||['設計／材料','製造／設備','零組件／模組','系統／應用']).map((name,i)=>`<div class="stage"><div class="stage-title">${String(i+1).padStart(2,'0')}　${esc(name)}</div>${members(t.id).filter(s=>stageOf(s,t)===i).map(s=>`<button class="node" data-action="company" data-id="${s.id}" data-market="${marketOf(s)}"><span class="line"><strong>${esc(s.name)}</strong><span class="${tone(s.change)} tiny num">${pct(s.change)}</span></span><span class="line" style="margin-top:5px"><small>${esc(s.id)} · ${esc(s.market)}</small><small>${finite(s.price)?nf(s.price,2):'未取行情'}</small></span><span class="role">${esc(s.role||'自訂分類')}</span></button>`).join('')||'<div class="empty tiny">尚未加入公司</div>'}</div>`).join('')}</div></div>`;
}
function chainPage(){
 const t=theme(activeTheme);
 return head('產業供應鏈','沿價值鏈查看角色，點公司深入研究；水平滑動可查看完整結構。','SUPPLY CHAIN',`<button data-action="add-relation" data-theme="${t.id}">${icon('plus')}加入公司／來源</button>`)
 +`<div class="filterbar"><select id="chain-select" style="max-width:290px">${themes().map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><span class="badge purple">價值鏈角色圖</span><a href="#theme/${t.id}" class="linkbtn">看題材分析 →</a></div><div class="card"><div class="card-head"><h2>${esc(t.name)}</h2><span class="badge">${members(t.id).length} 家 · ${market}</span></div>${chainHTML(t)}<div class="source">箭頭只表示產業流程，並不表示兩公司已確認有客戶／供應商關係。原站授權手繪圖未複製。公司角色可透過「加入公司／來源」修改。</div></div><div class="card pad section"><h3>附來源的研究關係</h3>${relationList(t.id)}</div>`;
}
function relationList(id){
 const rs=user.relations.filter(r=>r.theme===id);return rs.length?rs.map(r=>`<div class="info-row"><span>${esc(stock(r.stock).name||r.stock)} · ${esc(r.note||'研究分類')}</span><span>${sourceLink(r.url,'來源')} <button class="linkbtn danger" data-action="delete-relation" data-id="${r.id}">移除</button></span></div>`).join(''):'<p class="muted tiny">尚未新增已附來源的关系。沒有來源的預置分類僅作待查核研究索引。</p>';
}
function themePage(id){
 const t=theme(id),ss=members(t.id),avg=meanChange(ss);activeTheme=t.id;
 return `<div class="backline"><a href="#themes">← 題材總覽</a></div><div class="theme-highlight"><div class="row between"><div><div class="eyebrow">${esc(t.en)}</div><h2>${esc(t.name)}</h2></div><button data-action="watch-theme" data-id="${t.id}" class="${user.themeWatch.includes(t.id)?'starred':''}">${icon('star')}${user.themeWatch.includes(t.id)?'已收藏':'收藏題材'}</button></div><p>${esc(t.desc)}</p><div class="row wrap"><span class="badge purple">${ss.length} 家索引公司</span><span class="badge">非已查核供應鏈資料庫</span><span class="${tone(avg)} strong">等權漲跌 ${pct(avg)}</span></div></div>
 <div class="subnav section"><a href="#chain" class="linkbtn">完整供應鏈 →</a><button class="smallbtn" data-action="add-relation" data-theme="${t.id}">新增公司／關係來源</button><button class="smallbtn" data-action="theme-watch-all" data-theme="${t.id}">加入成分公司到收藏</button></div>
 <div class="card">${chainHTML(t)}<div class="source">研究角色分層不是已確認的供貨關係；數字僅使用實際取得的行情。</div></div>
 <div class="section-title"><h2>題材公司</h2><span class="badge">${market} · 最新來源日期 ${esc(currentSourceDate())}</span></div><div class="card">${stockTable(ss)}</div>
 <div class="grid g2 section"><div class="card pad"><h3>研究重點</h3><p class="muted">核對產品是否已量產、公司營收占比、客戶集中度與設備投資。題材漲跌不等於公司成長率。</p><button data-action="add-note" data-theme="${t.id}" class="secondary">新增題材研究筆記</button></div><div class="card pad"><h3>來源與關係</h3>${relationList(t.id)}</div></div>`;
}

function companyPage(id,m){
 const s=stock(id);if(!s.name)return empty('尚未收錄此公司','先從搜尋或公司清單選擇。','<a href="#themes">回題材總覽</a>');
 const hist=getFeed('history:'+id).data,key=`history:${id}`,tabs=[['basic','基本資料'],['industry','產業分析'],['finance','財務分析'],['chips','籌碼分析'],['etf','ETF 持倉'],['technical','技術分析'],['news','相關新聞'],['research','研究圖表']];
 return `<div class="backline"><button class="linkbtn" data-action="back">← 返回上一頁</button></div><div class="card pad"><div class="detail-top"><div class="brand-icon">${icon('chip')}</div><div><div class="eyebrow">${esc(s.market)} · ${esc(s.currency||curr(marketOf(s)))}</div><h1>${esc(s.name)} <span class="muted">${esc(id)}</span></h1></div><div class="row"><button class="square ${user.watch.includes(id)?'starred':''}" title="收藏" aria-label="收藏公司" data-action="watch-stock" data-id="${id}">${icon('star')}</button><button class="smallbtn" data-action="add-trade" data-stock="${id}">${icon('plus')}交易</button></div><div class="detail-price"><strong class="${tone(s.change)} num">${nf(s.price,2)}</strong><span class="${tone(s.change)} num">${pct(s.change)}</span> <small>${esc(quoteStamp(s))} · ${marketOf(s)==='TW'?'盤後':'Yahoo 可能延遲'}${s.stale?' · 舊資料':''}</small></div></div><div class="detail-stat"><span>成交量<b>${nf(s.volume,2)} 千股</b></span><span>成交額<b>${money(s.amount)}</b></span><span>股價來源<b>${esc(s.source||'未取得')}</b></span><span>日 K 最新<b>${esc(hist?.rows?.at(-1)?.date||'載入中')}</b></span></div></div>
 <div class="card section"><div class="tabs">${tabs.map(([v,t])=>`<button data-action="company-tab" data-tab="${v}" class="${companyTab===v?'selected':''}">${t}</button>`).join('')}</div><div class="pad">${companyBody(s)}</div></div>`;
}
function companyBody(s){
 const id=s.id,market=marketOf(s),hist=getFeed('history:'+id).data;
 if(companyTab==='basic'){
  const p=companyMap.get(id),val=dataRows('official:valuation').find(x=>x.id===id);
  return `<div class="grid g2"><div><h2>公司基本資料</h2><div class="info-grid">${[['公司名稱',p?.fullName||s.name],['代號',id],['掛牌市場',s.market],['產業代碼',p?.industry||'未取得'],['上市／上櫃日',p?.listed||'未取得'],['已發行普通股數',nf(p?.shares)],['本益比',nf(val?.pe,2)],['股價淨值比',nf(val?.pb,2)],['殖利率',finite(val?.dividendYield)?nf(val.dividendYield,2)+'%':'未取得'],['估值資料日',val?.date||'未取得']].map(([k,v])=>`<div class="info-row"><span>${k}</span><span>${esc(v)}</span></div>`).join('')}</div><p class="tiny muted section">公司資訊來源為官方公開資料；沒有取得的欄位不推算補值。估值為來源揭露值，不表示股票便宜或昂貴。</p></div><div><h2>研究索引</h2><div class="chips">${s.tags.map(t=>`<a href="#theme/${t}" class="tag-name">${esc(theme(t).name)}</a>`).join('')||'<span class="muted">尚未分類</span>'}</div><div class="comment">題材標籤是待查核的研究分類；沒有把預置文字當成公司的正式客戶／產品資料。</div><div class="section row wrap">${sourceLink(p?.website||s.sourceURL,'公司／官方資料')}${market==='TW'?sourceLink('https://mops.twse.com.tw/','公開資訊觀測站'):''}</div><div class="section"><button class="secondary" data-action="company-tab" data-tab="technical">${icon('chart')}查看技術圖表</button></div><div class="section"><button data-action="load-company-data" data-stock="${id}">${icon('refresh')}更新基本資料與估值</button></div></div></div>`;
 }
 if(companyTab==='industry')return `<h2>產業題材與定位</h2><div class="notice warn">${icon('info')}<span>分類待人工查核，不是原站的專有分析、SWOT 或客戶資料庫。你可以新增來源與研究內容。</span></div><div class="grid g3">${s.tags.map(t=>themeCard(theme(t))).join('')||empty('尚未建立題材關聯','從供應鏈頁面加入公司與研究來源。')}</div><div class="section"><button data-action="add-note" data-stock="${id}" class="secondary">記錄產品／客戶／SWOT 研究</button></div>`;
 if(companyTab==='technical'){
  const f=getFeed('history:'+id);
  if(!hist)return f.state==='loading'?loading('正在載入歷史日 K…'):empty('尚無有效日 K',f.error||'點下方重新載入；價格與歷史日 K 分開取得。',`<button class="primary" data-action="load-history" data-stock="${id}">載入歷史日 K</button>`,f.state==='error');
  const all=E.aggregate(hist.rows,chartUnit),bar=all[pinned??all.length-1]||all.at(-1),an=analyses.get(id),met=an?.metrics||{};
  return `<div class="charttools"><div class="segmented">${[['day','日 K'],['week','週 K'],['month','月 K']].map(([v,t])=>`<button data-action="chart-unit" data-value="${v}" class="${chartUnit===v?'selected':''}">${t}</button>`).join('')}</div><div class="row wrap"><div class="segmented">${[30,90,180,500].map(n=>`<button class="${chartRange===n?'selected':''}" data-action="chart-range" data-value="${n}">${n===500?'全部':n+'筆'}</button>`).join('')}</div><button class="smallbtn" data-action="export-history" data-stock="${id}">${icon('download')}日 K CSV</button></div></div><div class="ohlc" id="ohlc">${ohlcText(bar)}</div>${candles(hist.rows,E,{unit:chartUnit,range:chartRange,indicator:chartIndicator,pinned})}<div class="segmented">${[['kd','KD'],['macd','MACD'],['rsi','RSI'],['dmi','DMI']].map(([v,n])=>`<button class="${chartIndicator===v?'selected':''}" data-action="indicator" data-value="${v}">${n}</button>`).join('')}</div><div class="source section">來源 ${esc(hist.source)} · 最新 ${esc(hist.rows.at(-1).date)} · ${hist.rows.length} 筆 · ${market==='TW'?'未還原除權息':'Yahoo OHLC；非含息總報酬'}${hist.excludedCurrentDay?' · 今日未完成 K 線已排除':''} · 點 K 棒釘住十字線。日線技術指標，不是盤中值。</div><div class="grid g4 section">${[['MA20',nf(met.ma20,2)],['RSI(14)',nf(met.rsi,2)],['量比（前20日）',nf(met.volumeRatio,2)],['ATR(14)',nf(met.atr,2)]].map(([k,v])=>`<div class="card pad"><small>${k}</small><h2 class="num" style="margin:8px 0 0">${v}</h2></div>`).join('')}</div><details class="section"><summary>最近 10 筆原始日 K</summary>${rawTable(hist.rows.slice(-10).reverse())}</details>`;
 }
 if(companyTab==='finance')return financeBody(s);
 if(companyTab==='chips')return chipsBody(s);
 if(market!=='TW'&&['etf','news'].includes(companyTab))return empty('本版尚未接此海外資料','Yahoo 本版提供報價與日 K；不以台股資料代替。',sourceLink(s.sourceURL,'查看 Yahoo 公司頁'));
 if(companyTab==='etf')return `<h2>ETF 持倉資料</h2><p class="muted">此接口為 FinMind 主動式 ETF 每日持股，官方列為 Sponsor 會員功能。一般免費 Token 不足以取得；也不涵蓋所有被動式 ETF。</p>${feedContent(`dataset:etf:${id}`,rawTable)} `;
 if(companyTab==='news')return `<h2>公司相關新聞</h2>${feedContent(`dataset:news:${id}`,rows=>rows.slice(0,30).map(r=>`<div class="study"><small>${esc(r.date)} · ${esc(r.source||'FinMind')}</small><h3>${sourceLink(r.link||r.url,r.title||'新聞')}</h3></div>`).join(''))}`;
 if(companyTab==='research')return `<div class="row between"><h2>研究紀錄與圖表</h2><button data-action="add-note" data-stock="${id}" class="primary">${icon('plus')}新增研究</button></div>${notesList(user.notes.filter(n=>n.stock===id))}<div class="section"><button data-action="add-study" data-stock="${id}">新增法說摘要／來源頁碼</button></div>`;
 return '';
}
function ohlcText(b){return b?`<b>${esc(b.date)}</b><span>開 ${nf(b.open,2)}</span><span>高 ${nf(b.high,2)}</span><span>低 ${nf(b.low,2)}</span><span>收 ${nf(b.close,2)}</span><span>量 ${nf(b.volume)} 股</span>`:'';}
function rawTable(rows){
 if(!rows.length)return empty('無資料','來源未提供紀錄。');
 const keys=[...new Set(rows.slice(0,100).flatMap(Object.keys))].filter(k=>!['sourceURL','raw','parts'].includes(k)).slice(0,18);
 return `<div class="table-wrap"><table class="table"><thead><tr>${keys.map(k=>`<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,100).map(r=>`<tr>${keys.map(k=>`<td class="${String(r[k]||'').length>60?'wrapcell':''}">${esc(typeof r[k]==='object'?JSON.stringify(r[k]):r[k]??'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>100?'<p class="table-note">僅顯示前 100 筆；完整資料請由資料來源查閱。</p>':''}`;
}
function financeBody(s){
 if(marketOf(s)!=='TW')return empty('海外財務來源尚未設定','海外價格連線不代表已取得其完整財報。此版本財務接口以台股為主。');
 const key=`dataset:${financeTab}:${s.id}`;
 let body=feedContent(key,rows=>{
  if(financeTab==='revenue'){
   const rs=revenueRows(rows),latest=rs.at(-1);
   return metrics([['最新營收',latest?money(latest.revenue):'—',latest?.period||''],['年增率',pct(latest?.yoy),'與去年同月比較',tone(latest?.yoy)],['月增率',pct(latest?.mom),'與上月比較',tone(latest?.mom)],['取得月份',nf(rs.length),'依營收所屬月份，非公告月份']])+`<div class="section">${barsChart(rs.map(r=>({label:r.period.slice(2),value:r.revenue/1e8})),{unit:'億元'})}</div><div class="table-wrap"><table class="table"><thead><tr><th>所屬月份</th><th>營收（元）</th><th>月增率</th><th>年增率</th><th>來源日期</th></tr></thead><tbody>${rs.slice(-24).reverse().map(r=>`<tr><td>${r.period}</td><td>${nf(r.revenue)}</td><td class="${tone(r.mom)}">${pct(r.mom)}</td><td class="${tone(r.yoy)}">${pct(r.yoy)}</td><td>${esc(r.published)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  if(financeTab==='financials'){
   const eps=rows.filter(r=>r.type==='EPS').sort((a,b)=>a.date.localeCompare(b.date));
   return `<h3>EPS · 來源揭露值</h3>${barsChart(eps.map(r=>({label:r.date,value:Number(r.value)})),{unit:'元／股'})}<div class="comment">下表保留來源科目與數值；本版不自行將累計數誤轉成單季數。跨季比較請先核對來源口徑。</div>${rawTable(rows)}`;
  }return rawTable(rows);
 });
 return `<div class="subnav">${[['revenue','月營收'],['financials','損益／EPS'],['balance','資產負債'],['cashflow','現金流量'],['dividend','股利'],['pe','歷史估值']].map(([v,t])=>`<button class="${financeTab===v?'secondary':''}" data-action="finance-tab" data-tab="${v}">${t}</button>`).join('')}</div>${body}`;
}
function chipsBody(s){
 if(marketOf(s)!=='TW')return empty('此籌碼來源適用台股','不把台灣三大法人或融資券數據套用至海外市場。');
 const key=`dataset:${chipTab}:${s.id}`;
 return `<div class="subnav">${[['institutions','三大法人'],['margin','融資融券'],['holders','集保持股分級'],['shareholding','外資持股']].map(([v,n])=>`<button class="${chipTab===v?'secondary':''}" data-action="chip-tab" data-tab="${v}">${n}</button>`).join('')}</div>${feedContent(key,rows=>{
 if(chipTab==='institutions'){
   const a=chipDays(rows),v=a.at(-1);
   return metrics([['外資買賣超',nf(v?.foreign,1)+' 張',v?.date||'',tone(v?.foreign)],['投信買賣超',nf(v?.trust,1)+' 張',v?.date||'',tone(v?.trust)],['自營商買賣超',nf(v?.dealer,1)+' 張','自營＋避險，不重複計算',tone(v?.dealer)],['三大法人合計',nf(v?.total,1)+' 張',v?.date||'',tone(v?.total)]])+`<div class="section">${lineChart([['外資','foreign'],['投信','trust'],['自營商','dealer']].map(([name,k])=>({name,values:a.map(r=>r[k])})),{labels:a.map(r=>r.date),zero:true,yLabel:'每日法人買賣超（張）'})}</div>${rawTable(a.slice(-20).reverse().map(({date,foreign,trust,dealer,total})=>({日期:date,外資張:foreign,投信張:trust,自營張:dealer,合計張:total})))}`;
 }
 if(chipTab==='margin'){
   const a=[...rows].sort((a,b)=>a.date.localeCompare(b.date));
   return `<h3>融資／融券餘額</h3>${lineChart([{name:'融資餘額',values:a.map(r=>(r.MarginPurchaseTodayBalance==null?null:Number(r.MarginPurchaseTodayBalance)))}],{labels:a.map(r=>r.date),yLabel:'融資餘額（來源單位：張）'})}${lineChart([{name:'融券餘額',values:a.map(r=>(r.ShortSaleTodayBalance==null?null:Number(r.ShortSaleTodayBalance)))}],{height:180,labels:a.map(r=>r.date),yLabel:'融券餘額（來源單位：張）'})}${rawTable(rows.slice(0,30))}`;
 }
 return `<div class="notice">${icon('info')}<span>集保持股分級在 FinMind 官方文件列為 Backer／Sponsor 會員功能。此處保留原始資料，沒有把缺值當 0，也沒有假造大戶進出分數。</span></div>${rawTable(rows)}`;
 })}`;
}

function heatPage(){
 if(market!=='TW'&&heatWeight!=='volume')heatWeight='volume';
 const vals=quotedStocks().filter(s=>heatWeight==='cap'?finite(s.shares)&&s.shares>0:finite(s[heatWeight])&&s[heatWeight]>0)
 .map(s=>({...s,weight:heatWeight==='cap'?s.shares*s.price:s[heatWeight]})).sort((a,b)=>b.weight-a.weight).slice(0,80);
 const blocks=heatMode==='themes'?themes().map(t=>{const ss=members(t.id).filter(s=>finite(s[heatWeight])&&s[heatWeight]>0);return {id:t.id,name:t.name,change:meanChange(ss),weight:ss.reduce((a,s)=>a+s[heatWeight],0),count:ss.length};}).filter(t=>t.weight>0):vals;
 const sum=blocks.reduce((a,b)=>a+b.weight,0);
 const rects=treemap(blocks,0,0,1000,520);
 const tile=r=>{const d=r.data||r.item||r, v=d.change;
   const bg=!finite(v)?'var(--line)':v>0?`rgba(216,66,90,${Math.min(.88,.21+Math.abs(v)*.13)})`:v<0?`rgba(16,147,116,${Math.min(.9,.21+Math.abs(v)*.13)})`:'#7e88a2';
   return `<button class="heat-tile" style="left:${r.x/10}%;top:${r.y/5.2}%;width:${r.w/10}%;height:${r.h/5.2}%;background:${bg};color:${Math.abs(v||0)>1.8?'white':'var(--text)'}" title="${esc(d.name)} ${pct(v)}" data-action="${heatMode==='themes'?'open-theme':'company'}" data-id="${esc(d.id)}">${r.w>65&&r.h>34?`<b>${esc(d.name)}</b><span>${pct(v)}</span>${r.w>95&&r.h>85?`<small>${esc(d.id)}</small>`:''}`:r.w>35&&r.h>20?`<span>${esc(d.id)}</span>`:''}</button>`;
 };
 return head('市場熱力圖','把量價變化放到同一張圖；點選色塊深入公司或題材。','MARKET HEATMAP',
 `<button class="secondary" data-action="rotation">${icon('chart')}題材相對強弱</button>`)
 +notice()+`<div class="toolbar"><div class="segmented">${[['stocks','公司'],['themes','題材']].map(([id,n])=>`<button class="${heatMode===id?'selected':''}" data-action="heat-mode" data-mode="${id}">${n}</button>`).join('')}</div><div class="row"><label for="heat-weight">色塊面積</label><select id="heat-weight"><option value="amount" ${market!=='TW'?'disabled':''} ${heatWeight==='amount'?'selected':''}>成交金額</option><option value="volume" ${heatWeight==='volume'?'selected':''}>成交量</option>${heatMode==='stocks'&&market==='TW'?`<option value="cap" ${heatWeight==='cap'?'selected':''}>估計市值（股數 × 價格）</option>`:''}</select></div><span class="tiny muted">漲跌以資料日為準 · 前 ${blocks.length} 個有效區塊</span></div>
 <div class="card pad">${blocks.length?`<div class="heatbox" style="position:relative;aspect-ratio:1000/520">${rects.map(tile).join('')}</div>`:empty('沒有可繪製的量額資料','選擇成交金額或成交量，並確認行情來源已成功回傳。') }<div class="source">${market!=='TW'?'Yahoo 未提供成交金額，海外熱力圖使用來源成交量；不以價格乘總量假造金額。':''}顏色＝漲跌幅；面積＝${heatWeight==='amount'?'成交金額':heatWeight==='volume'?'成交量':'股數 × 價格估算，股數與價格可能不同日期'}。題材可能重複納入同一公司，不可將各題材加總當全市場規模。缺值不填零，不代表實際資金淨流入。</div></div>
 <div class="section-title"><h2>數據列表</h2><span class="badge">可點擊開啟</span></div>${stockTable(vals.slice(0,30),false)}`;
}
function stockTable(ss,technical=false){
 return `<div class="card table-wrap"><table class="table"><thead><tr><th>公司／代號</th><th>${market==='TW'?'收盤價':'報價'}</th><th>漲跌幅</th><th>${technical?'25 日走勢':'成交金額'}</th>${technical?'<th>MA</th><th>KD</th><th>MACD</th><th>條件狀態</th>':'<th>資料日期</th>'}<th>收藏</th></tr></thead><tbody>${ss.map(s=>{const a=analyses.get(s.id),m=a?.metrics||{};return `<tr><td><button class="textbtn company-name" data-action="company" data-id="${esc(s.id)}" data-market="${marketOf(s)}">${esc(s.name)}</button><small class="block">${esc(s.id)} · ${esc(s.currency||curr(market))}</small></td><td class="num">${nf(s.price,2)}</td><td class="num ${tone(s.change)}">${pct(s.change)}</td><td>${technical?spark((histMap.get(s.id)||[]).slice(-25).map(r=>r.close)):money(s.amount)}</td>${technical?`<td>${typeof m.trend==='boolean'?m.trend?'✓':'－':'?'}</td><td>${finite(m.k)&&finite(m.d)?`${nf(m.k,1)} / ${nf(m.d,1)}`:'?'}</td><td>${finite(m.dif)?nf(m.dif,2):'?'}</td><td><span class="badge ${a?.status==='achieved'?'good':''}">${a?.available?`${nf(a.score)} / 100`:'歷史資料未齊'}</span></td>`:`<td>${esc(s.date||'未取得')}<small class="block muted">${esc(s.time||'')} ${s.stale?'舊資料':''}</small></td>`}<td><button class="square small ${user.watch.includes(s.id)?'starred':''}" data-action="watch-stock" data-id="${esc(s.id)}" aria-label="收藏 ${esc(s.name)}">${icon('star')}</button></td></tr>`;}).join('')||'<tr><td colspan="9">目前沒有符合條件的公司。</td></tr>'}</tbody></table></div>`;
}
function currentMetrics(s){const a=analyses.get(s.id)?.metrics||{};const v=dataRows('official:valuation').find(r=>r.id===s.id),r=dataRows('official:revenue').find(r=>r.id===s.id);return {...a,price:s.price,change:s.change,volume:s.volume,amount:s.amount,pe:v?.pe,pb:v?.pb,dividendYield:v?.dividendYield,yield:v?.dividendYield,revenueYoY:r?.yoy};}
function selectedScreenStocks(){
 let ss=stocks().filter(s=>!screenerQuery||`${s.id} ${s.name}`.toLowerCase().includes(screenerQuery.toLowerCase()));
 if(screenerPreset==='watch')ss=ss.filter(s=>user.watch.includes(s.id));
 if(screenerPreset==='aligned')ss=ss.filter(s=>analyses.get(s.id)?.score===100);
 if(screenerPreset==='rules')ss=ss.filter(s=>E.evaluateRules(currentMetrics(s),screenerRules,screenerJoin).pass===true);
 if(screenerPreset==='missing')ss=ss.filter(s=>!analyses.get(s.id)?.available);
 return ss.sort((a,b)=>(finite(b.amount)?b.amount:-1)-(finite(a.amount)?a.amount:-1));
}
const ruleDefs=()=>({...E.RULE_FIELDS,price:{label:'收盤價'},change:{label:'漲跌幅 %'},volume:{label:'成交量（千股）'},amount:{label:'成交金額'},yield:{label:'殖利率 %'},revenueYoY:{label:'月營收年增 %'}});
function ruleRows(){return screenerRules.map((r,i)=>`<div class="rule"><span class="badge">${i+1}</span><select aria-label="條件欄位 ${i+1}" data-rule="${i}" data-prop="field">${Object.entries(ruleDefs()).map(([k,v])=>`<option value="${k}" ${r.field===k?'selected':''}>${esc(typeof v==='string'?v:v.label||k)}</option>`).join('')}</select><select aria-label="比較方式 ${i+1}" data-rule="${i}" data-prop="op">${['>','>=','<','<=','=','!='].map(op=>`<option value="${esc(op)}" ${r.op===op?'selected':''}>${esc(op)}</option>`).join('')}</select><input aria-label="條件數值 ${i+1}" type="number" step="any" data-rule="${i}" data-prop="value" value="${esc(r.value)}"><button class="square" data-action="remove-rule" data-index="${i}" title="刪除條件">${icon('trash')}</button></div>`).join('');}
function screenerPageHTML(){
 const ss=selectedScreenStocks(),all=stocks(),known=all.filter(s=>analyses.get(s.id)?.available).length,totalPages=Math.max(1,Math.ceil(ss.length/30));screenerPage=Math.min(screenerPage,totalPages-1);
 return head('選股研究工作台','用透明條件縮小研究範圍；分數不是明日上漲機率。','STOCK SCREENER',
 `<button class="secondary" data-action="open-backtest">${icon('chart')}策略回測</button><button class="primary" data-action="scan-history" ${screenerBusy?'disabled':''}>${icon('refresh')}載入本頁前 20 檔日線</button>`)
 +notice()+`<div class="grid g2"><div class="card pad"><div class="row between"><h3>條件積木</h3><select id="rule-join"><option value="all" ${screenerJoin==='all'?'selected':''}>全部符合 AND</option><option value="any" ${screenerJoin==='any'?'selected':''}>任一符合 OR</option></select></div><div class="rule-list">${ruleRows()}</div><div class="row wrap section"><button class="secondary" data-action="add-rule">${icon('plus')}新增條件</button><button class="primary" data-action="apply-rules">套用條件</button><button data-action="save-rules">儲存組合</button></div><div class="tiny muted section">布林條件以 1＝成立、0＝不成立。資料缺少不算符合，也不視為 0。</div></div>
 <div class="card pad"><h3>資料覆蓋與已存組合</h3><div class="metric"><strong class="value">${known}<small> / ${all.length}</small></strong><p>具有足夠歷史資料的公司</p></div><div class="row wrap">${user.rules.map(r=>`<button class="secondary" data-action="load-rules" data-id="${esc(r.id)}">${esc(r.name)}</button>`).join('')||'<small>儲存後可一鍵載入條件組合。</small>'}</div><p class="tiny muted">大量日線需逐檔查詢，可能受到資料商額度限制。本頁不會偷偷掃描整個市場；按鈕只載入目前清單前 20 檔。</p></div></div>
 ${screenerBusy?`<div class="notice section">${icon('refresh')}<span>日線載入 ${scanDone} / ${scanTotal}；各檔成功或錯誤分開記錄。</span><button data-action="stop-scan">停止</button></div>`:''}
 <div class="toolbar section"><div class="segmented">${[['all','全部 '+all.length],['aligned','五條件皆成立'],['rules','套用積木'],['watch','收藏'],['missing','資料未齊']].map(([id,n])=>`<button class="${screenerPreset===id?'selected':''}" data-action="screen-preset" data-mode="${id}">${n}</button>`).join('')}</div><input id="screener-filter" value="${esc(screenerQuery)}" placeholder="名稱或代號"></div>
 <div class="row between section-title"><span>${ss.length} 檔結果 · 第 ${screenerPage+1} / ${totalPages} 頁</span><div class="row"><button data-action="screen-prev" ${screenerPage===0?'disabled':''}>上一頁</button><button data-action="screen-next" ${screenerPage>=totalPages-1?'disabled':''}>下一頁</button><button data-action="export-screen">${icon('download')}CSV</button></div></div>${stockTable(ss.slice(screenerPage*30,screenerPage*30+30),true)}`;
}
function watchPage(){
 const ss=user.watch.map(stock).filter(s=>s.name);return head('我的收藏','公司、題材與研究紀錄共用收藏，不需在不同頁面重建。','MY WATCHLIST',`<button class="primary" data-action="open-search">${icon('plus')}搜尋加入</button>`)
 +notice()+`<div class="section-title"><h2>收藏題材</h2><span>${user.themeWatch.length} 個</span></div><div class="grid g4">${themes().filter(t=>user.themeWatch.includes(t.id)).map(themeCard).join('')||empty('還沒有收藏題材','在題材卡右上角點星號即可保存。','<a href="#themes">探索題材 →</a>')}</div>
 <div class="section-title"><h2>收藏公司</h2><span>${ss.length} 檔 · 可跨市場；行情依各市場來源</span></div>${ss.length?stockTable(ss,true):empty('開始建立研究清單','搜尋代號或從供應鏈選一家公司。','<button class="primary" data-action="open-search">搜尋公司</button>')}`;
}
function portfolioPage(){
 let pp=[];try{pp=ledger(user.trades);}catch(e){return empty('交易資料驗證失敗',e.message);}
 const groups=['TWD','USD','JPY','KRW'].map(c=>{
  const ps=pp.filter(p=>p.currency===c),cost=ps.reduce((a,p)=>a+p.cost,0),realized=ps.reduce((a,p)=>a+p.realized,0);
  const hasMissing=ps.some(p=>p.qty>0&&!finite(stock(p.stock).price)),value=hasMissing?null:ps.reduce((a,p)=>a+p.qty*(stock(p.stock).price||0),0);
  return {c,ps,cost,realized,value,profit:value===null?null:value-cost};
 }).filter(g=>g.ps.length);
 return head('我的持股','移動加權平均成本；買賣以「股」記錄，不是張。','PORTFOLIO & JOURNAL',
 `<button class="secondary" data-action="import-trades">${icon('upload')}匯入 CSV</button><button class="secondary" data-action="export-trades">${icon('download')}匯出交易</button><button class="primary" data-action="add-trade">${icon('plus')}新增交易</button>`)
 +`<div class="notice">${icon('lock')}<span>只儲存在目前瀏覽器，不是券商庫存同步。不同幣別分開統計；沒有假設匯率，也不把缺行情當零市值。</span><button data-action="export-backup">備份</button></div>
 ${groups.length?`<div class="grid g4">${groups.map(g=>`<div class="card metric"><div class="label">${g.c} · 持股成本 ${money(g.cost)}</div><div class="value ${tone(g.profit)}">${money(g.value)}</div><small>目前估值（各檔來源收盤價）</small><div class="row between section"><span>未實現 ${pct(g.cost&&g.profit!==null?g.profit/g.cost*100:null)}</span><span class="${tone(g.profit)}">${money(g.profit)}</span></div><div class="tiny">已實現 ${money(g.realized)}</div></div>`).join('')}</div>`:''}
 <div class="toolbar section"><div class="segmented">${[['holdings','持股總覽'],['trades','交易紀錄'],['notes','研究筆記']].map(([id,n])=>`<button class="${portfolioTab===id?'selected':''}" data-action="portfolio-tab" data-tab="${id}">${n}</button>`).join('')}</div>${portfolioTab==='notes'?'<button class="primary" data-action="add-note">新增筆記</button>':''}</div>
 ${portfolioTab==='trades'?`<div class="card table-wrap"><table class="table"><thead><tr><th>日期</th><th>公司</th><th>買賣</th><th>股數</th><th>價格</th><th>費用＋稅</th><th>幣別</th><th>操作</th></tr></thead><tbody>${[...user.trades].sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt).map(t=>`<tr><td>${esc(t.date)}</td><td>${esc(t.name)} <small>${esc(t.stock)}</small></td><td>${t.side==='buy'?'買入':'賣出'}</td><td>${nf(t.qty)}</td><td>${nf(t.price,2)}</td><td>${nf(t.fee+t.tax,2)}</td><td>${t.currency}</td><td><button data-action="edit-trade" data-id="${esc(t.id)}">修改</button><button data-action="delete-trade" data-id="${esc(t.id)}">刪除</button></td></tr>`).join('')||'<tr><td colspan="8">尚無交易。可以新增一筆真實紀錄，或匯入 CSV。</td></tr>'}</tbody></table></div>`:portfolioTab==='notes'?notesList(user.notes):pp.some(p=>p.qty>0)?`<div class="card table-wrap"><table class="table"><thead><tr><th>公司</th><th>股數</th><th>平均成本</th><th>收盤價／日期</th><th>未實現損益</th><th>報酬率</th><th>動作</th></tr></thead><tbody>${pp.filter(p=>p.qty>0).map(p=>{const s=stock(p.stock),profit=finite(s.price)?p.qty*s.price-p.cost:null;return `<tr><td><a href="#company/${p.stock}/${marketOf(s)}">${esc(p.name)}</a><small class="block">${p.stock} · ${p.currency}</small></td><td>${nf(p.qty)}</td><td>${nf(p.avgCost,2)}</td><td>${nf(s.price,2)}<small class="block">${esc(s.date||'無行情')}</small></td><td class="${tone(profit)}">${money(profit)}</td><td class="${tone(profit)}">${pct(profit!==null?profit/p.cost*100:null)}</td><td><button data-action="add-trade" data-id="${p.stock}">記錄買賣</button></td></tr>`;}).join('')}</tbody></table></div>`:empty('還沒有持股紀錄','輸入買入日期、股數、成交價與費用，即可建立自己的帳本。','<button class="primary" data-action="add-trade">新增第一筆交易</button>')}`;
}
function notesList(ns){return `<div class="grid g3">${ns.map(n=>`<article class="card pad"><div class="row between"><span class="badge">${esc(n.stock||'一般研究')}</span><small>${esc(n.date||'')}</small></div><h3 style="margin-top:14px">${esc(n.title||'研究筆記')}</h3><p class="clamp3">${esc(n.text||n.body||'')}</p><div class="row between">${sourceLink(n.url,'資料來源')}<button data-action="open-note" data-id="${esc(n.id)}">閱讀／修改 →</button></div></article>`).join('')||empty('尚無研究筆記','在任何公司頁按「寫筆記」，或新增一般研究筆記。','<button class="primary" data-action="add-note">新增筆記</button>')}</div>`;}
function allEvents(){
 const es=user.events.map(e=>({...e,manual:true}));
 for(const id of user.watch.slice(0,12)){
  for(const r of dataRows('dataset:dividend:'+id)){
   for(const [field,label] of [['CashExDividendTradingDate','現金除息'],['CashDividendPaymentDate','現金發放'],['StockExDividendTradingDate','股票除權']]){
    const d=String(r[field]||'').slice(0,10);
    if(validDate(d)&&!es.some(e=>e.date===d&&e.stock===id&&e.title===label))es.push({id:`${id}-${field}-${d}`,date:d,title:label,stock:id,source:'FinMind TaiwanStockDividend',manual:false});
   }
  }
 }
 return es.sort((a,b)=>a.date.localeCompare(b.date));
}
function calendarPage(){
 const start=new Date(calendarMonth+'-01T00:00:00Z'),offset=start.getUTCDay(),days=new Date(Date.UTC(start.getUTCFullYear(),start.getUTCMonth()+1,0)).getUTCDate(),es=allEvents().filter(e=>e.date.startsWith(calendarMonth));
 return head('投資事件行事曆','收藏股除權息資料 + 你自己的法說與研究待辦。','EVENT CALENDAR',
 `<button class="secondary" data-action="load-calendar">${icon('refresh')}同步收藏股股利日期</button><button class="secondary" data-action="export-events">${icon('download')}匯出 ICS</button><button class="primary" data-action="add-event">${icon('plus')}新增事件</button>`)
 +`<div class="notice">${icon('info')}<span>自動資料限「收藏清單前 12 檔」的股利日期；來源沒有日期就不建立事件。法說、財報公布、產業展會目前需手動登錄，並非原站全市場事件庫。</span></div>
 <div class="toolbar"><div class="row"><button class="square" data-action="calendar-prev" aria-label="上個月">‹</button><h2>${calendarMonth.replace('-',' 年 ')} 月</h2><button class="square" data-action="calendar-next" aria-label="下個月">›</button><button data-action="calendar-today">本月</button></div><div class="segmented"><button class="${calendarView==='month'?'selected':''}" data-action="calendar-view" data-view="month">月曆</button><button class="${calendarView==='list'?'selected':''}" data-action="calendar-view" data-view="list">清單</button></div></div>
 ${calendarView==='month'?`<div class="card calendar"><div class="weekdays">${'日一二三四五六'.split('').map(n=>`<div>${n}</div>`).join('')}</div><div class="calendar-grid">${Array(offset).fill('<div class="day outside"></div>').join('')}${Array.from({length:days},(_,i)=>{const date=calendarMonth+'-'+String(i+1).padStart(2,'0');return `<div class="day ${date===today()?'today':''}"><button class="day-number" data-action="add-event" data-date="${date}">${i+1}</button>${es.filter(e=>e.date===date).map(e=>`<button class="event" data-action="view-event" data-id="${esc(e.id)}">${esc(e.stock||'')} ${esc(e.title)}</button>`).join('')}</div>`;}).join('')}</div></div>`:`<div class="card">${es.map(e=>`<div class="feed-item"><span class="badge">${esc(e.date)}</span><div class="grow"><h3>${esc(e.stock||'')} ${esc(e.title)}</h3><small>${e.manual?'手動登錄':esc(e.source)}</small></div><button data-action="view-event" data-id="${esc(e.id)}">查看 →</button></div>`).join('')||empty('本月沒有事件','可以新增事件，或先同步收藏股股利日期。')}</div>`}`;
}
function researchPage(route){
 const creator=route==='creators';
 if(creator)return head('財經創作者','收藏可信來源，留下閱讀摘要與查核線索。','CREATOR LIBRARY',`<button class="primary" data-action="add-creator">${icon('plus')}新增來源作者</button>`)
 +`<div class="notice">${icon('info')}<span>不複製原站授權研究圖解或付費文章。這裡保存你自行加入的公開連結與閱讀筆記，不會自動爬取作者全文。</span></div><div class="grid g3">${user.creators.map(c=>`<article class="card pad"><div class="avatar">${esc(c.name?.slice(0,1)||'研')}</div><h2>${esc(c.name)}</h2><p>${esc(c.description||'')}</p><div class="row between">${sourceLink(c.url,'開啟作者頁')}<button data-action="edit-creator" data-id="${esc(c.id)}">編輯</button></div></article>`).join('')||empty('建立自己的來源名單','加入你有權使用的作者網站或公開頻道。','<button class="primary" data-action="add-creator">新增作者</button>')}</div>`;
 return head('法說與研究資料庫','記錄原始出處、頁碼、關鍵數字，並列比較不同季度。','EARNINGS & RESEARCH',`<button class="secondary" data-action="compare-studies">季度比較</button><button class="primary" data-action="add-study">${icon('plus')}新增法說紀錄</button>`)
 +`<div class="notice">${icon('info')}<span>這是可操作的研究整理工具，不是 AIStockMap 的法說內容副本。摘要與數字由你輸入，應附原始簡報連結與頁碼；尚未接 PDF 自動擷取或圖解生成。</span></div>
 <div class="grid g3">${user.studies.map(s=>`<article class="card pad"><div class="row between"><span class="badge">${esc(s.stock||'產業研究')}</span><small>${esc(s.quarter||s.date||'')}</small></div><h2>${esc(s.title)}</h2><p class="clamp3">${esc(s.summary)}</p><div class="source">原始頁碼：${esc(s.page||'未填')} · ${esc(s.date||'')}</div><div class="row between">${sourceLink(s.url,'原始資料')}<button data-action="edit-study" data-id="${esc(s.id)}">閱讀／編輯 →</button></div></article>`).join('')||empty('尚未整理法說','先加入一份公開法說簡報的來源與重點。','<button class="primary" data-action="add-study">新增法說紀錄</button>')}</div>
 <div class="section-title"><h2>相關研究筆記</h2><button data-action="add-note">新增筆記</button></div>${notesList(user.notes)}`;
}
function riskPage(){
 const key='dataset:disposition:',notes=user.notifications;
 return head('處置資訊與個人提醒','公告事實與個人研究提醒分開呈現。','RISK & NOTICES',`<button class="secondary" data-action="retry-feed" data-key="${key}">${icon('refresh')}更新處置資料</button><button class="primary" data-action="add-alert">${icon('bell')}新增價格提醒</button>`)
 +`<div class="notice">${icon('info')}<span>處置名單依來源更新與涵蓋期間顯示；不推測官方處置門檻或「明日一定處置」。價格提醒僅在網頁取得資料時檢查，無背景推播。</span></div>
 <div class="grid g2"><div class="card pad"><h2>我的價格條件</h2>${notes.filter(n=>n.type==='price').map(n=>`<div class="feed-item"><div class="grow"><b>${esc(n.stock)} ${n.op==='above'?'高於或等於':'低於或等於'} ${nf(n.price,2)}</b><p>${n.triggeredAt?'已觸發：'+esc(n.triggeredAt):'等待行情符合條件'}</p></div><button data-action="delete-alert" data-id="${esc(n.id)}">刪除</button></div>`).join('')||empty('沒有價格提醒','先新增一個價格條件。')}</div><div class="card pad"><h2>提醒邊界</h2><p>僅使用已取得的報價與來源時間，可能延遲或不是今天。這不是券商停損單，不會代替你送單。</p><p>法規公告若缺漏或讀取失敗，請以交易所原始公告為準。</p><div class="row wrap">${sourceLink('https://www.twse.com.tw/zh/announcement/notice.html','TWSE 公告')}${sourceLink('https://www.tpex.org.tw/','TPEx 櫃買中心')}</div></div></div>
 <div class="section-title"><h2>近期處置資料</h2><span class="badge">FinMind · Backer／Sponsor 權限 · 查詢區間內</span></div><div class="card pad">${feedContent(key,rows=>rawTable(rows))}</div>`;
}
function currentSummary(id){
 const s=stock(id),a=analyses.get(id),v=dataRows('official:valuation').find(r=>r.id===id),r=dataRows('official:revenue').find(r=>r.id===id);
 return `${s.name||id}（${id}）\n行情來源：${s.source||'未取得'}；日期：${s.date||'未取得'}\n收盤價：${nf(s.price,2)} ${s.currency||curr(market)}；漲跌：${pct(s.change)}\n成交量：${nf(s.volume)} 千股\nMA5：${nf(a?.metrics?.ma5,2)}；MA20：${nf(a?.metrics?.ma20,2)}；RSI：${nf(a?.metrics?.rsi,2)}\n五條件分數：${a?.available?a.score+' / 100（不是勝率）':'資料不足'}\n本益比：${nf(v?.pe,2)}（${v?.date||'未取得'}）\n月營收：${money(r?.revenue)}；年增率：${pct(r?.yoy)}（${r?.period||'未取得'}）\n分類僅研究索引，客戶關係與法說論點尚待查核。`;
}
function aiPage(){
 const id=user.watch.find(x=>marketOf(stock(x))===market)||stocks()[0]?.id||'2330';
 return head('AI 分析與資料摘要','先確認原始數字，再討論待驗證的研究問題。','RESEARCH ASSISTANT')
 +`<div class="notice">${icon('info')}<span>${apiStatus?.aiConfigured?'線上 AI 已填入設定，仍需實際請求驗證模型與額度。':'目前未啟用線上 AI；「資料摘要」為程式整理，不是假裝 AI 生成。'} 不會自動傳送私人交易紀錄或全部研究筆記。</span></div>
 <div class="grid g2"><section class="card pad"><h2>選擇研究對象</h2><label for="ai-stock">公司代號</label><input id="ai-stock" value="${esc(id)}" list="stock-options"><datalist id="stock-options">${stocks().slice(0,300).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</datalist><label for="ai-question">研究問題</label><textarea id="ai-question" rows="5" placeholder="例如：整理已知數據、需要查核的風險，以及下一份法說該追問的問題。"></textarea><div class="row wrap section"><button class="secondary" data-action="data-summary">${icon('note')}產生資料摘要</button><button class="primary" data-action="online-ai" ${aiBusy?'disabled':''}>${icon('spark')}${aiBusy?'正在等待回覆…':'使用線上 AI'}</button></div><label class="checkline section"><input type="checkbox" id="ai-consent"> 同意將問題及此檔公開資料摘要傳送到已設定的 AI 服務，可能產生費用。</label></section>
 <section class="card pad"><div class="row between"><h2>研究輸出</h2><span class="badge">事實／推論需區分</span></div><div id="ai-output" class="prose" style="white-space:pre-wrap">${aiAnswer?esc(aiAnswer):'尚未產生摘要。沒有足夠來源時，會明確保留「未取得」。'}</div></section></div>`;
}
const featureGroups=[
 ['頁面與個股研究','已實作','每日焦點、題材、供應鏈、熱力圖、公司八分頁、全站搜尋、手機導覽與深淺色。'],
 ['量價與公司資料','資料介面已接入','官方盤後行情、公司名錄、月營收、估值、重大訊息；FinMind 日線、法人、資券、財報等。成功與失敗各自顯示，不能把介面存在當作每個來源都已驗收。'],
 ['選股與個人工作台','已實作','AND／OR 條件、日線批次載入、回測、收藏、交易成本、筆記、事件、來源作者、法說季度比較、備份。'],
 ['原站全部產業與研究內容','未包含','20 個可編輯起始題材不是原站全部資料庫；沒有原站授權創作者圖解、完整 AI 研究或付費內容。'],
 ['盤中延遲行情','未包含','預設採官方盤後資料；不冒充原站約延遲 15–20 分鐘的盤中服務，也不沿用舊 MIS 5 秒輪詢。'],
 ['雲端會員與商業服務','未完成','本機儲存，不含會員登入、跨裝置同步、付款訂閱、背景推播。AI 僅為可設定選項。'],
 ['其他未完整對等','未完成','持股圖片辨識、完整法說自動解析、正式處置門檻預測、全市場事件庫、原站私有演算法、即時串流與 ETF 全覆蓋。'],
 ['像素一模一樣','未驗收','依公開導覽與可讀公司頁重建；未取得原站會員畫面的完整視覺樣本，不能宣稱逐像素相同。']
];
function coveragePage(){return head('功能完成範圍','哪些已能操作、哪些需要資料、哪些尚未對等，全部列明。','IMPLEMENTATION STATUS')
 +`<div class="card table-wrap"><table class="table"><thead><tr><th>範圍</th><th>狀態</th><th>實際內容與差異</th></tr></thead><tbody>${featureGroups.map(([a,b,c])=>`<tr><td>${esc(a)}</td><td><span class="badge ${b==='已實作'?'good':''}">${esc(b)}</span></td><td class="wrapcell">${esc(c)}</td></tr>`).join('')}</tbody></table></div><div class="card pad section"><h2>獨立實作，不冒充原站</h2><p>保留相近的研究流程及頁面類型，但不使用 AIStockMap 的商標圖像、私有程式、會員資料或付費研究。來源皆為公開官方資料介面、你自己的 Token 所有權限，以及你自行建立的紀錄。</p><p>部署包可以沿用既有 Netlify 網址。此版本本身不等於已更新你的線上網站。</p></div>`;}
function settingsPage(){
 const checks=[['後端 API',apiStatus?.apiReady?'已回應 v'+apiStatus.version:apiStatus?.error||'等待檢查',apiStatus?.apiReady],
 ['本市場行情',quoteState.state==='success'?`${quotedStocks().length} 檔 · ${currentSourceDate()}`:quoteState.error||'等待資料',quoteState.state==='success'],
 ['FinMind Token',apiStatus?.historicalTokenConfigured?'已填入（不代表付費資料權限）':'未填入；部分歷史資料可能可用',!!apiStatus?.historicalTokenConfigured],
 ['海外資料',apiStatus?.overseasProvider==='Yahoo Finance'?'Yahoo 介接已設定，不用金鑰；不代表已取得行情':'等待新版 Yahoo 後端',!!apiStatus?.overseasConfigured],
 ...['US','JP','KR'].map(m=>{const st=marketStates.get(m);const n=stocks(m).filter(q=>finite(q.price)&&!q.stale).length;return [m+' Yahoo',n?`${n} 檔已取得；詳見個股時間`:st?.error||'尚未請求；點上方市場切換',n>0];}),
 ['線上 AI',apiStatus?.aiConfigured?'設定已填入，待請求驗證':'需 AI 金鑰、模型與網站存取碼',!!apiStatus?.aiConfigured]];
 return head('資料、外觀與備份','不再把「API 回應」與「行情真的取得」混成同一個綠燈。','DATA & SETTINGS',`<button class="primary" data-action="check-connection">${icon('refresh')}重新檢查連線</button>`)
 +`<div class="grid g2"><section class="card pad"><h2>連線診斷</h2>${checks.map(([name,status,ok])=>`<div class="status-row"><span class="dot ${ok?'ok':'error'}"></span><div><b>${esc(name)}</b><p>${esc(status)}</p></div></div>`).join('')}<div class="notice">${icon('info')}<span>新版 API 路徑 <code>/api/atlas/</code>。收到舊版 3.x 狀態或 404，代表線上部署尚未換到此包，不是要重新申請 Token。</span></div><label for="access-code">網站存取碼（選用，不是 FinMind Token）</label><input type="password" id="access-code" placeholder="只有你設定 ATLAS_ACCESS_TOKEN 時才需要" autocomplete="off"><button class="secondary section" data-action="set-access">僅本次開頁使用</button></section>
 <section class="card pad"><h2>顯示設定</h2><div class="formgrid"><div><label for="setting-theme">顏色主題</label><select id="setting-theme">${[['light','淺色'],['dark','深色'],['system','跟隨裝置']].map(([v,n])=>`<option value="${v}" ${user.settings.theme===v?'selected':''}>${n}</option>`).join('')}</select></div><div><label for="setting-font">字級</label><select id="setting-font">${[['normal','一般'],['large','大字'],['largest','最大']].map(([v,n])=>`<option value="${v}" ${user.settings.font===v?'selected':''}>${n}</option>`).join('')}</select></div><div><label for="setting-color">漲跌顏色</label><select id="setting-color"><option value="red" ${user.settings.color==='red'?'selected':''}>紅漲綠跌</option><option value="green" ${user.settings.color==='green'?'selected':''}>綠漲紅跌</option></select></div><div><label for="setting-refresh">開頁時自動重查盤後來源</label><select id="setting-refresh">${[[0,'關閉'],[5,'每 5 分鐘'],[15,'每 15 分鐘'],[30,'每 30 分鐘']].map(([v,n])=>`<option value="${v}" ${Number(user.settings.autoRefresh)===v?'selected':''}>${n}</option>`).join('')}</select></div></div><p class="tiny muted">更新頻率不代表資料商行情頻率；來源不變，價格也不會變。手機休眠不在背景工作。</p><h2 class="section">本機資料管理</h2><div class="row wrap"><button class="primary" data-action="export-backup">${icon('download')}完整備份</button><button class="secondary" data-action="import-backup">${icon('upload')}還原備份</button><button data-action="import-legacy">匯入這台裝置的舊版紀錄</button><button data-action="clear-cache">只清行情快取</button></div><p class="tiny muted">更換網址、瀏覽器、裝置或清除網站資料，不會自動同步帳本。備份含個人筆記與交易，請妥善保管。</p></section></div>
 <div class="section-title"><h2>各資料來源的實際結果</h2><span>${feedStore.size} 個已請求項目</span></div><div class="card table-wrap"><table class="table"><thead><tr><th>資料項目</th><th>狀態</th><th>筆數／錯誤</th><th>操作</th></tr></thead><tbody>${[...feedStore].map(([key,f])=>`<tr><td>${esc(key)}</td><td>${{idle:'未開始',loading:'取得中',success:'成功',error:'失敗'}[f.state]}</td><td class="wrapcell">${f.state==='success'?nf(f.data?.rows?.length||0):esc(f.error||'')}</td><td><button data-action="retry-feed" data-key="${esc(key)}">重試</button></td></tr>`).join('')||'<tr><td colspan="4">開啟公司頁或資料頁後會逐項顯示結果。</td></tr>'}</tbody></table></div>
 <section class="card pad section"><h2>來源與使用方式</h2><p>TWSE／TPEx：盤後行情、公司、估值、營收與公告。FinMind：日線、籌碼與財務資料。來源限流、資料授權與涵蓋範圍會影響結果；有金鑰也不代表每個資料集都有權限。</p><p>公開網站的後端仍可被其他人呼叫並消耗額度。正式個人使用可設定 <code>ATLAS_ACCESS_TOKEN</code> 保護資料端點；不要將 FinMind 或 AI 金鑰填在網頁或 GitHub。</p><div class="row wrap">${sourceLink('https://openapi.twse.com.tw/','TWSE OpenAPI')}${sourceLink('https://www.tpex.org.tw/openapi/','TPEx OpenAPI')}${sourceLink('https://finmind.github.io/','FinMind 文件')}<a href="#coverage">功能缺口與限制 →</a></div></section>`;
}

// Network requests never depend on an optimistic "configured" flag.
// Every source records its own success/error; one failed feed cannot blank all pages.
const sourceTasks=new Map(),marketStates=new Map();let quoteGeneration=0,routeGeneration=0;
async function checkStatus(){
 try{const r=await api.get('status');if(r.version!==VERSION)throw Error(`API 版本 ${r.version||'未知'}；頁面版本 ${VERSION}。請使用新版部署。`);apiStatus=r;}
 catch(e){apiStatus={apiReady:false,error:e.message};}
 render();return apiStatus;
}
async function ensureFeed(key,force=false){
 if(sourceTasks.has(key))return sourceTasks.get(key);
 const old=getFeed(key);if(!force&&old.state==='success')return old.data;if(!force&&old.state==='error')return null;
 const [type,kind,id='']=key.split(':');
 if(type==='history')return loadHistory(kind,force);
 let path;if(type==='official')path='official?kind='+encodeURIComponent(kind);
 else if(type==='dataset')path='dataset?kind='+encodeURIComponent(kind)+(id?'&stock='+encodeURIComponent(id):'');
 else return null;
 feedStore.set(key,{state:'loading',data:old.data});render();
 const task=(async()=>{
  try{
   const data=await api.get(path);
   if(!Array.isArray(data.rows))throw Error('來源格式錯誤：缺少 rows 陣列');
   feedStore.set(key,{state:'success',data});
   if(key==='official:companies')for(const row of data.rows)companyMap.set(row.id,row);
   return data;
  }catch(e){feedStore.set(key,{state:'error',error:e.message,data:old.data});return null;}
  finally{sourceTasks.delete(key);render();}
 })();sourceTasks.set(key,task);return task;
}
const marketJobs=new Map();
function ingestHistories(histories,requestedMarket){
 for(const [id,h] of Object.entries(histories||{})){
  if(h?.market!==requestedMarket||!Array.isArray(h.rows)||h.rows.length<2)continue;
  try{const rows=E.validateBars(h.rows);histMap.set(id,rows);analyses.set(id,E.analyze(rows));feedStore.set('history:'+id,{state:'success',data:{...h,rows}});}
  catch(e){feedStore.set('history:'+id,{state:'error',error:e.message});}
 }
}
async function loadQuotes(force=false,{warm=false}={}){
 const requestMarket=market;
 if(marketJobs.has(requestMarket))return marketJobs.get(requestMarket);
 const job=(async()=>{
  const old=marketStates.get(requestMarket);
  quoteState={state:'loading',error:'',cache:!!old?.cache,progress:0};render();
  const ordered=[...new Set([
   ...(routes()[0]==='company'&&routes()[1]?[routes()[1]]:[]),
   ...user.watch.filter(id=>marketOf(stock(id))===requestMarket),
   ...stocks(requestMarket).map(s=>s.id)
  ])].slice(0,60);
  const groups=requestMarket==='TW'?[null]:Array.from({length:Math.ceil(ordered.length/5)},(_,i)=>ordered.slice(i*5,i*5+5));
  const received=new Map(),warnings=[],histories={};let fetchedAt='',lastError=null,completed=0;
  try{
   if(!groups.length)throw Error('\u8acb\u5148\u641c\u5c0b\u4e26\u52a0\u5165\u672c\u5e02\u5834\u7684\u516c\u53f8\u4ee3\u865f\u3002');
   for(const group of groups){
    // Stop launching more batches after the user changes market.
    if(requestMarket!==market&&completed>0){warnings.push('\u5df2\u5207\u63db\u5e02\u5834\uff0c\u5176\u9918\u6279\u6b21\u5df2\u505c\u6b62\u3002');break;}
    try{
     const data=await api.get('quotes?market='+requestMarket+(group?'&symbols='+encodeURIComponent(group.join(',')):''));
     if(!Array.isArray(data.quotes))throw Error('\u884c\u60c5\u683c\u5f0f\u932f\u8aa4\uff1a\u7f3a\u5c11 quotes');
     for(const q of data.quotes){
      if(q&&typeof q.id==='string'&&typeof q.name==='string'&&marketOf(q)===requestMarket&&(finite(q.price)||q.price===null)){
       const clean={...q,stale:false};quoteMap.set(q.id,clean);received.set(q.id,clean);
      }
     }
     ingestHistories(data.histories,requestMarket);Object.assign(histories,data.histories||{});
     warnings.push(...(data.warnings||[]));fetchedAt=data.fetchedAt||fetchedAt;
     completed+=group?.length||data.quotes.length;
     if(requestMarket===market){quoteState={state:'loading',progress:completed,total:ordered.length};render();}
     if(data.failures?.some(f=>['YAHOO_RATE_LIMIT','YAHOO_ACCESS_DENIED'].includes(f.code)))break;
    }catch(e){
     lastError=e;warnings.push(e.message);completed+=group?.length||0;
     if(requestMarket==='TW'||['YAHOO_RATE_LIMIT','YAHOO_ACCESS_DENIED','YAHOO_NETWORK','YAHOO_TIMEOUT'].includes(e.code)||e.status===401)break;
    }
   }
   const qs=[...received.values()];
   if(!qs.some(q=>finite(q.price)))throw lastError||Error('\u4f86\u6e90\u6c92\u6709\u56de\u50b3\u6709\u6548\u50f9\u683c\u3002');
   for(const [id,q] of quoteMap)if(marketOf(q)===requestMarket&&!received.has(id))quoteMap.set(id,{...q,stale:true});
   const data={quotes:[...quoteMap.values()].filter(q=>marketOf(q)===requestMarket),histories,warnings:[...new Set(warnings)],fetchedAt,provider:requestMarket==='TW'?'TWSE / TPEx':'Yahoo Finance'};
   const state={state:'success',error:'',cache:false,fetchedAt,warnings:data.warnings,received:qs.length,requested:requestMarket==='TW'?qs.length:ordered.length,provider:data.provider};
   marketStates.set(requestMarket,state);cachePut('quotes:'+requestMarket,data);checkPriceAlerts(requestMarket);
   if(requestMarket===market){quoteState=state;render();}
   if(warm&&requestMarket===market){
    const ids=ordered.filter(id=>received.has(id)).slice(0,6);await warmHistories(ids);
   }
   return data;
  }catch(e){
   const stored=cacheGet('quotes:'+requestMarket);
   if(stored?.data?.quotes?.length){
    for(const q of stored.data.quotes)if(q?.id&&q?.name)quoteMap.set(q.id,{...q,stale:true});
    // Historic cached candles remain historic; never re-date them to now.
    ingestHistories(stored.data.histories,requestMarket);
    marketStates.set(requestMarket,{state:'success',cache:true,error:e.message,savedAt:stored.savedAt,warnings:[e.message]});
   }else marketStates.set(requestMarket,{state:'error',error:e.message,cache:false});
   if(requestMarket===market){quoteState=marketStates.get(requestMarket);render();}
   return null;
  }
 })();
 marketJobs.set(requestMarket,job);
 try{return await job;}finally{marketJobs.delete(requestMarket);}
}

async function loadHistory(id,force=false){
 if(!id)return null;const key='history:'+id;if(sourceTasks.has(key))return sourceTasks.get(key);
 if(!force&&histMap.has(id))return getFeed(key).data;
 const old=getFeed(key);if(!force&&old.state==='error')return null;
 feedStore.set(key,{state:'loading',data:old.data});render();
 const task=(async()=>{
  try{
   const r=await api.get('history?stock='+encodeURIComponent(id)+'&market='+marketOf(stock(id)));
   const rows=E.validateBars(r.rows);if(!rows.length)throw Error('此檔沒有有效歷史日線');
   histMap.set(id,rows);analyses.set(id,E.analyze(rows));
   feedStore.set(key,{state:'success',data:{...r,rows}});
   // A history response must not silently relabel quote timestamps or prices.
   return {...r,rows};
  }catch(e){feedStore.set(key,{state:'error',error:e.message,data:old.data});return null;}
  finally{sourceTasks.delete(key);render();}
 })();sourceTasks.set(key,task);return task;
}
async function warmHistories(ids,progress=false){
 let next=0;await Promise.all([0,1].map(async()=>{while(next<ids.length){if(progress&&scanAbort)break;const id=ids[next++];await loadHistory(id);if(progress){scanDone++;render();}}}));
}
async function scanHistories(){
 if(screenerBusy)return;screenerBusy=true;scanAbort=false;scanDone=0;
 // If a rules filter currently has zero candidates, load from the search scope.
 let candidates=selectedScreenStocks();if(!candidates.length)candidates=stocks().filter(s=>!screenerQuery||`${s.id} ${s.name}`.includes(screenerQuery));
 const ids=candidates.slice(screenerPage*30,screenerPage*30+20).map(s=>s.id);scanTotal=ids.length;render();
 await warmHistories(ids,true);screenerBusy=false;render();toast(scanAbort?'已停止後續查詢':'這批日線已處理；失敗項目可在資料設定重試。');
}
function checkPriceAlerts(m){
 let changed=false;for(const a of user.notifications.filter(n=>n.type==='price'&&!n.triggeredAt)){
  const s=stock(a.stock);if(marketOf(s)!==m||!finite(s.price)||s.stale)continue;
  if(a.op==='above'?s.price>=a.price:s.price<=a.price){a.triggeredAt=`${s.date}，價 ${s.price}（${s.source}）`;changed=true;toast(`${a.stock} 符合你設定的報價條件；資料日 ${s.date}`);}
 }if(changed)save();
}
function setAutoRefresh(){
 clearInterval(refreshTimer);const mins=Number(user.settings.autoRefresh);
 if(mins>0)refreshTimer=setInterval(()=>{if(!document.hidden&&quoteState.state!=='loading')loadQuotes();},mins*60000);
}
function onRoute(){
 routeGeneration++;const [r,id,m]=routes();
 if(r==='company'&&['TW','US','JP','KR'].includes(m)&&market!==m){market=m;quoteState=marketStates.get(m)||{state:'loading'};loadQuotes();}
 render();
 if(r==='focus'||r===''){
  ensureFeed('official:index');if(feedTab==='announcements')ensureFeed('official:announcements');if(feedTab==='news')ensureFeed('dataset:news:');
 }
 if(['themes','theme','chain','screener','radar','company','companies'].includes(r))ensureFeed('official:companies');
 if(r==='company'&&id){
  if(market!=='TW'){ensureCompanyQuote(id,market);if(companyTab==='technical')loadHistory(id);return;}
  if(companyTab==='basic'){ensureFeed('official:valuation');ensureFeed('official:revenue');}
  if(companyTab==='technical')loadHistory(id);
  if(companyTab==='finance')ensureFeed('dataset:'+financeTab+':'+id);
  if(companyTab==='chips')ensureFeed('dataset:'+chipTab+':'+id);
  if(companyTab==='etf')ensureFeed('dataset:etf:'+id);
  if(companyTab==='news')ensureFeed('dataset:news:'+id);
 }
 if(r==='screener'||r==='radar'){ensureFeed('official:valuation');ensureFeed('official:revenue');}
 if(r==='risk')ensureFeed('dataset:disposition:');
}
function navigate(route){closeModal();if(location.hash==='#'+route)onRoute();else location.hash=route;}
function showModal(title,html,{wide=false}={}){
 modalReturn=document.activeElement;
 $('#modal-root').innerHTML=`<div class="modal-overlay" role="presentation"><section class="dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header><h2 id="modal-title">${esc(title)}</h2><button class="square" data-action="close-modal" aria-label="關閉">${icon('close')}</button></header><div class="dialog-body">${html}</div></section></div>`;
 document.body.style.overflow='hidden';setTimeout(()=>$('input,textarea,select,button',$('.dialog-body'))?.focus(),20);
}
function closeModal(){$('#modal-root').innerHTML='';document.body.style.overflow='';modalReturn?.isConnected&&modalReturn.focus?.({preventScroll:true});}
function field(name,label,value='',type='text',attrs=''){return `<div><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}></div>`;}
function area(name,label,value='',attrs=''){return `<div class="full"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" rows="5" ${attrs}>${esc(value)}</textarea></div>`;}
function form(id,body,footer='儲存'){return `<form id="${id}"><div class="formgrid">${body}</div><div id="form-error" class="error-text" role="alert"></div><div class="dialog-actions"><button type="button" data-action="close-modal">取消</button><button class="primary" type="submit">${footer}</button></div></form>`;}
function formError(e){const box=$('#form-error');if(box)box.textContent=e.message||String(e);else toast(e.message||String(e),true);}
function modalSearch(){
 showModal('搜尋公司與題材',`<input id="search-input" placeholder="${market==='TW'?'台積電、2330、CoWoS':market==='US'?'AAPL, NVDA, Apple':market==='JP'?'7203.T, Toyota':'005930.KS, Samsung'}"  autocomplete="off"><div class="source">搜尋目前公司目錄與研究題材，不查閱原站會員資料。</div><div id="search-results"></div>`,{wide:true});renderSearch('');
}
let remoteSearch={query:'',market:'',results:[],error:'',loading:false};
function renderSearch(query){
 const q=query.trim().toLowerCase(),local=stocks().filter(s=>!q||`${s.id} ${s.name} ${s.fullName||''}`.toLowerCase().includes(q)).slice(0,30),ts=themes().filter(t=>q&&`${t.name} ${t.id} ${t.desc||''}`.toLowerCase().includes(q));
 const remote=remoteSearch.query===q&&remoteSearch.market===market?remoteSearch:{results:[],loading:false,error:''};
 const ss=[...new Map([...local,...remote.results].map(s=>[s.id,s])).values()];
 const body=ts.map(t=>`<button class="search-result" data-action="open-theme" data-id="${esc(t.id)}"><span>${icon('map')} ${esc(t.name)}</span><span class="badge">\u984c\u6750</span></button>`).join('')+ss.map(s=>`<div class="search-result"><button class="textbtn" data-action="company" data-id="${esc(s.id)}" data-market="${marketOf(s)}"><b>${esc(s.name)}</b><small> ${esc(s.id)} \u00b7 ${esc(s.market)}</small></button><button class="square ${user.watch.includes(s.id)?'starred':''}" data-action="watch-stock" data-id="${esc(s.id)}">${icon('star')}</button></div>`).join('');
 $('#search-results').innerHTML=(market!=='TW'?`<div class="notice"><span>${esc(market)}\uff1a\u53ef\u8f38\u5165 AAPL\u30017203.T\u3001005930.KS\u3001247540.KQ \u7b49\u5c0d\u61c9\u5e02\u5834\u4ee3\u865f\u3002</span><button class="secondary" data-action="search-yahoo" ${!q||remote.loading?'disabled':''}>${remote.loading?'\u67e5\u8a62\u4e2d\u2026':'\u5f9e Yahoo \u67e5\u8a62'}</button></div>`:'')+(remote.error?`<div class="notice error">${esc(remote.error)}</div>`:'')+(body||empty('\u6c92\u6709\u7b26\u5408\u7684\u672c\u6a5f\u516c\u53f8','\u6d77\u5916\u516c\u53f8\u53ef\u6309\u4e0a\u65b9 Yahoo \u67e5\u8a62\uff1b\u8acb\u78ba\u8a8d\u5df2\u9078\u5c0d\u5e02\u5834\u3002'));
}
async function searchFromYahoo(){
 const input=$('#search-input'),query=input?.value.trim()||'',requestedMarket=market;
 if(!query)return;
 remoteSearch={query:query.toLowerCase(),market:requestedMarket,results:[],error:'',loading:true};renderSearch(query);
 try{
  const data=await api.get('search?market='+requestedMarket+'&q='+encodeURIComponent(query));
  if(!Array.isArray(data.results))throw Error('Yahoo search response is invalid.');
  const results=data.results.filter(x=>x.id&&x.name&&marketOf(x)===requestedMarket);
  for(const result of results)companyMap.set(result.id,result);
  remoteSearch={query:query.toLowerCase(),market:requestedMarket,results,error:'',loading:false};
 }catch(e){remoteSearch={query:query.toLowerCase(),market:requestedMarket,results:[],error:e.message,loading:false};}
 if($('#search-input')&&market===requestedMarket)renderSearch($('#search-input').value);
}
async function ensureCompanyQuote(id,m){
 if(m==='TW'||finite(quoteMap.get(id)?.price)||sourceTasks.has('quote:'+id))return;
 const task=(async()=>{
  try{
   const data=await api.get('quotes?market='+m+'&symbols='+encodeURIComponent(id));
   for(const q of data.quotes||[])if(q.id&&q.name&&marketOf(q)===m)quoteMap.set(q.id,{...q,stale:false});
   ingestHistories(data.histories,m);
   if(m===market&&quoteState.state==='error'){quoteState={state:'success',cache:false,warnings:data.warnings||[],provider:'Yahoo Finance'};marketStates.set(m,quoteState);}
  }catch(e){if(m===market)toast(e.message,true);}
  finally{sourceTasks.delete('quote:'+id);render();}
 })();sourceTasks.set('quote:'+id,task);return task;
}

function tradeModal(id='',edit=''){
 const t=edit?user.trades.find(x=>x.id===edit):null,s=stock(id||t?.stock||'2330');
 showModal(t?'修改交易':'新增交易',form('trade-form',`<input type="hidden" name="id" value="${esc(t?.id||'')}">${field('stock','公司代號',t?.stock||id||'','text','required maxlength="16"')}${field('name','公司名稱',t?.name||s.name||'','text','maxlength="100"')}${field('date','成交日期',t?.date||today(),'date','required max="'+today()+'"')}<div><label for="f-side">買賣別</label><select id="f-side" name="side"><option value="buy">買入</option><option value="sell" ${t?.side==='sell'?'selected':''}>賣出</option></select></div>${field('qty','股數（不是張）',t?.qty||'','number','required min="1" step="1"')}${field('price','成交價格',t?.price||'','number','required min="0.000001" step="any"')}${field('fee','手續費',t?.fee??0,'number','min="0" step="any"')}${field('tax','交易稅／其他成本',t?.tax??0,'number','min="0" step="any"')}<div><label for="f-currency">幣別</label><select name="currency" id="f-currency">${['TWD','USD','JPY','KRW'].map(c=>`<option value="${c}" ${(t?.currency||s.currency||curr(market))===c?'selected':''}>${c}</option>`).join('')}</select></div><p class="tiny">不自動填入法定費率。填你實際支付的費用；賣出超過當時持股會拒絕儲存。</p>`));
}
function noteModal(id='',stockId=''){
 const n=user.notes.find(x=>x.id===id);
 showModal(n?'研究筆記':'新增研究筆記',form('note-form',`<input type="hidden" name="id" value="${esc(n?.id||'')}">${field('title','標題',n?.title||'','text','required maxlength="180"')}${field('stock','公司代號（可留空）',n?.stock||stockId,'text','maxlength="16"')}${field('date','記錄日期',n?.date||today(),'date','required')}${field('url','公開資料來源連結',n?.url||'','url')}${area('text','研究內容',n?.text||n?.body||'','required maxlength="20000"')}`)+`${n?`<button class="danger" data-action="delete-note" data-id="${esc(n.id)}">刪除筆記</button>`:''}`);
}
function studyModal(id='',stockId=''){
 const s=user.studies.find(x=>x.id===id);
 showModal(s?'編輯法說研究':'新增法說研究',form('study-form',`<input type="hidden" name="id" value="${esc(s?.id||'')}">${field('title','研究標題',s?.title||'','text','required maxlength="180"')}${field('stock','公司代號',s?.stock||stockId,'text','required maxlength="16"')}${field('quarter','季度（例 2026Q2）',s?.quarter||'','text','required pattern="[0-9]{4}Q[1-4]"')}${field('date','法說／整理日期',s?.date||today(),'date','required')}${field('url','原始簡報或公告連結',s?.url||'','url','required')}${field('page','原始頁碼',s?.page||'','text','maxlength="100"')}${area('summary','重點摘要（自己整理）',s?.summary||'','required maxlength="20000"')}${field('revenue','營收（同公司比較請統一幣別／單位）',s?.revenue??'','number','step="any"')}${field('eps','EPS',s?.eps??'','number','step="any"')}${field('margin','毛利率 %',s?.margin??'','number','step="any"')}${field('unit','營收幣別與單位',s?.unit||'TWD 元','text','required maxlength="60"')}`)+`${s?`<button class="danger" data-action="delete-study" data-id="${esc(s.id)}">刪除此紀錄</button>`:''}`,{wide:true});
}
function creatorModal(id=''){
 const c=user.creators.find(x=>x.id===id);
 showModal('來源作者',form('creator-form',`<input type="hidden" name="id" value="${esc(id)}">${field('name','作者／來源名稱',c?.name||'','text','required maxlength="150"')}${field('url','公開網站／頻道連結',c?.url||'','url','required')}${area('description','關注領域與使用授權備註',c?.description||'','maxlength="5000"')}`)+`${c?`<button class="danger" data-action="delete-creator" data-id="${esc(id)}">移除作者</button>`:''}`);
}
function eventModal(id='',date=''){
 const e=allEvents().find(x=>x.id===id);
 if(e&&!e.manual){showModal('來源事件',`<span class="badge">${esc(e.date)}</span><h2>${esc(stock(e.stock).name||e.stock)} · ${esc(e.title)}</h2><p>來源：${esc(e.source)}</p><p>這是資料來源事件，不可直接修改。請核對公司最新公告。</p>`);return;}
 showModal(e?'編輯事件':'新增事件',form('event-form',`<input type="hidden" name="id" value="${esc(e?.id||'')}">${field('title','事件標題',e?.title||'','text','required maxlength="180"')}${field('date','事件日期',e?.date||date||today(),'date','required')}${field('stock','公司代號（可留空）',e?.stock||'','text','maxlength="16"')}${field('url','資料來源',e?.url||'','url')}${area('note','備註',e?.note||'','maxlength="10000"')}`)+`${e?`<button class="danger" data-action="delete-event" data-id="${esc(e.id)}">刪除事件</button>`:''}`);
}
function themeModal(){
 showModal('新增自訂題材',form('theme-form',field('name','題材名稱','','text','required maxlength="80"')+area('desc','研究範圍與分類依據','','required maxlength="2000"')+field('url','分類資料來源（選用）','','url')));
}
function relationModal(){
 showModal('加入公司與來源',form('relation-form',`<div><label for="f-theme">題材</label><select name="theme" id="f-theme">${themes().map(t=>`<option value="${t.id}" ${t.id===activeTheme?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div>${field('stock','公司代號','','text','required maxlength="16"')}<div><label for="f-stage">供應鏈層級</label><select name="stage" id="f-stage">${['設計／材料','製造／設備','零組件／模組','系統／應用'].map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select></div>${field('url','佐證的公司公告／公開來源','','url','required')}${area('note','分類依據（不是未經查證的供貨承諾）','','required maxlength="3000"')}`));
}
function alertModal(){showModal('新增報價條件提醒',form('alert-form',field('stock','公司代號','','text','required maxlength="16"')+`<div><label for="f-op">條件</label><select name="op" id="f-op"><option value="above">報價 ≥</option><option value="below">報價 ≤</option></select></div>`+field('price','觸發價格','','number','required min="0.000001" step="any"')+'<p class="tiny">只在此網頁取得行情時檢查；不是盤中即時預警或自動停損。</p>'));}
function compareStudies(){
 if(user.studies.length<2){toast('請先建立至少兩份法說研究紀錄。');return;}
 showModal('同公司季度比較',`<div class="formgrid"><div><label>基期</label><select id="compare-a">${user.studies.map(s=>`<option value="${s.id}">${esc(s.stock+' '+s.quarter+' '+s.title)}</option>`).join('')}</select></div><div><label>比較期</label><select id="compare-b">${user.studies.map((s,i)=>`<option value="${s.id}" ${i===1?'selected':''}>${esc(s.stock+' '+s.quarter+' '+s.title)}</option>`).join('')}</select></div></div><div id="study-comparison"></div>`,{wide:true});renderStudyComparison();
}
function renderStudyComparison(){
 const a=user.studies.find(s=>s.id===$('#compare-a').value),b=user.studies.find(s=>s.id===$('#compare-b').value);
 if(a.stock!==b.stock){$('#study-comparison').innerHTML=empty('請選同一家公司','不同公司不做季度增減率比較。');return;}
 const rows=[['營收','revenue'],['EPS','eps'],['毛利率 %','margin']];
 $('#study-comparison').innerHTML=`<div class="notice section">${icon('info')}<span>這是你輸入的研究數字，未自動查核。營收單位不同不計算變化；基期為負值不計算成長率。</span></div><table class="table"><thead><tr><th>項目</th><th>${esc(a.quarter)}</th><th>${esc(b.quarter)}</th><th>變化</th></tr></thead><tbody>${rows.map(([n,k])=>`<tr><td>${n}</td><td>${nf(a[k],2)}</td><td>${nf(b[k],2)}</td><td>${k==='margin'?nf(finite(a[k])&&finite(b[k])?b[k]-a[k]:null,2)+' 百分點':pct(finite(a[k])&&a[k]>0&&finite(b[k])&&(k!=='revenue'||a.unit===b.unit)?(b[k]/a[k]-1)*100:null)}</td></tr>`).join('')}</tbody></table><p>${sourceLink(a.url,'基期原始來源')}（${esc(a.unit)}）　${sourceLink(b.url,'比較期來源')}（${esc(b.unit)}）</p>`;
}

function backtestModal(){
 const id=routes()[0]==='company'?routes()[1]:user.watch[0]||'2330';
 showModal('策略回測（獨立規則，不是原站演算法）',form('backtest-form',field('stock','公司代號',id,'text','required maxlength="16"')+`<div><label for="f-strategy">策略</label><select name="strategy" id="f-strategy">${[['trend','MA 多頭'],['breakout','突破前 20 日高點'],['kd','KD 交叉'],['dmi','DMI 交叉'],['macd','MACD 交叉']].map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select></div>`+field('capital','初始資金',1000000,'number','required min="1" step="any"')+field('holdBars','持有交易日上限',20,'number','required min="1" max="250" step="1"')+field('feePct','單邊手續費 %（自行輸入）',0,'number','required min="0" max="10" step="any"')+field('taxPct','賣出稅費 %（自行輸入）',0,'number','required min="0" max="10" step="any"')+field('slippagePct','單邊滑價 %',0.1,'number','required min="0" max="10" step="any"')+field('stopPct','停損幅度 %',8,'number','required min="0.01" max="50" step="any"')+field('targetPct','停利幅度 %',15,'number','required min="0.01" max="50" step="any"')+'<p class="tiny full">先用 60 筆暖機。收盤訊號下一交易日開盤成交，同根碰停損及停利採先停損。依來源 OHLC，非含息總報酬；不模擬漲跌停無法成交／容量限制，不可用這個結果保證獲利。</p>','執行回測')+'<div id="backtest-output"></div>',{wide:true});
}
function showBacktest(result,id){
 const el=$('#backtest-output');if(!el)return;
 if(result.error){el.innerHTML=empty('回測無法執行',result.error);return;}
 // Keep raw accounting labels explicit; do not advertise win probability.
 el.innerHTML=`<div class="section"><h2>${esc(stock(id).name||id)} 回測結果</h2>${metrics([['淨報酬',pct(result.totalReturn),'含輸入費率與滑價',tone(result.totalReturn)],['最大回撤',pct(result.maxDrawdown),'依回測權益曲線'],['完成交易',nf(result.trades?.length),'樣本越少不確定性越高'],['樣本區間',esc(result.equity?.[0]?.date||''),result.equity?.at(-1)?.date||'']])}${result.trades?.length<100?'<div class="notice">完成交易少於 100 筆，樣本不足；這不是可靠的勝率估計。</div>':''}${lineChart([{name:'回測權益',values:(result.equity||[]).map(v=>v.value??v.equity)}],{labels:(result.equity||[]).map(v=>v.date),yLabel:'策略權益（資金單位）'})}${rawTable((result.trades||[]).slice(-80))}<div class="source">來源：${esc(getFeed('history:'+id).data?.source||'')}；依來源 OHLC，非含息總報酬。以最後一筆收盤結清剩餘持股，詳見原始交易明細。</div></div>`;
}
function rotationModal(){
 const points=themes().map(t=>{
  const parts=members(t.id).map(s=>histMap.get(s.id)).filter(r=>r?.length>=65);
  if(!parts.length)return null;const ratios=parts.map(rows=>{
   const end=Math.min(rows.length-1,Math.max(60,Math.floor((rows.length-1)*rotationStep/100)));
   return {x:(rows[end].close/rows[end-60].close-1)*100,y:(rows[end].close/rows[end-20].close-1)*100};
  });return {...t,x:ratios.reduce((a,b)=>a+b.x,0)/ratios.length,y:ratios.reduce((a,b)=>a+b.y,0)/ratios.length,n:parts.length};
 }).filter(Boolean);
 const max=Math.max(10,...points.flatMap(p=>[Math.abs(p.x),Math.abs(p.y)])),xx=v=>400+v/max*335,yy=v=>230-v/max*170;
 showModal('題材相對價格表現',`<p>橫軸＝60 日漲跌；縱軸＝20 日漲跌。只使用已載入歷史資料的成分股，以等權平均計算；不是原站 RRG 或實際資金流。</p>${points.length?`<svg class="chart" viewBox="0 0 800 470" role="img" aria-label="題材60日與20日漲跌散布圖"><rect x="60" y="40" width="680" height="360" rx="12" fill="var(--soft)"/><path d="M400 40V400M60 230H740" stroke="var(--line)" stroke-width="2"/><text x="660" y="445" fill="var(--muted)" font-size="13">60 日漲跌 →</text><text x="65" y="25" fill="var(--muted)" font-size="13">20 日漲跌 ↑</text>${points.map(p=>`<g><circle cx="${xx(p.x)}" cy="${yy(p.y)}" r="${Math.min(12,5+p.n)}" fill="var(--accent)" opacity=".75"/><text x="${xx(p.x)+12}" y="${yy(p.y)+4}" fill="var(--text)" font-size="12">${esc(p.name)}（${p.n}）</text></g>`).join('')}</svg><label>樣本位置 ${rotationStep}%</label><input id="rotation-range" type="range" min="65" max="100" value="${rotationStep}">`:empty('歷史資料不足','請先在選股頁載入一些公司的日線。')}`,{wide:true});
}
function readLocalFile(accept,onRead){
 const input=document.createElement('input');input.type='file';input.accept=accept;input.addEventListener('change',async()=>{try{const file=input.files?.[0];if(!file)return;if(file.size>10*1024*1024)throw Error('檔案不可超過 10 MB');await onRead(await file.text());}catch(e){toast(e.message,true);}});input.click();
}
function exportBackup(){download('ATLAS-backup-'+today()+'.json',JSON.stringify(user,null,2),'application/json');}
function icsEscape(v){return String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function exportEvents(){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ATLAS//Research Calendar//ZH-TW','CALSCALE:GREGORIAN'];
 for(const e of allEvents()){const d=e.date.replaceAll('-','');lines.push('BEGIN:VEVENT','UID:'+icsEscape(e.id)+'@atlas.local','DTSTAMP:'+today().replaceAll('-','')+'T000000Z','DTSTART;VALUE=DATE:'+d,'SUMMARY:'+icsEscape((e.stock?e.stock+' ':'')+e.title),'DESCRIPTION:'+icsEscape((e.note||'')+(e.url?'\n'+e.url:'')),'END:VEVENT');}lines.push('END:VCALENDAR');download('ATLAS-events.ics',lines.join('\r\n'),'text/calendar;charset=utf-8');
}
function upsert(list,value){const index=list.findIndex(v=>v.id===value.id);if(index<0)list.push(value);else list[index]=value;}
function nonemptyURL(url){if(url&&!safeURL(url))throw Error('來源必須為有效的 http 或 https 公開網址');return safeURL(url);}
function validID(id,optional=false){if(!id&&optional)return '';if(!/^[\w.-]{1,16}$/.test(id)||['constructor','prototype','__proto__'].includes(id))throw Error('公司代號格式錯誤');return id;}
async function handleSubmit(event){
 const f=event.target;if(!(f instanceof HTMLFormElement))return;event.preventDefault();const x=Object.fromEntries(new FormData(f)),formID=f.getAttribute('id');
 try{
  if(formID==='trade-form'){
   const prior=user.trades.find(t=>t.id===x.id),s=stock(x.stock);
   const t=validateTrade({...x,id:x.id||uid(),name:x.name||s.name||x.stock,createdAt:prior?.createdAt||Date.now()});
   const next=user.trades.filter(v=>v.id!==t.id);next.push(t);ledger(next);user.trades=next;
  }else if(formID==='note-form'){
   if(!validDate(x.date))throw Error('日期無效');validID(x.stock,true);
   upsert(user.notes,{...x,id:x.id||uid(),url:nonemptyURL(x.url)});
  }else if(formID==='study-form'){
   validID(x.stock);if(!validDate(x.date)||!/^\d{4}Q[1-4]$/.test(x.quarter))throw Error('日期或季度格式錯誤');
   const v={...x,id:x.id||uid(),url:nonemptyURL(x.url)};
   for(const k of ['revenue','eps','margin']){v[k]=x[k].trim()===''?null:Number(x[k]);if(v[k]!==null&&!finite(v[k]))throw Error('數字格式錯誤');}
   upsert(user.studies,v);
  }else if(formID==='creator-form')upsert(user.creators,{...x,id:x.id||uid(),url:nonemptyURL(x.url)});
  else if(formID==='event-form'){validID(x.stock,true);if(!validDate(x.date))throw Error('事件日期無效');upsert(user.events,{...x,id:x.id||uid(),url:nonemptyURL(x.url)});}
  else if(formID==='theme-form')user.customThemes.push({...x,id:'theme-'+uid().slice(0,24),icon:'map',stages:['設計／材料','製造／設備','零組件／模組','系統／應用'],url:nonemptyURL(x.url)});
  else if(formID==='relation-form'){validID(x.stock);if(!stock(x.stock).name)throw Error('公司不在目前目錄；請先載入公司資料或檢查代號');if(!themes().some(t=>t.id===x.theme))throw Error('題材無效');user.relations=user.relations.filter(r=>!(r.theme===x.theme&&r.stock===x.stock));user.relations.push({...x,id:uid(),stage:Number(x.stage),url:nonemptyURL(x.url)});}
  else if(formID==='alert-form'){validID(x.stock);const price=Number(x.price);if(!finite(price)||price<=0)throw Error('價格必須大於零');user.notifications.push({...x,price,id:uid(),type:'price'});}
  else if(formID==='rules-form'){user.rules.push({id:uid(),name:x.name,rules:structuredClone(screenerRules),join:screenerJoin});}
  else if(formID==='backtest-form'){
   validID(x.stock);for(const k of ['capital','holdBars','feePct','taxPct','slippagePct','stopPct','targetPct']){x[k]=Number(x[k]);if(!finite(x[k]))throw Error('回測參數無效');}
   const b=$('button[type=submit]',f);b.disabled=true;b.textContent='取得日線／計算中…';
   try{await loadHistory(x.stock);const result=E.backtest(histMap.get(x.stock)||[],x);backtestResult={...result,stock:x.stock};showBacktest(result,x.stock);}
   finally{if(b.isConnected){b.disabled=false;b.textContent='執行回測';}}return;
  }else return;
  save();closeModal();render();toast('已儲存於這個瀏覽器。');
 }catch(e){formError(e);}
}
async function doAction(el){
 const a=el.dataset.action,id=el.dataset.id||el.dataset.stock||el.dataset.theme||'',tab=el.dataset.tab||'';
 try{
  if(a==='close-modal'){closeModal();return;}
  if(a==='nav'){navigate(el.dataset.route);return;}
  if(a==='company'){companyTab='basic';pinned=null;navigate('company/'+encodeURIComponent(id)+'/'+(el.dataset.market||marketOf(stock(id))));return;}
  if(a==='open-theme'){activeTheme=id;navigate('theme/'+id);return;}
  if(a==='back'){navigate('themes');return;}
  if(a==='open-search'){modalSearch();return;}
  if(a==='search-yahoo'){await searchFromYahoo();return;}
  if(a==='market'){
   market=el.dataset.market;if(market!=='TW')heatWeight='volume';try{sessionStorage.setItem('atlas-map-market',market);}catch{}quoteState=marketStates.get(market)||{state:'loading'};screenerPage=0;
   if(routes()[0]==='company')navigate('themes');else render();loadQuotes(false,{warm:true});return;
  }
  if(a==='toggle-theme'){user.settings.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';save();render();return;}
  if(a==='refresh'){await loadQuotes(true,{warm:true});return;}
  if(a==='check-connection'){await Promise.all([checkStatus(),loadQuotes(true)]);return;}
  if(a==='set-access'){api.access=$('#access-code').value.trim();$('#access-code').value='';for(const [k,v]of feedStore)if(v.state==='error')feedStore.delete(k);await Promise.all([checkStatus(),loadQuotes(true,{warm:true})]);onRoute();return;}
  if(a==='retry-feed'){await ensureFeed(el.dataset.key,true);return;}
  if(a==='watch-stock'){user.watch=user.watch.includes(id)?user.watch.filter(x=>x!==id):[...user.watch,id];save();render();if($('#search-input'))renderSearch($('#search-input').value);return;}
  if(a==='watch-theme'){user.themeWatch=user.themeWatch.includes(id)?user.themeWatch.filter(x=>x!==id):[...user.themeWatch,id];save();render();return;}
  if(a==='theme-category'){category=el.dataset.value;render();return;}
  if(a==='theme-watch-all'){user.watch=[...new Set([...user.watch,...members(id||activeTheme).map(s=>s.id)])];save();render();toast('已加入此題材的公司。');return;}
  if(a==='more-focus'){feedLimit+=12;render();return;}
  if(a==='feed-tab'){feedTab=tab;feedLimit=8;onRoute();return;}
  if(a==='company-tab'){companyTab=tab;onRoute();return;}
  if(a==='finance-tab'){financeTab=tab;onRoute();return;}
  if(a==='chip-tab'){chipTab=tab;onRoute();return;}
  if(a==='load-history'){await loadHistory(id||routes()[1],true);return;}
  if(a==='load-company-data'&&market!=='TW'){await loadQuotes(true,{warm:true});return;}
  if(a==='load-company-data'){const sid=id||routes()[1];await Promise.all([loadHistory(sid),ensureFeed('official:valuation',true),ensureFeed('official:revenue',true)]);return;}
  if(a==='chart-unit'){chartUnit=el.dataset.value; pinned=null;render();return;}
  if(a==='chart-range'){chartRange=Number(el.dataset.value);pinned=null;render();return;}
  if(a==='indicator'){chartIndicator=el.dataset.value||el.dataset.indicator;render();return;}
  if(a==='export-history'){const sid=id||routes()[1];const rows=histMap.get(sid);if(!rows?.length)throw Error('尚無可匯出的歷史資料');download(sid+'-history.csv',csvEncode(rows,['date','open','high','low','close','volume']),'text/csv;charset=utf-8');return;}
  if(a==='heat-mode'){heatMode=el.dataset.mode;if(heatMode==='themes'&&heatWeight==='cap')heatWeight='amount';render();return;}
  if(a==='rotation'){rotationModal();return;}
  if(a==='screen-preset'){screenerPreset=el.dataset.mode;screenerPage=0;render();return;}
  if(a==='add-rule'){if(screenerRules.length>=12)throw Error('最多 12 個條件');screenerRules.push({field:'rsi',op:'>=',value:50});render();return;}
  if(a==='remove-rule'){screenerRules.splice(Number(el.dataset.index),1);render();return;}
  if(a==='apply-rules'){screenerPreset='rules';screenerPage=0;render();return;}
  if(a==='save-rules'){showModal('儲存條件組合',form('rules-form',field('name','組合名稱','','text','required maxlength="100"')));return;}
  if(a==='load-rules'){const r=user.rules.find(v=>v.id===id);if(r){screenerRules=structuredClone(r.rules);screenerJoin=r.join||'all';screenerPreset='rules';render();}return;}
  if(a==='scan-history'){await scanHistories();return;}
  if(a==='stop-scan'){scanAbort=true;return;}
  if(a==='screen-prev'||a==='screen-next'){screenerPage+=a==='screen-next'?1:-1;render();return;}
  if(a==='export-screen'){download('ATLAS-screen.csv',csvEncode(selectedScreenStocks().map(s=>({id:s.id,name:s.name,price:s.price,change:s.change,date:s.date,source:s.source,score:analyses.get(s.id)?.score})),['id','name','price','change','date','source','score']),'text/csv;charset=utf-8');return;}
  if(a==='portfolio-tab'){portfolioTab=tab;render();return;}
  if(a==='add-trade'||a==='edit-trade'){tradeModal(a==='add-trade'?id:'',a==='edit-trade'?id:'');return;}
  if(a==='delete-trade'){if(!confirm('刪除此筆交易？之後的賣出紀錄仍須有足夠股數。'))return;const next=user.trades.filter(t=>t.id!==id);ledger(next);user.trades=next;save();render();return;}
  if(a==='export-trades'){download('ATLAS-trades.csv',csvEncode(user.trades,['date','stock','name','side','qty','price','fee','tax','currency']),'text/csv;charset=utf-8');return;}
  if(a==='import-trades'){readLocalFile('.csv',text=>{const rows=csvParse(text);const fresh=rows.map((r,i)=>validateTrade({...r,id:uid(),createdAt:Date.now()+i}));const next=[...user.trades,...fresh];ledger(next);if(!confirm(`新增 ${fresh.length} 筆交易？此動作不自動去重。`))return;user.trades=next;save();render();toast('交易已匯入。');});return;}
  if(a==='add-note'||a==='open-note'){noteModal(a==='open-note'?id:'',a==='add-note'?(id||el.dataset.stock||''):'');return;}
  if(a==='add-study'||a==='edit-study'){studyModal(a==='edit-study'?id:'',a==='add-study'?(id||el.dataset.stock||''):'');return;}
  if(a==='add-creator'||a==='edit-creator'){creatorModal(a==='edit-creator'?id:'');return;}
  if(a==='compare-studies'){compareStudies();return;}
  if(a==='add-theme'){themeModal();return;}
  if(a==='add-relation'){relationModal();return;}
  if(a==='add-alert'){alertModal();return;}
  if(a==='delete-relation'||a==='delete-note'||a==='delete-study'||a==='delete-event'||a==='delete-creator'||a==='delete-alert'){
   if(!confirm('確定刪除此筆個人紀錄？'))return;const key=({'delete-relation':'relations','delete-note':'notes','delete-study':'studies','delete-event':'events','delete-creator':'creators','delete-alert':'notifications'})[a];user[key]=user[key].filter(v=>v.id!==id);save();closeModal();render();return;
  }
  if(a==='add-event'||a==='view-event'){eventModal(a==='view-event'?id:'',el.dataset.date||'');return;}
  if(a==='calendar-prev'||a==='calendar-next'){
   const d=new Date(calendarMonth+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+(a==='calendar-next'?1:-1));calendarMonth=d.toISOString().slice(0,7);render();return;
  }
  if(a==='calendar-today'){calendarMonth=today().slice(0,7);render();return;}
  if(a==='calendar-view'){calendarView=el.dataset.view;render();return;}
  if(a==='load-calendar'){const ids=user.watch.filter(id=>marketOf(stock(id))==='TW').slice(0,12);if(!ids.length)throw Error('先收藏至少一檔台股，再同步股利日期');toast(`開始查詢 ${ids.length} 檔；各檔來源狀態見資料設定。`);let n=0;await Promise.all([0,1].map(async()=>{while(n<ids.length)await ensureFeed('dataset:dividend:'+ids[n++]);}));render();return;}
  if(a==='export-events'){exportEvents();return;}
  if(a==='announcement'){
   const row=dataRows('official:announcements').find(x=>`${x.id}-${x.time}`===id)||dataRows('official:announcements')[Number(el.dataset.index)];
   if(row)showModal(row.title,`<div class="row"><span class="badge">${esc(row.date)}</span><span>${esc(row.name)}（${esc(row.id)}）</span></div><div class="prose" style="white-space:pre-wrap">${esc(row.body)}</div>${sourceLink(row.sourceURL,'公告資料來源')}`,{wide:true});return;
  }
  if(a==='open-backtest'){backtestModal();return;}
  if(a==='data-summary'){const sid=$('#ai-stock').value.trim();validID(sid);aiAnswer='資料摘要（程式整理，非生成式 AI）\n\n'+currentSummary(sid);$('#ai-output').textContent=aiAnswer;return;}
  if(a==='online-ai'){
   if(!$('#ai-consent').checked)throw Error('請先勾選同意傳送問題與公開資料摘要');
   if(!apiStatus?.aiConfigured)throw Error('線上 AI 尚未設定，請先使用資料摘要或查看資料設定');
   const sid=$('#ai-stock').value.trim(),question=$('#ai-question').value.trim();validID(sid);if(!question)throw Error('請輸入研究問題');
   aiBusy=true;el.disabled=true;el.textContent='正在等待 AI…';
   try{const out=await api.get('ai',{method:'POST',body:{consent:true,question,summary:currentSummary(sid)},timeout:30000});aiAnswer='AI 生成內容（未經查核）\n\n'+out.text;if($('#ai-output'))$('#ai-output').textContent=aiAnswer;}
   finally{aiBusy=false;el.disabled=false;el.textContent='使用線上 AI';}return;
  }
  if(a==='export-backup'){exportBackup();return;}
  if(a==='import-backup'){readLocalFile('.json',text=>{const d=validateUser(JSON.parse(text));if(!confirm('用此備份取代本機紀錄？請先匯出現有備份。'))return;user=d;save();closeModal();render();setAutoRefresh();toast('備份已還原。');});return;}
  if(a==='import-legacy'){const d=importLegacy();if(!confirm('將舊版自選、交易、筆記匯入新工作台？新帳本會被取代，原舊版資料不刪除。'))return;user=d;save();render();toast('舊版紀錄已匯入。');return;}
  if(a==='clear-cache'){clearMarketCache();toast('行情快取已清除，個人紀錄保留。');await loadQuotes(true);return;}
 }catch(e){toast(e.message||String(e),true);}
}
document.addEventListener('click',event=>{
 const el=event.target.closest('[data-action]');if(el&&!el.disabled){event.preventDefault();doAction(el);return;}
 if(event.target.classList.contains('modal-overlay'))closeModal();
 const candle=event.target.closest('[data-candle]');if(candle){pinned=Number(candle.dataset.candle);render();}
});
document.addEventListener('submit',handleSubmit);
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='search-input')renderSearch(el.value);
 if(el.id==='topic-filter'){topicQuery=el.value;render();}
 if(el.id==='screener-filter'){screenerQuery=el.value;screenerPage=0;render();}
 if(el.dataset.rule!==undefined){const i=Number(el.dataset.rule);screenerRules[i][el.dataset.prop]=el.dataset.prop==='value'?Number(el.value):el.value;}
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='chain-select'){activeTheme=el.value;render();}
 if(el.id==='heat-weight'){heatWeight=el.value;if(heatWeight==='cap')ensureFeed('official:companies');render();}
 if(el.id==='rule-join')screenerJoin=el.value;
 if(el.id==='compare-a'||el.id==='compare-b')renderStudyComparison();
 if(el.id==='rotation-range'){rotationStep=Number(el.value);rotationModal();}
 if(el.id.startsWith('setting-')){const key=el.id.slice(8);user.settings[key]=key==='refresh'?Number(el.value):el.value;if(key==='refresh'){user.settings.autoRefresh=Number(el.value);delete user.settings.refresh;}save();setAutoRefresh();render();}
});
document.addEventListener('keydown',event=>{
 if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();modalSearch();}
 if(event.key==='Escape')closeModal();
 if(event.key==='Tab'&&$('.dialog')){
   const els=$$('button,input,textarea,select,a[href]', $('.dialog')).filter(e=>!e.disabled&&e.type!=='hidden'),first=els[0],last=els.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }
});
window.addEventListener('hashchange',()=>{window.scrollTo({top:0});onRoute();});
async function bootstrap(){
 let m=routes()[2];try{m=m||sessionStorage.getItem('atlas-map-market');}catch{}if(['TW','US','JP','KR'].includes(m))market=m;if(market!=='TW')heatWeight='volume';
 const stored=cacheGet('quotes:'+market);if(stored?.data?.quotes){for(const q of stored.data.quotes)quoteMap.set(q.id,{...q,stale:true});ingestHistories(stored.data.histories,market);quoteState={state:'success',cache:true};marketStates.set(market,quoteState);}
 onRoute();setAutoRefresh();
 // Intentionally parallel: health metadata must never gate a working quote feed.
 await Promise.all([checkStatus(),loadQuotes(false,{warm:true}),ensureFeed('official:companies')]);
 if(user.loadError)toast(user.loadError,true);
}
if('serviceWorker' in navigator&&!globalThis.ATLAS_TEST_MODE&&location.protocol!=='file:'){
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});
 let reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{
  if(reloaded||sessionStorage.getItem('atlas-v10-sw-reload'))return;
  reloaded=true;sessionStorage.setItem('atlas-v10-sw-reload','1');location.reload();
 });
}
bootstrap().catch(e=>{console.error('ATLAS startup:',e);$('#app').innerHTML=empty('啟動未完成',e.message,'<a href="./start.html">開啟更新修復頁</a>',true);});
// Debugging surface contains no credentials; opt-in from console only.
globalThis.ATLAS_DIAGNOSTICS=()=>({version:VERSION,market,status:apiStatus,quotes:quotedStocks().length,histories:histMap.size,feeds:[...feedStore].map(([key,v])=>({key,state:v.state,error:v.error||null}))});
