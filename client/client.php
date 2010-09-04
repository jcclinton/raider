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
				
				socket.onmessage = function(msg){
					message(msg.data, 1);					
				}
				
				socket.onclose = function(){
					message('<p class="event">Socket Status: '+socket.readyState+' (Closed)'+'</p>');
				}			
					
			} catch(exception){
				message('<p>Error'+exception+'</p>');
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
				socket.send("{'action':'yo', 'x':150, 'y':150}");
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