class Chat {
	socket: any;
	
	constructor(socket: any) {
		this.socket = socket;
	}
	
	sendMessages(room: any, text: string) : void {
		this.socket.emit('message', {
			room: room,
			text: text
		});
	}
	
	changeRoom(room: string) : void {
		this.socket.emit('join', {
			newRoom: room
		});
	}
	
	processCommand(userCommand: string) : string {
		var words = userCommand.split(' ');
		var command = words[0].substr(1, words[0].length).toLocaleLowerCase();
		var message: string = undefined;
		
		switch(command) {
			case 'join':
				words.shift();
				var room = words.join(' ');
				this.changeRoom(room);
				break;
			case 'nick':
				words.shift();
				var name = words.join(' ');
				this.socket.emit('nameAttempt', name);
				break;
			default:
				message = 'Unrecognized command.';
				break;
		}
		
		return message;
	}
}