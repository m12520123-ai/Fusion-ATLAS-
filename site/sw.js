
const CACHE='atlas-map-v10-shell';
const FILES=['/index.html','/atlas-ui.css?v=10.0.0','/atlas-engine.js?v=10.0.0','/atlas-app.mjs?v=10.0.0','/atlas-catalog.mjs?v=10.0.0','/atlas-store.mjs?v=10.0.0','/atlas-charts.mjs?v=10.0.0','/map-icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>(k.startsWith('atlas-shell-')||k.startsWith('atlas-map-v'))&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 // Financial API responses and protected requests are NEVER service-worker cached.
 if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/')||e.request.headers.has('x-atlas-token')||u.pathname==='/start.html')return;
 const allowed=FILES.some(f=>new URL(f,self.location.origin).pathname===u.pathname)||u.pathname==='/';
 if(!allowed)return;
 e.respondWith(fetch(e.request).then(r=>{
  if(r.ok&&r.type==='basic'){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return r;
 }).catch(async()=>await caches.match(e.request)||e.request.mode==='navigate'&&await caches.match('/index.html')||new Response('Offline',{status:503})));
});
