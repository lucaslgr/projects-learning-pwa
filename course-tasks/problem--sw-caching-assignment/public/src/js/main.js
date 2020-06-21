//DOM Elements 
var box = document.querySelector('.box');
var button = document.querySelector('button');
//========(6) Change some styling in the main.css file and make sure that the new file gets loaded + cached (hint: versioning)========
box.style.backgroundColor = 'blue';

//Variavel para guardar o evento de mostrar o banner para o usuário de instalação do app PWA
var deferredPrompt;

//Associando funcao ao evento beforeinstallprompt DEFAULT do navegador que apresenta o App PWA para o cliente para guardar o evento na variavel deferredPrompt e acioná-lo da forma que desejarmos
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallpromt fired');
  event.preventDefault();

  //Salvando o evento
  deferredPrompt = event;
  return false;
});

//Associando funcao ao evento de click do button da tela para apresentar o banner de instalação do PWA ao clicar
button.addEventListener('click', (event) => {
  if(deferredPrompt){
    deferredPrompt.prompt(); //Mostrando o banner

    //Verificando qual foi a escolha do cliente
    deferredPrompt.userChoice.then( (choiceResult) => {
      //Printando a escolha setada
      console.log(choiceResult.outcome);
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    })
    //Setando como null para não mostrar o banner toda hora
    deferredPrompt = null;
  }
});



button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});

//========(1) Register a Service Worker========
//Verificando se tem recurso de SW no navegador
if ('serviceWorker' in navigator) {
  //Se tiver, registra nosso SW
  navigator.serviceWorker
    .register('/sw.js')
    .then( () => {
      console.log('[Service Worker] registered!');
    })
    .catch( (err) => {
      console.log(err);
    });
}


//TODO - LIST TASKS
//========(1) Register a Service Worker========
//========(2) Identify the AppShell (i.e. core assets your app requires to provide its basic "frame")========
//========(3) Precache the AppShell========
//========(4) Add Code to fetch the precached assets from cache when needed========
//========(5) Precache other assets required to make the root index.html file work========
//========(6) Change some styling in the main.css file and make sure that the new file gets loaded + cached (hint: versioning)========
//========(7) Make sure to clean up unused caches========
// 8) Add dynamic caching (with versioning) to cache everything in your app when visited/ fetched by the user

// Important: Clear your Application Storage first to get rid of the old SW & Cache from the Main Course Project!