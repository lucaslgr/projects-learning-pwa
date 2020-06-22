
var box = document.querySelector('.box');
var button = document.querySelector('button');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Registered Service Worker!');
    });
}

button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});



//! 5) Replace it with a "Cache, then network" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
//Armazenando a url
let url = 'https://httpbin.org/ip';

//flag para identificar se o
let flagAnswerNetwork = false;

//* Buscando da rede
fetch('https://httpbin.org/ip')
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    flagAnswerNetwork = true; //Setando a flag como true
    console.log(data.origin);
    box.style.height = (data.origin.substr(0, 2) * 5) + 'px';
  });

//* Buscando do cache
//Verifica se o recurso de CACHES está disponível no navegador
if ('caches' in window) {
  caches.match(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log('from cache',data);
      if (flagAnswerNetwork !== true) { //Se não tiver obtido a resposta da network primeiro
        box.style.height = (data.origin.substr(0, 2) * 50) + 'px';
      }
    });
}

// 1) Identify the strategy we currently use in the Service Worker (for caching)
// R: Cache, fallback to newtork (with dynamic caching)
// 2) Replace it with a "Network only" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// 3) Replace it with a "Cache only" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// 4) Replace it with "Network, cache fallback" strategy =>  => Clear Storage (in Dev Tools), reload & try using your app offline
// 5) Replace it with a "Cache, then network" strategy => Clear Storage (in Dev Tools), reload & try using your app offline
// 6) Add "Routing"/ URL Parsing to pick the right strategies: Try to implement "Cache, then network", "Cache with network fallback" and "Cache only" (all of these, with appropriate URL selection)

// Important: Clear your Application Storage first to get rid of the old SW & Cache from the Main Course Project!