const CACHE='school-improvement-v3.1.0';
const ASSETS=['./','index.html','manifest.json','assets/css/styles.css','assets/js/data.js','assets/js/storage.js','assets/js/engine.js','assets/js/app.js','assets/icons/icon-192.png','assets/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
  if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
  return resp;
 }).catch(()=>e.request.mode==='navigate'?caches.match('./'):Response.error())));
});
