import * as express from 'express';
import * as http from 'http';
import * as socketio from 'socket.io';
import { ChatServer } from './lib/ChatServer/ChatServer';

var app = express();
var server = http.createServer(app);
var io: SocketIO.Server = socketio(server);

var port: number = 3000;

app.get('/', (request: any, response: any) => {
  response.sendFile(__dirname + '/public/htmls/index.html');
});

app.use('/static', express.static('public'));
app.use('/modules', express.static('node_modules'));

server.listen(port, () => {
  console.log('listening on port ' + port);
});

var chatServer = new ChatServer(server);
