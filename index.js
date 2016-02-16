var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(require('express').static('.'));

app.get('/', function(request, response) {
    response.sendFile(__dirname + '/index.html');
});

http.listen(3000, function() {
    console.log('listening on *:3000')
});

io.on('connection', function(socket){
    console.log('User connected');
    socket.on('disconnect', function(){
        console.log('User disconnected')
    });
    socket.on('chat message', function(message){
        console.log('Received message: ' + message);
        socket.broadcast.emit('chat message', message);
    });
});
