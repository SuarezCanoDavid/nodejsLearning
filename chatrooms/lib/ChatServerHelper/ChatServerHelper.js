/// <reference path="../../typings/socket.io/socket.io.d.ts"/>
/// <reference path="../../typings/node/node.d.ts"/>
var socketio = require('socket.io');
var ChatServerHelper = (function () {
    function ChatServerHelper() {
        this.guestCount = 0;
        this.nickNames = {};
        this.namesUsed = [];
        this.usersLocation = {};
    }
    ChatServerHelper.prototype.listen = function (server) {
        var _this = this;
        this.io = socketio.listen(server);
        this.io.sockets.on('connection', function (socket) {
            _this.assignGuestName(socket);
            _this.joinRoom(socket, ChatServerHelper.initialRoom);
            _this.handleNameChangeAttempts(socket);
            _this.handleMessageBroadcasting(socket);
            _this.handleRoomJoining(socket);
            _this.handleClientDisconnection(socket);
            _this.handleRoomsRequest(socket);
        });
    };
    ChatServerHelper.prototype.assignGuestName = function (socket) {
        ++this.guestCount;
        var name = 'Guest ' + this.guestCount;
        this.nickNames[socket.id] = name;
        socket.emit('nameResult', {
            success: true,
            name: name
        });
        this.namesUsed.push(name);
    };
    ChatServerHelper.prototype.joinRoom = function (socket, room) {
        this.usersLocation[socket.id] = room;
        socket.join(room);
        socket.emit('joinResult', {
            room: room
        });
        socket.broadcast.to(room).emit('message', {
            text: this.nickNames[socket.id] + ' has joined ' + room + '.'
        });
        var usersInRoom = this.io.sockets.clients(room);
        if (usersInRoom.length > 1) {
            var usersList = new Array();
            for (var index in usersInRoom) {
                usersList.push(this.nickNames[usersInRoom[index].id]);
            }
            socket.emit('message', {
                text: "Users currently in " + room + ": " + usersList.join(", ")
            });
        }
    };
    ChatServerHelper.prototype.handleNameChangeAttempts = function (socket) {
        var _this = this;
        socket.on('nameAttempt', function (name) {
            if (name.indexOf('Guest') == 0) {
                socket.emit('nameResult', {
                    success: false,
                    message: 'Names cannot begin with "Guest".'
                });
            }
            else {
                if (_this.namesUsed.indexOf(name) == -1) {
                    var previousName = _this.nickNames[socket.id];
                    var index = _this.namesUsed.indexOf(previousName);
                    _this.namesUsed[index] = name;
                    _this.nickNames[socket.id] = name;
                    socket.emit('nameResult', {
                        success: true,
                        name: name
                    });
                    socket.broadcast.to(_this.usersLocation[socket.id]).emit('message', {
                        text: previousName + ' is now known as ' + name + '.'
                    });
                }
                else {
                    socket.emit('nameResult', {
                        success: false,
                        message: 'That name is already in use.'
                    });
                }
            }
        });
    };
    ChatServerHelper.prototype.handleMessageBroadcasting = function (socket) {
        var _this = this;
        socket.on('message', function (message) {
            socket.broadcast.to(message.room).emit('message', {
                text: _this.nickNames[socket.id] + ': ' + message.text
            });
        });
    };
    ChatServerHelper.prototype.handleRoomJoining = function (socket) {
        var _this = this;
        socket.on('join', function (room) {
            socket.leave(_this.usersLocation[socket.id]);
            _this.joinRoom(socket, room.newRoom);
        });
    };
    ChatServerHelper.prototype.handleClientDisconnection = function (socket) {
        var _this = this;
        socket.on('disconnect', function () {
            var index = _this.namesUsed.indexOf(_this.nickNames[socket.id]);
            delete _this.namesUsed[index];
            delete _this.nickNames[socket.id];
        });
    };
    ChatServerHelper.prototype.handleRoomsRequest = function (socket) {
        var _this = this;
        socket.on('rooms', function () {
            socket.emit('rooms', _this.io.sockets.manager.rooms);
        });
    };
    ChatServerHelper.initialRoom = "Lobby";
    return ChatServerHelper;
})();
exports.ChatServerHelper = ChatServerHelper;
//# sourceMappingURL=ChatServerHelper.js.map