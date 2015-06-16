/// <reference path="../../../../typings/knockout/knockout.d.ts"/>
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Chat"] = 0] = "Chat";
    MessageType[MessageType["NewUser"] = 1] = "NewUser";
})(MessageType || (MessageType = {}));
;
var UserAction;
(function (UserAction) {
    UserAction[UserAction["Reading"] = 0] = "Reading";
    UserAction[UserAction["Writing"] = 1] = "Writing";
})(UserAction || (UserAction = {}));
var ChatMessage = (function () {
    function ChatMessage(text, type) {
        this.text = text;
        this.type = type;
    }
    return ChatMessage;
})();
var User = (function () {
    function User() {
    }
    return User;
})();
var ChatRoomViewModel = (function () {
    function ChatRoomViewModel(socket) {
        this.userName = ko.observable('');
        this.roomName = ko.observable('');
        this.usersInRoom = ko.observableArray(new Array());
        this.inputMessage = ko.observable('');
        this.messages = ko.observableArray(new Array());
        this.socket = socket;
        this.handleIncomingMessage();
        this.handleOtherUserWriting();
    }
    ChatRoomViewModel.prototype.emitMessage = function () {
        var message = new ChatMessage(this.inputMessage(), MessageType.Chat);
        this.socket.emit("chat message", message);
        this.inputMessage('');
    };
    ChatRoomViewModel.prototype.handleIncomingMessage = function () {
        var _this = this;
        this.socket.on('chat message', function (message) {
            _this.messages.push(message);
        });
    };
    ChatRoomViewModel.prototype.handleOtherUserWriting = function () {
        this.socket.on('users typing', function (user) {
        });
    };
    return ChatRoomViewModel;
})();
//# sourceMappingURL=ChatRoomViewModel.js.map