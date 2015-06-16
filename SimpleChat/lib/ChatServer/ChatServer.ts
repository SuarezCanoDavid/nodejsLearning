import * as socketio from 'socket.io';
import * as http from 'http';

export class ChatServer {
  io: SocketIO.Server;
  usersCounter: number;
  users: { [index: string] : string };

  constructor(server: http.Server) {
    this.io = socketio(server);
    this.usersCounter = 0;
    this.users = {};

    this.handleConnection();
  }

  handleConnection() : void {
    this.io.on('connection', (socket: SocketIO.Socket) => {
      console.log('user connected');
      this.notifyUserConnection(socket);

      this.handleDisconnection(socket);
      this.handleChatMessage(socket);
      this.handleUserWriting(socket);
    });
  }

  handleDisconnection(socket: SocketIO.Socket) : void {
    socket.on('disconnect', () => {
      console.log('user disconnected');
      this.notifyUserDisconnection(socket);
    });
  }

  handleChatMessage(socket: SocketIO.Socket) : void {
    socket.on('chat message', (message: string) => {
      socket.broadcast.emit('chat message', message);
    });
  }

  handleUserWriting(socket: SocketIO.Socket) : void {
    socket.on('user writing', () => {
      socket.broadcast.emit('user typing', this.users[socket.id]);
    });
  }

  assignNewUserName(id: string) : string {
    ++this.usersCounter;

    var name = 'Guest ' + this.usersCounter;
    this.users[id] = name;

    return name;
  }

  notifyUserConnection(socket: SocketIO.Socket) : void {
    var userName = this.assignNewUserName(socket.id);

    this.io.emit('user connected', userName);
  }

  notifyUserDisconnection(socket: SocketIO.Socket) : void {
    this.io.emit('user disconnected', this.users[socket.id]);

    delete this.users[socket.id];
  }
}
