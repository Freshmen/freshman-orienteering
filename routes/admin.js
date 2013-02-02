var userSchema = [
	{ title : '#'},
	{ title : 'Name'},
	{ title : 'Profile'},
	{ title : 'Type' }
];

var eventSchema = [
	{ title : '#'},
	{ title : 'Title'},
	{ title : 'Location' },
	{ title : 'Start time' },
	{ title : 'End time' },
	{ title : 'Checkpoints' },
	{ title : 'Enrollments' }
];


var ticketSchema = [
	{ title : '#'},
	{ title : 'Ticket'},
	{ title : 'Owner' }
];

exports.users = {
	list : function(req, res) {
		var options = {
			user : req.user,
			title : 'Users',
			topnav : 'users',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Users', link : '/admin/users', active : true}
			],
			schema : userSchema
		};
		res.render('admin/list.ejs', options);
	},
	edit : function(req, res) {
		var options = {
			user : req.user,
			title : 'Edit user',
			topnav : 'users',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Users', link : '/admin/users', active : true}
			],
			schema : userSchema
		};
		res.render('admin/edit.ejs', options);
	}
}

exports.events = {
	list : function(req, res) {
		var options = {
			user : req.user,
			title : 'Events',
			topnav : 'events',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Events', link : '/admin/events', active : true}
			],
			schema : eventSchema
		};
		res.render('admin/list.ejs', options);
	},
	edit : function(req, res) {
		var options = {
			user : req.user,
			title : 'Edit event',
			topnav : 'events',	
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Events', link : '/admin/events', active : true}
			],
			schema : eventSchema,
		};
		res.render('admin/edit.ejs', options);
	}
}

exports.tickets = {
	list : function(req, res) {
		var options = {
			user : req.user,
			title : 'Tickets',
			topnav : 'tickets',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Tickets', link : '/admin/tickets', active : true}
			],
			schema : ticketSchema
		};
		res.render('admin/list.ejs', options);
	},
	edit : function(req, res) {
		var options = {
			user : req.user,
			title : 'Edit ticket',
			topnav : 'tickets',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/'}, 
				{ text : 'Tickets', link : '/admin/tickets', active : true}
			],
			schema : ticketSchema
		};
		res.render('admin/edit.ejs', options);
	}
}

exports.index = function(req, res) {
	var options = {
		user : req.user,
		topnav : 'home',
			breadcrumbs : [
				{ text : 'Home', link : '/admin/', active : true}
			]
	};
	res.render('admin/index.ejs', options);
}


