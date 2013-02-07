var app = new APP();

var updateNav = function(active) {
	$('.nav li').removeClass('active');
	if (active == 'Events') {
		$('.nav li').eq(0).addClass('active');
	}
	else if (active == 'Users') {
		$('.nav li').eq(1).addClass('active');
	}
	else if (active == 'Tickets') {
		$('.nav li').eq(2).addClass('active');
	}
} 

var displayItem = function(evt) {
	if (evt.data && evt.data.type && evt.data.type == "Event") {
		var course = evt.data;
		course.load(function(data) {
			console.log(data);
		});
	}
}

var deleteItem = function(evt) {
	console.log("deleting item:");
	console.log(item);
}

var createTableHead = function(schema, actions) {
	var $thead = $('<thead />');
		for (var i = 0; i < schema.length; i++) {
		var $th = $('<th />');
		$th.text(schema[i].label);
		$thead.append($th);
	}
	for (var i = 0; i < actions.length; i++) {
		var $th = $('<th />');
		$th.text(actions[i].label);
		$thead.append($th);
	}
	return $thead;
}

var createTableBody = function(schema, actions, array) {
	var $tbody = $('<tbody />');
	for (var i = 0; i < array.length; i++) {
		$tr = $('<tr />');
		var obj = array[i];
		for (var j = 0; j < schema.length; j++) {
			$td = $('<td />');
			$td.text(obj[schema[j].property]);
			$tr.append($td);
		}
		for (var j = 0; j < actions.length; j++) {
			var action = actions[j];
			$td = $('<td />');
			$btn = $('<input type="button" />').addClass('btn');
			if (action.type && action.type == "primary") {
				$btn.addClass("btn-primary");
			}
			if (action.type && action.type == "danger") {
				$btn.addClass("btn-danger");
			}
			if (action.type && action.type == "link") {
				$btn.addClass("btn-link");
			}
			if (action.action) {
				$btn.bind('click', obj, action.action);
			}
			$btn.attr('value', actions[j].label);
			$td.append($btn);
			$tr.append($td);
		}
		$tbody.append($tr);
	}
	return $tbody;
}

var createTable = function(schema, actions, array) {
	var $table = $('<table />');
	$table.addClass('table');
	$table.append(createTableHead(schema, actions));
	$table.append(createTableBody(schema, actions, array));
	return $table;
}

var displayEventList = function() {
	var schema = [];
	schema.push({ label : "Title", property : "title" });
	schema.push({ label : "Description", property : "description" });
	schema.push({ label : "Start Time", property : "starttime" });
	schema.push({ label : "End Time", property : "endtime" });
	var actions = [];
	actions.push({ label : "Details", action : displayItem, type : "primary" });
	var $table = createTable(schema, actions, app.courses);
	$('.page').html($table);
}

var displayCheckpointList = function() {
	var schema = [];
	schema.push({ label : "#", property : "_id" });
	schema.push({ label : "Title", property : "title" });
	schema.push({ label : "Task URL", property : "taskurl" });
	schema.push({ label : "Location", property : "location" });
	var actions = [];
	actions.push({ label : "Edit", action : displayItem, type : "primary" });
	var $table = createTable(schema, actions, app.courses);
	$('.page').html($table);
}

var displayUserList = function() {
	var schema = [];
	schema.push({ label : "Name", property : "name" });
	schema.push({ label : "Facebook ID", property : "id" });
	schema.push({ label : "Facebook username", property : "username" });
	schema.push({ label : "Type", property : "type" });
	var actions = [];
	actions.push({ label : "Details", action : displayItem, type : "primary" });
	$('.page').html(createTable(schema, actions, app.users));
}

var displayTicketList = function() {
	var schema = [];
	schema.push({ label : "Ticket", property : "ticket" });
	schema.push({ label : "Event ID", property : "event" });
	var actions = [];
	actions.push({ label : "Delete", action : deleteItem, type : "danger" });
	$('.page').html(createTable(schema, actions, app.tickets));
}

$('#top-nav-events').bind('click', function() {
	updateNav('Events');
	app.loadCourses(function () {
		displayEventList();
	});
});

$('#top-nav-users').bind('click', function() {
	updateNav('Users');	
	app.loadUsers(function () {
		displayUserList();
	});
});

$('#top-nav-tickets').bind('click', function() {
	updateNav('Tickets');	
	app.loadTickets(function () {
		displayTicketList();
	});
});