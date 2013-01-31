var log = 1;
var userEvents = {};

function getEventData(){
	getUserEvents();
}



function getUserEvents(){
	$.getJSON("/api/v2/me", function(user) {
		 var userID = user._id;
		if (log == 1){
			console.log(userID);
		}
		$.getJSON("/api/v2/events?organizer="+userID, function(events) {
			userEvents = events;
			if (log == 1){
				console.log(userEvents[0].title);
			}
			populatePage(userEvents);

		});
	});

}

function populatePage(eventData){
	for (var e in eventData){
		var currentID = eventData[e]._id;
		$('#content').append('<div id="event_'+currentID+'" class="eventListContainer"></div>');
		$('#event_'+currentID).append('<h3 class="eventNameTag">'+eventData[e].title+'</h3>');
		$('#event_'+currentID).append('<input type="button" id="manageEventButton" onclick=manageThisEvent("'+e+'") value="Manage" class="button">');

	}
	$('#ajaxLoader').fadeOut("fast");
	$('footer').append('<a href="#">View old events...</a>');
}

function manageThisEvent(eventID){
	var thisEvent = userEvents[eventID];
	$('#content').empty();
	$('footer').empty();
	$('footer').append('<a href="desktop_manage">&lt; Back</a>');
	$('#content').append('<div id="eventManagementHolder"></div>');
	$('#eventManagementHolder').append('<p>Title: '+thisEvent.title+'</p>');
	$('#eventManagementHolder').append('<p>Latitude: '+thisEvent.location.latitude+'</p>');
	$('#eventManagementHolder').append('<p>Longitude: '+thisEvent.location.longitude+'</p>');
	$('#eventManagementHolder').append('<p>Description: '+thisEvent.description+'</p>');
	$('#eventManagementHolder').append('<p>Ordered: '+thisEvent.ordered+'</p>');

}