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
		alert("You haven't yet given permissions for the CAN app. Login to Facebook and accept CAN as an app. Instructions will be updatd soon.");
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

function uploadFile(ctx) {
    var object_name = randomString() + "_" + new Date().getTime();
    var data15 = "Hello Me!";
    ctx.fsio.data.upload(ctx.token, object_name, data15, function(
        jqXHR) {
        $("body").append("<br><br>Uploaded '" + object_name + "': "+
                         jqXHR.status);
        if(jqXHR.status == 204)
            waitUntilScanned(ctx, object_name);
        console.log(jqXHR);
    });
}

function createUploadToken() {
    	
    ctx.fsio.ticket.createUploadToken(ctx.ticket, function(
        jqXHR) {
        if(jqXHR.status == 200) {
	    console.log(jqXHR.responseText);	
            ctx.token = JSON.parse(jqXHR.responseText).Token;
            //uploadFile(ctx);
        } else {
            $("body").append("<br>Failed to create upload token: " +
                             status);
        }
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
		eventDesc = data.description;
	        // Create a folder with that name	
	        fsio.content.createFolder(ticket, "FORI/"+eventName,
                    function(jqXHR){
		        console.log("foler created for event "+ eventID +" "+ jqXHR );
		        console.log(jqXHR);
			// Set up description and metadata for the folder
			var metadata = { "eventID" : eventID };
			fsio.content.setFileMetadata(ticket, "FORI/"+eventName, eventDesc, metadata, 
			    function(jqXHR){
				console.log(jqXHR);
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
