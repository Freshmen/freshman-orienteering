exports.index = function(req, res) {
	var options = {
		user : req.user
	};
	res.render('admin.ejs', options);
}
