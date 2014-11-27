'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'cyrax',
  host: 'api.brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  API: deploy, restart
 */

var deployAPI = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'api',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-api',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /home/ubuntu/brickflow-api/src/index.js',
        'forever start -c "node --harmony" --silent ' +
          '/home/ubuntu/brickflow-api/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:'+ instance.name + ':api');
};

var restartAPI = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'api',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-api',
        'forever stop /home/ubuntu/brickflow-api/src/index.js',
        'forever start -c "node --harmony" --silent ' +
          '/home/ubuntu/brickflow-api/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':api');
};

var api = {
  deploy: deployAPI,
  restart: restartAPI
};

module.exports = {api: api};
