var deferredPrompt;

//* Verifica se o navegador tem Promises e Fetch API, se não houver, importa localmente dos arquivos Polyfills
if (window.Promise) {
    window.Promise = Promise;    
}

//* Verificando se o navegador suporta SW
if ('serviceWorker' in navigator) {

    //* Registrando o SW
    navigator.serviceWorker
        .register('/sw.js')
        .then( () => {
            console.log('Service Worker registred');
        })
        .catch((error) => { //Tratando caso a promise seja rejeitada
            console.log(error);
        });
}

//* Pegando o evento default que mostra o banner do PWA no navegador e configurando para mostrar o banner em outro momento
window.addEventListener('beforeinstallprompt', (event) => {
    console.log('beforeinstallpromt fired');
    event.preventDefault();

    //* Salvando o evento
    deferredPrompt = event;
    return false;
});