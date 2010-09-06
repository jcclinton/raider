<!DOCTYPE html>
<html>
<head>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
<script type="text/javascript">
$(document).ready(function() {
	
	if(!("WebSocket" in window)){
		$('#chatLog, input, button, #examples').fadeOut("fast");	
		$('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');		
	}else{
		//The user has WebSockets
		
		
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
	 
	 $('#canvas').append('<img src="zoqfot.big.12.png" id = "sprite" style="position:absolute; top:200px; left:200px;" />');
	
	//draw();
	connect();
		
	function connect(){
			var socket;
			var host = "ws://localhost:8000/socket/server/startDaemon.php";
			
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
		
		
	}//End connect()
		
});
</script>
<meta charset=utf-8 />
<style type="text/css">
body{font-family:Arial, Helvetica, sans-serif;}
#container{
	border:5px solid grey;
	width:800px;
	margin:0 auto;
	padding:10px;
}
#chatLog{
	padding:5px;
	border:1px solid black;	
}
#chatLog p{margin:0;}
.event{color:#999;}
.warning{
	font-weight:bold;
	color:#CCC;
}
</style>
<title>WebSockets Client</title>

</head>
<body>
	<!--canvas id="canvas" width="400" height="400" style="outline: 1px solid black"></canvas-->
	<div id="canvas" style="outline:1px solid black; height:400px; width:400px; position:relative;"></div>
  <div id="wrapper">
  
  	<div id="container">
    
    	<h1>WebSockets Client</h1>
        
        <div id="chatLog">
        
        </div>
        <p id="examples">e.g. try 'hi', 'name', 'age', 'today'</p>
        
    	<input id="text" type="text" />
        <button id="disconnect">Disconnect</button>

	</div>
  
  </div>
</body>
</html>​