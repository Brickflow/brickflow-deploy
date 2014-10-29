'use strict';

var koa = require('koa');
var router = require('koa-router');
var serve = require('koa-static');
var app = koa();


app.use(router(app));

app.use(serve(__dirname + '\\static'));

app.listen(3000);

console.log('listening on your mother\'s ass ',__dirname+'\\static');
