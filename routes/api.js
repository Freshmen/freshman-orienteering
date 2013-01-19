//var nano = require('nano')('http://Fori:P0r1na@127.0.0.1:5984/');

var nano = require('nano')('http://couch:zu5r8ZcL@fori.uni.me:8124/');
nano.db.create('fori-test-6');
var db = nano.use('fori-test-6');

var add_design_docs = function() {
	db.insert(
		{ "views": 
			{
   				"Events": {
       				"map": "function(doc) {\n  if (doc.type === \"Event\")\n    emit(doc.organizer, doc);\n}"
   				},	
   				"Checkpoints": {
       				"map": "function(doc) {\n  if (doc.type === \"Checkpoint\")\n    emit(doc.event, doc);\n}"
   				},
   				"Users": {
       				"map": "function(doc) {\n  if (doc.type === \"User\")\n    emit(doc.id, doc);\n}"
   				},
   				"Enrollments": {
       				"map": "function(doc) {\n  if (doc.type === \"Enrollment\")\n    emit(doc.event, doc);\n}"
   				},
   				"EnrollmentsByUser": {
       				"map": "function(doc) {\n  if (doc.type === \"Enrollment\")\n    emit(doc.user, doc);\n}"
   				},
   				"Checkins": {
       				"map": "function(doc) {\n  if (doc.type === \"Checkin\")\n    emit(doc.checkpoint, doc);\n}"
   				},
   				"CheckinsByUser": {
       				"map": "function(doc) {\n  if (doc.type === \"Checkin\")\n    emit(doc.user, doc);\n}"
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

var read_rev = function(id, callback) {
	db.get(id, function(err, body) {
		if (!err) {
			callback(body._rev);
		} 
		else { return console.log(err); }
	});
}

// gets document from database
var read_doc = function(id, callback) {
	db.get(id, function(err, body) {
		if (!err) {
			delete body._rev;
			callback(body);
		} 
		else { return console.log(err); }
	});
}

var delete_doc = function(id, callback) {
	read_rev(id, function(rev) {
		db.destroy(id, rev, function(err, body) {
			if (err) {
				callback(err);
			}
			else  {
				callback(body);
			}  	
		});
	});
}

var update_doc = function(id, doc, callback) {
	read_doc(id, function(body) {
		var current_doc = body;
		for (var prop in doc) {
			if (doc.hasOwnProperty(prop)) {
				current_doc[prop] = updateItem[prop];
			}
		}
		insert_doc(current_doc, 0, function(body) {
			callback(body);
		});
	});
}

var read_view = function(view, filter, callback) {
	db.view('Lists', view, filter?{ 'keys' : [filter] }:'', function(err, body) {
  		if (!err) {
  			var response = [];
  			if(body && body.rows) {
  				body.rows.forEach(function(doc) {
					delete doc.value._rev;
      				response.push(doc.value);
    			});
  			}
  			callback(response);
    	} else {
    		console.log(err);
    	}
	});
}

exports.events = {
	create : function(req, res) {
		req.body.type = 'Event';
		if (req.user && !req.body.organizer) {
			req.body.organizer = req.user;
		}
		insert_doc(req.body, 0, function(body){
			res.json(body, 201);
		});
	},
	list : function(req, res) {
		var organizer = req.query['organizer'];
		var filter = organizer?organizer:false;
		read_view('Events', filter, function(body) {
			res.json(body, 200);
		});
	},
	show : function(req, res) {
		read_doc(req.params.eventID, function(body) {
			res.json(body, 200);
		});
	},
	edit : function(req, res) {
		update_doc(req.params.eventID, req.body, function(body){
			res.json(body, 200);
		});
	},
	remove : function(req, res) {
		delete_doc(req.params.eventID, function(body) {
			res.json(body, 200);
		});
	}
};


exports.checkpoints = {
	create : function(req, res) {
		req.body.type = 'Checkpoint';
		insert_doc(req.body, 0, function(body){
			res.json(body, 201);
		});
	},
	list : function(req, res) {
		read_view('Checkpoints', req.params.eventID, function(body) {
			res.json(body, 200);
		});
	},
	show : function(req, res) {
		read_doc(req.params.checkpointID, function(body) {
			res.json(body, 200);
		});
	},
	edit : function(req, res) {
		update_doc(req.params.checkpointID, req.body, function(body){
			res.json(body, 200);
		});
	},
	remove : function(req, res) {
		delete_doc(req.params.checkpointID, function(body) {
			res.json(body, 200);
		});
	}
};

exports.enrollments = {
	create : function(req, res) {
		req.body.type = 'Enrollment';
		if (!req.body.user && req.user) {
			req.body.user = req.user;
		}		
		insert_doc(req.body, 0, function(body){
			res.json(body, 201);
		});
	},
	list : function(req, res) {
		read_view('Enrollments', req.params.eventID, function(body) {
			res.json(body, 200);
		});
	},
	show : function(req, res) {
		read_doc(req.params.enrollmentID, function(body) {
			res.json(body, 200);
		});
	},
	edit : function(req, res) {
		update_doc(req.params.enrollmentID, req.body, function(body){
			res.json(body, 200);
		});
	},
	remove : function(req, res) {
		delete_doc(req.params.enrollmentID, function(body) {
			res.json(body, 200);
		});
	}
};

exports.checkins = {
	create : function(req, res) {
		req.body.type = 'Checkin';
		if (!req.body.user && req.user) {
			req.body.user = req.user;
		}
		insert_doc(req.body, 0, function(body){
			res.json(body, 201);
		});
	},
	list : function(req, res) {
		read_view('Checkins', req.params.checkpointID, function(body) {
			res.json(body, 200);
		});
	},
	show : function(req, res) {
		read_doc(req.params.checkinID, function(body) {
			res.json(body, 200);
		});
	},
	edit : function(req, res) {
		update_doc(req.params.checkinID, req.body, function(body){
			res.json(body, 200);
		});
	},
	remove : function(req, res) {
		delete_doc(req.params.checkinID, function(body) {
			res.json(body, 200);
		});
	}
};

exports.users = {
	create : function(req, res) {
		req.body.type = 'User';
		insert_doc(req.body, 0, function(body){
			res.json(body, 201);
		});
	},
	list : function(req, res) {
		var id = req.query['id'];
		read_view('Users', id?id:false, function(body) {
			res.json(body, 200);
		});
	},
	show : function(req, res) {
		read_doc(req.params.userID, function(body) {
			res.json(body, 200);
		});
	},
	edit : function(req, res) {
		update_doc(req.params.userID, req.body, function(body){
			res.json(body, 200);
		});
	},
	remove : function(req, res) {
		delete_doc(req.params.userID, function(body) {
			res.json(body, 200);
		});
	},
	get : function(userID, callback) {
		read_doc(userID, function(body) {
			callback(body);
		});		
	},
	facebook_login : function(user, callback) {
		read_view('Users', user.id, function(body) {
			if (body && body.length) {
				callback(body[0]._id);
			} else {
				user._json.type = 'User';
				insert_doc(user._json, 0, function(body){
					callback(body.id);
				});
			}
		});	
	}
};