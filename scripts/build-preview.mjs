
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import handler from '../server/functions/atlas.mjs';
import {mockFetch,stocks} from '../tests/fixtures.mjs';
import {clearCache} from '../server/lib/data.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
globalThis.fetch=mockFetch;clearCache();
const requests=['status','quotes?market=TW',...['companies','valuation','revenue','index','announcements'].map(k=>'official?kind='+k),
 ...stocks.map(s=>'history?stock='+s.id+'&market=TW'),
 ...['institutions','margin','holders','shareholding','pe','revenue','financials','balance','cashflow','dividend','etf'].flatMap(k=>['2330','2454'].map(s=>'dataset?kind='+k+'&stock='+s)),
 'dataset?kind=news','dataset?kind=news&stock=2330','dataset?kind=news&stock=2454','dataset?kind=disposition'];
const map={};
const keyOf=p=>{const u=new URL(p,'https://preview.invalid/api/atlas/');return u.pathname.split('/').at(-1)+'?'+[...u.searchParams].sort().map(([k,v])=>k+'='+v).join('&');};
for(const p of requests){
 const r=await handler(new Request('https://preview.invalid/api/atlas/'+p),{}),data=await r.json();
 if(data.source)data.source='TEST FIXTURE (NOT MARKET DATA) / '+data.source;
 if(data.quotes)for(const q of data.quotes)q.source='TEST FIXTURE (NOT MARKET DATA)';
 map[keyOf(p)]={status:r.status,data};
}
const get=n=>readFile(path.join(root,'site',n),'utf8');
let lib=(await get('atlas-catalog.mjs'))+'\n'+(await get('atlas-store.mjs'))+'\n'+(await get('atlas-charts.mjs'))+'\n'+(await get('atlas-app.mjs'));
lib=lib.replace(/^import .*?;\s*$/gm,'').replace(/\bexport\s+(?=(?:const|function|class|async))/g,'');
let html=await get('index.html');
html=html.replace(/<link rel="stylesheet"[^>]+>/g,'<style>'+await get('atlas-ui.css')+'</style>');
html=html.replace(/<link rel="manifest"[^>]+>/g,'').replace(/<link rel="(?:icon|apple-touch-icon)"[^>]+>/g,'');
html=html.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g,'');
const prelude=`
globalThis.ATLAS_TEST_MODE=true;
(function(){
try{localStorage.length;}catch{
 const values=globalThis.ATLAS_TEST_STORAGE||{};Object.defineProperty(globalThis,'localStorage',{value:{getItem:k=>values[k]??null,setItem:(k,v)=>values[k]=String(v),removeItem:k=>delete values[k],clear:()=>{for(const k in values)delete values[k]},key:i=>Object.keys(values)[i],get length(){return Object.keys(values).length}}});
}
})();
const FIXTURES=${JSON.stringify(map)};
globalThis.fetch=async function(input,options={}){
 if(globalThis.__atlasApi){const r=await globalThis.__atlasApi(String(input),options);return new Response(JSON.stringify(r.data),{status:r.status,headers:{'content-type':'application/json'}});}
 const u=new URL(String(input),'https://preview.invalid/');
 const key=u.pathname.split('/').at(-1)+'?'+[...u.searchParams].sort().map(([k,v])=>k+'='+v).join('&');
 const r=FIXTURES[key]||{status:503,data:{error:'此單檔預覽未附該項測試資料；正式版本需由後端讀取來源。'}};
 await new Promise(ok=>setTimeout(ok,100));
 return new Response(JSON.stringify(r.data),{status:r.status,headers:{'content-type':'application/json'}});
};
`;
const engineText=await get('atlas-engine.js');
html=html.replace('</body>',()=>'<script>'+prelude.replace(/<\/script/gi,'<\\/script')+'</script><script>'+engineText.replace(/<\/script/gi,'<\\/script')+'</script><script type="module">'+lib.replace(/<\/script/gi,'<\\/script')+'</script></body>');
const out=process.argv[2]||path.join(root,'../ATLAS_Map_Rebuild_Preview.html');await writeFile(out,html);console.log('Preview fixture file:',out);
