
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import handler from '../server/functions/atlas.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../site');
const mock=process.env.ATLAS_TEST_DATA==='1';
if(mock){const {mockFetch}=await import('../tests/fixtures.mjs');globalThis.fetch=mockFetch;}
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/atlas/')){
  let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>40000){res.writeHead(413);res.end('Request too large');return;}chunks.push(chunk);}
  const request=new Request('http://localhost'+req.url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
  const r=await handler(request,{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));return;
 }
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
 if(pathname==='/')pathname='/index.html';
 const full=path.resolve(root,'.'+pathname);
 if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 let content=await readFile(full);
 if(mock&&pathname.endsWith('.html'))content=Buffer.from(content.toString().replace('<head>','<head><script>globalThis.ATLAS_TEST_MODE=true;</script>'));
 res.writeHead(200,{'content-type':types[path.extname(full)]||'application/octet-stream','cache-control':'no-store'});res.end(content);
 }catch(e){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('Not found');}
});
const port=Number(process.env.PORT||8787);server.listen(port,'127.0.0.1',()=>console.log(`ATLAS at http://127.0.0.1:${port} ${mock?'(TEST DATA, not market data)':''}`));
