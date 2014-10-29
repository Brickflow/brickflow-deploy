'use strict';

var registerScripts = function(filenameArray){
  filenameArray.forEach(function (element){
    require('./deployScripts/' + element);
  });
};

module.exports = {registerScripts: registerScripts};
