var CACHE_STATIC_NAME = 'static-v13';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

/**
 * 
 * @param {string} cacheName 
 * @param {int} maxItems 
 */
function trimCache(cacheName, maxItems){
  caches.open(cacheName)
    .then( (cache) => {
      return cache.keys()
      .then( (keys) =>{
        if(keys.length > maxItems){
          cache.delete(keys[0])
            .then(trimCache(cacheName, maxItems));
        }
      })
    })
}

/**
 * Verifica se a string procurada existe no array de strings
 * @param {string procurada} string 
 * @param {array de strings} array 
 */
function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
            
          }
        }));
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = 'https://httpbin.org/get';

  /**
   * Para requisição que os dados sempre são atualizado, elas passam por esse filtro, logo, sempre é realizado 
   * uma nova requisição, salva no cache dinâmico, e retorna a resposta
  */
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              //Limpando os arquivos mais antigos cacheados
              trimCache(CACHE_DYNAMIC_NAME, 3);
              //Inserindo no cache um clone da resposta
              cache.put(event.request, res.clone());
              return res;
            });
        })
    );
  }
  /**
   * Requisições a arquivos do CACHE_STATIC_NAME, cacheados na hora da instalação do SW, são requisitados
   * diretamente no cache, pois praticamente nunca se alteram, logo não há necessidade de ficar consultando-os
   * na rede e atualizado seus caches.
   */
  else if(isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  }
  /**
   * Requisições não filtradas, caem nesse fluxo, onde primeiro são buscadas no cache, e em segundo lugar
   * se não encontrado nenhum resultado no cache, são requisitadas na rede, se encontradas, salvamos no cache
   * se não encontrdas novamente, levamos para a nossa página de fallback cacheada no cache estático
   */
  else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    //Limpando os arquivos mais antigos cacheados
                    trimCache(CACHE_DYNAMIC_NAME, 3);
                    //Inserindo no cache um clone da resposta
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    /**
                     * Retorna a página de fallback somente nos casos que algum arquivo do help page não conseguir ser 
                     * requisitado nem no cache e nem na rede, pois assim evita que caso um arquivo .css não seja requisitado 
                     * com sucesso no cache e nem na rede, a nossa estratégia retorna a página de fallback do nosso cache para a
                     * requisição do arquivo 
                     */
                    if(event.request.headers.get('accept').includes('text/html')){
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });