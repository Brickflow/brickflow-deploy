 'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'quan-chi',
  host: '54.172.28.59', // 172.30.1.94 VPC IP
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
  Logstash: restart
 */

var restartLogstash= function(){
  gulp.start('restart:'+ instance.name + ':logstash');
};

gulp.task('restart:'+ instance.name + ':logstash', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'sudo service logstash restart'
      ],
      {filePath: 'logstash.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/' + instance.name));
  }
);

var logstash = {
  restart: restartLogstash
};

module.exports = {
  logstash: logstash
};
