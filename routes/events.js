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