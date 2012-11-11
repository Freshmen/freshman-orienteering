exports.create = function(req, res){
	//create a couch, this will only create once and all the rest will be blocked by CouchDB
	var nano = require('nano')('http://fori.uni.me:8124');
	nano.db.create('fori');
	res.send('ok');
};

exports.listEvents = function(req, res){
	res.send('events will be listed here...')	
}


exports.showEvent = function(req, res){
	res.send('event ' +  req.params.eventId + ' will be described here...')	
}

exports.listWaypoints = function(req, res){
	res.send('waypoints for event ' + req.params.eventId + ' will be listed here...')	
}


exports.showWaypoint = function(req, res){
	res.send('waypoint ' 
		+  req.params.wpId 
		+ ' of event'
		+ req.params.eventId 
		+ ' will be described here...')	
}