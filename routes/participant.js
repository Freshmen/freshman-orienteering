var title = "Gamified";

exports.eventList = function(req, res) {
	req.api.events.list(req, null, function(err, events) {
		req.api.users.getEnrollments(req, null, function(err, enrollments) {
			var enrolledEvents = [];
			for (var i = 0; i < events.length; i++) {
				for (var j = 0; j < enrollments.length; j++) {
					if (events[i]._id == enrollments[j].event) {
						enrolledEvents.push(events[i]);
					}
				}
			}
			res.render('eventList.ejs', { 
				user: req.user, 
				title: title, 
				events : events, 
				enrolledEvents : enrolledEvents
			});
		});
	});
}

exports.eventDetails = function(req, res) {
	res.render('eventDetails.ejs');
}

exports.checkpointList = function(req, res) {
	res.render('checkpointList.ejs');
}

exports.checkpointDetails = function(req, res) {
	res.render('checkpointDetails.ejs');
}
