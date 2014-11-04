'use strict';

var execute = function(server, service, action){
  if(window.confirm('Are you sure?')){
    $.ajax('/execute/' + server + '/' + service + '/' + action, 'GET');
  }
};
