exports.show = function(req, res){
	var greeting = "Welcome";
	if(req.user && req.user.name){
		greeting = "Welcome, " + req.user.name;
	}
	res.render('login', { 'greeting' : greeting, 'authenticated' : req.user?true:false });	
}
