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
		$('#event_'+currentID).append('<input type="button" id="detailsButton" onclick=viewEventDetails("'+e+'") value="Details" class="button">');
		$('#event_'+currentID).append('<input type="button" id="submissionsButton" onclick=viewSubmissions("'+e+'") value="Submissions" class="button">');

	}
	$('#ajaxLoader').fadeOut("fast");
	$('footer').append('<a href="#">View old events...</a>');
}

function viewEventDetails(eventID){
	var thisEvent = userEvents[eventID];
	var starttime = new Date(thisEvent.starttime);
	var endtime = new Date(thisEvent.endtime);
	clearContent($('#content'),"&lt; Back");
	$('#content').append('<div id="eventDetailsHolder"></div>');
	$('#eventDetailsHolder').append('<h1>'+thisEvent.title+'</h2>');
	$('#eventDetailsHolder').append('<h3>Location</h3>');
	$('#eventDetailsHolder').append('Latitude: '+thisEvent.location.latitude+'<br />Longitude: '+thisEvent.location.longitude);
	$('#eventDetailsHolder').append('<h3>Time</h3>');
	$('#eventDetailsHolder').append('The event starts at '+starttime+' and ends at '+endtime);
	$('#eventDetailsHolder').append('<h3>Description</h3>');
	$('#eventDetailsHolder').append(thisEvent.description);
	if (thisEvent.ordered == 'true'){
		$('#eventDetailsHolder').append('<h5>The checkpoints of this event are ordered</h5>');
	}
	else {
		$('#eventDetailsHolder').append('<h5>The checkpoints of this event are unordered</h5>');
	}


}

function viewSubmissions(eventID){
	var thisEvent = userEvents[eventID];
	clearContent($('#content'),"&lt; Back");
	$('#content').append('<div id="submissionsHolder"></div>');
}

function clearContent(elementToClear,newFooter){
	elementToClear.empty();
	$('footer').empty();
	$('footer').append('<a href="desktop_manage">'+newFooter+'</a>');
}


