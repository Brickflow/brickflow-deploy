'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'goro',
  host: 'brickflow.com', // VPC IP
  username: 'ubuntu',
  pem: require('../getPem').getPem('goro')
};

var createConnection = function(){
  return new gulpSSH({
    ignoreErrors: false,
    sshConfig: {
      host: instance.host,
      port: 22,
      username: instance.username,
      privateKey: instance.pem
    }
  });
};

/*
  AppServer: deploy, restart, test
 */
var stream = null;
var deployAppServer = function(sa){
  stream = sa;
  gulp.start('deploy:'+ instance.name + ':appserver');
};

gulp.task('deploy:'+ instance.name + ':appserver', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow_app',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop server/src/index.js',
        'forever start -a -l /home/ubuntu/brickflow_app/log/forever.log ' +
        '-o /home/ubuntu/brickflow_app/log/out.log ' +
        '-e /home/ubuntu/brickflow_app/log/err.log server/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'appServer.log'}).
      pipe(stream).
      on('error', console.log).
      pipe(gulp.dest('log/goro'));
  }
);

var restartAppServer = function(){
  gulp.start('restart:'+ instance.name + ':appserver');
};

gulp.task('restart:'+ instance.name + ':appserver', function(){
    var sshTask = createConnection();
    return sshTask.exec([
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow_app',
        'forever stop server/src/index.js',
        'forever start -a -l /home/ubuntu/brickflow_app/log/forever.log ' +
        '-o /home/ubuntu/brickflow_app/log/out.log ' +
        '-e /home/ubuntu/brickflow_app/log/err.log server/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'appServer.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/goro'));
  }
);

var testAppServer = function(sa){
  stream = sa;
  gulp.start('test:'+ instance.name + ':appserver');
};

gulp.task('test:'+ instance.name + ':appserver', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'uptime && ls -lh'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'appServer.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/goro')).
      pipe(stream);
  }
);

var appServer = {
  deploy: deployAppServer,
  restart: restartAppServer,
  test: testAppServer
};

/*
  Qumblr: deploy, restart
 */

var deployQumblr = function(){
  gulp.start('deploy:' + instance.name + ':qumblr');
};

gulp.task('deploy:'+ instance.name + ':qumblr', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'export QUMBLR_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/qumblr.js',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'grunt setup',
        'forever stop run.js',
        'forever start -a -l /home/ubuntu/qumblr.js/log/forever.log ' +
        '-o /home/ubuntu/qumblr.js/log/out.log ' +
        '-e /home/ubuntu/qumblr.js/log/err.log run.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'qumblr.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/goro')).
      pipe(stream);
  }
);

var restartQumblr = function(){
  gulp.start('restart:' + instance.name + ':qumblr');
};

gulp.task('restart:'+ instance.name + ':qumblr', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'export QUMBLR_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/qumblr.js',
        'forever stop run.js',
        'forever start -a -l /home/ubuntu/qumblr.js/log/forever.log ' +
        '-o /home/ubuntu/qumblr.js/log/out.log ' +
        '-e /home/ubuntu/qumblr.js/log/err.log run.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'qumblr.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/goro'));
  }
);

var qumblr = {
  deploy: deployQumblr,
  restart: restartQumblr
};


module.exports = {appServer: appServer, qumblr: qumblr};


