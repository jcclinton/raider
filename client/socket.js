


	Init = {}
	Init.run = function(){

		socketController.connect();

		canvas_element = $('#canvas');

		World.init(canvas_element);

		canvas_element.click(function(e) {
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

		Unit.init();

	}

	World = {}
	World.height = 800;
	World.width = 600;
	World.init = function(canvas){
		World.canvas = canvas;
		canvas.css('height', World.height);
		canvas.css('width', World.width);
	}
	//World.background = {type:"color",}



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
		msg = msg.text;
		socketController.message('<p class="event">received: '+msg+'</p>');
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

		Unit.move(x,y);
		socketController.send('{"action":"move", "x":'+x+', "y":'+y+'}');

	}
	Interface.keyboard = function(event){
	  if (event.keyCode == '13') {
		 send();
	   }

	}



	Unit = {}

	Unit.init = function(){
		var top = '200';
		var left = '100';
		$('#canvas').append('<img src="images/zoqfot.big.12.png" id = "sprite" style="position:absolute; top:300px left:100px;" />');
		Unit.speed = 1000;
	}

	Unit.move = function(x, y){
		$('#sprite').animate({
			top: y,
			left: x
		},
		Unit.speed,
		function(){
			Unit.hasArrived(x, y);
		});
		socketController.message('<p>moving to: ' + x + ', '+  y + '</p>');
	}

	Unit.hasArrived = function(x, y){
		socketController.message('<p>arrived at: ' + x + ', '+  y + '</p>');
		socketController.send('{"action":"arrived", "x":'+x+', "y":'+y+'}');
	}