//create a couch, this will only create once and all the rest will be blocked by CouchDB
var nano = require('nano')('http://fori.uni.me:8124');
nano.db.create('fori-test-2');
var db = nano.use('fori-test-2');


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

function deleteItem(id, callback) {	
	
}

exports.createEvents = function(req, res){
	if (req.body) {
		var event = req.body;
		event.type = 'Event';
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
		checkPoint.type = 'Checkpoint';
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
  			response.events = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.events.push(doc.value);
    			});
  			}
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
	read_doc(req.params.checkpointID, function(body) {
		var currentCheckpoint = body;
		var _rev = currentCheckpoint._rev;
		insert_doc(currentCheckpoint, _rev, function(body){
			res.send(body, 200);
		});
	});	
};

exports.deleteEvents = function(req, res){
	res.send('DELETEing here deletes everything...\n');	
};

exports.deleteEvent = function(req, res){
	read_doc(req.params.eventID, function(body) {
		var currentEvent = body;
		var _rev = currentEvent._rev;
		currentEvent._deleted = true;
		insert_doc(currentEvent, _rev, function(body){
			res.send(body, 200);
		});
	});
};

exports.deleteCheckpoints = function(req, res){
	var filter = {};
	filter.keys = [];
	filter.keys.push(req.params.eventID);
	db.view('Lists', 'Checkpoints', filter ,function(err, body) {
  		if (!err) {
  			var response = {};
  			response.status = 'OK';
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				doc._deleted = true;
      				console.log('checkpoint ' + doc._id + ' deleted.');
    			});
  			}
    		res.send(response, 200);
    	} else {
    		res.send(err, 400);
    	}
	}); 
};

exports.deleteCheckpoint = function(req, res){
	read_doc(req.params.checkpointID, function(body) {
		var currentCheckpoint = body;
		currentCheckpoint._deleted = true;
		var _rev = currentCheckpoint._rev;
		insert_doc(currentCheckpoint, _rev, function(body){
			res.send(body, 200);
		});
	});	
};

exports.test = function(req, res) {
	var data = req.body;
	data.success = 'OK';
	res.send(data, 200);
};