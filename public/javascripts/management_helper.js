var log = 1;

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
			var userEvents = events;
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
		$('#contentManage').append('<div id="event_'+currentID+'" class="eventListContainer"></div>');
		$('#event_'+currentID).append('<h3 class="eventNameTag">'+eventData[e].title+'</h3>');
		$('#event_'+currentID).append('<input type="button" id="manageEventButton" onclick=manageThisEvent('+currentID+') value="Manage" class="button">');

	}
}

function manageThisEvent(eventID){
	$('#contentManage').empty();
}