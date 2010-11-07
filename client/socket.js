

		UnitList = Backbone.Collection.extend({

			removeAll: function(){
				console.log('removing all: ' + list.length);
				list.each(function(e){
				console.log('removing: '+e.id);
					list.remove(e, {silent: true});
					list.trigger('remove:'+e.id);
				});
			}

		});
		//_.bindAll(UnitList);
		list = new UnitList();
		list.bind('removeAll', list.removeAll);


		Client = Backbone.Model.extend({
			initialize: function(attributes){
				this.set(attributes);
			},

			getPid: function(){
				return this.get('pid');
			}
		});



		Unit = Backbone.Model.extend({

			initialize: function(attributes) {
				this.set(attributes);
				var name = this.getName();
				var img = this.getImg();
				$('#canvas').append('<div id = "'+name+'" style="position:absolute; top:'+this.get('y')+'px; left:'+this.get('x')+'px;"><img src="client/images/'+img+'" /></div>');
				console.log('creating model');
				list.add(this);
				new UnitView({model: this, el: $('#'+name)});
			},

			getName: function(){
				return 'sprite'+this.get('id');
			},

			isMe: function(){
				return this.get('current');
			},

			isSelected: function(){
				return this.get('selected');
			},

			getImg: function(){
				var img_arr = (this.get('team') == 'light')?this.light_imgs:this.dark_imgs;
				console.log(this.get('team'));

				var nums = img_arr.length;
				var modulo = this.get('id') % nums;


				return img_arr[modulo] + '.big.0.png';
			},

			light_imgs: [
				'arilou',
				'chenjesu',
				'chmmr',
				'human',
				'melnorme',
				'mmrnmhrm',
				'orz',
				'pkunk',
				'shofixti',
				'sis',
				'supox',
				'syreen',
				'utwig',
				'yehat',
				'zoqfot'
			],

			dark_imgs: [
				'androsyn',
				'blackurq',
				'druuge',
				'ilwrath',
				'mycon',
				'slylandr',
				'spathi',
				'thradd',
				'umgah',
				'urquan',
				'vux'

			],

			moveModel: function(msg){
				console.log('moving model');

				this.set({dx: msg.dx, dy: msg.dy}, {silent: true})
				this.trigger('moveUnit');
			}

		});












		var UnitView = Backbone.View.extend({
		  initialize: function() {
		  	console.log('view init');

  			_.bindAll(this, 'render', 'move', 'remove', 'createEvents', 'toggleSelected');
		  	this.model.view = this;
		  	if(this.model.isMe()){
		  		this.createEvents();
			  	var ev = {'mousedown': 'select'};
			  	this.handleEvents(ev);
			  	this.model.bind('change:selected', this.toggleSelected);
		  	}else{
			  	this.model.bind('moveUnit', this.render);
		  	}
			list.bind('remove:'+this.model.id, this.remove);

		  },

		  events: {
		    "mousedown":          "move"
		  },


		  select: function(){
		  	console.log('selected!');
		  	this.model.set({selected: 1});
		  	return this;
		  },

		  toggleSelected: function(){
		  	var selected = this.model.isSelected();
		  	if(selected == 0){
		  		this.el.removeClass('selectedUnit');
		  	}else{
		  		this.el.addClass('selectedUnit');
		  	}
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
		  	if(e.which != 3 || !this.model.isSelected()){
		  		console.log('not moving!');
		  		return this;
		  	}
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
		  	this.el.remove();
		  	this.model.destroy();
		  }

		});













		Backbone.sync = function(method, model, success, error) {
			if(method == 'create'){
				var msg = '{"action":"create"}';
			}else{
				var x = model.get('x');
				var y = model.get('y');
				var id = model.id;
				var pid = model.get('pid');
				var msg = '{"action":"move", "x":'+x+', "y":'+y+', "id":'+id+', "pid": '+pid+'}';
			}
			socketController.send(msg);
		}




















	var socketController = {
		connect : function(){
				//var host = "ws://localhost:8000/php2d/server/startDaemon.php";
				var host = "ws://65.49.73.225:8000/php2d/server/startDaemon.php";

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
			var id = msg.id;
			var pid = msg.pid;
			text = text + ' pid:'+pid;
			if(id){
				text = text + ' id:' + id
			}

			if(msg.command == 'close'){
					console.log('CLOSING pid: ' + pid);
					var to_remove = list.select(function(e){
						return e.get('pid') == pid;
					});

					_.each(to_remove, function(e){
						list.remove(e, {silent: true});
						list.trigger('remove:'+e.id);
					});
			}else if(msg.command == 'init'){
				var pid = {pid: msg.pid};
				client = new Client(pid);
			}else{
				var e = list.get(id);
				if(msg.command == 'create'){
					if(!e){
						console.log(msg.command);
						var lx, ly;
						lx = msg.x;
						ly = msg.y;

						var obj = {x: lx, y: ly, dx: 0, dy: 0, selected: 0, pid: pid, id: id, current: msg.is_me, team: msg.team};
						//obj.current = (msg.command == 'init')?1:0;
						//obj.current = msg.is_me;
						var u = new Unit(obj);
					}else{
						console.log('doh!!');
					}
				}else if(msg.command == 'move'){
					if(e && e.isMe() == 0){
						e.moveModel({dx: msg.x, dy: msg.y});
					}
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
	$('#connect').bind('click', function(){socketController.connect();});
	$('#unselect').bind('click', function(){
		list.each(function(model){
			if(model.isMe()){
				model.set({'selected':0});
			}
		});
	});

	$('#add').bind('click', function(){
		var pid = client.getPid();
		var msg = '{"action":"add", "pid": '+pid+'}';
		socketController.send(msg);

	});



 $('#canvas').bind("contextmenu", function(e){ return false; });








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