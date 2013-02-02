var checkpoint_hash = {};
var hashkey = 0;
var eventCoord;
var i = 0;
var eventDBID;

function createCheckpoint(marker){
	$('<div class="drag-container"><div class="top"><span></span></div><div class="center-content"></div><div class="bottom"><span></span></div> </div>').insertBefore('#addOption');
	$(".center-content").last().append('<form id="checkpoint"></form>');
	i++;
	hashkey++;
	$('#checkpoint').append('<img src="images/trash.jpg" class="trash" onclick=removeCheckpoint(this) style="float:right; margin:0 5px 0 0; height: auto; width: 20px;"><label id="hidden">' + hashkey + '</label><h3>Checkpoint ' + i + '</h3>');
	$('#checkpoint').append('<input type="text" id="title" placeholder="Title" autocomplete="off" class="CHPformfield" required>');
	$('#checkpoint').append('<label class="CHPformfield">Latitude:</label>');
	$('#checkpoint').append('<input type="text" id="latitude" placeholder="Latitude" autocomplete="off" class="CHPformfield" required disabled>');
	$('#checkpoint').append('<label class="CHPformfield">Longitude:</label>');
	$('#checkpoint').append('<input type="text" id="longitude" placeholder="Longitude" autocomplete="off" class="CHPformfield" required disabled>');
	$('#checkpoint').append('<input type="button" id="addTask" onclick=taskDialog(this) value="Add a task" class="button"><label id="hidden">' + hashkey + '</label>');
	
	$('#checkpoint').append('<div id="dialog" title="Task" ></div>');
	$('#dialog').append('<textarea id="taskDescription" rows="15" placeholder="Enter a task for the participants" class="wide"></textarea>');
	$('#dialog').append('<input type="text" id="taskURL" placeholder="Task media URL" class="wide">');
	$('#dialog').append('<select id="submissionType" class="wide"><option value="" disabled="disabled" selected>Select submission file type</option><option value="video/*">Video</option><option value = "image/*">Image</option><option value = "audio/*">Audio</option><option value = "*">Any</option></select>');

	$('#checkpoint').attr("id","checkpoint_" + i);

	<!-- FIX: Just #title in the following line will set the id of the Event title -->
	<!-- Alternative would be to change the id of the event title while disabling it if that doesn't cause any harm -->
 
	$('#checkpoint_' + i +'>#title').attr("id","title_" + hashkey);
	$('#dialog').attr("id","dialog_" + hashkey);
	$('#latitude').attr("id","latitude_" + hashkey);
	$('#longitude').attr("id","longitude_" + hashkey);
	$('#task').attr("id","task_" + hashkey);
	$('#taskDescription').attr("id","taskDescription_" + hashkey);
	$('#taskURL').attr("id","taskURL_" + hashkey);
	$('#submissionType').attr("id","submissionType_" + hashkey);
	$('#latitude_' + hashkey).val(marker.coordinate.latitude);
	$('#longitude_' + hashkey).val(marker.coordinate.longitude);

	$("#dialog_" + hashkey).dialog({
		autoOpen: false,
		draggable: false,
		show: 'fade',
		hide: 'fade',
		resizable: false,
		modal: true,
		width: 500
	});

	<!-- $('.drag-container').last().draggable({ axis: "y", containment: "parent", scroll: false , snap: "true", snapMode: "outer" }); -->
	checkpoint_hash[hashkey] = marker;
	fixIds();
}

function fixIds() {
	var j = 1;
	$("#checkpoint_holder form").each(function(){
		$(this).attr("id","checkpoint_" + j++);
	});
	j = 1;
	$("#checkpoint_holder h3").each(function(){
		checkpoint_hash[$(this).prev().text()].set("text",""+j);
		$(this).text("Checkpoint " + j++);
	});
}

function removeCheckpoint(dustbin){

	var temp = $(dustbin).next().text();
	map.objects.remove(checkpoint_hash[temp]);
	$(dustbin).parent().parent().parent().fadeTo("normal", 0.01, function(){ //fade
    	$(this).slideUp("normal", function() { //slide up
       		$(this).remove(); //then remove from the DOM
     		fixIds();
       	});
    });
}

function saveEvent(){
	var event_details = {};
	$("#event_form").children().filter(":text").each(function() {
		if ($(this).attr("id") == 'starttime' || $(this).attr("id") == 'endtime'){
			var date = new Date($(this).val());
			event_details[$(this).attr("id")] = date.toJSON();
		}
		else if ($(this).attr("id") == 'location') {
			var location = {};
			location["latitude"] = eventCoord.latitude;
			location["longitude"] = eventCoord.longitude;
			event_details["location"] = location;
			//event_details["location"]["longitude"] = lon;
		}
		else {
			event_details[$(this).attr("id")] = $(this).val();
		}
	});
	event_details["description"] = $('#description').val();
	event_details["ordered"] = $('#ordered').attr('checked')?true:false;
	$.post("/api/v2/events/",event_details,function(data){
		jQuery.parseJSON(data);
		eventDBID = data.id;
		saveTicket(eventDBID, function(data){ console.log(data) });
	},"json");

	eventCreated = true;
			
	displayNotifier("Your event has been created!","Start adding checkpoints by double-clicking on the map. Checkpoints can be rearranged by dragging them around.");

	<!-- Display add checkpoint button -->	
	//$("#addOption").trigger('click');
	//$("#addOption").show();

	<!-- Disable editing on the event details form -->
	$("#title").attr("disabled","true");
	$("#starttime").attr("disabled","true");
	$("#endtime").attr("disabled","true");
	$("#ordered").attr("disabled","true");
	$("#submitEvent").attr("disabled","true");
	$("#description").attr("disabled","true");
	$("#submitEvent").attr('style', 'background-color:silver');

	<!-- Add save event button -->
	document.getElementById('submitCheckpoints').style.visibility = 'visible';
	//$("#event_form").append('<input type="submit" id="saveEvent" value="Save Event" class="button" style="float:right">')
	

	return false;
}

function saveCheckpoints() {
	$("form").each(function() {
		if (/checkpoint_./.test($(this).attr("id"))){
			//console.log($(this).attr("id"));
			checkpointJSON = parseCheckpoint($(this).attr("id"));
			$.post("/api/v2/events/" + eventDBID + "/checkpoints",checkpointJSON,function(data){
			    // Setup the checkpoint folder and upload the task file into it.
			    chkptDBID = data.id	 
			    setupCheckpointFolder(eventDBID, chkptDBID);
			});
		}
	});
}

function parseCheckpoint(checkpointFormID) {
	var checkpoint_details = {};
	var location = {};
	var task = {};
	var order;
	//	var key = $("#" + checkpointFormID).children("#hidden").first().text();
	// Just to make things more complex ;-)
	var key = $("#" + checkpointFormID + ">#hidden:first").text();
	if ($('#ordered').attr('checked')?true:false) {
		order = checkpointFormID.replace("checkpoint_","");
	}
	else {
		order = '0';
	}
	$("#" + checkpointFormID).children().each(function() {
		console.log($(this));
		if (/title_./.test($(this).attr("id"))){
			checkpoint_details['title'] = $(this).val();
		}
		else if (/latitude_./.test($(this).attr("id"))){
			location["latitude"] = $(this).val();
		}
		else if (/longitude_./.test($(this).attr("id"))){
			location["longitude"] = $(this).val();
		}
	});
	task["description"] = $("#dialog_" + key).children("textarea").val();
	task["URL"] = $("#dialog_" + key).children("input").val();
	task["accepts"] = $("#dialog_" + key).children("select").val();
	checkpoint_details['order'] = order;
	checkpoint_details['location'] = location;
	checkpoint_details['task'] = task;
	return checkpoint_details;
}


function displayNotifier(title_msg, body_msg) {
	<!-- Display info dialog -->
	var notifier = new Backbone.Notifier({
		theme: 'plastic',
		type: 'info',
		dialog: false,
		modal: true,
		position: 'center',
		zIndex: 10000,
		screenOpacity: 0.7,
	});
	notifier.notify({
		title: title_msg,
		message: body_msg,
		hideOnClick: true,
		fadeInMs: 800,
		fadeOutMs: 800,
		ms: 10000,
	});
}

function taskDialog(taskButton){
	temp = $(taskButton).next().text()
	taskButton.value = "Edit Task";
	$("#dialog_" + temp).dialog("open");
}
