//create a couch, this will only create once and all the rest will be blocked by CouchDB
var nano = require('nano')('http://fori.uni.me:8124');
nano.db.create('fori-test');
var db = nano.use('fori-test');


function insert_doc(doc, tried, callback) {
    db.insert(doc,
      function (error,http_body,http_headers) {
        if(error) {
          if(error.message === 'no_db_file'  && tried < 1) {
            // create database and retry
            return nano.db.create(db_name, function () {
              insert_doc(doc, tried+1);
            });
          }
          else { return console.log(error); }
        }
        callback(http_body);
    });
}

function read_doc(id, callback) {
	db.get(id, { revs_info: true }, function(err, body) {
		if (!err) {
			callback(body);
		} 
		else { return console.log(error); }
	});
}

exports.createEvents = function(req, res){
	if (req.body) {
		insert_doc(req.body, 0, function(body){
			res.send(body, 201);
		});
	}
	else {
		res.send('{"error" : "No body in request"}', 400);
	}
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
	read_doc(req.params.eventID, function(body) {
		res.send(body);
	});
};

exports.readWaypoints = function(req, res){
	res.send('GETing here will list all the waypoints for event ' 
		+ req.params.eventID 
		+ ' here...\n');	
};

exports.readWaypoint = function(req, res){
	res.send('GETting here will describe the waypoint ' 
		+  req.params.waypointID
		+ ' of event '
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
