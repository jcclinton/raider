

		UnitList = Backbone.Collection.extend({});
		list = new UnitList();



		Unit = Backbone.Model.extend({

			initialize: function(attributes) {
				this.set(attributes);
				var img = (this.get('id')%2==0)?'zoqfot.big.12.png':'blackurq.big.0.png';
				var name = 'sprite'+this.get('id');
				$('#canvas').append('<img src="images/'+img+'" id = "'+name+'" style="position:absolute; top:'+this.get('y')+'px; left:'+this.get('x')+'px;" />');
				console.log('creating model');
				list.add(this);
				new UnitView({model: this, el: $('#'+name)});
			},

			isMe: function(){
				return this.get('current');
			},

			init: function(data){
				var new_id = data.id;
				this.set({id: new_id});
				console.log('initializing model to id: '+this.get('id'));
			},

			moveModel: function(msg){
				console.log('moving model');

				this.set({dx: msg.dx, dy: msg.dy}, {silent: true})
				this.trigger('moveUnit');
			}

		});












		var UnitView = Backbone.View.extend({
		  initialize: function() {
		  	console.log('view init');

  			_.bindAll(this, 'render', 'move', 'remove', 'createEvents');
		  	this.model.view = this;
		  	if(this.model.isMe()){
		  		this.createEvents();
		  	}else{
			  	this.model.bind('moveUnit', this.render);
			  	list.bind('remove', this.remove);
			  	//this.handleEvents();
		  	}
			  	list.bind('removeAll', this.removeAll);
		  },

		  events: {
		    "click":          "move"
		  },

		  render: function() {
			console.log('render');

			var dx = this.model.get('dx');
			var dy = this.model.get('dy');

			var distance = Math.sqrt( Math.pow(dx - this.model.get('x'), 2) + Math.pow(dy - this.model.get('y'), 2)  );

			var time = 5 * distance;
			//time = 1000;

			//		console.log(distance + ' ' + dy + ' ' + this.model.get('y'));
			this.model.set({x:dx, y:dy}, {silent: true});
			//this.model.save();

			this.el.stop();
					console.log('rendering to:'+this.model.get('x') +', ' + this.model.get('y'));

			this.el.animate({
				top: this.model.get('y'),
				left: this.model.get('x')
			},
			time,
			'linear');

		  	return this;
		  },

			createEvents : function(events) {
			  // Cached regex to split keys for `handleEvents`.
			  var eventSplitter = /^(\w+)\s*(.*)$/;
			  //$(this.el).unbind();
			  if (!(events || (events = this.events))) return this;
			  for (var key in events) {
			    var methodName = events[key];
			    var match = key.match(eventSplitter);
			    var eventName = match[1], selector = match[2];
			    var method = _.bind(this[methodName], this);
			    if (selector === '' || eventName == 'change') {
			      $('#canvas').bind(eventName, method);
			    } else {
			      $('#canvas').delegate(selector, eventName, method);
			    }
			  }
			  return this;
			},

		  move: function(e){
			console.log('move');

			//var dx = e.offsetX - 8;
			//var dy = e.offsety - 8;
			var dx = e.pageX - 8;
			var dy = e.pageY - 8;

			var distance = Math.sqrt( Math.pow(dx - this.model.get('x'), 2) + Math.pow(dy - this.model.get('y'), 2)  );

			var time = 5 * distance;
			//time = 1000;

			//		console.log(distance + ' ' + dy + ' ' + this.model.get('y'));
			this.model.set({x:dx, y:dy});
			this.model.save();

			this.el.stop();

			this.el.animate({
				top: this.model.get('y'),
				left: this.model.get('x')
			},
			time,
			'linear');
		  },

		  remove: function(){
		  	console.log('removing');
		  	this.el.remove();
		  	this.model.destroy();
		  },

			removeAll: function(){
				list.each(function(e){
					var mdl = list.get(e.id);
					list.remove(mdl);
				});
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
					this.socket.onclose = this.onclose;

				} catch(exception){
					this.message('<p>Error'+exception+'</p>');
					this.isConnected = false;
				}
		},

		open : function(){
			this.isConnected = true;
			this.message('<p class="event">Socket Status: '+this.socket.readyState+' (open)'+'</p>');
		},

		close : function(){
			this.socket.close();
		},

		onclose : function(){
			list.trigger('removeAll');
			this.isConnected = false;
			this.message('<p class="event bad">Socket Status: '+this.socket.readyState+' (Closed)'+'</p>');
		},

		receive : function(msg){
			//this.message(msg.data, 1);
			msg = this.getMessageObject(msg.data);
			var text = msg.text;
			text = text + ' id:' + msg.id;

			var e = list.get(msg.id);
			if(msg.command == 'init' || msg.command == 'create'){
				if(!e){
					var lx, ly;
					lx = msg.x;
					ly = msg.y;
					
					var obj = {x: lx, y: ly, id: msg.id, dx: 0, dy: 0};
					obj.current = (msg.command == 'init')?1:0;
					var u = new Unit(obj);
				}
			}else if(msg.command == 'move'){
				if(e && e.isMe() == 0){
					e.moveModel({dx: msg.x, dy: msg.y});
				}
			}else if(msg.command == 'close'){
				if(e){
					console.log('CLOSING id: ' + e.id);
					list.remove(e);
				}
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
	$('#disconnect').bind('click', function(){socketController.close();});













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