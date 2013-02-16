/*
 * GET desktop page.
 */

exports.show = function(req, res) {
  res.render('desktop', { title: 'Gamified : Desktop Page', user : req.user });
};

exports.create = function(req, res) {
  res.render('desktop_create', { title: 'Gamified : Create Event', user: req.user });
};

exports.manage = function(req, res) {
	res.render('desktop_manage', { title: 'Gamified : Manage Event', user: req.user });
};

exports.details = function(req, res) {
	res.render();
}

exports.grade = function(req, res) {}