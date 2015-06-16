/// <reference path="../../typings/socket.io/socket.io.d.ts"/>
/// <reference path="../../typings/node/node.d.ts"/>

import socketio = require('socket.io');
import http = require('http');

export class ChatServerHelper {
	io: SocketIO.Server;
	guestCount: number;
	nickNames: { [index: number] : string };
	namesUsed: string[];
	usersLocation: any;
	static initialRoom: string = "Lobby";

	constructor() {
		this.guestCount = 0;
		this.nickNames = {};
		this.namesUsed = [];
		this.usersLocation = {};
	}

	listen(server: http.Server): void {
		this.io = socketio.listen(server);

		this.io.sockets.on('connection', (socket: SocketIO.Socket) => {
			this.assignGuestName(socket);

			this.joinRoom(socket, ChatServerHelper.initialRoom);

			this.handleNameChangeAttempts(socket);

			this.handleMessageBroadcasting(socket);

			this.handleRoomJoining(socket);

			this.handleClientDisconnection(socket);

			this.handleRoomsRequest(socket);
		});
	}

	assignGuestName(socket: SocketIO.Socket) : void {
		++this.guestCount;

		var name = 'Guest ' + this.guestCount;

		this.nickNames[socket.id] = name;

		socket.emit('nameResult', {
			success: true,
			name: name
		});

		this.namesUsed.push(name);
	}

	joinRoom(socket: SocketIO.Socket, room: string) : void {
		this.usersLocation[socket.id] = room;

		socket.join(room);
		socket.emit('joinResult', {
			room: room
		});

		socket.broadcast.to(room).emit('message', {
			text: this.nickNames[socket.id] + ' has joined ' + room + '.'
		});

		var usersInRoom : any[] = this.io.sockets.clients(room);

		if(usersInRoom.length > 1) {
			var usersList = new Array<string>();

			for(var index in usersInRoom) {
				usersList.push(this.nickNames[usersInRoom[index].id]);
			}

			socket.emit('message', {
				text: "Users currently in " + room + ": " + usersList.join(", ")
			});
		}
	}

	handleNameChangeAttempts(socket: SocketIO.Socket) : void {
		socket.on('nameAttempt', (name: string) => {
			if(name.indexOf('Guest') == 0) {
				socket.emit('nameResult', {
					success: false,
					message: 'Names cannot begin with "Guest".'
				});
			} else {
				if(this.namesUsed.indexOf(name) == -1) {
					var previousName = this.nickNames[socket.id];
					var index = this.namesUsed.indexOf(previousName);

					this.namesUsed[index] = name;
					this.nickNames[socket.id] = name;

					socket.emit('nameResult', {
						success: true,
						name: name
					});

					socket.broadcast.to(this.usersLocation[socket.id]).emit('message', {
						text: previousName + ' is now known as ' + name + '.'
					});
				} else {
					socket.emit('nameResult', {
						success: false,
						message: 'That name is already in use.'
					});
				}
			}
		});
	}

	handleMessageBroadcasting(socket: SocketIO.Socket) : void {
		socket.on('message', (message: any) => {
			socket.broadcast.to(message.room).emit('message', {
				text: this.nickNames[socket.id] + ': ' + message.text
			});
		});
	}

	handleRoomJoining(socket: SocketIO.Socket) : void {
		socket.on('join', (room: any) => {
			socket.leave(this.usersLocation[socket.id]);
			this.joinRoom(socket, room.newRoom);
		});
	}

	handleClientDisconnection(socket: SocketIO.Socket) : void {
		socket.on('disconnect', () => {
			var index = this.namesUsed.indexOf(this.nickNames[socket.id]);

			delete this.namesUsed[index];
			delete this.nickNames[socket.id];
		});
	}

	handleRoomsRequest(socket: SocketIO.Socket) : void {
		socket.on('rooms', () => {
			socket.emit('rooms', this.io.sockets.manager.rooms);
		});
	}
}
