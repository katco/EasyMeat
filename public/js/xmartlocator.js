var xmartlabslocator = {};
(function(publicScope) {
	var webSocket, map, markers, myMarker,clickMarker;
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var direct_start;
	var direct_end;
	var panelDiv = document.getElementById('direction-panel');
	var timeToGoal;
	var timeDiff;
	var room;
	//var infowindow;
	
	var int = 0;
		

	publicScope.initialize = function(socket, mapId) {
		webSocket = socket;
		markers = {};

		var defaultPosition = new google.maps.LatLng(-34.397, 150.644);
		var mapOptions = {
			zoom: 8,
			center: defaultPosition,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: [{
                    stylers: [{//色合いを設定
                        hue: "#808000"},//カラーコード
                    {   gamma: 1.50},//ガンマ値
                    {   saturation: -40}]}]//彩度

		};

		map = new google.maps.Map(document.getElementById(mapId), mapOptions);
		//xmartlabsutil.geolocation(showPosition);
		google.maps.event.addListener(map, 'click', mylistener);

		webSocket.on('location update', updateMarker);
		webSocket.on('user disconnected', removeMarker);
		//webSocket.emit('request locations', loadMarkers);
		
		//追加
		webSocket.on('new chat msg', receiveChatMessage);

		webSocket.on('send new goal',updateGoalPos);
		webSocket.on('set room name', function (name) {
		 
			room = name;
			xmartlabsutil.geolocation(showPosition);
		});
		
		
		$(document).on('click', ".sender", showUserLocation);
	}
	
	//クリックしたときのイベント
	publicScope.roloadMap = function() {
	
		google.maps.event.trigger(map, 'resize');
		
	}
	
	
	publicScope.loadMs = function() {
	
		webSocket.emit('request locations', loadMarkers);
		
	}
	
	  function mylistener(event) {
	console.log("mylistener:"+event);
	str = prompt("合言葉は？","");

//strが空の場合の処理
if (str == ""){
alert("空だよ");
return;
}else if(str == null){
alert("null");
return;
}else{
alert("いいね");
}
		  //ソケットで目的地変更のイベントを送信
		  webSocket.emit('updateGoal', event);

	  
    }
	function updateGoalPos(event) {
	
	var str;  //入力文字を入れる変数

//インプットボックスの表示＆入力文字をstrに代入

	////////////////////////////
	timeToGoal  = +new Date() + 54981249;
	timeDiff = timeToGoal - new Date();
	
	////////////////////////////
	
				 if(!clickMarker){
			  
			  
			  clickMarker = getMarker(event.latLng.pb, event.latLng.qb, 'click');
			  //directionを初期化
			
			  directionsDisplay = new google.maps.DirectionsRenderer();
			  directionsDisplay.setOptions(
			 {
				suppressMarkers: true
			 });
				directionsDisplay.draggable = true;
				directionsDisplay.setMap(map);
				directionsDisplay.setPanel(panelDiv);
				direct_end = new google.maps.LatLng(event.latLng.pb, event.latLng.qb);	  
				calcRoute();
				
			  clickloop();
			  }else{
			
			  clickMarker.setPosition(new google.maps.LatLng(event.latLng.pb, event.latLng.qb));	
			direct_end = new google.maps.LatLng(event.latLng.pb, event.latLng.qb);	
		calcRoute();
			  
			  }
			  
			  var canvas = document.getElementById("myCanvas");
      var c = canvas.getContext("2d");
	   var img = new Image();
  img.src = "http://maps.google.com/maps/api/staticmap?center=" + event.latLng.pb + "," + event.latLng.qb + "&zoom=16&size=320x320&sensor=false";
  /* 画像を描画 */
 // alert(img.src);
  img.onload = function() {
    c.drawImage(img, 0, 0);
	
  }
	
	}
	
	
	
	function clickloop(){
	
	clickMarker.setIcon("https://chart.googleapis.com/chart?chst=d_simple_text_icon_above&chld=残り"+computeDuration(timeDiff)+ "|24|00F|glyphish_flag|24|F88|FFF");
	timeDiff  = timeDiff - 1000;
	if(timeDiff > 0){
		window.setTimeout(clickloop,1000);
	}else{
		alert("時間です");
	}
	
	
	
	
	}
	
	/**
 * ミリ秒を時分秒へ変換
 * ms ミリ秒
 */
function computeDuration(ms){
    var h = String(Math.floor(ms / 3600000) + 100).substring(1);
    var m = String(Math.floor((ms - h * 3600000)/60000)+ 100).substring(1);
    var s = String(Math.round((ms - h * 3600000 - m * 60000)/1000)+ 100).substring(1);
    return h+':'+m+':'+s;
}
	//ルート計算
	function calcRoute() {
	   
		var request = {
			origin : direct_start,
			destination : direct_end,
			travelMode : google.maps.DirectionsTravelMode.DRIVING
		};
		directionsService.route(request, function(response, status) {
			if(status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				
			}
		});
	}

	function getMarker(lat, lng, title) {
	
	if(title=="Me"){
	
	return new google.maps.Marker({
			title: title,
			map: map,
			position: new google.maps.LatLng(lat,lng),
			
			
			icon: "http://www.google.com/mapfiles/gadget/arrowSmall80.png"
		});
	}else if(title == "click"){
	
	return new google.maps.Marker({
			title: title,
			map: map,
			position: new google.maps.LatLng(lat,lng),
			
			
			icon: "https://chart.googleapis.com/chart?chst=d_simple_text_icon_above&chld="+title+ "|24|00F|glyphish_flag|24|F88|FFF"
		});
	}else{
	return new google.maps.Marker({
			title: title,
			map: map,
			position: new google.maps.LatLng(lat,lng),
			
			
			icon: "https://chart.googleapis.com/chart?chst=d_simple_text_icon_above&chld="+title+ "|24|00F|glyphish_runner|24|F88|FFF"
		});
	
	}

		
		
	}

	function showPosition(position) {
	
		var data = {
			lat : position.coords.latitude,
			lng : position.coords.longitude,
		}

		myMarker = getMarker(data.lat, data.lng, 'Me');
		
		
	direct_start = new google.maps.LatLng(data.lat, data.lng);
	alert(direct_start);
		
		map.setCenter(myMarker.getPosition());
       
		//webSocket.to(room).emit("send location",data);
		webSocket.emit("send location",data);
		//webSocket.broadcast.emit("send location",data);
	}

	function showUserLocation(event){
	
		event.preventDefault();
		var key = $(event.currentTarget).data("key");
		if(key == xmartlabschat.user.key)
			map.setCenter(myMarker.getPosition());
		else {
			var userMarker = markers[key];
			if(userMarker)			
				map.setCenter(userMarker.getPosition());
			else
				alert("The user is no longer connected (or did not share his location)");
		}
	}

	function updateMarker(data) {
	
	 
		var marker = markers[data.key];
		//ルート表示の始点を変更
		
					if(marker) {
			marker.setPosition(new google.maps.LatLng(data.lat,data.lng));
			
		} else {
		
			markers[data.key] = getMarker(data.lat, data.lng, data.name);
		}		
	}
	
	

	function loadMarkers(data) {
	    
	    //alert(xmartlabschat.user.name);
		for(key in data) {
	        
			var user = data[key];
			if(user.room != room)
			continue;
			//xmartlabschat.addUser(user);
		
			markers[key] = getMarker(user.lat, user.lng, user.name);
			if(user.key == xmartlabschat.user.key){
				direct_start = new google.maps.LatLng(user.lat, user.lng);
			}
			
			
			
			
			
			
			
		}
	}

	function removeMarker(key){
		var marker = markers[key];
		if(marker){
			marker.setMap(null);
			delete markers[key];
		}
	}
	
	function receiveChatMessage(data) {
	
//	 var boxText = document.createElement("div");
 //       boxText.style.cssText = "border: 1px solid black; margin-top: 8px; background: #ffffff; padding: 5px;";
  //      boxText.innerHTML = "<h5>"+data.sender + ":</h5><h4>" +data.message + "</h4>";
                
    //    var myOptions = {
 //                content: boxText,
//				 alignBottom: true,
 // closeBoxURL: "",
 // disableAutoPan: true,
 // maxWidth: 0,  // no max
 // pixelOffset: new google.maps.Size(-140, -12), 
 // infoBoxClearance: new google.maps.Size(1, 1) 
                
   ///             ,closeBoxMargin: "10px 2px 2px 2px"
   //             ,closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif"
               
   //     };

     //   var infoBox = new InfoBox(myOptions);
    //    infoBox.open(map,myMarker);
		//addChatMessage(data.sender, data.key, data.message);
		infowindow=new google.maps.InfoWindow({
  /* 情報ウィンドウのオプション設定 */
	content: data.message
	});
	infowindow.open(map,markers[data.key]);
	}
})(xmartlabslocator);