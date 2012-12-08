var db = require('./db.js');

exports.show = function(req, res) {
	db.getEvents(function(data) {
		res.render('admin', data);
	});
}