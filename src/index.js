'use strict';

var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var stream = require('stream');
var ansi2html = require('ansi2html');
var app = koa();

app.use(router(app));
app.use(serve(__dirname + '/../static'));

function getFileStream(cb) {
  var fileStream = stream.Transform({ objectMode: true });
  fileStream._transform = function(chunk, enc, next) {
    cb(null, ansi2html(chunk.toString()));
    next();
  };
  return fileStream;
}

function getStdOutStream() {
  var s = stream.Transform({ objectMode: true });
  s._transform = function(chunk, enc, next) {
    var fileStream = getFileStream((function(err, file) {
      this.push(file);
      next();
    }).bind(this));
    chunk.pipe(fileStream);
    fileStream.read();
  };
  return s;
}

app.get('/execute/:server/:service/:action', function *(next){
  this.type = 'json';
  var stdOutStream = getStdOutStream();
  this.body = stdOutStream;
  require('./deployScripts/' + this.params.server)
    [this.params.service][this.params.action](stdOutStream);
  yield next;
});

app.listen(3000);

console.log('Deploy service started in dir ', __dirname);
