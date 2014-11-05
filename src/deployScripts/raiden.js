 'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'raiden',
  host: 'raiden.brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  Logstash2Influx: deploy, restart
 */

var deployLogstash2Influx = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'logstash2influx',
    instance: instance,
    command: [
        'cd /home/ubuntu/brickflow-logstash2influx',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /home/ubuntu/brickflow-logstash2influx/run.js',
        'forever start -a ' +
        '-l /home/ubuntu/brickflow-logstash2influx/log/forever.log ' +
        '-o /home/ubuntu/brickflow-logstash2influx/log/out.log ' +
        '-e /home/ubuntu/brickflow-logstash2influx/log/err.log ' +
        '/home/ubuntu/brickflow-logstash2influx/run.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:'+ instance.name + ':logstash2influx');
};

var restartLogstash2Influx = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'logstash2influx',
    instance: instance,
    command: [
        'cd /home/ubuntu/brickflow-logstash2influx',
        'forever stop /home/ubuntu/brickflow-logstash2influx/run.js',
        'forever start -a ' +
        '-l /home/ubuntu/brickflow-logstash2influx/log/forever.log ' +
        '-o /home/ubuntu/brickflow-logstash2influx/log/out.log ' +
        '-e /home/ubuntu/brickflow-logstash2influx/log/err.log ' +
        '/home/ubuntu/brickflow-logstash2influx/run.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':logstash2influx');
};

var logstash2influx = {
  deploy: deployLogstash2Influx,
  restart: restartLogstash2Influx
};

/*
  InfluxDB: restart
 */
var restartInfluxDB = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'influxdb',
    instance: instance,
    command: ['sudo service influxdb restart'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':influxdb');
};

var influxdb = {
  restart: restartInfluxDB
};

/*
  Logstash: restart
 */
var restartLogstash = function(stream){
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
  logstash2influx: logstash2influx,
  influxdb: influxdb,
  logstash: logstash
};
