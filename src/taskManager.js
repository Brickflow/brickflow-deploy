'use strict';

var gulp = require('gulp');
var gulpSSH = require('gulp-ssh');

var createConnection = function(instance){
  console.log('szopdleamitbasztam');
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

function defineTask(options) {
  gulp.task(options.taskName + ':' +
      options.instance.name + ':' +
      options.serviceName,
      function(){
      var sshTask = createConnection(options.instance);
        return sshTask.exec(
          options.command.join(' || >&2 echo "Error" && '),
          {filePath: options.serviceName + '.log'}).
          on('error', console.log).
          pipe(gulp.dest('log/' + options.instance.name)).
          pipe(options.stdOutStream);
      }
  );
}

module.exports = {defineTask: defineTask};
