const CACHE_NAME='barnoir-v2';
const ASSETS=[
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Install: cache core assets
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.url.includes('supabase'))return;
  e.respondWith(
    fetch(e.request).then(resp=>{
      if(resp&&resp.status===200){
        const clone=resp.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(e.request,clone));
      }
      return resp;
    }).catch(()=>caches.match(e.request))
  );
});

// Push notification handler
self.addEventListener('push',e=>{
  const data=e.data?e.data.json():{title:'BAR NOIR',body:'New message'};
  e.waitUntil(
    self.registration.showNotification(data.title||'BAR NOIR',{
      body:data.body||'New message',
      icon:'icon-192.png',
      badge:'icon-192.png',
      tag:'bn-msg',
      renotify:true
    })
  );
});

// Notification click: open app
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
      for(const c of list){
        if(c.url.includes('neodealstyle.github.io')&&'focus' in c)return c.focus();
      }
      return clients.openWindow('./');
    })
  );
});
