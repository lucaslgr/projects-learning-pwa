//Definindo variaveis com nome do cache static e dynamic
var CACHE_STATIC_NAME = 'static-v1';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';


//Associando funcao ao evento e de instalação disparado assim que o SW é registrado pelo app.js
self.addEventListener('install', (event) => {
    console.log('[Service Worker] installing...', event);

    //========(2) Identify the AppShell (i.e. core assets your app requires to provide its basic "frame")========
    //Inserindo arquivos no cache antes do evento terminar
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then( (cache) => {
    //========(3) Precache the AppShell========
                console.log('[Service Worker] Precaching App Shell...');
                cache.addAll([
                    '/', //Para puxar o index.html quando acessárem diretamente pela URL default
                    '/index.html',
                    '/src/js/main.js',
                    '/src/js/material.min.js',
                    '/src/css/main.css',
                    '/src/css/app.css',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css',
                ]);
            })
    );
});

//Associando função ao evento de ativação do SW
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating SW...'); 

    //========(7) Make sure to clean up unused caches========
    //usando o método waitUntil para não ir para outro evento enquanto essa promise não for resolvida
    event.waitUntil(
        //Analisando as keys de todos os caches, se não forem nenhum dos atuais, será deletado
        caches.keys()
            .then( (keysCachesArray) => {
                //Retorna um array de Promisses resolvendo cada map em busca de Caches antigos para limpá-los antes do captar os eventos de fetch
                return Promise.all(keysCachesArray.map( (key) => {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
                        console.log('[Service Worker] Removing old cache.', key);
                        //Deletando
                        caches.delete(key);
                    }
                }))
            })
    );

    //Retorna se o SW foi ativado corretamnete
    return self.clients.claim();
});

//========(4) Add Code to fetch the precached assets from cache when needed========
self.addEventListener('fetch', (event) => {
    console.log('[Service Worker] Fetching Something...');
    //Sobrecarregando a resposta da requisição
    event.respondWith(
        //Verificando se alguma key do cache armazenado bate com a URL da requisição
        caches.match(event.request)
            .then( (response) => { 
                if(response) { //Se encontrar essa requisicao salva no cache, pega de lá
                    return response;
                }else{ //Se não encontrar essa requisicao salva no cache, executa a requisicao com fetch
                    return fetch(event.request)
                        .then( (res) => {
//========(5) Precache other assets required to make the root index.html file work========
                            return caches.open(CACHE_DYNAMIC_NAME)
                                    .then( (cache) => {
//========(8) Add dynamic caching (with versioning) to cache everything in your app when visited/ fetched by the user========
                                        //Salvando a url dinamicamente como key e a um clone da resposta p/ não retornar vazio no primeiro consumo da resposta do request antes de armazenar no cache
                                        cache.put(event.request.url, res.clone())

                                        //Retornando a resposta da requisição obtida do fetch normalmente
                                        return res;
                                })
                        })
                        .catch( (err) => {
                            //Captando os erros quando ocorre um fetch com a aplicação offline
                        })
                }
            })
    )
}); 