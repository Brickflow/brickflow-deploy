 'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'kitana',
  host: 'kitana.brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  RabbitMQ: restart
 */

var restartRabbitMQ = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'rabbitmq',
    instance: instance,
    command: ['sudo service rabbitmq-server restart'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':rabbitmq');
};

var rabbitmq = {
  restart: restartRabbitMQ
};

var checkRabbitMQ = function(stream){
  taskManager.defineTask({
    taskName: 'check',
    serviceName: 'rabbitmq',
    instance: instance,
    command: [
    'sudo rabbitmqctl list_queues',
    'sudo service rabbitmq-server status'],
    stdOutStream: stream,
  });
  gulp.start('check:'+ instance.name + ':rabbitmq');
};

var rabbitmq = {
  restart: restartRabbitMQ,
  check: checkRabbitMQ
};
module.exports = {
  rabbitmq: rabbitmq
};
