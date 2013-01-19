///////////////////
// This is just mockup content
var content = {};

var fs = require('fs');
fs.readFile('./temp/eventExample.json', 'utf8', function(err, data){
	if(err){
		return console.log(err);
	}
	content = JSON.parse(data);
})
//////////////////

exports.show = function(req, res){
	res.render('mobile', { 'title' : 'Freshman Orienteering',
							'user' : req.user?req.user:{name : 'Sign in'}});
}

/*
*/



