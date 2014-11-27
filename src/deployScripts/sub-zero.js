'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'sub-zero',
  host: 'sentinel.brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  Sentinel: deploy, restart
 */

var deploySentinel = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'sentinel',
    instance: instance,
    command: [
        'cd /var/www/sentinel.brickflow.com/',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /var/www/sentinel.brickflow.com/src/index.js',
        'forever start --silent -a -l /dev/null ' +
          '/var/www/sentinel.brickflow.com/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:'+ instance.name + ':sentinel');
};

var restartSentinel = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'sentinel',
    instance: instance,
    command: [
         'cd /var/www/sentinel.brickflow.com/',
        'forever stop /var/www/sentinel.brickflow.com/src/index.js',
        'forever start --silent -a -l /dev/null ' +
          '/var/www/sentinel.brickflow.com/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':sentinel');
};

var sentinel = {
  deploy: deploySentinel,
  restart: restartSentinel
};

module.exports = {sentinel: sentinel};
