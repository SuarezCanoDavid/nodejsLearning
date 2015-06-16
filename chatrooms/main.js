/// <reference path="typings/node/node.d.ts"/>
var http = require('http');
var help = require('./lib/HttpServerHelper/HttpServerHelper');
var server;
var serverHelper = new help.HttpServerHelper();
var port = 3000;
server = http.createServer(function (request, response) {
    var absPath = serverHelper.getAbsPathFromRequest(request);
    serverHelper.serveStatic(response, absPath);
});
server.listen(port, function () {
    console.log("Server listening on port " + port);
});
//# sourceMappingURL=main.js.map