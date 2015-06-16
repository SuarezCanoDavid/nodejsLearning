var socketio = require('socket.io');
var help = require('../ChatServerHelper/ChatServerHelper');
var ChatServer = (function () {
    function ChatServer() {
    }
    ChatServer.prototype.listen = function (server) {
        this.io = socketio.listen(server);
        this.io.set('log level', 1);
        var helper = new help.ChatServerHelper();
        this.io.sockets.on('connection', function (socket) {
            helper.assignGuestName(socket);
        });
    };
    return ChatServer;
})();
exports.ChatServer = ChatServer;
//# sourceMappingURL=ChatServer.js.map