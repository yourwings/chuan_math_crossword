// 小川数字迷宫 - Service Worker 文件
// 用于实现离线缓存功能

const CACHE_NAME = 'chuan-math-crossword-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './arithmetic_grid/index.html',
  './arithmetic_grid/game.js',
  './arithmetic_grid/initialize-game.js',
  './arithmetic_grid/style.css',
  './arithmetic_grid/debug-info.js',
  './sudoku/index.html',
  './sudoku/game.js',
  './sudoku/initialize-game.js',
  './sudoku/style.css',
  './sudoku/sudoku-generator.js',
  './mental_arithmetic/index.html',
  './mental_arithmetic/game.js',
  './mental_arithmetic/style.css',
  './game_24points/index.html',
  './game_24points/game.js',
  './game_24points/style.css'
];

// 安装 Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker 正在安装...');
  
  // 预缓存核心资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('缓存打开');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 激活 Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker 已激活');
  
  // 清理旧缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: 清理旧缓存', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 拦截请求并从缓存提供资源
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果在缓存中找到匹配的资源，则返回缓存的版本
        if (response) {
          return response;
        }
        
        // 否则发送网络请求
        return fetch(event.request)
          .then(response => {
            // 检查是否收到有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应（因为响应流只能使用一次）
            const responseToCache = response.clone();
            
            // 将新资源添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
      .catch(() => {
        // 如果网络请求失败且缓存中没有匹配项，可以返回一个离线页面
        // 这里简单返回，实际应用中可以返回一个自定义的离线页面
        console.log('离线访问，无法加载资源');
      })
  );
});