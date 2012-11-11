exports.create = function(req, res){
	//create a couch, this will only create once and all the rest will be blocked by CouchDB
	var nano = require('nano')('http://fori.uni.me:8124');
	var message = nano.db.create('fori');
	res.send('ok');
};