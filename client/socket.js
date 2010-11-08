

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

			sendMoveResponse: function(){
				var x = this.get('x');
				var y = this.get('y');
				var id = this.id;
				var pid = this.get('pid');
				var msg = '{"action":"move", "x":'+x+', "y":'+y+', "id":'+id+', "pid": '+pid+'}';
				socketController.send(msg);
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

  			_.bindAll(this, 'moveThem', 'moveMe', 'remove', 'createEvents', 'toggleSelected');
		  	this.model.view = this;
		  	if(this.model.isMe()){
		  		this.createEvents();
			  	var ev = {'mousedown': 'select'};
			  	this.handleEvents(ev);
			  	this.model.bind('change:selected', this.toggleSelected);
		  	}else{
			  	this.model.bind('moveUnit', this.moveThem);
		  	}
			list.bind('remove:'+this.model.id, this.remove);

		  },

		  events: {
		    "mousedown":          "moveMe"
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

		  moveThem: function() {
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

		  moveMe: function(e){
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
			model.sendMoveResponse();
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
 