


    function draw() {
      var canvas = document.getElementById("canvas");
      if (canvas.getContext) {
        var ctx = canvas.getContext("2d");

		  var img = new Image();
		 img.onload = function(){
			ctx.drawImage(img,200,200);
		 }
		  img.src = 'zoqfot.big.12.png';

      canvas.onmousedown = function(e) {
        var mx = e.clientX;
        var my = e.clientY;
        ctx.drawImage(img, mx, my);
				$('#chatLog').append('clicked at mx:'+mx+' my: '+my+'<br/>');
      }



       /* ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect (10, 10, 55, 50);

        ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
        ctx.fillRect (30, 30, 55, 50);  */
      }
    }



	socketController = {};

	socketController.connect = function(){
			var socket;
			var host = "ws://localhost:8000/php2d/server/startDaemon.php";

			try{
				var socket = new WebSocket(host);
				message('<p class="event">Socket Status: '+socket.readyState+'</p>');
				socket.onopen = function(){
					message('<p class="event">Socket Status: '+socket.readyState+' (open)'+'</p>');
				}

				socket.onmessage = receive;

				socket.onclose = function(){
					message('<p class="event">Socket Status: '+socket.readyState+' (Closed)'+'</p>');
				}

			} catch(exception){
				message('<p>Error'+exception+'</p>');
			}

			function receive(msg){
				message(msg.data, 1);
				msg = "msg = "+msg.data;
				eval(msg);
				var speed;
				if(msg.text == 'moving'){
					speed = 10;
					$('#sprite').animate({
						top: msg.y,
						left: msg.x
					}, speed);
					$('#chatLog').append(msg.x + ', '+  msg.y);
				}else{
					msg = msg.text;
				}
			}

			function send(){
				var text = $('#text').val();
				if(text==""){
					message('<p class="warning">Please enter a message'+'</p>');
					return ;
				}
				try{
					socket.send(text);
					message('<p class="event">Sent: '+text+'</p>')
				} catch(exception){
					message('<p class="warning">'+'</p>');
				}
				$('#text').val("");
			}

			function message(msg, type){
				if(type == 1){
					msg = "msg = "+msg;
					eval(msg);
					msg = msg.text;
					msg = '<p class="message">Received: ' + msg + '</p>';
				}
				$('#chatLog').append(msg);
			}//End message()

			$('#text').keypress(function(event) {
					  if (event.keyCode == '13') {
						 send();
					   }
			});

			$('#text').click(function() {
				//socket.send("{'action':'yo', 'x':150, 'y':150}");
			});

			$('#canvas').click(function(e) {
				var x = e.pageX - this.offsetLeft;
				var y = e.pageY - this.offsetTop;

				//$('#chatLog').append(x +', '+ y + '<br/>');
				socket.send('{"action":"move", "x":'+x+', "y":'+y+'}');
			});

			$('#disconnect').click(function(){
				socket.close();
			});

		}