
var button = document.querySelector('#start-button');
var output = document.querySelector('#output');

button.addEventListener('click', function() {
  
  //! TODO 1:
  //! 1 - Handle the Promise "response" (=> the value you resolved) and return a fetch()
  //! 2 - call to the value (= URL) you resolved (use a GET request)

  //! 3 - Handle the response of the fetch() call and extract the JSON data, return that
  //! 4 - and handle it in yet another then() block

  //! 5 - Finally, output the "name" property of the data you got back (e.g. data.name) inside
  //! 6 - the "output" element (see variables at top of the file)

  // Create a new Promise here and use setTimeout inside the function you pass to the constructor
  let promise1 = new Promise((resolve, reject) => {

    setTimeout(function() { // <- Store this INSIDE the Promise you created!
      //! 1 - Resolve the following URL: https://swapi.co/api/people/1
      resolve('https://swapi.co/api/people/1')
    }, 3000);
  }).then( (url) => {
    
    //! 2 - Retornando o resultado da promise
    return fetch(url);
  }).then( (response) => {
    
    //! 3 - Transformando a responsa em um OBJETO json
    return response.json();
    //! 4 - Manipulando em outro .then
  }).then( (responseJSON) => {
    //! 5,6 - Setando o name do JSON no DOM com id=output
    output.textContent = responseJSON.name;
  });


  //! TODO 2:
  //! 1 - Repeat the exercise with a PUT request you send to https://httpbin.org/put
  //! 2 - Make sure to set the appropriate headers (as shown in the lecture)

  //! 3 - Send any data of your choice, make sure to access it correctly when outputting it
  //! Example: If you send {person: {name: 'Max', age: 28}}, you access data.json.person.name to output the name (assuming your parsed JSON is stored in "data") 

  let promise2 = new Promise( (resolve, reject) => {
    
    setTimeout( () => {
      resolve('https://httpbin.org/put')
    }, 3000);
  }).then( (url) => {
    
    return fetch(url, {
        method:'PUT',
        headers:{
          'Content-Type':'application/json',
          'Accept':'application/json' 
        },
        mode:'cors',
        body:JSON.stringify({
            person: {name: 'Max', age: 28}  
        })
      });
  }).then( (response) => {
    
    return response.json();
  }).then( (responseJSON) => {

    output.textContent = responseJSON.person.name;
  })

  //! TODO 3:
  //! 1 - To finish the assignment, add an error to URL and add handle the error both as a second argument to then() as well as via the alternative taught in the module

  let promise3 = new Promise( (resolve, reject) => {
    
    setTimeout( () => {
      resolve('https://httpbin.org/putssss')
    }, 3000);
  }).then( (url) => {
    
    return fetch(url, {
        method:'PUT',
        headers:{
          'Content-Type':'application/json',
          'Accept':'application/json' 
        },
        mode: 'cors',
        body:JSON.stringify({
            person: {name: 'Max', age: 28}  
        })
      });
  }).then( (response) => {
    
    return response.json();
  }).then( (responseJSON) => {

    output.textContent = responseJSON.person.name;
  }).catch( (err) => {
    console.log(err);
  })
});