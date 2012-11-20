
/*
 * GET event-creation desktop page.
 */

exports.show = function(req, res){
  res.render('desktop_create', { title: 'Create Event' });
};