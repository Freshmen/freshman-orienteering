
/*
 * GET event-management desktop page.
 */

exports.show = function(req, res){
  res.render('desktop_manage', { title: 'Manage Event' });
};