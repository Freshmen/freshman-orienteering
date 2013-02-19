var log = 0;
var userEvents = {};
var eventName = "";

function getEventData(){
	getUserEvents();
}

function getUserEvents(){
	$.getJSON("/api/v2/me", function(user) {
		var userID = user._id;
		if (log == 1){
			console.log(userID);
		}
		$.getJSON("/api/v2/me/events", function(events) {
			userEvents = events;
			if (log == 1){
				console.log(userEvents[0].title);
			}
			populateDetailsPage(userEvents);

		});
	});

}

function populateDetailsPage(eventData){
	if (jQuery.isEmptyObject(eventData)){
			$('#content').append('<h1 class="centertext">You don\'t have any events coming up. Go create one!</h1>');
	}
	else{
		for (var e in eventData){
			var currentID = eventData[e]._id;
			$('#content').append('<div id="event_'+currentID+'" class="eventListContainer"></div>');
			$('#event_'+currentID).append('<h3 class="eventNameTag">'+eventData[e].title+'</h3>');
			$('#event_'+currentID).append('<input type="button" id="detailsButton" onclick=viewEventDetails("'+e+'") value="Details" class="button">');
			$('#event_'+currentID).append('<input type="button" id="submissionsButton" onclick=viewSubmissions("'+e+'") value="Submissions" class="button">');
		}
	}
	$('#ajaxLoader').hide();
	//$('footer').append('<a href="#">View old events...</a>');
}

function viewEventDetails(eventNumber){
	var thisEvent = userEvents[eventNumber];
	var starttime = new Date(thisEvent.starttime);
	var endtime = new Date(thisEvent.endtime);
	var editLink = '<a href="#" onclick=editProperty(this,"'+thisEvent._id+'") class="propertyEditLink">(edit)</a>';
	if (log == 1){
				console.log(thisEvent._id);
			}
	clearContent($('#content'),"&lt; Back");
	$('#content').append('<div id="eventDetailsHolder"></div>');
	$('#eventDetailsHolder').append('<h1 id="title" class="propertyHeader">'+thisEvent.title+'</h1>'+editLink);
	$('#eventDetailsHolder').append('<h3>Location</h3>');
	$('#eventDetailsHolder').append('<p>Latitude: '+thisEvent.location.latitude+'</p><p>Longitude: '+thisEvent.location.longitude+'</p>');
	$('#eventDetailsHolder').append('<h3 class="propertyHeader">Time</h3>');
	$('#eventDetailsHolder').append('<p>The event starts at '+starttime+' and ends at '+endtime+'</p>');
	$('#eventDetailsHolder').append('<h3 id="description" class="propertyHeader">Description</h3>');
	$('#eventDetailsHolder').append('<p>'+thisEvent.description+'</p>');
	if (thisEvent.ordered == 'true'){
		$('#eventDetailsHolder').append('<h5>The checkpoints of this event are ordered</h5>');
	}
	else {
		$('#eventDetailsHolder').append('<h5>The checkpoints of this event are unordered</h5>');
	}
	$('#eventDetailsHolder').append('<input type="button" id="deleteButton" onclick=askConfirmation("'+thisEvent._id+'") value="Delete this event" class="button">');
	eventName = thisEvent.title;
}

function editProperty(link, ID){
	var editee = $(link).prev();
	
	if ($(link).text() == '(edit)'){
		editee.replaceWith('<input type="text" id="'+editee.attr("id")+'" class="'+editee.attr("class")+'" value="'+editee.text()+'">');
		$(link).prev().keyup(function(event){
    		if(event.keyCode == 13){
        		$(link).click();
    		}
    	});
		$(link).text('(save)');
	}
	else {
		var obj = {};
		obj[editee.attr("id")] = editee.val();
		$.ajax({
			url:'/api/v2/events/'+ID,	
			type:'PUT',
			data: obj,
			success: function(response,data){}
		});
		editee.replaceWith('<h1 type="text" id="'+editee.attr("id")+'" class="'+editee.attr("class")+'">'+editee.val()+'</h1>');
		$(link).text('(edit)');
	}
}

function viewSubmissions(eventID){
	var thisEvent = userEvents[eventID];
	clearContent($('#content'),"&lt; Back");
	$('#content').append('<div id="submissionsHolder"></div>');
	$('#submissionsHolder').append('<h1 id="title" class="propertyHeader">'+thisEvent.title+'</h1>');
	$('#submissionsHolder').append('<input type="button" id="refreshSubmissionsButton" onclick=buildSubmissionsTable("'+eventID+'") value="Refresh" class="button"/>');
	$('#submissionsHolder').append('<div id="tableHolder"></div>');
	eventName = thisEvent.title;
	buildSubmissionsTable(eventID);
}

function buildSubmissionsTable(eventID){
	var thisEvent = userEvents[eventID];
	$('#tableHolder').empty();
	$('#tableHolder').append('<table id="submissions" class="tablesorter"><thead><tr><th>Submission</th><th>Time</th><th>Checkpoint</th><th>Submitter</th><th>Share</th></tr></thead><tbody></tbody></table>');
	getSubmissions(thisEvent._id);
	$('#submissions').trigger("update");
	$('#submissions').tablesorter({headers: {4: {sorter: false} }});
	
}

function getSubmissions(eventID){
	$.getJSON("/api/v2/events/"+eventID+"/submissions", function(submissions) {
		if (jQuery.isEmptyObject(submissions)){
			$('#tableHolder').append("<h4>No one has submitted anything yet.</h4>");
		}
		else{
			populateSubmissionsTable(submissions,eventID);
		}
		});
}

function populateSubmissionsTable(submissions,eventID){
	for (var s in submissions) {
		var filename = submissions[s].filename;
		var time = new Date(submissions[s].timestamp);
		time = moment(time).format("HH:mm:ss, D.MM.YYYY");
		$.getJSON("/api/v2/events/"+eventID+"/checkpoints/"+submissions[s].checkpoint, function(checkpoint) {
			var checkpointName = checkpoint.title;
			var submissionPath = eventName + "/" + checkpointName + "/submissions/" + filename;
			getSubmissionUrl(submissionPath , function(downloadUrl){
				var url = downloadUrl;
				$.getJSON("/api/v2/users/"+submissions[s].user, function(user){
					var userName = user.name;
					$('#submissions tbody').append('<tr><td><a href="'+url+'">View</a></td><td>'+time+'</td><td>'+checkpointName+'</td><td>'+userName+'</td><td><a id="share" href="https://www.facebook.com/sharer/sharer.php?u='+url+'" target="_blank"><i class="icon-facebook-sign icon-large"> Share on facebook</a></td></tr>');	
				});

			});
		});
	}
}

function clearContent(elementToClear,newFooter){
	elementToClear.empty();
	$('footer').empty();
	$('footer').append('<a href="manage">'+newFooter+'</a>');
}

function askConfirmation(eventID){
	var notifier = new Backbone.Notifier({
		theme: 'plastic',
		modal: true,
		position: 'center',
		zIndex: 10000,
		screenOpacity: 0.7,
		fadeInMs: 0,
		fadeOutMs: 0,
	});

	var confirmMsg = notifier.notify({
	message: "Are you sure you want to delete this event?",
	'type': "error",
	buttons: [
		{'data-role': 'ok', text: 'Yes'},
		{'data-role': 'cancel', text: 'No', 'class': 'default'}
	],
	modal: true,
	ms: null,
	destroy: false
})
.on('click:ok', function(){
	this.destroy();
	deleteEvent(eventID);
})
.on('click:cancel', 'destroy');
}

function deleteEvent(eventID){
	$.ajax({
		url:'/api/v2/events/'+eventID,
		type:'DELETE',
		success: function(response,data){
			window.location.reload();
		}
	});
	
}

