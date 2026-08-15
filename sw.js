const CACHE='school-improvement-v4.0.0';
const ASSETS=["./", "index.html", "manifest.json", "assets/css/styles.css", "assets/js/data.js", "assets/js/storage.js", "assets/js/engine.js", "assets/js/document-intelligence.js", "assets/js/report-export.js", "assets/js/app.js", "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/images/leadership-hero.png", "assets/images/heroes/activity.svg", "assets/images/heroes/ai.svg", "assets/images/heroes/assessment.svg", "assets/images/heroes/dashboard.svg", "assets/images/heroes/events.svg", "assets/images/heroes/evidence.svg", "assets/images/heroes/gifted.svg", "assets/images/heroes/guidance.svg", "assets/images/heroes/health.svg", "assets/images/heroes/improvement.svg", "assets/images/heroes/intelligence.svg", "assets/images/heroes/leadership.svg", "assets/images/heroes/nafs.svg", "assets/images/heroes/operational.svg", "assets/images/heroes/partnership.svg", "assets/images/heroes/professional.svg", "assets/images/heroes/reports.svg", "assets/images/heroes/satisfaction.svg", "assets/images/heroes/settings.svg", "assets/images/heroes/volunteer.svg"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{
  if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
  return resp;
 }).catch(()=>e.request.mode==='navigate'?caches.match('./'):Response.error())));
});
