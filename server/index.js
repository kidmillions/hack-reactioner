var express = require('express');
var mongoose = require('mongoose');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 5000;
mongoose.connect('mongodb://localhost/hackreactioner');


require('./config/config.js')(app, express);

io.on('connection', require('./config/socket.js'));


http.listen(port, function(){
  console.log('listening on *:3000');
});