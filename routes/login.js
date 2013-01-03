exports.show = function(req, res){
	//res.render('mobile', { 'selection' : events[req.query.selection] || data['Index']})
	res.render('login', { 'title' : 'Welcome'});
}
