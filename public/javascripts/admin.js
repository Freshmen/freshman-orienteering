var Users = Backbone.Collection.extend({
	url: '/api/v2/users'
});

var User = Backbone.Model.extend({
	urlRoot: '/api/v2/users/'
});

var Events = Backbone.Collection.extend({
	url: '/api/v2/events'
});

var Event = Backbone.Model.extend({
	urlRoot: '/api/v2/events/'
});

var Router = Backbone.Router.extend({
	routes: {
		"": "home",
		"users" : "listUsers",
		"users/create": "editUser", 
		"users/:id": "showUser",
		"users/:id/edit": "editUser",
		"events": "listEvents",
		"events/create": "editEvent", 
		"events/:id": "showEvent",
		"events/:id/edit": "editEvent"
	}
});

var router = new Router();
router.on('route:home', function() {
	// render user list
	//userListView.render();
	$("#top-nav li").removeClass("active");
});

router.on('route:listUsers', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-users").addClass("active");
});

router.on('route:editUser', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-users").addClass("active");
});

router.on('route:showUser', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-users").addClass("active");
});

router.on('route:listEvents', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-events").addClass("active");
});

router.on('route:editEvent', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-events").addClass("active");
});

router.on('route:showEvent', function() {
	$("#top-nav li").removeClass("active");
	$("#top-nav-events").addClass("active");
});

Backbone.history.start();