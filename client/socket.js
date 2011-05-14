var order66 = function(instanceIndex){

		UnitList = Backbone.Collection.extend({

			removeAll: function(){
				console.log('removing all: ' + unitList.length);
				unitList.each(function(e){
					console.log('removing: '+e.id);
					unitList.remove(e, {silent: true});
					unitList.trigger('remove:'+e.id);
				});
			}

		});
		//_.bindAll(UnitList);
		unitList = new UnitList();
		unitList.bind('removeAll', unitList.removeAll);







		ProjectileList = Backbone.Collection.extend({

			removeAll: function(){
				console.log('removing all: ' + projectileList.length);
				projectileList.each(function(e){
					console.log('removing: '+e.id);
					projectileList.remove(e, {silent: true});
					projectileList.trigger('remove:'+e.id);
				});
			}

		});
		//_.bindAll(UnitList);
		projectileList = new ProjectileList();
		projectileList.bind('removeAll', projectileList.removeAll);















		Client = Backbone.Model.extend({
			initialize: function(attributes){
				this.set(attributes);
			},

			getUid: function(){
				return this.get('uid');
			}
		});






















		Unit = Backbone.Model.extend({

			initialize: function(attributes) {
				this.set(attributes);
				var name = this.getName();
				var img = this.getImg();
				$('#canvas').append('<div id = "'+name+'" style="position:absolute; top:'+this.get('y')+'px; left:'+this.get('x')+'px;"><img src="client/images/'+img+'" /></div>');
				console.log('creating model');
				unitList.add(this);
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
				var uid = this.get('uid');
				var msg = '{"action":"move", "x":'+x+', "y":'+y+', "id":'+id+', "uid": '+uid+'}';
				socketController.send(msg);
			},

			moveModel: function(msg){
				console.log('moving model');

				this.set({dx: msg.dx, dy: msg.dy}, {silent: true})
				this.trigger('moveUnit');
			}

		});

















		Projectile = Backbone.Model.extend({

			initialize: function(attributes) {
				attributes.time = new Date().getTime();
				this.set(attributes, {silent: true});
				console.log('creating projectile');
				var silent = this.get('current')==0?true:false;
				console.log(silent);
				projectileList.add(this, {silent: silent});
				new ProjectileView({model: this});
			},

			getId: function(){
				return this.id + this.get('time');
			},

			sendMoveResponse: function(){
				var x = this.get('x');
				var y = this.get('y');
				var id = this.id;
				var uid = this.get('uid');
				var pid = this.getId();
				var msg = '{"action":"fire", "pid":'+pid+', "id":'+id+', "uid": '+uid+', "eid": '+this.get('eid')+'}';
				if(this.get('current') == 1){
					socketController.send(msg);
				}
			},
		});























		var UnitView = Backbone.View.extend({
		  initialize: function() {
		  	console.log('view init');

  			_.bindAll(this, 'moveThem', 'moveMe', 'remove', 'createEvents', 'toggleSelected');
		  	this.model.view = this;
		  	if(this.model.isMe()){
		  		this.createEvents();
		  		this.createEvents({'keydown':'fireProjectile'}, 'document');
		  	}else{
			  	this.model.bind('moveUnit', this.moveThem);
		  	}
			  	var ev = {"mousedown": 'select'};
			  	//this.delegateEvents(ev);
			  this.model.bind('change:selected', this.toggleSelected);
			unitList.bind('remove:'+this.model.id, this.remove);



		  },

		  events: {
		    "mousedown": "moveMe"
		  },


		  select: function(){
		  	console.log('selected!');
		  	this.model.set({selected: 1});
		  	return this;
		  },

		  toggleSelected: function(){
		  	var selected = this.model.isSelected();
		  	var name = 'selectedUnit';
		  	if(!this.model.isMe()){
		  		name = name + 'Other';
		  	}if(selected == 0){
		  		this.el.removeClass(name);
		  	}else{
		  		this.el.addClass(name);
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

			createEvents : function(events, el) {
			  // Cached regex to split keys for `handleEvents`.
			  var eventSplitter = /^(\w+)\s*(.*)$/;
			  //$(this.el).unbind();
			  if (!(events || (events = this.events))) return this;
			  for (var key in events) {
			  	if(events.hasOwnProperty(key)){
				    var methodName = events[key];
				    var match = key.match(eventSplitter);
				    var eventName = match[1], selector = match[2];
				    var method = _.bind(this[methodName], this);
				    el = el || '#canvas';
				    if (selector === '' || eventName == 'change') {
				    	if(el === 'document'){
				    		$(document).bind(eventName, method);
				    	}else{
				    		$(el).bind(eventName, method);
				    	}
				    } else {
				      $(el).delegate(selector, eventName, method);
				    }
				}
			  }
			  return this;
			},

		  moveMe: function(e){
		  	if(e.which === 1  && !this.model.isSelected()){
			  	console.log('selected!');
			  	this.model.set({selected: 1});
			  	return this;
			  }

		  	if(e.which == 1 || e.which == 2 || !this.model.isMe()){
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

			//this.el.stop();

			this.el.animate({
				top: this.model.get('y'),
				left: this.model.get('x')
			},
			{queue:false, duration:time, easing: 'linear'});
		  },

		  fireProjectile: function(e){
		  	if(!this.model.isSelected()){
		  		console.log('not firing!');
		  		return this;
		  	}

			var x, y, dx, dy;
			//dx = 100;
			//dy = 100;
			//eid = 0;

			var enemy = unitList.find(function(unit){
				return !unit.isMe() && unit.isSelected();
			});

			if(enemy){
				dx = enemy.get('x');
				dy = enemy.get('y');

				x = this.el.css('left').split('px')[0];
				y = this.el.css('top').split('px')[0];


				var obj = {x: x, y: y, dx: dx, dy: dy, id: this.model.id, eid: enemy.id, uid: this.model.get('uid'), current: this.model.isMe()};
				new Projectile(obj);
			}

		  },

		  remove: function(){
		  	this.el.remove();
		  	this.model.destroy();
		  	delete this.model;
		  }

		});






























		var ProjectileView = Backbone.View.extend({
		  initialize: function() {
		  	console.log('projectile view init');

			var id = this.model.getId();
			$('#canvas').append('<div id = "'+id+'" style="position:absolute; top:'+this.model.get('y')+'px; left:'+this.model.get('x')+'px;"><img src="client/images/fusion.big.0.png" /></div>');
			this.el = $('#'+id);

  			_.bindAll(this, 'move', 'remove');
		  	this.model.view = this;

		  	this.move();

		  },

		  move: function() {
			console.log('firing!');

			var dx = this.model.get('dx');
			var dy = this.model.get('dy');

			var distance = Math.sqrt( Math.pow(dx - this.model.get('x'), 2) + Math.pow(dy - this.model.get('y'), 2)  );

			var time = 1 * distance;
			//time = 1000;

			//		console.log(distance + ' ' + dy + ' ' + this.model.get('y'));
			this.model.set({x:dx, y:dy}, {silent: true});
			//this.model.save();

			console.log('rendering to:'+this.model.get('x') +', ' + this.model.get('y'));


			this.el.animate({
				top: this.model.get('dy'),
				left: this.model.get('dx')
			},
			{duration:time, easing: 'linear', complete: this.remove});

		  	return this;
		  },


		  remove: function(){
		  	this.el.remove();
		  	this.model.destroy({silent:true});
		  	delete this.model;
		  }

		});













		Backbone.sync = function(method, model, success, error) {
			model.sendMoveResponse();
		}




















	var socketController = {
		connect : function(){
				var host = '65.49.73.225';
				var options = {port: 80};

				this.socket = new io.Socket(host, options);
				this.socket.on('connect', this.open )
				this.socket.on('message', this.receive )
				this.socket.on('disconnect', this.onclose )
				this.socket.connect();
		},

		open : function(){
			this.isConnected = true;
			this.message('<p class="event">Socket Status: (open)'+'</p>');
		},

		close : function(){
			this.socket.disconnect();
			console.log('uhhhh closing?');
		},

		onclose : function(){
			unitList.trigger('removeAll');
			projectileList.trigger('removeAll');
			this.isConnected = false;
			this.message('<p class="event bad">Socket Status: (Closed)'+'</p>');
		},

		receive : function(msg){
			//this.message('<p class="event">data received: '+msg + '</p>');
			//console.log(msg);
			msg = this.getMessageObject(msg);
			var text = msg.text;
			var id = msg.id;
			var uid = msg.uid;
			text = text + ' uid:'+uid;
			if(id){
				text = text + ' id:' + id
			}

			if(msg.command == 'close'){
					console.log('CLOSING uid: ' + uid);
					var to_remove = unitList.select(function(e){
						return e.get('uid') == uid;
					});

					_.each(to_remove, function(e){
						unitList.remove(e, {silent: true});
						unitList.trigger('remove:'+e.id);
					});
			}else if(msg.command == 'init'){
				client = new Client({uid: msg.uid});
				//var msg = '{"action":"instance", "iId":'+instanceIndex+', "uid": '+uid+'}';

				// do all bindings here since they dont make sense unless the client is initialized
				$('#disconnect').bind('click', function(){socketController.close();});
				//$('#connect').bind('click', function(){socketController.connect();});
				$('#unselect').bind('click', function(){
					unitList.each(function(model){
						model.set({'selected':0});
					});
				});

				$('#add').bind('click', function(){
					var uid = client.getUid();
					var msg = '{"action":"add", "uid": '+uid+'}';
					socketController.send(msg);

				});

				//socketController.send(msg);
			}else{
				var e = unitList.get(id);
				if(msg.command == 'create'){
					if(!e){
						console.log(msg.command);
						var lx, ly;
						lx = msg.x;
						ly = msg.y;

						var obj = {x: lx, y: ly, dx: 0, dy: 0, selected: 0, uid: uid, id: id, current: msg.is_me, team: msg.team};
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
				}else if(msg.command == 'fire'){
					if(e && e.isMe() == 0){
						var enemy = unitList.get(msg.eid);


						var x, y, dx, dy;

						if(enemy){
							dx = enemy.get('x');
							dy = enemy.get('y');

							x = e.view.el.css('left').split('px')[0];
							y = e.view.el.css('top').split('px')[0];


							var obj = {x: x, y: y, dx: dx, dy: dy, id: e.view.model.id, eid: enemy.id, uid: e.view.model.get('uid'), current: e.view.model.isMe()};
							new Projectile(obj);
						}
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
			var o
				, e
				;

			try{
				o = $.parseJSON(msg);
			}catch(e){
				o = 'doh';
			}

			return o;
		},

		message : function(msg, type){
			if(type == 1){
				msg = this.getMessageObject(msg);
				msg = msg.text;
				msg = '<p class="message">Received: ' + msg + '</p>';
			}
			$('#chatLog').prepend(msg+'<hr/>');
		}
	}
	_.bindAll(socketController);











/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


	socketController.connect();



 $('#canvas').bind("contextmenu", function(e){ return false; });

}