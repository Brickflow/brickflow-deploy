 'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'quan-chi',
  host: '172.30.1.94', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  Logstash: restart
 */

var restartLogstash= function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'logstash',
    instance: instance,
    command: ['sudo service logstash restart'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':logstash');
};

var logstash = {
  restart: restartLogstash
};

module.exports = {
  logstash: logstash
};
