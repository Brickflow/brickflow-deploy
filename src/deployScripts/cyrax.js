'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'cyrax',
  host: 'api.brickflow.com', // VPC IP
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
  API: deploy, restart
 */


var deployAPI = function(){
  gulp.start('deploy:'+ instance.name + ':api');
};

gulp.task('deploy:'+ instance.name + ':api', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-api',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /home/ubuntu/brickflow-api/src/index.js',
        'forever start -c "node --harmony" -a ' +
        '-l /home/ubuntu/brickflow-api/log/forever.log ' +
        '-o /home/ubuntu/brickflow-api/log/out.log ' +
        '-e /home/ubuntu/brickflow-api/log/err.log ' +
        '/home/ubuntu/brickflow-api/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'api.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/cyrax'));
  }
);

var restartAPI = function(){
  gulp.start('restart:'+ instance.name + ':api');
};

gulp.task('restart:'+ instance.name + ':api', function(){
    var sshTask = createConnection();
    return sshTask.exec([
        'export BF_ENVIRONMENT="PROD"',
        'cd /home/ubuntu/brickflow-api',
        'forever stop /home/ubuntu/brickflow-api/src/index.js',
        'forever start -c "node --harmony" -a ' +
        '-l /home/ubuntu/brickflow-api/log/forever.log ' +
        '-o /home/ubuntu/brickflow-api/log/out.log ' +
        '-e /home/ubuntu/brickflow-api/log/err.log ' +
        '/home/ubuntu/brickflow-api/src/index.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'api.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/cyrax'));
  }
);

var api = {
  deploy: deployAPI,
  restart: restartAPI
};

module.exports = {api: api};
