 'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var instance = {
  name: 'raiden',
  host: 'raiden.brickflow.com', // VPC IP
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
  Logstash2Influx: deploy, restart
 */

var deployLogstash2Influx = function(){
  gulp.start('deploy:'+ instance.name + ':logstash2influx');
};

gulp.task('deploy:'+ instance.name + ':logstash2influx', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'cd /home/ubuntu/brickflow-logstash2influx',
        'git pull origin master 2>&1',
        'npm install 2>&1',
        'forever stop /home/ubuntu/brickflow-logstash2influx/run.js',
        'forever start -a ' +
        '-l /home/ubuntu/brickflow-logstash2influx/log/forever.log ' +
        '-o /home/ubuntu/brickflow-logstash2influx/log/out.log ' +
        '-e /home/ubuntu/brickflow-logstash2influx/log/err.log ' +
        '/home/ubuntu/brickflow-logstash2influx/run.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'logstash2influx.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/'+ instance.name));
  }
);

var restartLogstash2Influx = function(){
  gulp.start('restart:'+ instance.name + ':logstash2influx');
};

gulp.task('restart:'+ instance.name + ':logstash2influx', function(){
    var sshTask = createConnection();
    return sshTask.exec([
        'cd /home/ubuntu/brickflow-logstash2influx',
        'forever stop /home/ubuntu/brickflow-logstash2influx/run.js',
        'forever start -a ' +
        '-l /home/ubuntu/brickflow-logstash2influx/log/forever.log ' +
        '-o /home/ubuntu/brickflow-logstash2influx/log/out.log ' +
        '-e /home/ubuntu/brickflow-logstash2influx/log/err.log ' +
        '/home/ubuntu/brickflow-logstash2influx/run.js',
        'forever list'
      ].join(' || >&2 echo "Error" && '),
      {filePath: 'logstash2influx.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/'+ instance.name));
  }
);

var logstash2influx = {
  deploy: deployLogstash2Influx,
  restart: restartLogstash2Influx
};

/*
  InfluxDB: restart
 */
var restartInfluxDB = function(){
  gulp.start('restart:'+ instance.name + ':influxdb');
};

gulp.task('restart:'+ instance.name + ':influxdb', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'sudo service influxdb restart'
      ],
      {filePath: 'influxdb.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/'+ instance.name));
  }
);

var influxdb = {
  restart: restartInfluxDB
};

/*
  Logstash: restart
 */
var restartLogstash = function(){
  gulp.start('restart:'+ instance.name + ':logstash');
};

gulp.task('restart:'+ instance.name + ':logstash', function(){
  var sshTask = createConnection();
    return sshTask.exec([
        'sudo service logstash restart'
      ],
      {filePath: 'logstash.log'}).
      on('error', console.log).
      pipe(gulp.dest('log/'+ instance.name));
  }
);

var logstash = {
  restart: restartLogstash
};

module.exports = {
  logstash2influx: logstash2influx,
  influxdb: influxdb,
  logstash: logstash
};
