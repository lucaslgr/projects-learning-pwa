//variavel de controle do versionamento dos caches
var CACHE_STATIC_NAME = 'static-v4';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker....', event);
    
    //Abrindo o cache e esperando ele terminar antes de escutar outro evento com o SW
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then( (cache) => {
                console.log('[Service Worker] Precaching App Shell');

                /**
                 * Adicionando as requisições/arquivos no cache
                 * OBS: Armazena o conteúdo da requisição e a cache para acessá-lo é a propria URL da requisição
                 */
                cache.addAll([
                    '/', //Para puxar o index.html quando acessárem diretamente pela URL default
                    '/index.html',
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
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                ]);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...', event);

    event.waitUntil(
        caches.keys()
            .then( (keyList) => {
                //Retorna um array de Promisses resolvendo cada map em busca de Caches antigos para limpá-los antes do captar os eventos de fetch
                return Promise.all(keyList.map( (key) => {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                        console.log('[Service Worker] Removing old cache.', key);
                        caches.delete(key);
                    }
                }))
            })
    );

    //* Retorna se o SW foi ativado corretamente
    return self.clients.claim();
});

//* Todas as requisições fetch passarão primeiro pelo SW
self.addEventListener('fetch', (event) => {
    // console.log('[Service Worker] Fetching Something...', event);

    //* Sobreescrevendo a reposta da requisição
    event.respondWith(
        caches.match(event.request)
            .then( (response) => {
                if (response) { //Se encontrar essa requisicao salva no cache, pega de lá
                    return response;
                } else{ //Se não encontrar essa requisicao salva no cache, executa a requisicao com fetch
                    return fetch(event.request)
                            .then( (res) => { //Dinamic cache
                                return caches.open(CACHE_DYNAMIC_NAME)
                                        .then( (cache) => {
                                            //Salvando a url dinamicamente como key e a um clone da resposta p/ não retornar vazio no primeiro consumo da resposta do request antes de armazenar no cache
                                            cache.put(event.request.url, res.clone())
                                            return res;
                                        })
                            })
                            .catch((err) => { //Captando os erros quando ocorre um fetch com a aplicação offline
                                
                            }) 
                }
            })
    );
});