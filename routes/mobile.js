///////////////////
// This is just mockup content
var content = {};

var fs = require('fs');
fs.readFile('./temp/testData.json', 'utf8', function(err, data){
	if(err){
		return console.log(err);
	}
	content = JSON.parse(data);
	console.log(content.events[0]);
})
//////////////////

exports.show = function(req, res){

	//res.render('mobile', { 'selection' : events[req.query.selection] || data['Index']})
	res.render('mobile', { 'title' : 'Freshman Orienteering',
							'signinStatus' : 'Sign In',
							'content' : content.events});
}

