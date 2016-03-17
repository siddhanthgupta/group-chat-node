var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var util = require('util');
var bodyParser = require('body-parser');

// app.use(require('express').static('.'));
app.use('/assets', require('express').static(__dirname + '/assets'));
app.use(bodyParser.json()); // for parsing application/json

var allClients = {};
var clientSocketMap = {};

function validateName(name) {
    if(name.length <= 0)
        return 1;
    for(var socketId in clientSocketMap) {
        if(name.localeCompare(clientSocketMap[socketId])==0) {
            return 2;
        }
    }
    return 0;
};


function getUsers() {
    var userArr = [];
    for (var socketId in clientSocketMap) {
        userArr.push(clientSocketMap[socketId]);
    }
    return userArr;
};

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

app.post('/login', function (request, response) {
    util.log('Request recieved: \nmethod: ' + request.method + '\nurl: ' + request.url) // this line logs just the method and url
    console.log(request.body);
    var validation = validateName(request.body.name);
    if(validation == 0) {
        clientSocketMap[request.body.id] = request.body.name;
        console.log(clientSocketMap);
        var retObject = {"valid":true};

        retObject.users = getUsers();
        var socket = allClients[request.body.id];
        socket.broadcast.emit('change-users', getUsers());
        response.end(JSON.stringify(retObject));
    } else {
        var retObject = {"valid":false};
        retObject.validation = validation;
        response.end(JSON.stringify(retObject));
    }
});

http.listen(3000, function () {
    console.log('listening on *:3000')
});

io.on('connection', function (socket) {
    console.log('User connected');
    allClients[(String)(socket.id).slice(2)] = socket;
    // console.log(allClients);
    socket.on('disconnect', function () {
        console.log('User disconnected. The user is ');
        delete clientSocketMap[(String)(socket.id).slice(2)];
        delete allClients[(String)(socket.id).slice(2)];
        console.log(clientSocketMap);
        socket.broadcast.emit('change-users', getUsers());
    });
    socket.on('chat message', function (message) {
        console.log('Received message: ');
        console.log(message);
        socket.broadcast.emit('chat message', message);
    });
});
