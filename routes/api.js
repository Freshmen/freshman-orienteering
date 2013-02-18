var https = require('https');

module.exports = exports = function api_module(cfg) {
	var nano, db, DEBUG;

	var init = function(cfg, callback) {
		nano = require('nano')(cfg.url);
		nano.db.create(cfg.name);
		db = nano.use(cfg.name);
		UNAUTHENTICATED = cfg.UNAUTHENTICATED;
		add_design_docs();
		if (callback) { callback(); }
	}

	if (cfg) { init(cfg); }

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
	   				},
	   				"Submissions": {
	       				"map": "function(doc) {\n  if (doc.type === \"Submission\")\n    emit(doc.checkpoint, doc);\n}"
	   				},
	   				"SubmissionsByEvent": {
	       				"map": "function(doc) {\n  if (doc.type === \"Submission\")\n    emit(doc.event, doc);\n}"
	   				},
	   				"SubmissionsByUser": {
	       				"map": "function(doc) {\n  if (doc.type === \"Submission\")\n    emit(doc.user, doc);\n}"
	   				},
	   				"Tasks": {
	       				"map": "function(doc) {\n  if (doc.type === \"Task\")\n    emit(doc.checkpoint, doc);\n}"
	   				},
	   				"Tickets": {
	       				"map": "function(doc) {\n  if (doc.type === \"Ticket\")\n    emit(doc.event, doc);\n}"
	   				}
				}
	  		}, '_design/Lists'
	  	);
	};

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
		if (id) {
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
		} else { 
			callback({ "error" : "no id provided" });
		}
	}

	var update_doc = function(id, doc, callback) {
		db.get(id, function(err, body) {
			var current_doc = body;
			for (var prop in doc) {
				if (doc.hasOwnProperty(prop)) {
					current_doc[prop] = doc[prop];
				}
			}
			insert_doc(current_doc, 0, function(body) {
				callback(body);
			});
		});
	}

	var read_view = function(view, filter, callback) {
		filter = filter?filter:'';
		db.view('Lists', view, filter, function(err, body) {
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

	var parseFilters = function(req, key) {
		var isFiltered = false;
		var filter = {};
		if (key) {
			isFiltered = true;
			filter.key = key;
		}
		if (req.query['limit'] && !isNaN(req.query['limit'])) {
			isFiltered = true;
			filter.limit = req.query['limit'];
		}
		if (req.query['offset'] && !isNaN(req.query['offset'])) {
			isFiltered = true;
			filter.skip = req.query['offset'];
		}
		if (req.query['skip'] && !isNaN(req.query['skip'])) {
			isFiltered = true;
			filter.skip = req.query['skip'];
		}
		if (req.query['descending'] && req.query['descending'] == 'true') {
			isFiltered = true;
			filter.descending = true;
		}
		return isFiltered?filter:'';
	}

	var checkRights = function(id, user, next) {
		if (UNAUTHENTICATED) { 
			next(); 
		} else if (!user) {
			next({ error : "user not logger in." });
		} else if (user.type && user.type == "Admin") {
			next();
		} else {
			read_doc(id, function(data) {
				if (user._id && data.organizer && data.organizer == user._id) {
					next();
				} else {
					next({ error : "You don't have permissions to modify this object." });
				}
			});
		}
	}

	return {
		configure : init,
		events : {
			create : function(req, res) {
				req.body.type = 'Event';
				if (req.user && !req.body.organizer) {
					req.body.organizer = req.user._id;
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Events', parseFilters(req, req.query['organizer']), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.eventID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				checkRights(req.params.eventID, req.user, function(err) {
					if (!err) {
						update_doc(req.params.eventID, req.body, function(body){
							res.json(200, body);
						});
					} else {
						res.json(403, err);
					}
				})
			},
			remove : function(req, res) {
				checkRights(req.params.eventID, req.user, function(err) {
					if (!err) {
						delete_doc(req.params.eventID, function(body) {
							res.json(200, body);
						});
					} else {
						res.json(403, err);
					}
				})
			},
			getEvents : function(callback) {
				read_view('Events', false, function(body) {
					callback(body);
				});
			
			}
		},

		checkpoints : {
			create : function(req, res) {
				req.body.type = 'Checkpoint';
				if (req.params.eventID) {
					req.body.event = req.params.eventID;
				}
				if (req.user && !req.body.organizer) {
					req.body.organizer = req.user._id;
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Checkpoints', parseFilters(req, req.params.eventID), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.checkpointID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				update_doc(req.params.checkpointID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.checkpointID, function(body) {
					res.json(200, body);
				});
			}
		},
		enrollments : {
			create : function(req, res) {
				req.body.type = 'Enrollment';
				if (req.params.eventID) {
					req.body.event = req.params.eventID;
				}
				if (!req.body.user && req.user) {
					req.body.user = req.user._id;
				}		
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Enrollments', parseFilters(req, req.params.eventID), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.enrollmentID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				req.body.type = 'Enrollment';
				req.body.event = req.params.eventID;
				update_doc(req.params.enrollmentID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.enrollmentID, function(body) {
					res.json(200, body);
				});
			}
		},

		checkins : {
			create : function(req, res) {
				req.body.type = 'Checkin';
				if (req.params.checkpointID) {
					req.body.checkpoint = req.params.checkpointID;
				}
				if (req.params.eventID) {
					req.body.event = req.params.eventID;
				}
				if (!req.body.user && req.user) {
					req.body.user = req.user._id;
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Checkins', parseFilters(req, req.params.checkpointID), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.checkinID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				update_doc(req.params.checkinID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.checkinID, function(body) {
					res.json(200, body);
				});
			}
		},

		submissions : {
			create : function(req, res) {
				req.body.type = 'Submission';
				if (req.params.checkpointID) {
					req.body.checkpoint = req.params.checkpointID;
				}
				if (req.params.eventID) {
					req.body.event = req.params.eventID;
				}
				if (!req.body.user && req.user) {
					req.body.user = req.user._id;
				}
				req.body.timestamp = new Date();
				req.body.grade = null;
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Submissions', parseFilters(req, req.params.checkpointID), function(body) {
					res.json(200, body);
				});
			},
			listByEvent : function(req, res) {
				read_view('SubmissionsByEvent', parseFilters(req, req.params.eventID), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.submissionID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				update_doc(req.params.submissionID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.submissionID, function(body) {
					res.json(200, body);
				});
			}
		},
		task : {
			create : function(req, res) {
				req.body.type = 'Task';
				if (req.params.checkpointID) {
					req.body.checkpoint = req.params.checkpointID;
				}
				if (req.params.eventID) {
					req.body.event = req.params.eventID;
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			show : function(req, res) {
				read_view('Tasks', parseFilters(req, req.params.checkpointID), function(body) {
					res.json(200, body[0]);
				});
			},
			edit : function(req, res) {
				update_doc(req.params.taskID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.taskID, function(body) {
					res.json(200, body);
				});
			}
		},
		users : {
			create : function(req, res) {
				req.body.type = 'User';
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Users', parseFilters(req, req.query['id']), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.userID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				update_doc(req.params.userID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.userID, function(body) {
					res.json(200, body);
				});
			},
			getEnrollments : function(req, res) {
				if (req.user && req.user._id) {
					read_view('EnrollmentsByUser', parseFilters(req, req.user._id), function(body) {
						res.json(200, body);
					});	
				} else {
					res.json(403, { 'error' : 'user not logged in' });
				}
			},
			getCheckins : function(req, res) {
				if (req.user && req.user._id) {
					read_view('CheckinsByUser', parseFilters(req, req.user._id), function(body) {
						res.json(200, body);
					});	
				} else {
					res.json(403, { 'error' : 'user not logged in' });
				}
			},
			getSubmissions : function(req, res) {
				if (req.user && req.user._id) {
					read_view('SubmissionsByUser', parseFilters(req, req.user._id), function(body) {
						res.json(200, body);
					});	
				} else {
					res.json(403, { 'error' : 'user not logged in' });
				}
			},
			getCurrentUser : function(req, res) {
				if (req.user && req.user._id) {
					read_doc(req.user._id, function(body) {
						res.json(200, body);
					});	
				} else {
					res.json(403, { 'error' : 'user not logged in' });
				}
			},
			get : function(userID, callback) {
				read_doc(userID, function(body) {
					callback(body);
				});		
			},
			facebook_login : function(user, callback) {
				read_view('Users', { 'key' : user.id }, function(body) {
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
		},

		tickets : {
			create : function(req, res) {
				req.body.type = 'Ticket';
				if (req.user && req.user._id) {
					req.body.user = req.user._id;	
				}
				if (req.params.eventID) {
					req.body.event = req.params.eventID;	
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			list : function(req, res) {
				read_view('Tickets', parseFilters(req, req.params.eventID), function(body) {
					res.json(200, body);
				});
			},
			show : function(req, res) {
				read_doc(req.params.ticketID, function(body) {
					res.json(200, body);
				});
			},
			edit : function(req, res) {
				req.body.type = 'Ticket';
				update_doc(req.params.ticketID, req.body, function(body){
					res.json(200, body);
				});
			},
			remove : function(req, res) {
				delete_doc(req.params.ticketID, function(body) {
					res.json(200, body);
				});
			},
			getTickets : function(callback) {
				read_view('Tickets', false, function(body) {
					callback(body);
				});
			},
			deleteTicket : function(ticketID, callback) {
				delete_doc(ticketID, function(body) {
					callback(body);
				});
			}
		},
		ticket : {
			create : function(req, res) {
				req.body.type = 'Ticket';
				if (req.user && req.user._id) {
					req.body.user = req.user._id;	
				}
				if (req.params.eventID) {
					req.body.event = req.params.eventID;	
				}
				insert_doc(req.body, 0, function(body){
					res.json(201, body);
				});
			},
			show : function(req, res) {
				read_view('Tickets', parseFilters(req, req.params.eventID), function(body) {
					res.json(200, body[0]);
				});
			},
			upload : function(req, res) {
				read_view('Tickets', parseFilters(req, req.params.eventID), function(tickets) {
					if (!tickets && !tickets[0].ticket) {
						res.json(500, { "error" : "failed to get a user ticket"});
					}
					var options = {
						hostname: 'devapi-fip.sp.f-secure.com',
						port: 443,
						method: "POST",
						path: '/ticket/1_0_0/upload',
						headers : {
							'x-apikey' : 'l7xx4b2071526ae34e7fb2d33ff02bb82503',
							'x-application-ticket' : tickets[0].ticket,
							'Content-Length' : 0
						}
					};
					var post_req = https.request(options, function(response) {
						response.setEncoding('utf-8');
						res.writeHead(response.statusCode);
						response.on('data', function(data) {
							res.write(data);
						});
						response.on('end', function(data) {
							res.end();
						});
					}).on('error', function(e) {
						res.json(500, { "error" : "failed to get an upload token"});
					});
					post_req.end();
				});
			}, 
			download : function(req, res) {
				read_view('Tickets', parseFilters(req, req.params.eventID), function(tickets) {
					if (!tickets && !tickets[0].ticket) {
						res.json(500, { "error" : "failed to get a user ticket"});
					}
					read_doc(req.params.checkpointID, function(checkpoint) {

						var options = {
							hostname: 'devapi-fip.sp.f-secure.com',
							port: 443,
							method: "GET",
							path: encodeURIComponent(checkpoint.task.URL),
							headers : {
								'x-apikey' : 'l7xx4b2071526ae34e7fb2d33ff02bb82503',
								'x-application-ticket' : tickets[0].ticket
							}
						};
						console.log("options");
						var post_req = https.request(options, function(response) {
							var items;
							response.setEncoding('utf-8');
							res.writeHead(response.statusCode);
							response.on('data', function(data) {
								items.write(data);
							});
							response.on('end', function(data) {
								if (items && items.Items && items.Items[0]) {
									var item = items.Items[0].URL;
									res.json(200, item);
								} else {
									res.json(500, { "error" : "failed to get a download url"});
								}			
							});
						}).on('error', function(e) {
							console.log("Error with getting a download URL from CAN:");
							console.log(e);
							res.json(500, { "error" : "failed to get a response from CAN"});
						});
						post_req.end();	
					});
					
				});
			}
		}, 
		internal : {
			getDocumentById : function(id, callback) {
				read_doc(id, callback);
			},
			getDocumentsByType : function(type, filter, callback) {
				if (filter) {
					filter = { key : filter };
				} else {
					filter = '';
				}
				read_view(type, filter, callback);
			},
			getUploadToken : function(eventID, callback) {
				read_view('Tickets', { key : eventID}, function(tickets) {
					var options = {
						hostname: 'devapi-fip.sp.f-secure.com',
						port: 443,
						method: "POST",
						path: '/ticket/1_0_0/upload',
						headers : {
							'x-apikey' : 'l7xx4b2071526ae34e7fb2d33ff02bb82503',
							'x-application-ticket' : tickets[0].ticket,
							'Content-Length' : 0
						}
					};
					var post_req = https.request(options, function(response) {
						var token;
						response.setEncoding('utf-8');
						response.on('data', function(data) {
							token += data;
						});
						response.on('end', function() {
							callback(token);
						});
					})
					post_req.end();
				});
			}
		}
	};
}


