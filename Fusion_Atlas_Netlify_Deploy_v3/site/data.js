/* Original, editable demonstration catalog. Not a verified supply-chain dataset.
 * All generated prices, volumes and chart values are synthetic. */
window.ATLAS_DATA = (() => {
  const themes = [
    {id:'ai',name:'AI 伺服器',en:'AI INFRASTRUCTURE',icon:'cpu',accent:'#b9ef76',desc:'從運算晶片到機櫃系統，沿著角色分層拆解研究主題。',stages:['運算與設計','製造與封裝','零組件與散熱','系統與整合']},
    {id:'pack',name:'先進封裝',en:'ADVANCED PACKAGING',icon:'layers',accent:'#75c9e9',desc:'整理製程、設備與封測角色；實際合作關係仍須查證。',stages:['晶片設計','晶圓製造','設備與材料','封裝與測試']},
    {id:'semi',name:'半導體',en:'SEMICONDUCTORS',icon:'chip',accent:'#92aafa',desc:'以設計、製造、封測與材料四個角度建立研究清單。',stages:['IC 設計','晶圓製造','封裝測試','設備與材料']},
    {id:'cool',name:'散熱與液冷',en:'THERMAL MANAGEMENT',icon:'wind',accent:'#64d6bc',desc:'把散熱元件、材料與系統分開觀察，避免只追逐題材。',stages:['材料與電路','散熱元件','模組整合','系統應用']},
    {id:'power',name:'電源與儲能',en:'POWER & ENERGY',icon:'bolt',accent:'#f2cb74',desc:'從電力設備到電源管理，建立自己的能源研究路徑。',stages:['電力設備','電源供應','控制與管理','系統應用']},
    {id:'network',name:'高速網通',en:'CONNECTIVITY',icon:'network',accent:'#81bfef',desc:'檢視網通晶片、電路板、設備與系統的不同角色。',stages:['通訊晶片','材料與電路','網路設備','系統整合']},
    {id:'ev',name:'電動車',en:'ELECTRIC MOBILITY',icon:'car',accent:'#efad87',desc:'以零組件與系統角色組織公司，不把主題等同營收占比。',stages:['晶片與元件','動力與電控','零組件','整合應用']},
    {id:'robot',name:'機器人與自動化',en:'ROBOTICS',icon:'robot',accent:'#d2b4ee',desc:'拆解感測控制、傳動、機械與整合的研究範圍。',stages:['晶片與控制','傳動與零件','機械設備','系統整合']}
  ];
  const rows = [
    ['2330','台積電','TWSE','晶圓製造',['ai','pack','semi'],1080,2.37,51000],
    ['2454','聯發科','TWSE','IC 設計',['ai','semi','network','ev'],1265,1.61,9200],
    ['3443','創意','TWSE','IC 設計',['ai','pack','semi'],1465,4.64,4200],
    ['3661','世芯-KY','TWSE','IC 設計',['ai','pack','semi'],2890,3.59,2900],
    ['2379','瑞昱','TWSE','通訊晶片',['semi','network'],512,-0.78,8100],
    ['3034','聯詠','TWSE','IC 設計',['semi'],487,-1.02,5300],
    ['2303','聯電','TWSE','晶圓製造',['semi','ev'],47.2,-0.63,91000],
    ['3711','日月光投控','TWSE','封裝測試',['pack','semi'],162,1.89,22100],
    ['2449','京元電子','TWSE','封裝測試',['pack','semi'],112,3.23,38500],
    ['3680','家登','TPEX','設備與材料',['pack','semi'],456,2.47,4600],
    ['3131','弘塑','TPEX','設備與材料',['pack','semi'],1630,5.16,1800],
    ['3583','辛耘','TWSE','設備與材料',['pack','semi'],398,2.84,3300],
    ['2382','廣達','TWSE','系統整合',['ai','cool'],278.5,3.15,47000],
    ['3231','緯創','TWSE','系統整合',['ai'],118,2.61,63000],
    ['6669','緯穎','TWSE','系統整合',['ai','cool'],2475,4.43,2300],
    ['2356','英業達','TWSE','系統整合',['ai'],49.6,1.85,18500],
    ['2317','鴻海','TWSE','系統整合',['ai','ev','robot'],185.5,2.49,116000],
    ['2308','台達電','TWSE','電源與控制',['ai','power','cool','ev','robot'],402,2.03,14800],
    ['3017','奇鋐','TWSE','散熱元件',['ai','cool'],698,5.76,22600],
    ['3324','雙鴻','TPEX','散熱元件',['ai','cool'],625,4.17,8300],
    ['3653','健策','TWSE','散熱元件',['ai','cool','ev'],1390,3.73,3100],
    ['3013','晟銘電','TWSE','模組整合',['ai','cool'],103,2.49,15700],
    ['2383','台光電','TWSE','材料與電路',['ai','network','cool'],654,3.81,9700],
    ['2368','金像電','TWSE','材料與電路',['ai','network'],258,4.03,21300],
    ['3037','欣興','TWSE','材料與電路',['pack','semi','network'],158,-1.56,36800],
    ['2345','智邦','TWSE','網路設備',['ai','network'],725,2.69,5500],
    ['6285','啟碁','TWSE','網路設備',['network'],117,-1.68,4400],
    ['5388','中磊','TWSE','網路設備',['network'],111,-0.89,4200],
    ['1519','華城','TWSE','電力設備',['power'],542,2.26,5400],
    ['1513','中興電','TWSE','電力設備',['power'],166,1.53,17900],
    ['1504','東元','TWSE','電源與控制',['power','ev','robot'],52.1,-0.95,23000],
    ['2301','光寶科','TWSE','電源供應',['ai','power'],108,1.89,21100],
    ['4931','新盛力','TPEX','電源供應',['power'],91,-2.15,3200],
    ['1536','和大','TWSE','傳動與零件',['ev','robot'],53.9,-1.1,3400],
    ['2049','上銀','TWSE','傳動與零件',['robot'],261,1.75,8100],
    ['1590','亞德客-KY','TWSE','傳動與零件',['robot'],948,-1.35,980],
    ['4526','東台','TPEX','機械設備',['robot'],29.7,2.41,7800],
    ['1503','士電','TWSE','電力設備',['power','ev','robot'],211,1.93,6000],
    ['2497','怡利電','TWSE','電源與控制',['ev'],62.1,-0.8,1900],
    ['6414','樺漢','TWSE','系統整合',['robot'],292,1.04,2300]
  ];
  const stocks = rows.map(([id,name,market,role,tags,price,change,volume],i)=>({id,name,market,role,tags,price,change,volume,amount:Math.round(price*volume*1000),source:'demo',date:null,displayOrder:i}));
  function stage(stock,theme) {
    const r=stock.role;
    if(theme==='ai') return /設計|晶片/.test(r)?0:/晶圓|封裝|設備與/.test(r)?1:/系統/.test(r)?3:2;
    if(theme==='pack') return /設計/.test(r)?0:/晶圓/.test(r)?1:/封裝/.test(r)?3:2;
    if(theme==='semi') return /設計|晶片/.test(r)?0:/晶圓/.test(r)?1:/封裝/.test(r)?2:3;
    if(theme==='cool') return /材料/.test(r)?0:/散熱/.test(r)?1:/模組|電源/.test(r)?2:3;
    if(theme==='power') return /電力/.test(r)?0:/供應/.test(r)?1:/控制/.test(r)?2:3;
    if(theme==='network') return /晶片|設計/.test(r)?0:/材料/.test(r)?1:/設備/.test(r)?2:3;
    if(theme==='ev') return /晶片|設計|晶圓/.test(r)?0:/電源|電力/.test(r)?1:/零件|散熱/.test(r)?2:3;
    return /設計|控制/.test(r)?0:/零件/.test(r)?1:/機械|電力/.test(r)?2:3;
  }
  function history(id,n=240){
    const s=stocks.find(x=>x.id===id);let seed=Number(id)*7919;
    const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
    let v=s.price*.73;const a=[];
    for(let i=0;i<n;i++){const open=v,close=open*(1+(rand()-.455)*.055);v=close;a.push({date:'D'+(i+1),open,close,high:Math.max(open,close)*(1+rand()*.018),low:Math.min(open,close)*(1-rand()*.018),volume:Math.round(s.volume*(.35+rand()*1.2)*1000)});}
    const scale=s.price/a[a.length-1].close;
    a.forEach(x=>['open','close','high','low'].forEach(k=>x[k]=Math.round(x[k]*scale*100)/100));
    return a;
  }
  return {themes,stocks,stage,history,version:1};
})();

/* Expanded demo catalogue: names identify UI examples, not verified supply relationships. */
(function(){
const D=window.ATLAS_DATA;
const themes=[
 ['memory','HBM 與記憶體','MEMORY & HBM','chip',['材料與IP','製造','封測模組','終端應用']],
 ['optical','矽光子／光通訊','PHOTONICS','network',['元件設計','光學元件','模組','系統應用']],
 ['satellite','衛星通訊','SATELLITE NETWORKS','network',['晶片','零件','通訊設備','營運服務']],
 ['cloud','雲端與 SaaS','CLOUD & SOFTWARE','layers',['運算硬體','雲端平台','軟體工具','企業應用']],
 ['pcb','PCB／高階材料','PCB & MATERIALS','layers',['原料','基板','製造','組裝']],
 ['solar','太陽能','SOLAR ENERGY','sun',['材料','電池','模組','系統']],
 ['finance','金融服務','FINANCIAL SERVICES','wallet',['金融基礎','銀行','保險','資產管理']],
 ['shipping','航運／物流','SHIPPING & LOGISTICS','car',['設備','運輸','港口物流','服務']],
 ['etf','ETF 研究','ETF WORKSPACE','compare',['指數／策略','基金','資產類別','投資用途']],
 ['health','醫療／生技','HEALTHCARE','spark',['研究','藥品','器材','服務']],
 ['consumer','消費電子','CONSUMER ELECTRONICS','cpu',['晶片','零件','組裝','品牌']],
 ['defense','航太／國防','AEROSPACE','bolt',['材料','元件','系統','應用']]
];
themes.forEach(([id,name,en,icon,stages],i)=>D.themes.push({id,name,en,icon,stages,desc:'研究分類展示。公司角色、產品、客戶與營收關聯需以原始資料查核。',accent:['#a99bff','#70dcca','#c2f077','#ffc684'][i%4]}));
const add=[
 ['2303','聯電','TWSE','晶圓製造',['semi'],52,2.4,72000],
 ['2408','南亞科','TWSE','記憶體製造',['memory'],92,1.2,31000],
 ['2344','華邦電','TWSE','記憶體製造',['memory'],31,-1.1,36000],
 ['2481','強茂','TWSE','半導體元件',['semi','power'],74,2.6,12000],
 ['6147','頎邦','TPEX','封裝測試',['pack','semi'],61,1.5,9000],
 ['1815','富喬','TPEX','材料',['pcb'],45,-2.1,19000],
 ['2367','燿華','TWSE','PCB製造',['pcb'],37,-1.5,23000],
 ['1301','台塑','TWSE','材料',['power'],55,.4,22000],
 ['2603','長榮','TWSE','航運服務',['shipping'],180,1.7,15000],
 ['2609','陽明','TWSE','航運服務',['shipping'],68,1.8,18000],
 ['2881','富邦金','TWSE','金融控股',['finance'],91,.6,14000],
 ['2882','國泰金','TWSE','金融控股',['finance'],65,-.8,17000],
 ['0050','元大台灣50','TWSE','ETF',['etf'],52,.8,47000],
 ['NVDA','NVIDIA','US','GPU 設計',['ai','semi','robot'],140,2.8,182000],
 ['AMD','AMD','US','晶片設計',['ai','semi'],160,1.2,43000],
 ['AVGO','Broadcom','US','晶片與軟體',['ai','network','cloud'],220,2.1,27000],
 ['MSFT','Microsoft','US','雲端平台',['cloud','ai'],440,.8,20000],
 ['GOOGL','Alphabet','US','平台與雲端',['cloud','ai'],195,1.1,24000],
 ['AMZN','Amazon','US','雲端與平台',['cloud','ai','consumer'],210,-.3,29000],
 ['META','Meta','US','平台服務',['ai','cloud'],630,1.3,16000],
 ['AAPL','Apple','US','消費電子',['consumer','semi'],230,-.8,39000],
 ['TSLA','Tesla','US','電動車',['ev','robot','power'],320,-2.3,73000],
 ['MU','Micron','US','記憶體製造',['memory','ai'],108,3.1,22000],
 ['ARM','Arm','US','晶片 IP',['semi','ai'],150,1.8,7000],
 ['ASML','ASML ADR','US','半導體設備',['semi','pack'],780,-.6,1700],
 ['TSM','TSMC ADR','US','晶圓製造',['semi','pack','ai'],190,1.4,12000],
 ['VRT','Vertiv','US','電力與散熱',['cool','power','ai'],120,2.5,5800],
 ['ORCL','Oracle','US','雲端與軟體',['cloud'],190,1.6,9400],
 ['PLTR','Palantir','US','資料分析軟體',['cloud','defense'],98,-1.2,51000],
 ['JPM','JPMorgan Chase','US','銀行',['finance'],240,.5,7100],
 ['LLY','Eli Lilly','US','藥品',['health'],780,.9,2200],
 ['SPY','SPDR S&P 500 ETF','US','ETF',['etf'],590,.7,33000],
 ['QQQ','Invesco QQQ','US','ETF',['etf'],510,.9,28000],
 ['7203.T','Toyota','JP','汽車製造',['ev'],2700,.9,14000],
 ['8035.T','Tokyo Electron','JP','半導體設備',['semi'],25500,1.7,1800],
 ['6758.T','Sony Group','JP','電子與娛樂',['consumer'],3400,-.7,2800],
 ['6861.T','Keyence','JP','自動化設備',['robot'],59000,1.1,370],
 ['005930.KS','Samsung Electronics','KR','記憶體與電子',['memory','consumer'],71000,1.4,15000],
 ['000660.KS','SK hynix','KR','記憶體製造',['memory','ai'],210000,2.9,4100],
 ['373220.KS','LG Energy Solution','KR','電池',['ev','power'],370000,-.5,210],
 ['005380.KS','Hyundai Motor','KR','汽車製造',['ev'],230000,.8,870]
];
add.forEach(([id,name,market,role,tags,price,change,volume])=>{
 if(!D.stocks.some(s=>s.id===id))D.stocks.push({id,name,market,role,tags,price,change,volume,amount:price*volume*1000,source:'demo',date:null});
});
D.stocks.forEach(s=>{s.currency={TWSE:'TWD',TPEX:'TWD',US:'USD',JP:'JPY',KR:'KRW'}[s.market]||'TWD';});
const cached=new Map();
D.history=function(id,n=300){
 const key=id+':'+n;if(cached.has(key))return cached.get(key).map(r=>({...r}));
 const s=D.stocks.find(x=>x.id===id);if(!s)return [];
 let seed=2166136261;for(const c of id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
 const rows=[];let c=s.price*.7;
 for(let i=0;i<n;i++){
  const o=c*(1+(rand()-.5)*.009),wave=Math.sin(i/19+(seed%17))*.002;
  c=o*(1+(rand()-.465)*.035+wave);
  rows.push({date:'D'+String(i+1).padStart(3,'0'),open:o,close:c,high:Math.max(o,c)*(1+rand()*.013),low:Math.min(o,c)*(1-rand()*.013),volume:Math.round(s.volume*1000*(.5+rand()*1.8))});
 }
 const scale=s.price/rows.at(-1).close;
 rows.forEach(r=>['open','close','high','low'].forEach(k=>r[k]=Math.max(.01,Math.round(r[k]*scale*100)/100)));
 s.change=(rows.at(-1).close/rows.at(-2).close-1)*100;
 s.volume=rows.at(-1).volume/1000;s.amount=s.price*s.volume*1000;
 cached.set(key,rows);return rows.map(r=>({...r}));
};
D.stocks.forEach(s=>D.history(s.id));
})();
