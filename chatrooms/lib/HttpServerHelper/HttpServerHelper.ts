/// <reference path="../../typings/mime/mime.d.ts"/>

import mime = require('mime');
import fs = require('fs');
import path = require('path');

export interface ICache {
	[index: string]: string;
}

export class HttpServerHelper {
	cache: ICache = {};

	getAbsPathFromRequest(request: any) {
		return './public' + (request.url == '/' ? '/index.html' : request.url);
	}

	send404(response: any) {
		response.writeHead(404, { 'Content-type': 'text/plain' });
		response.write("Error 404: resource not found.");
		response.end();
	}

	sendFile(response: any, filePath: string, fileContents: string) {
		response.writeHead(200, { 'Content-type': mime.lookup(path.basename(filePath)) });
		response.end(fileContents);
	}

	serveStatic(response: any, absPath: string) {
		if (this.cache[absPath]) {
			this.sendFile(response, absPath, this.cache[absPath]);
		} else {
			fs.exists(absPath, (exists: boolean) => {
				if (exists) {
					fs.readFile(absPath, (error, data) => {
						if (error) {
							this.send404(response);
						} else {
							this.cache[absPath] = data.toString();
							this.sendFile(response, absPath, data.toString());
						}
					});
				} else {
					this.send404(response);
				}
			});
		}
	}
}
