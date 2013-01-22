exports.show = function(req, res) {
	res.render('backbone.ejs', { 'user' : req.user });
};