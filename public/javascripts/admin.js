var removeHash = function(hashValue) {
	// Remove the ugly Facebook appended hash
	if (window.location.hash && window.location.hash === hashValue) {
		if (window.history && history.pushState) {
			window.history.pushState("", document.title, window.location.pathname);
		} else {
			// Prevent scrolling by storing the page's current scroll offset
			var scroll = {
				top: document.body.scrollTop,
				left: document.body.scrollLeft
			};
			window.location.hash = "";
			// Restore the scroll offset, should be flicker free
			document.body.scrollTop = scroll.top;
			document.body.scrollLeft = scroll.left;
		}
	}
}("#_=_");

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