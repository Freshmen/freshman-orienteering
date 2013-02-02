var baseUrl = "/api/v2/";

var Event = function() {};

var User = function() {};

var Checkpoint = function() {};

var EventList = function() {
};

EventList.prototype.load = function(callback) {
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/",
		method : "GET"
	});
	jqxhr.done(
		function(data) { 
			callback(data) 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not load event list");
		console.log(error);
	});
}

Event.prototype.load = function(callback) {
	if (this._id) {
		var jqxhr = $.ajax({ 
			url : baseUrl + "events/" + this._id,
			method : "GET"
		});
		jqxhr.done(
			function(data) { 
				this = data;
				callback(this);
			}
		);
		jqxhr.fail( function(error) {
			console.log("Could not load event");
			console.log(error);
		});
	}
}

Event.prototype.save = function(callback) {
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/",
		method : "POST",
		data : JSON.stringify(this)
	});
	jqxhr.done(
		function(data) { 
			this._id = data._id; 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not create event");
		console.log(error);
	});
}

Event.prototype.update = function(callback) {
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/" + this._id,
		method : "PUT",
		data : JSON.stringify(this)
	});
	jqxhr.done(
		function(data) { 
			callback(data) 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not update event");
		console.log(error);
	});
}

Event.prototype.delete = function(callback) {
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/" + this._id,
		method : "DELETE",
	});
	jqxhr.done(
		function(data) { 
			callback(data) 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not delete event");
		console.log(error);
	});
}