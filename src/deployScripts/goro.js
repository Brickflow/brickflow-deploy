'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'goro',
  host: 'brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

var sshTask = new gulpSSH({
  ignoreErrors: false,
  sshConfig: {
    host: instance.host,
    port: 22,
    username: instance.username,
    privateKey: instance.pem
  }
});

gulp.task('deploy:'+ instance.name, function(){
  return sshTask.exec(['uptime']);
});
