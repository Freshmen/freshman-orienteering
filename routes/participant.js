var title = "Gamified";

exports.eventList = function(req, res) {
	req.api.internal.getDocumentsByType('Events', null, function(events) {
		req.api.internal.getDocumentsByType('EnrollmentsByUser', req.user._id, function(enrollments) {
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
	req.api.internal.getDocumentById(req.params.eventID, function(evt) {
		req.api.internal.getDocumentsByType('EnrollmentsByUser', req.user._id, function(enrollments) {
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
	req.api.internal.getDocumentsByType('Checkpoints', req.params.eventID, function(checkpoints) {
		req.api.internal.getDocumentsByType('CheckinsByUser', req.user._id, function(chekins) {
			for (var i = 0; i < checkpoints.length; i++) {
				checkpoints[i].visited = false;
				for (var j = 0; j < chekins.length; j++) {
					if (checkpoints[i]._id == chekins[j].checkpoint) {
						checkpoints[i].visited = true;
						break;
					}
				}
			}
			req.api.internal.getDocumentById(req.params.eventID, function(evt) {
				res.render('checkpointList.ejs', {
					user : req.user, 
					title : title, 
					checkpoints : checkpoints,
					evt : evt
				});
			});
		});
	});
}

exports.checkpointDetails = function(req, res) {
	var submitted = false;
	var task;
	req.api.internal.getDocumentById(req.params.eventID, function(evt) {
		req.api.ticket.upload(req, null, function(ticket) {
			req.api.internal.getDocumentById(req.params.checkpointID, function(checkpoint) {
				req.api.internal.getDocumentsByType('SubmissionsByUser', req.user._id, function(submissions) {
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
