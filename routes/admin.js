var db = require('./db.js');

exports.events = {
	'list' : function(req, res) {
		db.getDocumentsByType('Event', function(data) {
			res.render('admin/events/list', { 'items' : data });
		});
	},
	'show' : function(req, res) {
		db.getDocumentById(req.params.eventID, function(data) {
			db.getDocumentsByType('User', function(users) {
				db.getDocumentsByType('Event', function(events) {
					res.render('admin/events/show', { 'event' : data, 'users' : users, 'events' : events });
				});
			});	
		});
	},
	'edit' : function(req, res) {
		db.getDocumentById(req.params.eventID, function(data) {
			db.getDocumentsByType('User', function(users) {
				res.render('admin/events/edit', { 'event' : data, 'users' : users });
			});
		});
	},
	'create' : function(req, res) {
		db.getDocumentsByType('User', function(users) {
			res.render('admin/events/create', { 'users' : users });
		});	
	}
};

exports.checkpoints = {
	'list' : function(req, res) {
		db.getCheckpoints(req.params.eventID, function(data) {
			res.render('admin/checkpoints/list', { 'items' : data});
		});
	},
	'show' :  function(req, res) { 
		db.getDocumentById(req.params.checkpointID, function(data) {
			res.render('admin/checkpoints/show', { 'checkpoint' : data });
		});
	},
	'edit' :  function(req, res) {
		db.getDocumentById(req.params.checkpointID, function(data) {
			res.render('admin/checkpoints/edit', { 'checkpoint' : data, 'eventID' : req.params.eventID });
		});
	 },
	'create' :  function(req, res) { 
		res.render('admin/checkpoints/create', { 'eventID' : req.params.eventID });
	}
};

exports.enrollments = {
	'list' : function(req, res) {
		if (req.params.userID) {
			db.getEnrollmentsByUser(req.params.userID, function(data) {
				res.render('admin/enrollments/list', { 'items' : data });
			});
		} else {
			db.getEnrollments(req.params.eventID, function(data) {
				res.render('admin/enrollments/list', { 'items' : data});
			});
		}
	},
	'show' : function(req, res) {
		db.getDocumentById(req.params.enrollmentID, function(data) {
			db.getDocumentsByType('User', function(users) {
				db.getDocumentsByType('Event', function(events) {
					res.render('admin/enrollments/show', { 'enrollment' : data, 'users' : users, 'events' : events  });
				});
			});
		});
	},
	'edit' : function(req, res) {
		db.getDocumentById(req.params.enrollmentID, function(data) {
			db.getDocumentsByType('User', function(users) {
				db.getDocumentsByType('Event', function(events) {
					res.render('admin/enrollments/edit', { 'enrollment' : data, 'users' : users, 'events' : events, 'eventID' : req.params.eventID });
				});
			});
		});
	},
	'create' : function(req, res) {
		var api_endpoint;
		if (req.params.userID) {
			api_endpoint = '/api/v1/users/' + req.params.userID + '/enrollments';
		} else if (req.params.eventID) {
			api_endpoint = '/api/v1/events/' + req.params.eventID + '/enrollments';
		}
		db.getDocumentsByType('User', function(users) {
			db.getDocumentsByType('Event', function(events) {
				res.render('admin/enrollments/create', { 'users' : users, 'events' : events, 'api_endpoint' : api_endpoint });
			});
		});	
	}
};

exports.checkins = {
	'list' : function(req, res) {
		db.getCheckins(req.params.checkpointID, function(data) {
			res.render('admin/checkins/list', { 'items' : data});
		});
	},
	'show' : function(req, res) {
		db.getDocumentById(req.params.checkinID, function(data) {
			db.getDocumentsByType('User', function(users) {
				db.getCheckpoints(req.params.eventID, function(checkpoints) {
					res.render('admin/checkins/show', { 'checkin' : data, 'users' : users, 'checkpoints' : checkpoints });
				});
			});
		});
	},
	'edit' : function(req, res) {
		db.getDocumentById(req.params.checkinID, function(data) {
			db.getDocumentsByType('User', function(users) {
				db.getCheckpoints(req.params.eventID, function(checkpoints) {
					res.render('admin/checkins/edit', { 'checkin' : data, 'checkpoints' : checkpoints, 'users' : users, 'eventID' : req.params.eventID, 'checkpointID' : req.params.checkpointID });
				});
			});
		});
	},
	'create' : function(req, res) {
		db.getDocumentsByType('User', function(users) {
			db.getCheckpoints(req.params.eventID, function(checkpoints) {
				res.render('admin/checkins/create', { 'checkpoints' : checkpoints, 'users' : users, 'eventID' : req.params.eventID, 'checkpointID' : req.params.checkpointID });
			});
		});
	}
};

exports.users = {
	'list' : function(req, res) {
		db.getDocumentsByType('User', function(data) {
			res.render('admin/users/list', { 'items' : data});
		});		
	},
	'show' : function(req, res) {
		db.getDocumentById(req.params.userID, function(data) {
			res.render('admin/users/show', { 'user' : data });
		});
	},
	'edit' : function(req, res) {
		db.getDocumentById(req.params.userID, function(data) {
			res.render('admin/users/edit', { 'user' : data });
		});
	},
	'create' : function(req, res) {
		res.render('admin/users/create', { });
	}
};

exports.index = function(req, res) {
	res.render('admin/index');
};