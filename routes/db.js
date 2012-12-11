//create a couch, this will only create once and all the rest will be blocked by CouchDB
var nano = require('nano')('couch:zu5r8ZcL@http://fori.uni.me:8124/');
nano.db.create('fori-test');
var db = nano.use('fori-test');


var addDesignDocs = function() {
	db.insert(
		{ "views": 
			{
   				"Events": {
       				"map": "function(doc) {\n  if (doc.type === \"Event\")\n    emit(doc.title, doc);\n}"
   				},	
   				"Checkpoints": {
       				"map": "function(doc) {\n  if (doc.type === \"Checkpoint\")\n    emit(doc.event, doc);\n}"
   				}
			}
  		}, '_design/Lists'
  	);
}();

var insert_doc = function(doc, tried, callback) {
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

var read_doc = function(id, callback) {
	db.get(id, function(err, body) {
		if (!err) {
			callback(body);
		} 
		else { return console.log(error); }
	});
}

var deleteItem = function(id, callback) {
	read_doc(id, function(item){
		db.destroy(item._id, item._rev, function(err, body) {
			if (err) {
				callback(err);
			}
			else  {
				callback(body);
			}  	
		});
	});
}

var updateItem = function(id, updateItem, callback) {
	read_doc(id, function(body) {
		var currentItem = body;
		for (var prop in updateItem) {
			if (updateItem.hasOwnProperty(prop)) {
				currentItem[prop] = updateItem[prop];
			}
		}
		insert_doc(currentItem, 0, function(body) {
			callback(body);
		});
	});
}

exports.getEvents = function(callback) {
	db.view('Lists', 'Events', function(err, body) {
  		if (!err) {
  			var response = {};
  			response.events = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.events.push(doc.value);
    			});
  			}
  			callback(response);
    	}
	});

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
	updateItem(req.params.eventID, req.body, function(body){
		res.send(body, 200);
	});
};

exports.updateCheckpoints = function(req, res){
	res.send('Unimplemented. PUTting here updates the submitted waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n', 404);	
};

exports.updateCheckpoint = function(req, res){
	updateItem(req.params.checkpointID, req.body, function(body){
		res.send(body, 200);
	});
};

exports.deleteEvents = function(req, res){
	res.send('Unimplemented. DELETEing here deletes everything...\n', 404);	
};

exports.deleteEvent = function(req, res){
	deleteItem(req.params.eventID, function(body) {
		res.send(body, 200);
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
    			});
  			}
    		res.send(response, 200);
    	} else {
    		res.send(err, 400);
    	}
	}); 
};

exports.deleteCheckpoint = function(req, res){
	deleteItem(id, function(body) {
		res.send(body, 200);
	});
};
