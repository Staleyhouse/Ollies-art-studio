/* Ollie's Art Studio V36: network first, offline cache after successful loads; preserve saved data. */
const CACHE='ollie-art-studio-v36';
const FILES=['./index.html','./app-icon-192.png','./app-icon-512.png','./apple-touch-icon.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 for(const path of FILES){try{await cache.add(new Request(path,{cache:'reload'}))}catch(_){}}
 await self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(n=>n.startsWith('ollie-art-studio-')&&n!==CACHE).map(n=>caches.delete(n)));
 await self.clients.claim();
})())});
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'||url.pathname.endsWith('.json')){
  e.respondWith((async()=>{
   try{const response=await fetch(req,{cache:'no-store'});
    if(response.ok){const cache=await caches.open(CACHE);await cache.put(req,response.clone());}
    return response;
   }catch(err){const cached=await caches.match(req,{ignoreSearch:true});
    if(cached)return cached;
    throw err;
   }
  })());
 }
});
