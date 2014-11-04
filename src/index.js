'use strict';

var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var stream = require('stream');
var app = koa();
var bl = require('bl');

app.use(router(app));
app.use(serve(__dirname + '/../static'));

app.get('/execute/:server/:service/:action', function *(next){
  this.type = 'json';
  var s = this.body = stream.Transform({ objectMode: true });
  s._transform = function(a, b, next) {
    var s2 = stream.Transform({ objectMode: true });
    var that = this;
    s2._transform = function(a, b, next) {
      that.push(a.toString());
      next();
    };
    a.pipe(s2);
    s2.read();
    next();
  };
  require('./deployScripts/' + this.params.server)
    [this.params.service][this.params.action](s);
  yield next;
});

app.listen(3000);

console.log('listening on your mother\'s ass ',__dirname+'\\static');
