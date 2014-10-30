'use strict';

var registerScripts = function(){
  var filenameArray = require('fs').
    readdirSync(__dirname + '/deployScripts');
  filenameArray.forEach(function (element){
    require('./deployScripts/' + element);
  });
};

module.exports = {registerScripts: registerScripts};
