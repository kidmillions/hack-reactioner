var express = require('express');
var mongoose = require('mongoose');
var app = express();
var http = require('http').Server(app);

mongoose.connect('mongodb://localhost/hackreactioner');


require('./config/config.js')(app, express);


http.listen(3000, function(){
  console.log('listening on *:3000');
});