import socketio = require('socket.io');
import help = require('../ChatServerHelper/ChatServerHelper');

export class ChatServer {
	io: any;

	listen(server: any) {
		this.io = socketio.listen(server);
		this.io.set('log level', 1);

		var helper = new help.ChatServerHelper();

		this.io.sockets.on('connection', (socket) => {
			helper.assignGuestName(socket);
		});
	}
}
