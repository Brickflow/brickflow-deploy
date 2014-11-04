 'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'reptile',
  host: 'reptile.brickflow.com', // VPC IP
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
  InfluxDB: restart
 */

var restartSolr = function(){
  gulp.start('restart:'+ instance.name + ':solr');
};

gulp.task('restart:'+ instance.name + ':solr', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'sudo service tomcat7 restart'
      ],
      {filePath: 'solr.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/'+ instance.name));
  }
);

var solr = {
  restart: restartSolr
};

module.exports = {
  solr: solr
};
