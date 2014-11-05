'use strict';

var writeChunk = function(event, text){
  text += event.currentTarget.responseText.replace(/(?:\r\n|\r|\n)/g, '<br />');
  $('#terminalContent').html(text);
  console.log(text);
  $('.terminal').removeClass('hide');
};

var setLoading = function(element, value){
  if(value){
    $(element).addClass('loading');
  } else {
    $(element).removeClass('loading');
  }
};

var execute = function(server, service, action, element){
  if(window.confirm('Are you sure?')){
    var text = '';
    var xhr = new XMLHttpRequest();
    setLoading(element, true);

    xhr.overrideMimeType("text/plain; charset=x-user-defined");

    xhr.addEventListener('progress', function(event){
      writeChunk(event, text);
    }, false);

    xhr.addEventListener('load', function(event){
      writeChunk(event, text);
      setLoading(element, false);
    }, false);

    xhr.open('GET', '/execute/' + server + '/' + service + '/' + action, true);

    xhr.send();
  }
};

var hideTerminal = function(){
  $('.terminal').addClass('hide');
};
