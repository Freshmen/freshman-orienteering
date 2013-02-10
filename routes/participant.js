exports.index = function(req, res) {
	var title = "Gamified";
	res.render("participant.ejs", { "title" : title, "user" : req.user });
}
