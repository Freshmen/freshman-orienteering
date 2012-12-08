var db = require('./db.js');

exports.show = function(req, res){
	var data = {};
	data.type = "event";
	data.items = [];
	res.render('show', data);
};

exports.list = function(req, res){
	var data = {};
	data.type = "event";
	data.items = [];
	res.render('list', data);
};

exports.edit = function(req, res){
	var data = {};
	data.type = "event";
	data.items = [];

	data.items[0] = {};
	data.items[0].key = 'title';
	data.items[0].value = 'test';
	
	data.items[1] = {};
	data.items[1].key = 'startTime';
	data.items[1].value = 'test';
	
	data.items[2] = {};
	data.items[2].key = 'endTime';
	data.items[2].value = 'test';
	
	data.items[3] = {};
	data.items[3].key = 'latitude';
	data.items[3].value = 'test';
	
	data.items[4] = {};
	data.items[4].key = 'longitude';
	data.items[4].value = 'test';
	
	data.items[5] = {};
	data.items[5].key = 'altitude';
	data.items[5].value = 'test';
	
	res.render('edit', data);
};

exports.create = function(req, res){
	var data = {};
	data.type = "event";
	data.items = [];
	data.items.push('title');
	data.items.push('startTime');
	data.items.push('endTime');
	data.items.push('latitude');
	data.items.push('longitude');
	data.items.push('altitude');
	res.render('create', data);
};