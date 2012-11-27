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
		var event = req.body;
		insert_doc(event, 0, function(body){
			res.send(body, 201);
		});
	}
	else {
		res.send('{"error" : "No body in request"}', 400);
	}
};

exports.createEvent = function(req, res){
	res.send('{"error" : "Cannot POST here."}', 400);
};

exports.createCheckpoints = function(req, res){
	if (req.body) {
		var checkPoint = req.body;
		checkPoint.event = req.params.eventID;
		insert_doc(checkPoint, 0, function(body){
			res.send(body, 201);
		});
	}
	else {
		res.send('{"error" : "No body in request"}', 400);
	}	
};

exports.createCheckpoint = function(req, res){
	res.send('{"error" : "Cannot POST here."}', 400);
};

exports.readEvents = function(req, res){
	db.view('Lists', 'Events', function(err, body) {
  		if (!err) {
  			var response = {};
  			if(body && body.rows) response.events = body.rows;
    		res.send(response, 200);
    	} else {
    		res.send(err, 400);
    	}
	});
};


exports.readEvent = function(req, res){
	read_doc(req.params.eventID, function(body) {
		res.send(body);
	});
};

exports.readCheckpoints = function(req, res){
	var filter = {};
	filter.keys = [];
	filter.keys.push(req.params.eventID);
	db.view('Lists', 'Checkpoints', filter ,function(err, body) {
  		if (!err) {
  			var response = {};
  			response.checkpoints = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.checkpoints.push(doc.value);
    			});
  			}
    		res.send(response, 200);
    	} else {
    		res.send(err, 400);
    	}
	}); 
};

exports.readCheckpoint = function(req, res){
	read_doc(req.params.checkpointID, function(body) {
		res.send(body);
	});
};

exports.updateEvents = function(req, res){
	res.send('PUTting here updates data that you push...\n');	
};

exports.updateEvent = function(req, res){
	read_doc(req.params.eventID, function(body) {
		var currentEvent = body;
		var _rev = currentEvent._rev;
		console.log(_rev);
		insert_doc(currentEvent, _rev, function(body){
			res.send(body, 200);
		});
	});
};

exports.updateCheckpoints = function(req, res){
	res.send('PUTting here updates the submitted waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.updateCheckpoint = function(req, res){
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

exports.deleteCheckpoints = function(req, res){
	res.send('DELETEing here deletes all waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n');	
};

exports.deleteCheckpoint = function(req, res){
	res.send('DELETEing here deletes waypoint (waypointID:'
		+ req.params.waypointID
		+') of this event (eventID:' 
		+ req.params.eventID
		+ ') everything...\n');	
};

exports.test = function(req, res) {
	var data = req.body;
	data.success = 'OK';
	res.send(data, 200);
};