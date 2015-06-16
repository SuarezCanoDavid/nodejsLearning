/// <reference path="typings/node/node.d.ts"/>
var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');
var Message = (function () {
    function Message() {
        this.id = Message.counter++;
        this.text = '';
    }
    Message.prototype.toString = function () {
        return 'id=' + this.id + ' text=' + this.text;
    };
    Message.counter = 0;
    return Message;
})();
var port = 3000;
var server;
var messages = new Array();
var counter = 0;
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["Ok"] = 200] = "Ok";
    StatusCode[StatusCode["BadRequest"] = 400] = "BadRequest";
    StatusCode[StatusCode["NotFound"] = 404] = "NotFound";
    StatusCode[StatusCode["InternalServerError"] = 500] = "InternalServerError";
})(StatusCode || (StatusCode = {}));
server = http.createServer(function (req, res) {
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
function handlePost(req, res) {
    var message = handleData(req);
    handleEnd(req, res, message);
}
function handleGet(req, res) {
    var pathname = url.parse(req.url).pathname;
    var start = pathname.lastIndexOf('.');
    if (start == -1) {
        getMessages(req, res);
    }
    else {
        getStatic(res, pathname, start + 1);
    }
}
function handleDelete(req, res) {
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
    }
    else {
        messages.splice(index, 1);
        res.end('Ok\n');
    }
}
function handlePut(req, res) {
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
function indexOfMessageById(messages, id) {
    for (var i = 0; i < messages.length; ++i) {
        if (messages[i].id = id) {
            return i;
        }
    }
    return -1;
}
function getMessages(req, res) {
    var body = messages.map(function (message) {
        return message.toString() + '\n';
    }).join('');
    res.setHeader('Content-Length', Buffer.byteLength(body).toString());
    res.setHeader('Content-Type', 'text/plain, charset="utf-8"');
    res.end(body);
}
function getStatic(res, pathname, start) {
    var extension = pathname.slice(start);
    if (['html', 'css', 'js'].indexOf(extension) != -1) {
        var location = path.join(__dirname + '/public/' + extension, pathname);
        fs.stat(location, function (err, stat) {
            if (err) {
                if (err.code == 'ENOENT') {
                    res.statusCode = StatusCode.NotFound;
                    res.end('File not found\n');
                }
                else {
                    res.statusCode = StatusCode.InternalServerError;
                    res.end('Internal Sever Error\n');
                }
            }
            else {
                var stream = fs.createReadStream(location);
                stream.pipe(res);
                stream.on('error', function (err) {
                    res.statusCode = StatusCode.InternalServerError;
                    res.end('Internal Server Error\n');
                });
            }
        });
    }
    else {
        res.statusCode = StatusCode.NotFound;
        res.end('File not found\n');
    }
}
function handleData(req) {
    var message = new Message();
    messages.push(message);
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        message.text += chunk;
    });
    return message;
}
function handleEnd(req, res, message) {
    req.on('end', function () {
        console.log(message.toString());
        res.end('OK\n');
    });
}
