var execute = function(server, action){
  $.ajax('/execute/' + server + '/' + action, 'GET');
};
