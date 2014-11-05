'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');
var stream = require('stream');

var instances = [
  {
    name: 'kano1',
    host: '172.30.1.146', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  }
  /*{
    name: 'kano2',
    host: '172.30.1.167', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano3',
    host: '172.30.1.227', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano4',
    host: '172.30.1.228', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano5',
    host: '172.30.1.226', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano6',
    host: '172.30.1.225', // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  }*/
];

/*
  tumblr-rpc: deploy, restart
 */

var deployTumblrRpc = function(streamIn){
  var combinedStream = require('combined-stream').create();

  instances.map(function(instance){
    var tempStream = stream.PassThrough();
    taskManager.defineTask({
      taskName: 'deploy',
      serviceName: 'tumblr-rpc',
      instance: instance,
      command: [
          'cd /home/ubuntu/brickflow-tumblr-rpc',
          'git pull origin master 2>&1',
          'npm install 2>&1',
          'forever stop /home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever start -a ' +
          '-l /home/ubuntu/brickflow-tumblr-rpc/log/forever.log ' +
          '-o /home/ubuntu/brickflow-tumblr-rpc/log/out.log ' +
          '-e /home/ubuntu/brickflow-tumblr-rpc/log/err.log ' +
          '/home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever list'],
      stdOutStream: tempStream
    });
    combinedStream.append(tempStream);
    gulp.start('deploy:' + instance.name + ':tumblr-rpc');
  });
  combinedStream.pipe(streamIn);
};

var restartTumblrRpc = function(streamIn){
  //var combinedStream = require('combined-stream').create({pauseStreams: false});
  //combinedStream.maxDataSize = 1024 * 1024 * 1024;
  var bigStream = stream.PassThrough({ objectMode: true });
  instances.map(function(instance){
    var tempStream = stream.PassThrough({ objectMode: true });

    taskManager.defineTask({
      taskName: 'restart',
      serviceName: 'tumblr-rpc',
      instance: instance,
      command: [
          'cd /home/ubuntu/brickflow-tumblr-rpc',
          'forever stop /home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever start -a ' +
          '-l /home/ubuntu/brickflow-tumblr-rpc/log/forever.log ' +
          '-o /home/ubuntu/brickflow-tumblr-rpc/log/out.log ' +
          '-e /home/ubuntu/brickflow-tumblr-rpc/log/err.log ' +
          '/home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever list'],
      stdOutStream: tempStream,
    });
    //combinedStream.append(tempStream);
    tempStream.pipe(bigStream).on('end', function(d){
      console.log('EEEEEEEEEEEND',d);
    });
  });
  /*combinedStream.
    on('error', console.log).
    pipe(streamIn);
*/
    bigStream.pipe(streamIn).on('end', function(d){
      console.log('bigeeeeend',d);
    });


  instances.map(function(instance){
    gulp.start('restart:' + instance.name + ':tumblr-rpc');
  });
};

var tumblrRpc = {
  deploy: deployTumblrRpc,
  restart: restartTumblrRpc
};

module.exports = {tumblrRpc: tumblrRpc};
