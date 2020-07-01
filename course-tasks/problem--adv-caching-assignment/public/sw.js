
var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/src/css/app.css',
  '/src/css/main.css',
  '/src/js/main.js',
  '/src/js/material.min.js',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});

function isInArray(string, array){
  for(let i = 0; array.lenght; i++){
    if(array[i] == string)
      return true;  
  }
  return false;
}

//! 2) Replace it with a ["Network only"] strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//     .then( (response) => {
//       return caches.open(CACHE_DYNAMIC_NAME)
//         .then( (cache) => {
//           cache.put(event.request.url, response.clone());
//           return response;
//         })
//     })
//   );
// });

//! 3) Replace it with a "Cache only" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

//! 4) Replace it with "Network, cache fallback" strategy =>  => Clear Storage (in Dev Tools), reload & try using your app offline
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request)
//       .then( (response) => {
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then( (cache) => {
//             cache.put(event.request.url, response.clone());
//             return response;
//           })
//       }).catch( (err) => {
//         return caches.match(event.request);
//       })
//   )
// });

//! 5) Replace it with a "Cache, then network" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
self.addEventListener('fetch', (event) => {
  if (event.request.url.indexOf('https://httpbin.org/ip') > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then( (cache) => {
          return fetch(event.request)
            .then( (response) => {
              cache.put(event.request.url, response.clone());
              return response;
            })
        })
    );
  }
  //! 6) Add "Routing"/ URL Parsing to pick the right strategies: Try to implement "Cache, then network", "Cache with network fallback" and "Cache only" (all of these, with appropriate URL selection)
  else if(isInArray(event.request.url, STATIC_FILES)){
    event.respondWith(
      caches.match(event.request)
    );
  }
  else{
    event.respondWith(
      caches.match(event.request)
        .then( (response) => {
          if(response){ //Se não existir esse cache retorna null no response
            return response;
          } else {
            return fetch(event.request)
              .then( (res) => {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then( (cache) => {
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch( (err) => {
                //page 404 fallback
                return cache.open(CACHE_STATIC_NAME)
                  .then( (cache) => {
                    if(event.request.headers.get('accept').inludes('text/html')){
                      return cache.match('/offline.html')
                    }
                  })
              });
          }
        })
    )
  }
});