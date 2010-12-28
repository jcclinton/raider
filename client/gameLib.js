(function{
	var game = this.game = {};


	// Require Underscore, if we're on the server, and it's not already present.
	var _ = this._;
	if (!_ && (typeof require !== 'undefined')) _ = require("underscore")._;

	// For Backbone's purposes, jQuery owns the `$` variable.
	var $ = this.jQuery;


	game.world = {};

	game.events = {
		initialize: function(){
		}
	};



	game.drawable = function(params){

	};

	_.extend(game.drawable.prototype, {

	});



	game.drawableImage = function(params){

	};

	_.extend(game.drawableImage.prototype, game.drawable, {

	});



	game.sprite = function(params){

	};

	_.extend(game.sprite.prototype, game.drawableImage, {

	});



	game.unit = function(params){

	};

	_.extend(game.unit.prototype, game.sprite, {
		add: function(params){
			params || params = {};
		}
	});

})();