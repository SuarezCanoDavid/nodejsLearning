/// <reference path="../../../../typings/knockout/knockout.d.ts"/>

enum MessageType {
  Chat,
  NewUser
};

enum UserAction {
  Reading,
  Writing
}

class ChatMessage {
  text: string;
  type: MessageType;

  constructor(text: string, type: MessageType) {
    this.text = text;
    this.type = type;
  }
}

class User {
  name: string;
  action: UserAction;
}

class ChatRoomViewModel {
  userName: KnockoutObservable<string>;
  roomName: KnockoutObservable<string>;
  usersInRoom: KnockoutObservableArray<string>;
  inputMessage: KnockoutObservable<string>;
  messages: KnockoutObservableArray<ChatMessage>;
  socket: SocketIO.Socket;

  constructor(socket: SocketIO.Socket) {
    this.userName = ko.observable('');
    this.roomName = ko.observable('');
    this.usersInRoom = ko.observableArray(new Array<string>());
    this.inputMessage = ko.observable('');
    this.messages = ko.observableArray(new Array<ChatMessage>());
    this.socket = socket;

    this.handleIncomingMessage();
    this.handleOtherUserWriting();
  }

  emitMessage() : void {
    var message: ChatMessage =
                new ChatMessage(this.inputMessage(), MessageType.Chat);

    this.socket.emit("chat message", message);

    this.inputMessage('');
  }

  handleIncomingMessage() : void {
    this.socket.on('chat message', (message: ChatMessage) => {
      this.messages.push(message);
    });
  }

  handleOtherUserWriting() : void {
    this.socket.on('users typing', (user: string) => {
      
    });
  }
}
