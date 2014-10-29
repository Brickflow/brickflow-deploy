'use strict';

var pemFolder = '../pemFiles';
var pemFiles = require(pemFolder + 'pemFiles.json');

var getPem = function(instanceName){
  return require('fs').readFileSync(pemFiles[instanceName]);
};

module.exports = getPem;
