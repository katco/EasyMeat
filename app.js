var fs = require('fs'),
  url = require('url'),
  http = require('http'),
  path = require('path'),
  mime = require('mime'),
  io = require('socket.io');

var httpServer = http.createServer(function(request, response) {
  var pathname = url.parse(request.url).pathname;
  if(pathname == "/") pathname = "index.html";
  var filename = path.join(process.cwd(), 'public', pathname);

  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found");
      response.end();
      return;
    }

    response.writeHead(200, { 'Content-Type': mime.lookup(filename) });
    fs.createReadStream(filename, {
      'flags': 'r',
      'encoding': 'binary',
      'mode': 0666,
      'bufferSize': 4 * 1024
    }).addListener("data", function(chunk) {
      response.write(chunk, 'binary');
    }).addListener("close", function() {
      response.end();
    });
  });
});

var connectedUsers = {};
var count = 0;
var roomList = new Object();
var jsonBoth = {};
  var room;
 
function htmlspecialchars(ch) { 
    
    return ch ;
}
var webSocket = io.listen(httpServer);

if(process.env.NODE_ENV == 'production') {
  webSocket.configure(function () { 
    webSocket.set("transports", ["xhr-polling"]); 
    webSocket.set("polling duration", 10); 
  });
}

webSocket.sockets.on('connection', function(socket) {

/////////////////////////////////////
count++;
console.log(count);

if(roomList){
        webSocket.sockets.emit("roomList", roomList);
    }
    //ルームが作られていればクライアントを更新
	function upDateRL(roomList){
        if(roomList){
            webSocket.sockets.emit('roomList', roomList);
        }
    }
	 socket.on("enter", function(data2){
	 console.log("enter");
        var data2name = htmlspecialchars(data2.value);
        //ルーム作成orルーム入室イベントが起きる。XSSを回避
        if(!roomList[data2name]){
            //ルームが作られていない場合
 
            roomList[data2name] = 1;
            console.log(data2name + "番ルームが作られました。" + roomList[data2name] + "人います。" );
 
            socket.set('room', data2name);
            socket.join(data2name);
			//ルーム名をクライアント側で持っておく
			  socket.emit('set room name', data2name);
 
            webSocket.sockets.to(data2name).emit('message', data2name + "に入室しました");
 
             
			
					webSocket.sockets.emit('roomList', roomList);
			
  
        }else if(roomList[data2name]){
            if(roomList[data2name] >= 1 && roomList[data2name] < 100){
                //ルームが作られていて、人数が1～3人の場合
                roomList[data2name]++;
 
                console.log(data2name+ "番ルームに入室しました。現在" + roomList[data2name] + "人");
 
                socket.set('room', data2name);
                socket.join(data2name);
			//ルーム名をクライアント側で持っておく
			  socket.emit('set room name', data2name);
                webSocket.sockets.to(data2name).emit('message', data2name + "に入室しました");
 
                 if(roomList){
			
					webSocket.sockets.emit('roomList', roomList);
				}
 
            }else{
                console.log(data2name+ "番ルームは満員です。");
                //ルームが作られていて人数が満員の時
            }
        }
    }); /////////////////////////////////////////////////////////////////////

 // 描画情報がクライアントから渡されたら、接続中の他ユーザーへ
  // broadcastで描画情報を送ります。
  // ちなみに、最近のsocket.IOでは、イベント名(以下だとdraw)は
  // 自由にネーミング出来るようになったようです。便利！！
  socket.on("draw", function (data) {
    console.log(data);
    socket.broadcast.to(room).emit("draw", data);
  });

  // 色変更情報がクライアントからきたら、
  // 他ユーザーへ変更後の色を通知します。
  socket.on("color", function (color) {
    console.log(color);
    socket.broadcast.to(room).emit("color", color);
	
  });

  // 線の太さの変更情報がクライアントからきたら、
  // 他ユーザーへ変更後の線の太さを通知します。
  socket.on("lineWidth", function (width) {
    console.log(width);
    socket.broadcast.to(room).emit("lineWidth", width);
  });
  
  socket.on("clear", function () {
    console.log(width);
    socket.broadcast.to(room).emit("clear");
  });
  // 目的地の変更情報がクライアントからきたら、
  // 他ユーザーへ変更後の目的地を通知します。
  socket.on("updateGoal", function (event) {
  
  
        socket.get('room', function(err, _room) {
            room = _room;
        });
	
    socket.broadcast.to(room).emit("send new goal", event);
    socket.to(room).emit("send new goal", event);
  });
 

  socket.on('join', function(user, sendKey) {
  
        socket.get('room', function(err, _room) {
            room = _room;
        });
    user.key = Date.now();
    socket.set('userkey', user.key);
    sendKey(user.key);
	user.room = room;

    connectedUsers[user.key] = user;
	
    socket.broadcast.emit("user connected", user);
  });

  socket.on('message', function(msg) {
  
   
        socket.get('room', function(err, _room) {
            room = _room;
        });

    socket.get('userkey', function(err, key) {
      var user = connectedUsers[key];
      if(user) {
	  msg = htmlspecialchars(msg);
        var data = {
          key : key,
          sender : user.name,
          message : msg
        };
        //socket.to(room).emit('new chat msg',data);
		socket.broadcast.to(room).emit('new chat msg',data);
		console.log('new chat msg');
		console.log(data);

		
      }
    });
  });

  socket.on("send location", function(data) {
  

        socket.get('room', function(err, _room) {
            room = _room;
        });
 
    socket.get('userkey', function(err, key) {
      var user = connectedUsers[key];
	 
      if(user) {
	  
        user.lat = data.lat;
        user.lng = data.lng;
		user.room = room;
        data.name = user.name;
        data.key = key;
		
	
        socket.broadcast.to(room).emit("location update", data);
      }
    });
  });

  socket.on("request locations", function(sendData) {
    sendData(connectedUsers);
	console.log("request locations");
	console.log(connectedUsers);
	
  });
  socket.on("set goal from iphone", function(data) {
   
	
	socket.broadcast.to(data.room).emit("send new goal from iphone", data);
    socket.to(data.room).emit("send new goal from iphone", data);
	console.log("xxxxxxxxxxxxxxxxxx");
	
  });

  socket.on('disconnect', function() {

   count--;
 
     
 
        socket.get('room', function(err, _room){
            room = _room;
        });
		
		if(room){
            roomList[room]--;   
            socket.leave(room);
 
            if(roomList[room] < 1){
                console.log(room + "の人数が0を下回りました。ルームを削除します。");
                delete roomList[room];
                console.log(roomList);
                webSocket.sockets.emit("roomDel", roomList);
            }else{
                console.log(room + "の人数：現在" + roomList[room]);
                webSocket.sockets.to(room).emit('message', room + "を退室しました");
             if(roomList){
			
					webSocket.sockets.emit('roomList', roomList);
				}
            }
        }
 
        console.log("ウェブサイトから退室：現在" + count + "人");
webSocket.sockets.emit("port", {value: count});
		
		///////////////////////////////////////
    socket.get('userkey', function(err, key) {
      var userInfo = connectedUsers[key];
      if(userInfo) {
        console.log('User ', userInfo.username, ' has disconnected. Key = ', key);
        delete connectedUsers[key];        
        socket.broadcast.emit("user disconnected", key);
      }
    });
  });
});

httpServer.listen(process.env.PORT || 8080, "0.0.0.0");
console.log('Server running at 8080');