'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'goro',
  host: 'brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  AppServer: deploy, restart, test
 */

var deployAppServer = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'appserver',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow_app',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop server/src/index.js',
        'forever start --silent -a -l /dev/null server/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:'+ instance.name + ':appserver');
};

var restartAppServer = function(stream){
 taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'appserver',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow_app',
        'forever stop server/src/index.js',
        'forever start --silent -a -l /dev/null server/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':appserver');
};

var testAppServer = function(stream){
  taskManager.defineTask({
    taskName: 'test',
    serviceName: 'appserver',
    instance: instance,
    command: ['date && whoami && uptime && ls -lh'],
    stdOutStream: stream,
  });
  gulp.start('test:'+ instance.name + ':appserver');
};

var appserver = {
  deploy: deployAppServer,
  restart: restartAppServer,
  test: testAppServer
};

/*
  Qumblr: deploy, restart
 */

var deployQumblr = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'qumblr',
    instance: instance,
    command: [
        'export QUMBLR_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/qumblr.js',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'grunt setup',
        'forever stop run.js',
        'forever start --silent -a -l /dev/null run.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:' + instance.name + ':qumblr');
};

var restartQumblr = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'qumblr',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'export QUMBLR_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-qumblr',
        'forever stop run.js',
        'forever start --silent -a -l /dev/null run.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:' + instance.name + ':qumblr');
};

var qumblr = {
  deploy: deployQumblr,
  restart: restartQumblr
};


module.exports = {appserver: appserver, qumblr: qumblr};


