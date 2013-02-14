var title = "Gamified";

exports.eventList = function(req, res) {
	req.api.events.list(req, null, function(err, events) {
		req.api.users.getEnrollments(req, null, function(err, enrollments) {
			var enrolled = [];
			var unenrolled = [];
			for (var i = 0; i < events.length; i++) {
				var found = false;
				for (var j = 0; j < enrollments.length; j++) {
					if (events[i]._id == enrollments[j].event) {
						enrolled.push(events[i]);
						found = true;
						break;
					}
				}
				if (!found) {
					unenrolled.push(events[i]);
				}
			}
			res.render('eventList.ejs', { 
				user: req.user, 
				title: title, 
				unenrolled : unenrolled, 
				enrolled : enrolled
			});
		});
	});
}

exports.eventDetails = function(req, res) {
	var enrolled = false;
	req.api.events.show(req, null, function(err, evt) {
		req.api.users.getEnrollments(req, null, function(err, enrollments) {
			for (var i = 0; i < enrollments.length; i++) {
				if (enrollments[i].event == req.params.eventID) {
					enrolled = true;
					break;
				}
			}
			res.render('eventDetails.ejs', { 
				evt : evt,
				enrolled : enrolled, 
				user: req.user 
			});
		});
	});
}

exports.checkpointList = function(req, res) {
	req.api.checkpoints.list(req, null, function(err, checkpoints) {
		req.api.users.getCheckins(req, null, function(err, chekins) {
			var visited = [];
			var unvisited = [];
			for (var i = 0; i < checkpoints.length; i++) {
				var found = false;
				for (var j = 0; j < chekins.length; j++) {
					if (checkpoints[i]._id == chekins[j].checkpoint) {
						visited.push(checkpoints[i]);
						found = true;
						break;
					}
				}
				if (!found) {
					unvisited.push(checkpoints[i]);
				}
			}
			req.api.events.show(req, null, function(err, evt) {
				res.render('checkpointList.ejs', {
					user : req.user, 
					title : title, 
					visited : visited,
					unvisited : unvisited,
					evt : evt
				});
			});
		});
	});
}

exports.checkpointDetails = function(req, res) {
	var submitted = false;
	var task;
	req.api.events.show(req, null, function(err, evt) {
		req.api.ticket.upload(req, null, function(err, ticket) {
			req.api.checkpoints.show(req, null, function(err, checkpoint) {
				req.api.users.getSubmissions(req, null, function(err, submissions) {
					for (var i = 0; i < submissions.length; i++) {
						if (submissions[i].checkpoint == req.params.checkpointID) {
							submitted = true;
							break;
						}
					}
					if (checkpoint.task) {
						task = checkpoint.task;
					} else if (checkpoint.taskURL && checkpoint.taskDescription) {
						task = {};
						task.taskURL = checkpoint.taskURL;
						task.description = checkpoint.taskDescription
					} else {
						req.api.task.show(req, null, function(err, task) {
							res.render('checkpointDetails.ejs', {
								checkpoint: checkpoint,
								task: task,
								evt : evt,
								submitted : submitted,
								ticket : ticket,
								user: req.user 
							});
						});
					}
					res.render('checkpointDetails.ejs', {
						checkpoint: checkpoint,
						task: task,
						evt : evt,
						submitted : submitted,
						ticket : ticket, 
						user: req.user 
					});
				});
			});
		});
	});
}
