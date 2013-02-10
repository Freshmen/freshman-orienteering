exports.show = function(req, res){
	res.render('mobile', { 'title' : 'Freshman Orienteering',
							'user' : req.user?req.user:{name : 'Sign in'}});
}
