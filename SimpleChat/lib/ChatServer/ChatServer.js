var socketio = require('socket.io');
var ChatServer = (function () {
    function ChatServer(server) {
        this.io = socketio(server);
        this.usersCounter = 0;
        this.users = {};
        this.handleConnection();
    }
    ChatServer.prototype.handleConnection = function () {
        var _this = this;
        this.io.on('connection', function (socket) {
            console.log('user connected');
            _this.notifyUserConnection(socket);
            _this.handleDisconnection(socket);
            _this.handleChatMessage(socket);
            _this.handleUserWriting(socket);
        });
    };
    ChatServer.prototype.handleDisconnection = function (socket) {
        var _this = this;
        socket.on('disconnect', function () {
            console.log('user disconnected');
            _this.notifyUserDisconnection(socket);
        });
    };
    ChatServer.prototype.handleChatMessage = function (socket) {
        socket.on('chat message', function (message) {
            socket.broadcast.emit('chat message', message);
        });
    };
    ChatServer.prototype.handleUserWriting = function (socket) {
        var _this = this;
        socket.on('user writing', function () {
            socket.broadcast.emit('user typing', _this.users[socket.id]);
        });
    };
    ChatServer.prototype.assignNewUserName = function (id) {
        ++this.usersCounter;
        var name = 'Guest ' + this.usersCounter;
        this.users[id] = name;
        return name;
    };
    ChatServer.prototype.notifyUserConnection = function (socket) {
        var userName = this.assignNewUserName(socket.id);
        this.io.emit('user connected', userName);
    };
    ChatServer.prototype.notifyUserDisconnection = function (socket) {
        this.io.emit('user disconnected', this.users[socket.id]);
        delete this.users[socket.id];
    };
    return ChatServer;
})();
exports.ChatServer = ChatServer;
//# sourceMappingURL=ChatServer.js.map