/// <reference path="typings/node/node.d.ts"/>

import http = require('http');
import url = require('url');
import fs = require('fs');
import path = require('path');

class Message {
  id: number;
  text: string;
  static counter: number = 0;

  constructor() {
    this.id = Message.counter++;
    this.text = '';
  }
  toString() : string {
    return 'id=' + this.id + ' text=' + this.text;
  }
}

var port: number = 3000;
var server: http.Server;
var messages: Message[] = new Array<Message>();
var counter: number = 0;



enum StatusCode {
  Ok = 200,
  BadRequest = 400,
  NotFound = 404,
  InternalServerError = 500
}

server = http.createServer((req: http.ServerRequest, res: http.ServerResponse) => {
  switch (req.method) {
    case 'POST':
      handlePost(req, res);
      break;
    case 'GET':
      handleGet(req, res);
      break;
    case 'DELETE':
      handleDelete(req, res);
      break;
    case 'PUT':
      handlePut(req, res);
      break;
  }
});

server.listen(port);

function handlePost(req: http.ServerRequest, res: http.ServerResponse) {
  var message = handleData(req);

  handleEnd(req, res, message);
}

function handleGet(req: http.ServerRequest, res: http.ServerResponse) {
  var pathname = url.parse(req.url).pathname;
  var start = pathname.lastIndexOf('.');

  if (start == -1) {
    getMessages(req, res);
  } else {
    getStatic(res, pathname, start + 1);
  }
}

function handleDelete(req: http.ServerRequest, res: http.ServerResponse) {
  var query = url.parse(req.url, true).query;

  if (isNaN(query.id)) {
    res.statusCode = StatusCode.BadRequest;
    res.end('Invalid Item Id\n');
    return;
  }

  var index = indexOfMessageById(messages, query.id);

  if (index == -1) {
    res.statusCode = StatusCode.NotFound;
    res.end('Item not found\n');
  } else {
    messages.splice(index, 1);
    res.end('Ok\n');
  }
}

function handlePut(req: http.ServerRequest, res: http.ServerResponse) {
  var query = url.parse(req.url, true).query;

  if (isNaN(query.id)) {
    res.statusCode = StatusCode.BadRequest;
    res.end('Invalid Item Id\n');
    console.log('Bad Request\n');
    return;
  }

  var index = indexOfMessageById(messages, query.id);

  if (index == -1) {
    res.statusCode = StatusCode.NotFound;
    res.end('Item not found\n');
    console.log('Item not found\n');
    return;
  }

  if (query.text !== undefined) {
    console.log(query.text + '\n');
    messages[index].text = query.text;
  }

  res.end('Ok\n');
}

function indexOfMessageById(messages: Message[], id: number) : number {
  for (var i = 0; i < messages.length; ++i) {
    if (messages[i].id = id) {
      return i;
    }
  }

  return -1;
}

function getMessages(req: http.ServerRequest, res: http.ServerResponse) : void {
  var body = messages.map((message: Message) => {
      return message.toString() + '\n';
  }).join('');

  res.setHeader('Content-Length', Buffer.byteLength(body).toString());
  res.setHeader('Content-Type', 'text/plain, charset="utf-8"');
  res.end(body);
}

function getStatic(res: http.ServerResponse, pathname: string, start: number) : void {
  var extension = pathname.slice(start);

  if (['html','css','js'].indexOf(extension) != -1) {
    var location = path.join(__dirname + '/public/' + extension, pathname);
    fs.stat(location, (err, stat) => {
      if (err) {
        if (err.code == 'ENOENT') {
          res.statusCode = StatusCode.NotFound;
          res.end('File not found\n');
        } else {
          res.statusCode = StatusCode.InternalServerError;
          res.end('Internal Sever Error\n');
        }
      } else {
        var stream = fs.createReadStream(location);

        stream.pipe(res);

        stream.on('error', (err) => {
          res.statusCode = StatusCode.InternalServerError;
          res.end('Internal Server Error\n');
        });
      }
    });
  } else {
    res.statusCode = StatusCode.NotFound;
    res.end('File not found\n');
  }
}

function handleData(req: http.ServerRequest) : Message {
  var message = new Message();
  messages.push(message);

  req.setEncoding('utf8');

  req.on('data', (chunk: Buffer) => {
    message.text += chunk;
  });

  return message;
}

function handleEnd(req: http.ServerRequest, res: http.ServerResponse, message: Message) : void {
  req.on('end', () => {
    console.log(message.toString());

    res.end('OK\n');
  });
}
