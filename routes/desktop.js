
/*
 * GET desktop page.
 */

exports.show = function(req, res){
  res.render('desktop', { title: 'Desktop Page' });
};