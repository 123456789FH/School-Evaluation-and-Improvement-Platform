const CACHE='school-improvement-v4.2.0';
const CORE=[
  './','index.html','manifest.json',
  'assets/css/styles.css',
  'assets/js/data.js','assets/js/storage.js','assets/js/engine.js',
  'assets/js/document-intelligence.js','assets/js/report-export.js','assets/js/app.js','assets/js/v4-ui.js',
  'assets/icons/icon-192.png','assets/icons/icon-512.png',
  'assets/images/leadership-hero.png'
];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async url=>{
      try{
        const response=await fetch(url,{cache:'reload'});
        if(response.ok)await cache.put(url,response.clone());
      }catch(_){}
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
async function networkFirst(request){
  const cache=await caches.open(CACHE);
  try{
    const fresh=await fetch(request,{cache:'no-store'});
    if(fresh&&fresh.ok)await cache.put(request,fresh.clone());
    return fresh;
  }catch(_){
    return (await cache.match(request)) || (request.mode==='navigate' ? await cache.match('./') : Response.error());
  }
}
async function staleWhileRevalidate(request){
  const cache=await caches.open(CACHE);
  const cached=await cache.match(request);
  const update=fetch(request).then(async response=>{
    if(response&&response.ok)await cache.put(request,response.clone());
    return response;
  }).catch(()=>null);
  return cached || await update || Response.error();
}
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const critical=request.mode==='navigate'||/\.(?:html?|css|js|json)$/i.test(url.pathname)||url.pathname.endsWith('/');
  event.respondWith(critical?networkFirst(request):staleWhileRevalidate(request));
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting();});
