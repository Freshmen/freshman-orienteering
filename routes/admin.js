var db = require('./db.js');

exports.events = {};
exports.checkpoints = {};
exports.enrollments = {};
exports.checkins = {};
exports.users = {};

exports.events.list = function(req, res) {
	db.getDocumentsByType('Event', function(data) {
		res.render('admin/events/list', { 'items' : data });
	});
}

exports.checkpoints.list = function(req, res) {
	db.getCheckpoints(req.params.eventID, function(data) {
		res.render('admin/checkpoints/list', { 'items' : data});
	});
}

exports.users.list = function(req, res) {
	db.getDocumentsByType('User', function(data) {
		res.render('admin/users/list', { 'items' : data});
	});
}

exports.enrollments.list = function(req, res) {
	if (req.params.userID) {
		db.getEnrollmentsByUser(req.params.userID, function(data) {
			res.render('admin/enrollments/list', { 'items' : data });
		});
	} else {
		db.getEnrollments(req.params.eventID, function(data) {
			res.render('admin/enrollments/list', { 'items' : data});
		});
	}
}

exports.checkins.list = function(req, res) {
	db.getCheckins(req.params.checkpointID, function(data) {
		res.render('admin/checkins/list', { 'items' : data});
	});
}

exports.events.show = function(req, res) {
	db.getDocumentById(req.params.eventID, function(data) {
		db.getDocumentsByType('User', function(users) {
			db.getDocumentsByType('Event', function(events) {
				res.render('admin/events/show', { 'event' : data, 'users' : users, 'events' : events });
			});
		});	
	});
}

exports.checkpoints.show = function(req, res) {
	db.getDocumentById(req.params.checkpointID, function(data) {
		res.render('admin/checkpoints/show', { 'checkpoint' : data });
	});
}

exports.enrollments.show = function(req, res) {
	db.getDocumentById(req.params.enrollmentID, function(data) {
		db.getDocumentsByType('User', function(users) {
			db.getDocumentsByType('Event', function(events) {
				res.render('admin/enrollments/show', { 'enrollment' : data, 'users' : users, 'events' : events  });
			});
		});
	});
}

exports.checkins.show = function(req, res) {
	db.getDocumentById(req.params.checkinID, function(data) {
		db.getDocumentsByType('User', function(users) {
			db.getCheckpoints(req.params.eventID, function(checkpoints) {
				res.render('admin/checkins/show', { 'checkin' : data, 'users' : users, 'checkpoints' : checkpoints });
			});
		});
	});
}

exports.users.show = function(req, res) {
	db.getDocumentById(req.params.userID, function(data) {
		res.render('admin/users/show', { 'user' : data });
	});
}

exports.events.edit = function(req, res) {
	db.getDocumentById(req.params.eventID, function(data) {
		db.getDocumentsByType('User', function(users) {
			res.render('admin/events/edit', { 'event' : data, 'users' : users });
		});
	});
}

exports.checkpoints.edit = function(req, res) {
	db.getDocumentById(req.params.checkpointID, function(data) {
		res.render('admin/checkpoints/edit', { 'checkpoint' : data, 'eventID' : req.params.eventID });
	});
}

exports.enrollments.edit = function(req, res) {
	db.getDocumentById(req.params.enrollmentID, function(data) {
		db.getDocumentsByType('User', function(users) {
			db.getDocumentsByType('Event', function(events) {
				res.render('admin/enrollments/edit', { 'enrollment' : data, 'users' : users, 'events' : events, 'eventID' : req.params.eventID });
			});
		});
	});
}

exports.checkins.edit = function(req, res) {
	db.getDocumentById(req.params.checkinID, function(data) {
		db.getDocumentsByType('User', function(users) {
			db.getCheckpoints(req.params.eventID, function(checkpoints) {
				res.render('admin/checkins/edit', { 'checkin' : data, 'checkpoints' : checkpoints, 'users' : users, 'eventID' : req.params.eventID, 'checkpointID' : req.params.checkpointID });
			});
		});
	});
}

exports.users.edit = function(req, res) {
	db.getDocumentById(req.params.userID, function(data) {
		res.render('admin/users/edit', { 'user' : data });
	});
}

exports.events.create = function(req, res) {
	db.getDocumentsByType('User', function(users) {
		res.render('admin/events/create', { 'users' : users });
	});	
}

exports.checkpoints.create = function(req, res) {
	res.render('admin/checkpoints/create', { 'eventID' : req.params.eventID });
}

exports.enrollments.create = function(req, res) {
	db.getDocumentsByType('User', function(users) {
		db.getDocumentsByType('Event', function(events) {
			res.render('admin/enrollments/create', { 'users' : users, 'events' : events, 'eventID' : req.params.eventID });
		});
	});	
}

exports.checkins.create = function(req, res) {
	db.getDocumentsByType('User', function(users) {
		db.getCheckpoints(req.params.eventID, function(checkpoints) {
			res.render('admin/checkins/create', { 'checkpoints' : checkpoints, 'users' : users, 'eventID' : req.params.eventID, 'checkpointID' : req.params.checkpointID });
		});
	});
}

exports.users.create = function(req, res) {
	res.render('admin/users/create', { });
}

exports.index = function(req, res) {
	res.render('admin/index');
}