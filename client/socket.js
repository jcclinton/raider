


	Init = {}
	Init.run = function(){

		socketController.connect();

		$('#canvas').click(function(e) {
				var x = this.offsetLeft;
				var y = this.offsetTop;
			Interface.click(e, x, y);
		});

		$('#disconnect').click(function(){
			socketController.close();
		});


		$('#text').keypress(function(event) {
			Interface.keyboard(event);
		});

		$('#canvas').append('<img src="images/zoqfot.big.12.png" id = "sprite" style="position:absolute; top:200px; left:200px;" />');

	}



	socketController = {};
	socketController.connect = function(){
			var host = "ws://localhost:8000/php2d/server/startDaemon.php";

			try{
				socketController.socket = new WebSocket(host);
				socketController.message('<p class="event">Socket Status: '+socketController.socket.readyState+'</p>');
				socketController.isConnected = true;

				//assign out relevant functions
				socketController.socket.onopen = socketController.open;
				socketController.socket.onmessage = socketController.receive;
				socketController.socket.onclose = socketController.close;

			} catch(exception){
				socketController.message('<p>Error'+exception+'</p>');
			}
	}

	socketController.open = function(){
		socketController.isConnected = true;
		socketController.message('<p class="event">Socket Status: '+socketController.socket.readyState+' (open)'+'</p>');
	}

	socketController.close = function(){
		socketController.isConnected = false;
		socketController.message('<p class="event bad">Socket Status: '+socketController.socket.readyState+' (Closed)'+'</p>');
	}

	socketController.receive = function(msg){
		//socketController.message(msg.data, 1);
		msg = socketController.getMessageObject(msg.data);
		var speed;
		if(msg.text == 'moving'){
			speed = 10;
			$('#sprite').animate({
				top: msg.y,
				left: msg.x
			}, speed);
			$('#chatLog').append('<p>moving to: ' + msg.x + ', '+  msg.y + '</p>');
		}else{
			msg = msg.text;
			socketController.message('<p class="event">guh?</p>');
		}
	}

	socketController.send = function(msg){
		if(socketController.isConnected){
			try{
				socketController.socket.send(msg);
				socketController.message('<p class="event">Sent: '+msg+'</p>')
			} catch(exception){
				socketController.message('<p class="warning">doh!</p>');
			}
		}else{
			socketController.message('<p class="event">Socket not connected!</p>')
		}
	}

	socketController.getMessageObject = function(msg){
		msg = "var obj = "+msg;
		eval(msg);
		return obj;
	}

	socketController.message = function(msg, type){
		if(type == 1){
			msg = socketController.getMessageObject(msg);
			msg = msg.text;
			msg = '<p class="message">Received: ' + msg + '</p>';
		}
		$('#chatLog').append(msg);
	}





	Interface = {};
	Interface.click = function(e, offsetLeft, offsetTop){
		var x = e.pageX - offsetLeft;
		var y = e.pageY - offsetTop;

		if(socketController.isConnected){
			$('#chatLog').append(x +', '+ y + '<br/>');
			socketController.send('{"action":"move", "x":'+x+', "y":'+y+'}');
		}else{
			socketController.message('<p> not connected? </p>');
		}

	}
	Interface.keyboard = function(event){
	  if (event.keyCode == '13') {
		 send();
	   }

	}