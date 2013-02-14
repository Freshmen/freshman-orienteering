var title = "Gamified";

exports.eventList = function(req, res) {
	res.render('eventList.ejs', { 
		user: req.user, 
		title: title, 
		events : [], 
		enrollments : []
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
