 'use strict';

var gulp = require('gulp');
var taskManager = require('../taskManager');

var instance = {
  name: 'reptile',
  host: 'reptile.brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

/*
  Solr: restart
 */

var restartSolr = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'solr',
    instance: instance,
    command: ['sudo service tomcat7 restart'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':solr');
};

var solr = {
  restart: restartSolr
};

/*
  recommend: deploy, restart
 */

var deployRecommend = function(stream){
  taskManager.defineTask({
    taskName: 'deploy',
    serviceName: 'recommend',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-recommend',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /home/ubuntu/brickflow-recommend/src/index.js',
        'forever start -c "node --harmony" --silent ' +
          '/home/ubuntu/brickflow-recommend/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('deploy:'+ instance.name + ':recommend');
};

var restartRecommend = function(stream){
  taskManager.defineTask({
    taskName: 'restart',
    serviceName: 'recommend',
    instance: instance,
    command: [
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-recommend',
        'forever stop /home/ubuntu/brickflow-recommend/src/index.js',
        'forever start -c "node --harmony" --silent ' +
          '/home/ubuntu/brickflow-recommend/src/index.js',
        'forever list'],
    stdOutStream: stream,
  });
  gulp.start('restart:'+ instance.name + ':recommend');
};

var recommend = {
  deploy: deployRecommend,
  restart: restartRecommend
};

module.exports = {
  solr: solr,
  recommend: recommend
};
