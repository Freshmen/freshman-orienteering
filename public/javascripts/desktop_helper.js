function createcheckpoint(){

	$('<div class="drag-container"><div class="top"><span></span></div><div class="center-content"></div><div class="bottom"><span></span></div> </div>').insertBefore('#addOption');
	$(".center-content").last().append('<form id="checkpoint"></form>');
	i++;
	$('#checkpoint').append('<img src="images/trash.jpg" class="trash" onclick=removeCheckpoint(this) style="float:right; margin:0 5px 0 0; height: auto; width: 20px;"><img src="images/save.png" class="save" onclick=saveMe(this) style="float:right; margin:0 5px 0 0; height: auto; width: 24px;"><h2>Checkpoint ' + i + '</h2>');
	$('#checkpoint').append('<input type="text" id="title" placeholder="Title" autocomplete="off" required>');
	$('#checkpoint').append('<input type="text" id="latitude" placeholder="Latitude" autocomplete="off" required>');
	$('#checkpoint').append('<input type="text" id="longitude" placeholder="Longitude" autocomplete="off" required>');
	$('#checkpoint').append('<input type="text" id="taskURL" placeholder="Task URL" autocomplete="off" required>');
	$('#checkpoint').attr("id","checkpoint_" + i);
	<!-- $('.drag-container').last().draggable({ axis: "y", containment: "parent", scroll: false , snap: "true", snapMode: "outer" }); -->
	fixIds();
}

function fixIds() {
	var j = 1;

	$("#checkpoint_holder form").each(function(){
		$(this).attr("id","checkpoint_" + j++);
	});
	j = 1;
	$("#checkpoint_holder h2").each(function(){
		$(this).text("Checkpoint " + j++);
	});
}

function removeCheckpoint(dustbin){

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
		else {
			event_details[$(this).attr("id")] = $(this).val();
		}
	});
	event_details["description"] = $('#description').val();
	event_details["ordered"] = $('#ordered').attr('checked')?true:false;
	console.log(event_details);
	$.post("/api/v1/events/",event_details,function(){});

	eventCreated = true;
			
	displayNotifier();

			
	<!-- Display add checkpoint button -->	
	//$("#addOption").trigger('click');
	//$("#addOption").show();

	<!-- Disable editing on the event details form -->
	$("#title").attr("disabled","true");
	$("#starttime").attr("disabled","true");
	$("#endtime").attr("disabled","true");
	$("#ordered").attr("disabled","true");
	$("#submit").attr("disabled","true");
	$("#description").attr("disabled","true");
	return false;
}

function displayNotifier() {
	<!-- Display info dialog -->
	var notifier = new Backbone.Notifier({
		theme: 'plastic',
		type: 'info',
		dialog: false,
		modal: true,
		ms: 20000,
		position: 'center',
		zIndex: 10000,
		screenOpacity: 0.7
	});
	notifier.notify({
		title: "Your event has been created!",
		message: "Start adding checkpoints by double-clicking on the map.",
		hideOnClick: true,
		fadeInMs: 800,
		fadeOutMs: 800
	});
}