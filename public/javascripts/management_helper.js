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
		$("#content").append('<div id="event_'+currentID+'" class="eventListContainer"></div>');
		$("#event_"+currentID).append(eventData[e].title);
	}
}