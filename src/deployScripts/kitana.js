 'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'kitana',
  host: 'kitana.brickflow.com', // VPC IP
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
  RabbitMQ: restart
 */

var restartRabbitMQ = function(){
  gulp.start('restart:'+ instance.name + ':rabbitmq');
};

gulp.task('restart:'+ instance.name + ':rabbitmq', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'sudo service rabbitmq-server restart'
      ],
      {filePath: 'rabbitmq.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/kitana'));
  }
);

var rabbitmq = {
  restart: restartRabbitMQ
};

module.exports = {
  rabbitmq: rabbitmq
};
