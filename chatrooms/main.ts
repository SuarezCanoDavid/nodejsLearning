/// <reference path="typings/node/node.d.ts"/>

import http = require('http');
import help = require('./lib/HttpServerHelper/HttpServerHelper');
//import chatServer = require('./lib/ChatServer/ChatServer');

var server: http.Server;
var serverHelper = new help.HttpServerHelper();
var port = 3000;

server = http.createServer((request: http.ServerRequest, response: http.ServerResponse) => {
	var absPath = serverHelper.getAbsPathFromRequest(request);

	serverHelper.serveStatic(response, absPath);
});

server.listen(port, () => {
	console.log("Server listening on port " + port);
});

//chatServer.listen(server);
