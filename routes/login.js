exports.show = function(req, res){
	//res.render('mobile', { 'selection' : events[req.query.selection] || data['Index']})
	//console.log(res.user);
	if(!req.session.passport.user){
		res.render('login', { 'title' : 'Welcome'});
	}else{
		console.log();
		res.render('is_you', { 'title' : 'Welcome pass','content':res.user});
	}
	
}
