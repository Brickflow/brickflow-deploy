'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instances = [
  {
    name: 'kano1',
    host: '54.85.20.120', // 172.30.1.146, // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano2',
    host: '54.165.225.231', // 172.30.1.167 // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano3',
    host: '54.172.8.47', // 172.30.1.227 // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano4',
    host: '54.164.1.116', // 172.30.1.228 // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano5',
    host: '54.84.246.238', // 172.30.1.226 // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  },
  {
    name: 'kano6',
    host: '54.85.116.233', // 172.30.1.225 // VPC IP
    username: 'ubuntu',
    pem: require('../getPem').getPem('goro')
  }
];

var createConnection = function(index){
  return new gulpSSH({
    ignoreErrors: false,
    sshConfig: {
      host: instances[index].host,
      port: 22,
      username: instances[index].username,
      privateKey: instances[index].pem
    }
  });
};

/*
  tumblr-rpc: deploy, restart
 */


var deployTumblrRpc = function(){
  console.log.apply(instances.map(function(element){
    return 'deploy:' + element.name + ':tumblr-rpc';
  }));
  instances.map(function(element){
    gulp.start('deploy:' + element.name + ':tumblr-rpc');
  });
};

instances.forEach(function(element, index){
  gulp.task('deploy:' + element.name + ':tumblr-rpc', function(){
    var sshTask = createConnection(index);
      return sshTask.exec([
          'cd /home/ubuntu/brickflow-tumblr-rpc',
          'git pull origin master 2>&1',
          'npm install 2>&1',
          'forever stop /home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever start -a ' +
          '-l /home/ubuntu/brickflow-tumblr-rpc/log/forever.log ' +
          '-o /home/ubuntu/brickflow-tumblr-rpc/log/out.log ' +
          '-e /home/ubuntu/brickflow-tumblr-rpc/log/err.log ' +
          '/home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever list'
        ].join(' || >&2 echo "Error" && '),
        {filePath: 'tumblr-rpc.log'}).
        on('error', console.log).
        pipe(gulp.dest('log/' + element.name));
    }
  );
});

var restartTumblrRpc = function(){
  console.log.apply(instances.map(function(element){
    return 'restart:' + element.name + ':tumblr-rpc';
  }));
  instances.map(function(element){
    gulp.start('restart:' + element.name + ':tumblr-rpc');
  });
};

instances.forEach(function(element, index){
  gulp.task('restart:' + element.name + ':tumblr-rpc', function(){
    var sshTask = createConnection(index);
      return sshTask.exec([
          'cd /home/ubuntu/brickflow-tumblr-rpc',
          'forever stop /home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever start -a ' +
          '-l /home/ubuntu/brickflow-tumblr-rpc/log/forever.log ' +
          '-o /home/ubuntu/brickflow-tumblr-rpc/log/out.log ' +
          '-e /home/ubuntu/brickflow-tumblr-rpc/log/err.log ' +
          '/home/ubuntu/brickflow-tumblr-rpc/run.js',
          'forever list'
        ].join(' || >&2 echo "Error" && '),
        {filePath: 'tumblr-rpc.log'}).
        on('error', console.log).
        pipe(gulp.dest('log/' + element.name));
    }
  );
});

var tumblrRpc = {
  deploy: deployTumblrRpc,
  restart: restartTumblrRpc
};

module.exports = {tumblrRpc: tumblrRpc};
