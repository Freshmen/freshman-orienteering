var db = require('./db.js');

var getRequestType = function(req) {
	var type;
	if (req.params.checkpointID) {
		type = 'Checkpoint';
	} else if (req.path.match(/\/checkpoints/i)) {
		type = 'Checkpoint';
	} else if (req.params.enrollmentID) {
		type = 'Enrollment';
	} else if (req.path.match(/\/enrollments/i)) {
		type = 'Enrollment';
	} else if (req.params.eventID) {
		type = 'Event';
	} else if (req.params.userID) {
		type = 'User';
	} else if (req.path.match(/\/users/i)) {
		type = 'User';
	} else {
		type = 'Event';
	}
	return type;
}

var getRequestId = function(req){
	var id;
	if (req.params.checkpointID) {
		id = req.params.checkpointID;
	} else if (req.params.eventID) {
		id = req.params.eventID;
	} else if (req.params.userID) {
		id = req.params.userID;
	} else if (req.params.enrollmentID) {
		id = req.params.enrollmentID;
	} else {
		id = null;
	}
	return id;
}

exports.list = function(req, res) {
	var id = getRequestId(req);
	var type = getRequestType(req);
	if (type === "Checkpoints") {
		db.getChildrenById(id, function(data) {
			res.render('admin_list', {'type' : type, 'items' : data});
		});
	} else {
		db.getDocumentsByType(type, function(data) {
			res.render('admin_list', {'type' : type, 'items' : data});
		});
	}

}

exports.show = function(req, res) {
	var id = getRequestId(req);
	var type = getRequestType(req);
	db.getDocumentById(id, function(data) {
		var items = [];
		for (var prop in data) {
			if (data.hasOwnProperty(prop) && prop.charAt(0) !== '_') {
				var item = {};
				item.key = prop;
				item.value = data[prop];
				items.push(item);
			}
		}
		res.render('admin_show', { 'type' : type, 'items' : items });
	});
}

exports.edit = function(req, res) {
	var id = getRequestId(req);
	var type = getRequestType(req);
	var actionPath = req.path.replace('admin/', 'api/v1/').replace('/edit', '');
	db.getDocumentById(id, function(data) {
		var items = [];
		for (var prop in data) {
			if (data.hasOwnProperty(prop) && prop.charAt(0) !== '_') {
				var item = {};
				item.key = prop;
				item.value = data[prop];
				items.push(item);
			}
		}
		res.render('admin_edit', { 'type' : type, 'items' : items, 'action' : actionPath });
	});
}

exports.create = function(req, res) {
	var type = getRequestType(req);
	var actionPath = req.path.replace('admin/', 'api/v1/').replace('/create', '');
	res.render('admin_create', { 'type' : type, 'action' : actionPath });
}

exports.index = function(req, res) {
	res.render('admin_index');
}