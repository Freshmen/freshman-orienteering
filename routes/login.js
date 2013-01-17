exports.show = function(req, res){
	if(req && req.session && req.session.passport && !req.session.passport.user){
		res.render('login', { 'title' : 'Welcome'});
	} else {
		res.render('is_you', { 'title' : 'Welcome pass','content': req.session.passport.user});
	}
	
}
