

getFunction = function(functionName) {
	var context, namespaces;

	if (_.isString(functionName)) {
		context = window;
		namespaces = functionName.split('.');

		for (var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
	}

	if (_.isFunction(context)) {
		return context;
	} else {
		return $.noop;
	}
}

CreateButton = function(selector, precall, postcall, callback) {
	if (!_.isFunction(precall)) {
		precall = $.noop;
	}

	if (!_.isFunction(postcall)) {
		postcall = $.noop;
	}

	if (!_.isFunction(callback)) {
		callback = $.noop;
	}

	function handler(e, data) {
 		var attrHref, attrCallback, attrPrecall, attrPostcall, inputs, result1, result2, target;

		e.preventDefault(); // prevent link href from being followed
		target = $(this);
 		attrHref = target.attr('href');

 		if (!_.isString(attrHref)) {
 			return false; // invalid href
 		}

 		inputs = {};
 		inputs.selector = target.attr('selector');
 		inputs.context = target;

		attrPrecall = getFunction(target.attr('precall'));
		attrPostcall = getFunction(target.attr('postcall'));
		attrCallback = getFunction(target.attr('callback'));

 		result1 = attrPrecall(target, data);
 		result2 = precall(target, data);

 		if (result1 !== false && result2 !== false) {
			inputs.callback = function(msg, context) {
				attrCallback(msg, context);
				callback(msg, context);
			};

			$.ajax({
			  url: attrHref,
			  success: function(data){
			    attrCallback($(this), data);
			  }
			});

			//MW.Ajax.request(attrHref, inputs);

			attrPostcall(target, data);
			postcall(target, data);
		}
	}

	$(selector).live('click', handler);
};

CreateButton('.ajax');
