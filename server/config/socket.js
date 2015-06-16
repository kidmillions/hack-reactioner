module.exports = function (socket) {
  
  console.log('a user connected');

  socket.on('send:vote', function(vote) {
  	console.log('vote added');
  	socket.broadcast.emit('send:vote', vote);
  });

  socket.on('send:question', function(question) {
  	console.log('new question');
  	socket.broadcast.emit('send:question', question);
  })
};