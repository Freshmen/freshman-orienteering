//create a couch, this will only create once and all the rest will be blocked by CouchDB
//var nano = require('nano')('http://Fori:P0r1na@127.0.0.1:5984/');
var nano = require('nano')('http://couch:zu5r8ZcL@fori.uni.me:8124/');
nano.db.create('fori-test-4');
var db = nano.use('fori-test-4');


var addDesignDocs = function() {
	db.insert(
		{ "views": 
			{
   				"Events": {
       				"map": "function(doc) {\n  if (doc.type === \"Event\")\n    emit(doc.title, doc);\n}"
   				},	
   				"Checkpoints": {
       				"map": "function(doc) {\n  if (doc.type === \"Checkpoint\")\n    emit(doc.event, doc);\n}"
   				},
   				"Users": {
       				"map": "function(doc) {\n  if (doc.type === \"User\")\n    emit(doc, doc);\n}"
   				},
   				"Enrollments": {
       				"map": "function(doc) {\n  if (doc.type === \"Enrollment\")\n    emit(doc.user, doc);\n}"
   				},
   				"Children" : {
   					"map" : "function(doc) {\n if (doc.type === \"Event\")\n  emit(doc.title, doc);\n  else if (doc.parent)\n   emit(doc.parent, doc);\n}"
   				},	
   				"byType": {
       				"map": "function(doc) {\n  if (doc.type)\n    emit(doc.type, doc);\n}"
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
		else { return console.log(err); }
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

exports.getDocumentById = function(id, callback){
	read_doc(id, function(body) {
		callback(body);
	});
};

exports.getDocumentsByType = function(type, callback){
	var filter;
	if (type) {
		filter = {};
		filter.keys = [];
		filter.keys.push(type);
	} else {
		filter = '';
	}
	db.view('Lists', 'byType', filter, function(err, body) {
  		if (!err) {
  			var response = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.push(doc.value);
    			});
  			}
  			callback(response);
    	} else {
    		console.log(err);
    	}
	});
};


exports.getChildrenById = function(id, callback) {
	var filter;
	if (id) {
		filter = {};
		filter.keys = [];
		filter.keys.push(id);
	} else {
		filter = '';
	}
	db.view('Lists', 'Children', filter, function(err, body) {
  		if (!err) {
  			var response = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.push(doc.value);
    			});
  			}
  			callback(response);
    	} else {
    		console.log(err);
    	}
	});
}

exports.getCheckpoints = function(eventID, callback) {
	var filter = {};
	filter.keys = [];
	filter.keys.push(eventID);
	db.view('Lists', 'Checkpoints', filter ,function(err, body) {
  		if (!err) {
  			var response = {};
  			response.checkpoints = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.checkpoints.push(doc.value);
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
		checkPoint.parent = req.params.eventID;
		checkPoint.type = 'Checkpoint';
		insert_doc(checkPoint, 0, function(body){
			res.json(body, 201);
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
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	});
};


exports.readEvent = function(req, res){
	read_doc(req.params.eventID, function(body) {
		res.json(body);
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
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	}); 
};

exports.readCheckpoint = function(req, res){
	read_doc(req.params.checkpointID, function(body) {
		res.json(body);
	});
};

exports.updateEvents = function(req, res){
	res.send('PUTting here updates data that you push...\n');	
};

exports.updateEvent = function(req, res){
	updateItem(req.params.eventID, req.body, function(body){
		res.json(body);
	});
};

exports.updateCheckpoints = function(req, res){
	res.send('Unimplemented. PUTting here updates the submitted waypoints for this event (eventID:' 
		+ req.params.eventID
		+ ')...\n', 404);	
};

exports.updateCheckpoint = function(req, res){
	updateItem(req.params.checkpointID, req.body, function(body){
		res.json(body);
	});
};

exports.deleteEvents = function(req, res){
	res.send('Unimplemented. DELETEing here deletes everything...\n', 404);	
};

exports.deleteEvent = function(req, res){
	deleteItem(req.params.eventID, function(body) {
		res.json(body);
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
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	}); 
};

exports.deleteCheckpoint = function(req, res){
	deleteItem(req.params.checkpointID, function(body) {
		res.json(body);
	});
};

exports.readUsers = function(req, res) {
	db.view('Lists', 'Users', function(err, body) {
  		if (!err) {
  			var response = {};
  			response.users = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.users.push(doc.value);
    			});
  			}
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	});
};

exports.readUser = function(req, res) {
	read_doc(req.params.userID, function(body) {
		res.json(body);
	});
};

exports.createUser = function(req, res) {
	if (req.body) {
		var user = req.body;
		user.type = 'User';
		insert_doc(user, 0, function(body){
			res.json(body, 201);
		});
	}
	else {
		res.send('{"error" : "No body in request"}', 400);
	}	
};

exports.updateUser = function(req, res) {
	updateItem(req.params.userID, req.body, function(body) {
		res.json(body);
	});	
};

exports.deleteUser = function(req, res) {
	deleteItem(req.params.userID, function(body) {
		res.json(body);
	});
};

exports.readCheckin = function(req, res) {};

exports.readCheckins = function(req, res) {};

exports.createCheckin = function(req, res) {};

exports.createEnrollment = function(req, res) {
	if (req.body) {
		var enrollment = req.body;
		enrollment.type = 'Enrollment';
		insert_doc(enrollment, 0, function(body){
			res.json(body, 201);
		});
	}
	else {
		res.send('{"error" : "No body in request"}', 400);
	}	
};

exports.readEnrollment = function(req, res) {
	read_doc(req.params.enrollmentID, function(body) {
		res.json(body);
	});	
};
exports.readEnrollments = function(req, res) {
	if (req.params.userID) {
		var filter = {};
		filter.keys = [];
		filter.keys.push(req.params.userID);
		db.view('Lists', 'Enrollments', filter, function(err, body) {
  		if (!err) {
  			var response = {};
  			response.enrollments = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.enrollments.push(doc.value);
    			});
  			}
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	});
	}
	db.view('Lists', 'Enrollments', function(err, body) {
  		if (!err) {
  			var response = {};
  			response.enrollments = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
      				response.enrollments.push(doc.value);
    			});
  			}
    		res.json(response);
    	} else {
    		res.send(err, 400);
    	}
	});
};
exports.deleteEnrollment = function(req, res) {
	deleteItem(req.params.enrollmentID, function(body) {
		res.json(body);
	});
};
exports.updateEnrollment = function(req, res) {
	updateItem(req.params.enrollmentID, req.body, function(body) {
		res.json(body);
	});	
};

