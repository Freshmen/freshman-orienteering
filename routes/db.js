//create a couch, this will only create once and all the rest will be blocked by CouchDB
var nano = require('nano')('http://fori.uni.me:8124');
nano.db.create('fori-test');
var db = nano.use('fori-test');

exports.createEvents = function(req, res){
	res.send('POSTing here creates overrides everything...\n');	
};

exports.createEvent = function(req, res){
	res.send('POSTing here creates event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.createWaypoints = function(req, res){
	res.send('POSTing here overrides all waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.createWaypoint = function(req, res){
	res.send('POSTing here creates a waypoint (waypointID:'
		+ req.params.waypointID
		+') for this event (eventID:' 
		+ req.params.eventID
		+ ') everything...\n');	
};

exports.readEvents = function(req, res){
	res.send('GETting here will list all the events');
};


exports.readEvent = function(req, res){
	res.send('GETting here will describe event ' 
		+  req.params.eventID 
		+ ' here...\n');	
};

exports.readWaypoints = function(req, res){
	res.send('GETing here will list all the waypoints for event ' 
		+ req.params.eventID 
		+ ' here...\n');	
};

exports.readWaypoint = function(req, res){
	res.send('GETting here will describe the waypoint ' 
		+  req.params.waypointID
		+ ' of event'
		+ req.params.eventID 
		+ ' here...\n');	
};

exports.updateEvents = function(req, res){
	res.send('PUTting here updates data that you push...\n');	
};

exports.updateEvent = function(req, res){
	res.send('PUTting here updates this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.updateWaypoints = function(req, res){
	res.send('PUTting here updates the submitted waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.updateWaypoint = function(req, res){
	res.send('PUTting here updates a waypoint (waypointID:'
		+ req.params.waypointID
		+') for this event (eventID:' 
		+ req.params.eventID
		+ ') everything...\n');	
};

exports.deleteEvents = function(req, res){
	res.send('DELETEing here deletes everything...\n');	
};

exports.deleteEvent = function(req, res){
	res.send('DELETEing deletes this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.deleteWaypoints = function(req, res){
	res.send('DELETEing here deletes all waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.deleteWaypoint = function(req, res){
	res.send('DELETEing here deletes waypoint (waypointID:'
		+ req.params.waypointID
		+') of this event (eventID:' 
		+ req.params.eventID
		+ ') everything...\n');	
};
