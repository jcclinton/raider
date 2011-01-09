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
</style>
<title>WebSockets Client</title>

</head>
<body>
	<!--canvas id="canvas" width="400" height="400" style="outline: 1px solid black"></canvas-->
	<div id="canvas" class="fl" style="outline:1px solid black; height:400px; width:400px; position:relative;"></div>

	<div id="wrapper">

  	<div id="container" class="fl">

    	<h1>WebSockets Client</h1>
        <button id="disconnect">Disconnect</button>
        <button id="connect">Connect</button>
        <button id="unselect">Unselect all</button>
        <button id="add">Add Unit</button>

        <div id="chatLog">

        </div>

	</div>
	<div style="clear:both;"></div>
	<div>
</body>
<script src="client/socket.js"></script>
</html>