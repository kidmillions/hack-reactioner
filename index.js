var express = require('express');
var app = express();
var http = require('http').Server(app);
var partials = require('express-partials');

app.use(partials());
partials.register('.jade',require('jade').render); 


app.get('/', function(req, res){
  res.render('index.jade');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});