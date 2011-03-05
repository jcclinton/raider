<!DOCTYPE html>
<html>
<head>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
<script src="client/underscore.js"></script>
<script src="client/backbone.js"></script>
<script src="http://cdn.socket.io/stable/socket.io.js"></script>
<script type="text/javascript">
$(document).ready(function() {

	if(!("WebSocket" in window)){
		$('#chatLog, input, button, #examples').fadeOut("fast");
		$('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');
	}else{
		//The user has WebSockets

		var init = 0;
		var el = $('a', '#link_wrapper');
		el.each(function(index){
			$(this).bind('click', function(){
				if(init == 0){
					order66(index);
					init = 1;
				}

				$('#link_canvas').hide();
				$('#canvas').show();
				$('#wrapper').show();
				$('#container').prepend('<p>index: '+index+'</p>');
				return false;
			});
		});
	}
});
</script>
<meta charset=utf-8 />
<style type="text/css">
body{font-family:Arial, Helvetica, sans-serif;}
#container{
	border:5px solid grey;
	width:300px;
	margin:0 auto;
	padding:10px;
}
#chatLog{
	padding:5px;
	border:1px solid black;
	height: 300px;
	overflow: scroll;
}
#chatLog p{margin:0;}
.event{color:#999;}
.warning{
	font-weight:bold;
	color:#CCC;
}
.bad{
	color: red;
}

.fl{
	float:left;
}

.selectedUnit{
	outline: 1px red solid;
}

.selectedUnitOther{
	outline: 1px blue solid;
}

.game_board{
	outline:1px solid black;
	height:400px;
	width:400px;
	position:relative;
}
</style>
<title>Ghost</title>

</head>
<body>
	<div id="canvas" class="fl game_board" style="display:none;"></div>
	<div id="link_canvas" class="fl game_board">
		<div id="link_wrapper" style="padding-left: 20px;">
			<?php
				for($i = 0; $i < 5; $i++){
			?>
				<div style="padding-top: 10px;">
					<a href="#" id="link<?=$i?>"><?='CLICK '.$i?></a>
				</div>

			<?php
			}
			?>
		</div>
	</div>

	<div id="wrapper" style="display:none;">

	  	<div id="container" class="fl">

	    	<h1>Client</h1>
	        <button id="disconnect">Disconnect</button>
	        <!--button id="connect">Connect</button-->
	        <button id="unselect">Unselect all</button>
	        <button id="add">Add Unit</button>
	        <a href="#" onclick="$('#chatLog').empty(); return false;" >clear chat</a>

	        <div id="chatLog">

	        </div>

		</div>
		<div style="clear:both;"></div>
	<div>
</body>
<script src="client/socket.js"></script>
</html>