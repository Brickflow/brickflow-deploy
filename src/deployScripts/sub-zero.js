'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'sub-zero',
  host: 'sentinel.brickflow.com', // VPC IP
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
  Sentinel: deploy, restart
 */


var deploySentinel = function(){
  gulp.start('deploy:'+ instance.name + ':sentinel');
};

gulp.task('deploy:'+ instance.name + ':sentinel', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'cd /var/www/sentinel.brickflow.com/',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /var/www/sentinel.brickflow.com/src/index.js',
        'forever start -a -l /var/www/sentinel.brickflow.com/log/forever.log ' +
        '-o /var/www/sentinel.brickflow.com/log/out.log ' +
        '-e /var/www/sentinel.brickflow.com/log/err.log ' +
        '/var/www/sentinel.brickflow.com/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'sentinel.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/sub-zero'));
  }
);

var restartSentinel = function(){
  gulp.start('restart:'+ instance.name + ':sentinel');
};

gulp.task('restart:'+ instance.name + ':sentinel', function(){
    var sshTask = createConnection();
    return sshTask.exec([
        'cd /var/www/sentinel.brickflow.com/',
        'forever stop /var/www/sentinel.brickflow.com/src/index.js',
        'forever start -a -l /var/www/sentinel.brickflow.com/log/forever.log ' +
        '-o /var/www/sentinel.brickflow.com/log/out.log ' +
        '-e /var/www/sentinel.brickflow.com/log/err.log ' +
        '/var/www/sentinel.brickflow.com/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'sentinel.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/sub-zero'));
  }
);

var sentinel = {
  deploy: deploySentinel,
  restart: restartSentinel
};

module.exports = {sentinel: sentinel};
