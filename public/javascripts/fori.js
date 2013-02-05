var baseUrl = "/api/v2/";

var API = function() {
	var path = baseUrl;
	this.getPath = function() { return path; }
	this.setPath = function(myPath) { path = myPath; }
};

API.prototype.init = function(config) {
	for (var prop in config) {
		if (config.hasOwnProperty(prop)) {
			this[prop] = config[prop];
		}
	}
}

var Course = function(config) {
	this.init(config);
	this.setPath(baseUrl + "events");
};
Course.prototype = new API();

var User = function(config) {
	this.init(config);
	this.setPath(baseUrl + "users");
};
User.prototype = new API();

var Ticket = function(config) {
	this.init(config);
	this.setPath(baseUrl + "tickets");
};
Ticket.prototype = new API();

var Checkpoint = function(config) {
	this.init(config);
	this.setPath(baseUrl + "events/" + this.event + "/checkpoints");
};
Checkpoint.prototype = new API();

var Enrollment = function(config) {
	this.init(config);
	this.setPath(baseUrl + "events/" + this.event + "/enrollments");
};
Enrollment.prototype = new API();

var Checkin = function(config) {
	this.init(config);
	this.setPath(baseUrl + "events/" + this.event + "/checkpoints/" + this.checkpoint + "/checkins");
};
Checkin.prototype = new API();


var APP = function() {
	this.load = function(url, callback) {
		var that = this;
		var jqxhr = $.ajax({ 
			url : url,
			method : "GET"
		});
		jqxhr.done(
			function(data) {
				callback(data);
			}
		);
		jqxhr.fail( function(error) {
			console.log("Could not load: " + url);
			console.log(error);
			callback(error);
		});
	}
};


APP.prototype.loadCourses = function(callback) {
	var that = this;
	this.load(baseUrl+'events', function(data) {
		var courseList = []; 
			for (var i = 0; i < data.length; i++) {
				courseList.push(new Course(data[i]));
			}
			that.courses = courseList;
			callback(that);
	});
}

APP.prototype.loadUsers = function(callback) {
	var that = this;
	this.load(baseUrl + "users/", function(data) {
		var userList = []; 
		for (var i = 0; i < data.length; i++) {
			userList.push(new User(data[i]));
		}
		that.users = userList;
		callback(that);
	});
}


APP.prototype.loadTickets = function(callback) {
	var that = this;
	this.load(baseUrl + "tickets/", function(data) {
		var ticketList = []; 
		for (var i = 0; i < data.length; i++) {
			ticketList.push(new Ticket(data[i]));
		}
		that.tickets = ticketList;
		callback(that);
	});
}

APP.prototype.loadCurrentUser = function(callback) {
	var that = this;
	this.load(baseUrl+"me/", function(data) {
		that.currentUser = new User(data);
		callback(that);
	});
}

API.prototype.save = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : that.getPath(),
		method : "POST",
		data : JSON.stringify(that)
	});
	jqxhr.done(
		function(data) { 
			that._id = data._id;
			callback(that); 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not create item");
		console.log(error);
		callback(error);
	});
}

API.prototype.update = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : this.getPath() + "/" + this._id,
		method : "PUT",
		data : JSON.stringify(that)
	});
	jqxhr.done(
		function(data) { 
			callback(that) 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not update item");
		console.log(error);
		callback(error);
	});
}

API.prototype.remove = function(callback) {
	var jqxhr = $.ajax({ 
		url : this.getPath() + "/" + this._id,
		method : "DELETE",
	});
	jqxhr.done(
		function(data) { 
			callback(data) 
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not remove item. Reason: ");
		console.log(error);
		callback(error);
	});
}

API.prototype.load = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : that.getPath() + "/" + that._id,
		method : "GET"
	});
	jqxhr.done(
		function(data) {
			for (var prop in data) {
				if (data.hasOwnProperty(prop)) {
					that[prop] = data[prop];
				}
			}
			callback(that);
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not load item");
		console.log(error);
	});
};

Course.prototype.loadCheckpoints = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/" + that._id + "/checkpoints/",
		method : "GET"
	});
	jqxhr.done(
		function(data) {
			var checkpointList = [];
			for (var i = 0; i < data.length; i++) {
				checkpointList.push(new Checkpoint(data[i]));
			}
			that.checkpoints = checkpointList;
			callback(that);
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not load checkpoint list");
		console.log(error);
	});
};

Course.prototype.loadEnrollments = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/" + that._id + "/enrollments/",
		method : "GET"
	});
	jqxhr.done(
		function(data) {
			var enrollments = [];
			for (var i = 0; i < data.length; i++) {
				enrollments.push(new Enrollment(data[i]));
			}
			that.enrollments = enrollments;
			callback(that);
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not load checkpoint list");
		console.log(error);
	});
};

Checkpoint.prototype.loadCheckins = function(callback) {
	var that = this;
	var jqxhr = $.ajax({ 
		url : baseUrl + "events/" + that.event + "/checkpoints/" + that._id,
		method : "GET"
	});
	jqxhr.done(
		function(data) {
			var checkins = [];
			for (var i = 0; i < data.length; i++) {
				checkins.push(new Checkin(data[i]));
			}
			that.checkins = checkins;
			callback(that);
		}
	);
	jqxhr.fail( function(error) {
		console.log("Could not load checkpoint list");
		console.log(error);
		callback(error);
	});
};