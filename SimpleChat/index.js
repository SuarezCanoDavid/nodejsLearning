/// <reference path="typings/node/node.d.ts"/>
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var ChatServer_1 = require('./lib/ChatServer/ChatServer');
var app = express();
var server = http.createServer(app);
var io = socketio(server);
var port = 3000;
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/public/htmls/index.html');
});
app.use('/static', express.static('public'));
app.use('/modules', express.static('node_modules'));
server.listen(port, function () {
    console.log('listening on port ' + port);
});
var chatServer = new ChatServer_1.ChatServer(server);
//# sourceMappingURL=index.js.map