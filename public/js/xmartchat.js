var xmartlabschat = {};
(function(publicScope) {

	var user = {};
	var users = {};
	var usersCount, messagesListContainer, messagesList, messageBox, sendButton,messageBox2, sendButton2;
	
	publicScope.users = users;
	publicScope.user = user;

	publicScope.initialize = function(username, socket, containerId) {
		user.name = username;
		webSocket = socket;

		createChatWindow(containerId);

		webSocket.on("user connected", addUser);
		webSocket.on("user disconnected", removeUser);
		webSocket.on('new chat msg', receiveChatMessage);

		webSocket.emit('join', { name : user.name }, function(key){ user.key = key; });
	}
	
	

	function addUser(user){
	
		if(!users[user.key])
		
			//updateUsersCount(1);
			
		users[user.key] = user;
		
	}
	publicScope.addUser = addUser;

	function removeUser(key){
		if(users[key]) {
			delete users[key];		
			//updateUsersCount(-1);
		}
	}

	function updateUsersCount(diff){
	        
			var currentCount = parseInt(usersCount.html()) + diff;
			
			usersCount.html(currentCount);
	}

	function receiveChatMessage(data) {
		addChatMessage(data.sender, data.key, data.message);
	}
    function sendChatMessage2(){
	 if(/\S/.test(messageBox2.val())){
			var messageVal2 = messageBox2.val().replace(/\n/g,"<br/>");
			messageBox2.val('');		
			addChatMessage(user.name, user.key, messageVal2);
			webSocket.send(messageVal2);
		}
	}
	function sendChatMessage() {
		if(/\S/.test(messageBox.val())){
			var messageVal = messageBox.val().replace(/\n/g,"<br/>");
			messageBox.val('');		
			addChatMessage(user.name, user.key, messageVal);
			webSocket.send(messageVal);
		}
	}
	publicScope.sendMessage = function(message){
			
			addChatMessage(user.name, user.key, message);
			webSocket.send(message);
	}
	
	function onChatKeyPress2(event) {
		// If the user has pressed enter
		if(event.which == 13 && !event.shiftKey) {
			event.preventDefault();
			sendChatMessage2();
		}
	}

	function onChatKeyPress(event) {
		// If the user has pressed enter
		if(event.which == 13 && !event.shiftKey) {
			event.preventDefault();
			sendChatMessage();
		}
	}

	function addChatMessage(sender, key, msg) {
		var backToBottom = 
			messagesListContainer[0].scrollHeight - messagesListContainer.scrollTop() - messagesListContainer.outerHeight() < 5;

		var message = $(document.createElement("li"));
		var under = $(document.createElement("span"));
		
		if(user.key == key){
			message.addClass("chat-message-me");
			under.addClass("overlay-me");
		}else{
			message.addClass("chat-message");
			under.addClass("overlay");
		}
	
		message.append("<span class='message-date'>"+xmartlabsutil.getHoursAndMinutes()+"</span>");
		$("<span class='sender btn-link'>"+sender+"</span>").data('key',key).appendTo(message);
		message.append("<p>"+msg+"</p>");
		message.append(under);

		messagesList.append(message);

		if(backToBottom)
			messagesListContainer.animate({scrollTop: messagesListContainer[0].scrollHeight});
	}

	function createChatWindow(containerId){
	
	    
		var chatContainer = $("#"+containerId);

		$("<div>").addClass("chat-header").appendTo(chatContainer);

		messagesListContainer = $("<div>").addClass('chat-messages-container');
		messagesList = $('<ul>').addClass('chat-messages-list');
		messageBox = $('#msgBox');//$('<textarea>').attr("placeholder","メッセージを入力してください");
		sendButton = $('#sendButton');//$('<button>').addClass("btn btn-mini btn-primary pull-right").attr('type','submit').html("送信");
		messageBox2 = $('#msgBox2');//$('<textarea>').attr("placeholder","メッセージを入力してください");
		sendButton2 = $('#sendButton2');//$('<button>').addClass("btn btn-mini btn-primary pull-right").attr('type','submit').html("送信");
		//var messageBoxContainer = $('<div>').addClass('chat-messagebox-container');
var messageBoxContainer = $("#messageBoxContainer").addClass('chat-messagebox-container');

		messagesListContainer.append(messagesList);
		//messageBoxContainer.append(messageBox).append(sendButton);
		chatContainer.append(messagesListContainer)//.append(messageBoxContainer);

		messageBox.on('keypress', onChatKeyPress);
		sendButton.on('click', sendChatMessage);
		messageBox2.on('keypress', onChatKeyPress2);
		sendButton2.on('click', sendChatMessage2);		

		usersCount = $("#usersCount")
		$("#usersCountContainer").show();

		if(typeof $.fn.autogrow == 'function')
			messageBox.autogrow();
			messageBox2.autogrow();
	}
})(xmartlabschat);