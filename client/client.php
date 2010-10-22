<!DOCTYPE html>
<html>
<head>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js"></script>
<script src="socket.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script type="text/javascript">
$(document).ready(function() {

	if(!("WebSocket" in window)){
		$('#chatLog, input, button, #examples').fadeOut("fast");
		$('<p>Oh no, you need a browser that supports WebSockets. How about <a href="http://www.google.com/chrome">Google Chrome</a>?</p>').appendTo('#container');
	}else{
		//The user has WebSockets
		var Unit = Backbone.Model.extend({

			initialize: function(attributes) {
				this.x = attributes.x;
				this.y = attributes.x;
			},

		});


		var UnitView = Backbone.View.extend({

		  tagName: "img",

		  //className: "document-row",

		  events: {
		    "click #canvas":          "move",
		  },

		  initialize: function(attributes) {
			this.model = attributes.model;
		    _.bindAll(this, "render");
			$('#canvas').append('<img src="images/zoqfot.big.12.png" id = "sprite" style="position:absolute; top:'+this.model.y+'px; left:'+this.model.x+'px;" />');
		  },

		  render: function() {
		  	alert('hi');
		  	this.handleEvents();
		  	return this;
		  },

		  move: function(){
			$('#sprite').animate({
				top: 10,
				left: 10
			},
			1000,
			'linear');
		  }

		});


		var unit = new Unit({x: 200,y: 100});
		var doc = new UnitView({model: unit});
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
</style>
<title>WebSockets Client</title>

</head>
<body>
	<!--canvas id="canvas" width="400" height="400" style="outline: 1px solid black"></canvas-->
	<div id="canvas" class="fl" style="outline:1px solid black; height:400px; width:400px; position:relative;"></div>

	<div id="wrapper">

  	<div id="container" class="fl">

    	<h1>WebSockets Client</h1>

        <div id="chatLog">

        </div>
        <button id="disconnect">Disconnect</button>

	</div>
	<div style="clear:both;"></div>
	<div>
</body>
</html>