requirejs.config({
    baseUrl: '/dependencies/can'
});

var fiso, ticket; // the ticket to be later moved to the user rather than event

requirejs(["/dependencies/can/FipCanConfig.js", "Can"], 
    function(CONFIG, Can) {
	// function to check if the user has logged in to CAN.
	// To be performed as soon as page loaded
 	// Create CAN SDK instance.
        can = new Can(CONFIG, CONFIG.api_key, CONFIG.api_key_secret);

    	can.login(function(status) {
	    if(status == 400){
		// @Vidhuran - 31st Jan 2013 
		// Commenting out for now , to be later uncommented.
		//   window.location.replace(decodeURIComponent("http://127.0.0.1/loginToFacebook.html"));
		alert("CAN Login Error, So you CAN't create an event");
	    }		
            // Create FSIO client.
       	    fsio = can.createFsioClient();
            // Create FSIO ticket.
            can.createFsioUserTicket(fsio, function(
                status, _ticket) {
                if(status == 200) { 
                    ticket = _ticket;
                } else {
                    callback(status);
                }
            }, 3600);
    	});
    }
);

function getFsioUserAccountInfo(ctx) {
    ctx.fsio.content.getUserAccountInfo(ctx.ticket, function(jqXHR) {
        console.log(jqXHR.responseText);
    });
}

function deleteFile(ctx, object) {
    ctx.fsio.content.deleteFile(ctx.ticket, object, function(jqXHR) {
        console.log(jqXHR.status);
    });
}



function downloadFile(ctx, object) {
    ctx.fsio.data.download(ctx.ticket, object, function(jqXHR) {
        $("body").append("<br><br>Downloaded '" + object + "': " +
                         jqXHR.status);
        $("body").append("<br><br>" + jqXHR.responseText);
        deleteFile(ctx, object);
    });
}

function waitUntilScanned(ctx, object) {
    ctx.fsio.waitForWorkers(ctx.ticket, object,
                            ["AV","FileTypeWorkerStatus","MetadataWorkerStatus"],
                            10, function(status) {
                                if(status == "success")
                                    downloadFile(ctx, object);
                            });
}

function uploadFile(token, path, taskFile) {
    var object_name = path + "/Task";
    fsio.data.partialUploadInit(token, object_name, function(jqXHR,textStatus) {
        var uploadId = jqXHR.getResponseHeader("upload-id");
            
        // Setup ajax calls when uploading data
        var defaultContentType = $.ajaxSettings.contentType;
        var defaultProcessData = $.ajaxSettings.processData;
        $.ajaxSetup({
            contentType : false,
            processData : false
        });
        Blob.prototype.substring = Blob.prototype.slice;
        taskFile.length = taskFile.size;
        fsio.data.uploadPartially(token, uploadId, taskFile, 5000000, function(jqXHR) {
            // alert("Uploaded " + fileName + " with status " + jqXHR.status + " and response text " + jqXHR.responseText);
            $.ajaxSetup({
                contentType : defaultContentType,
                processData : defaultProcessData
            });
        });
    });
}

// Right now eventId will be null , after some future changes setupEventFolder will ve called directly 
// from desktop_helper.js , that can provide us the event name
var setupEventFolder = function(eventID,eventName) {
    if (!!eventID) {
	    // Get ticket for this event
	    var ticket, eventName;
	    // In future tickets might be tied to the user account
	    $.get("api/v2/events/"+eventID+"/tickets", function(data) {
	        ticket = data[0].ticket;
	        // get eventname , in future this will be directly available as an input parameter.
	        $.get("api/v2/events/"+eventID, function(data){
		        eventName = data.title;
		        var eventDesc = data.description;
	            // Create a folder with that name	
	            fsio.content.createFolder(ticket, "devices/Web/FORI/"+eventName,
                    function(jqXHR){
			            // Set up description and metadata for the folder
			            var metadata = { "eventID" : eventID };
			            fsio.content.setFileMetadata(ticket, "devices/Web/FORI/"+eventName, eventDesc, metadata, 
			                 function(jqXHR){
				               // Nothing to be done here
			                 }
			            );
		            }
	            );
	        });		
	    });	
    }
    else {
	    console.log("eventID is not null, can't create folder");
    }		
}  

var uploadTask = function (ticket,path, taskFile) {
    fsio.ticket.createUploadToken(ticket, function(data) {
    	if(data.status == 200) {
	    var token = JSON.parse(data.responseText).Token;
	    console.log(token);
	    uploadFile(token, path, taskFile);
	} else {
	    console.log("Error while uploading task to "+ path);	
	}
    });	
}

var setupCheckpointFolder = function(eventID, chkptID, taskFile) {
    if(!!eventID || !!chkptID) {
        $.get("api/v2/events/" + eventID + "/checkpoints/" +chkptID, function(data){
            var chkptName = data.title;
            var chkptTask = data.task.description;
            $.get("api/v2/events/"+eventID, function(data){
                var eventName = data.title;
	        $.get("api/v2/events/"+eventID+"/tickets", function(data) {
	            var ticket = data[0].ticket;
                    // Create a folder with that name
                    fsio.content.createFolder(ticket, "devices/Web/FORI/"+eventName+"/"+chkptName, function(jqXHR){
		        // Set up description and metadata for the folder
		        var metadata = { "chkptID" : chkptID };
		        fsio.content.setFileMetadata(ticket, "devices/Web/FORI/"+eventName+"/"+chkptName, "No Desc", metadata, function(jqXHR){
			    var path = "devices/Web/FORI/"+eventName+"/"+chkptName;
			    uploadTask(ticket,path,taskFile);		
			});
		    });
    	        });
	    });
	});    
    } else {
        console.log("The arguments cannot be null, provide me with the eventID and chkptID");
    }		
    
}
var fetchTicket = function(callback) {
	callback(ticket);
};

var saveTicket = function(eventID, callback) {
    fetchTicket(function(ticket){
        $.post("/api/v2/events/" + eventID + "/tickets",
            { "ticket" : ticket },
            function(data){
		setupEventFolder(eventID,null);
                callback(data);
            }
            ,"json"
        );  
    }, function(error) {
        console.log(error);
    });
}
