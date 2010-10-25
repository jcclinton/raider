

		var UnitList = Backbone.Collection.extend({
		});
		var list = new UnitList;



		var Unit = Backbone.Model.extend({

			initialize: function(attributes) {
				this.set({x: attributes.x, y: attributes.y, id: attributes.id});
				$('#canvas').append('<img src="images/zoqfot.big.12.png" id = "sprite" style="position:absolute; top:'+this.get('y')+'px; left:'+this.get('x')+'px;" />');
				console.log('creating model');
				list.add(this);
			},

			init: function(data){
				var new_id = data.id;
				this.set({id: new_id});
				console.log('initializing model to id: '+this.get('id'));
			},

			move: function(){
				console.log('moving model');
			}

		});












		var UnitView = Backbone.View.extend({
		  initialize: function() {
		  	console.log('view init');
		    //_.bindAll(this, "render");
		  	this.handleEvents();
		  },

		  events: {
		    "click":          "move"
		  },

		  render: function() {
			console.log('render');
		  	//alert('hi');
		  	//this.handleEvents();

		  	return this;
		  },

		  move: function(e){
			console.log('move');

			var dx = e.pageX - 8;
			var dy = e.pageX - 8;

			var distance = Math.sqrt( Math.pow(dx - this.model.get('x'), 2) + Math.pow(dy - this.model.get('y'), 2)  );

			var time = 5 * distance;
			//time = 1000;

			//		console.log(distance + ' ' + dy + ' ' + this.model.get('y'));
			this.model.set({x:dx, y:dy});
			this.model.save();

			$('#sprite').animate({
				top: this.model.get('y'),
				left: this.model.get('x')
			},
			time,
			'linear');
		  }

		});


		Backbone.sync = function(method, model, success, error) {
			if(method == 'create'){
				var msg = '{"action":"create"}';
			}else{
				var x = model.get('x');
				var y = model.get('y');
				var msg = '{"action":"move", "x":'+x+', "y":'+y+'}';
			}
			socketController.send(msg);
		}




	socketController = {
		connect : function(){
				var host = "ws://localhost:8000/php2d/server/startDaemon.php";

				try{
					this.socket = new WebSocket(host);
					this.message('<p class="event">Socket Status: '+this.socket.readyState+'</p>');
					this.isConnected = true;

					//assign out relevant functions
					this.socket.onopen = this.open;
					this.socket.onmessage = this.receive;
					this.socket.onclose = this.close;

				} catch(exception){
					this.message('<p>Error'+exception+'</p>');
				}
		},

		open : function(){
			this.isConnected = true;
			this.message('<p class="event">Socket Status: '+this.socket.readyState+' (open)'+'</p>');
		},

		close : function(){
			this.isConnected = false;
			this.message('<p class="event bad">Socket Status: '+this.socket.readyState+' (Closed)'+'</p>');
		},

		receive : function(msg){
			//this.message(msg.data, 1);
			msg = this.getMessageObject(msg.data);
			var text = msg.text;

			if(msg.command == 'init'){
				var u = new Unit({x: 200,y: 100, id: msg.id});
				new UnitView({el: $('#canvas'), model: u});
			}

			this.message('<p class="event">received: '+text+'</p>');
		},

		send : function(msg){
			if(this.isConnected){
				try{
					this.socket.send(msg);
					this.message('<p class="event">Sent: '+msg+'</p>')
				} catch(exception){
					console.log(exception);
					this.message('<p class="warning">doh!</p>');
				}
			}else{
				this.message('<p class="event">Socket not connected!</p>')
			}
		},

		getMessageObject : function(msg){
			msg = "var obj = "+msg;
			eval(msg);
			return obj;
		},

		message : function(msg, type){
			if(type == 1){
				msg = this.getMessageObject(msg);
				msg = msg.text;
				msg = '<p class="message">Received: ' + msg + '</p>';
			}
			$('#chatLog').append(msg);
		}
	}
	_.bindAll(socketController);



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	socketController.connect();













/*

	Init = {};
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

	};

	World = {}
	World.init = function(canvas){
		World.height = 800;
		World.width = 600;
		World.canvas = canvas;
		canvas.css('height', World.height);
		canvas.css('width', World.width);


		function disableSelection(){
			var target = document.body;
			if (typeof target.onselectstart!="undefined") //IE route
				target.onselectstart=function(){return false}
			else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
				target.style.MozUserSelect="none"
			else //All other route (ie: Opera)
				target.onmousedown=function(){return false}
			target.style.cursor = "default"
		}
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
		var top = 200;
		var left = 100;
		Unit.x = left;
		Unit.y = top;
		Unit.name = 'sprite';
		Unit.element = $('#sprite');
		Unit.moving = 0;
		Unit.speed = 100;

		World.canvas.append('<img src="images/zoqfot.big.12.png" id = "'+Unit.name+'" style="position:absolute; top:'+top+'px; left:'+left+'px;" />');
	}

	Unit.move = function(x, y){

		var distance = Math.sqrt( Math.pow(x - Unit.x, 2) , Math.pow(y - Unit.y, 2)  );
		if(Unit.moving == 1){
			Unit.stop();
		}
		Unit.moving = 1;
		$('#sprite').animate({
			top: y,
			left: x
		},
		1000*(distance/Unit.speed),
		'linear',
		function(){
			Unit.hasArrived(x, y);
		});

		socketController.message('<p>moving to: ' + x + ', '+  y + ' which is distance: ' + distance +' and will take ' + distance/Unit.speed + ' seconds while moving at '+Unit.speed+'</p>');
	}

	Unit.stop = function(){
		$('#sprite').stop(true);
		var p = $('#sprite').position();
		Unit.x = p.left;
		Unit.y = p.top;
		Unit.moving = 0;
	}

	Unit.hasArrived = function(x, y){
		Unit.x = x;
		Unit.y = y;
		socketController.message('<p>arrived at: ' + x + ', '+  y + '</p>');
		socketController.send('{"action":"arrived", "x":'+x+', "y":'+y+'}');
		Unit.moving = 0;
	}*/