requirejs.config({
    baseUrl: '/dependencies/can'
});

var CONFIG, Can;

requirejs(["/dependencies/can/FipCanConfig.js", "Can"], 
    function(_CONFIG, _Can) { 
        CONFIG = _CONFIG;
        Can = _Can;
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

function createUploadToken(ctx) {
    ctx.fsio.ticket.createUploadToken(ctx.ticket, function(
        jqXHR) {
        if(jqXHR.status == 200) {
            ctx.token = JSON.parse(jqXHR.responseText).Token;
            uploadFile(ctx);
        } else {
            $("body").append("<br>Failed to create upload token: " +
                             status);
        }
    });
}

var fetchTicket = function(callback) {
    // Create CAN SDK instance.
    var can = new Can(CONFIG, CONFIG.api_key, CONFIG.api_key_secret);
    can.login(function(status) {
        // Create FSIO client.
        var fsio = can.createFsioClient();
        // Create FSIO ticket.
        can.createFsioUserTicket(fsio, function(
            status, ticket) {
            if(status == 200) {
                callback(ticket);
            } else {
                callback(status);
            }
        }, 3600);
    });
};

var saveTicket = function(eventID, callback) {
    fetchTicket(function(ticket){
        $.post("/api/v2/events/" + eventID + "/tickets",
            { "ticket" : ticket },
            function(data){
                callback(data);
            }
            ,"json"
        );  
    }, function(error) {
        console.log(error);
    });  
}
