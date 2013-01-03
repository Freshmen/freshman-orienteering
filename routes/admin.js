var db = require('./db.js');

var getRequestType = function(req) {
	var type;
	if (req.params.checkpointID) {
		type = 'Checkpoint';
	} else if (req.params.eventID) {
		type = 'Event';
	} else {
		type = 'Events';
	}
	return type;
}

var getRequestId = function(req){
	var id;
	if (req.params.checkpointID) {
		id = req.params.checkpointID;
	} else if (req.params.eventID) {
		id = req.params.eventID;
	} else {
		id = null;
	}
	return id;
}

exports.list = function(req, res) {
	var id = getRequestId(req);
	var type = getRequestType(req);
	db.getChildrenById(id, function(data) {
		res.render('admin_list', {'type' : type, 'items' : data});
	});
}

exports.show = function(req, res) {
	var id = getRequestId(req);
	var type = getRequestType(req);
	db.getDocumentById(id, function(data) {
		var items = [];
		for (var prop in data) {
			if (data.hasOwnProperty(prop)) {
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
	db.getDocumentById(id, function(data) {
		var items = [];
		for (var prop in data) {
			if (data.hasOwnProperty(prop)) {
				var item = {};
				item.key = prop;
				item.value = data[prop];
				items.push(item);
			}
		}
		res.render('admin_edit', { 'type' : type, 'items' : items });
	});
}

exports.create = function(req, res) {
	var type = getRequestType(req);
	res.render('admin_create', { 'type' : type });
}