/// <reference path="../../typings/mime/mime.d.ts"/>
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var HttpServerHelper = (function () {
    function HttpServerHelper() {
        this.cache = {};
    }
    HttpServerHelper.prototype.getAbsPathFromRequest = function (request) {
        return './public' + (request.url == '/' ? '/index.html' : request.url);
    };
    HttpServerHelper.prototype.send404 = function (response) {
        response.writeHead(404, { 'Content-type': 'text/plain' });
        response.write("Error 404: resource not found.");
        response.end();
    };
    HttpServerHelper.prototype.sendFile = function (response, filePath, fileContents) {
        response.writeHead(200, { 'Content-type': mime.lookup(path.basename(filePath)) });
        response.end(fileContents);
    };
    HttpServerHelper.prototype.serveStatic = function (response, absPath) {
        var _this = this;
        if (this.cache[absPath]) {
            this.sendFile(response, absPath, this.cache[absPath]);
        }
        else {
            fs.exists(absPath, function (exists) {
                if (exists) {
                    fs.readFile(absPath, function (error, data) {
                        if (error) {
                            _this.send404(response);
                        }
                        else {
                            _this.cache[absPath] = data.toString();
                            _this.sendFile(response, absPath, data.toString());
                        }
                    });
                }
                else {
                    _this.send404(response);
                }
            });
        }
    };
    return HttpServerHelper;
})();
exports.HttpServerHelper = HttpServerHelper;
//# sourceMappingURL=HttpServerHelper.js.map