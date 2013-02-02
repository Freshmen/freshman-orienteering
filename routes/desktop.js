
/*
 * GET desktop page.
 */

exports.show = function(req, res){
  res.render('desktop', { title: 'Desktop Page' });
};

exports.create = function(req, res){
  res.render('desktop_create', { title: 'Create Event' });
};

exports.manage = function(req, res){
  res.render('desktop_manage', { title: 'Manage Event' });
};