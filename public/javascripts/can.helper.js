requirejs.config({
    baseUrl: '/dependencies/can'
});

var DEV = {
    api_key : "l7xx4b2071526ae34e7fb2d33ff02bb82503",
    api_key_secret : "d6ad0ed4ad0246d19a2a6c424cfcb65d"
};

requirejs(["jquery", "/dependencies/can/FipCanConfig.js", "Can", "Fsio"], function(
    $, CONFIG, Can, Fsio) {

    function randomString(len) {
        len = len ? len : 20;
        var s = "";
        var chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i=0; i < len; i++)
            s += chars.charAt(Math.floor(Math.random() * chars.length));
        return s;
    }

    function getFsioUserAccountInfo(ctx) {
        ctx.fsio.content.getUserAccountInfo(ctx.ticket, function(jqXHR) {
            $("body").append("<br><br>" + jqXHR.responseText);
        });
    }

    function deleteFile(ctx, object) {
        ctx.fsio.content.deleteFile(ctx.ticket, object, function(jqXHR) {
            $("body").append("<br><br>Deleted '" + object + "': " +
                             jqXHR.status);
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

    $(function() {
        // Create CAN SDK instance.
        var can = new Can(CONFIG, DEV.api_key, DEV.api_key_secret);
        console.debug("Trying to login...");
        can.login(function(status) {
            console.log("User logged in: " + status);
            console.log("UUID: " + can.getUserUuid());
            // Create FSIO client.
            var fsio = can.createFsioClient();
            // Create FSIO ticket.
            can.createFsioUserTicket(fsio, function(
                status, ticket) {
                if(status == 200) {
                    var ctx = {
                        fsio: fsio,
                        ticket: ticket
                    };
                    // Get user account info.
                    // getFsioUserAccountInfo(ctx);
                    // Create upload token.
                    createUploadToken(ctx);
                } else {
                    console.log("Failed to create FSIO ticket: " +
                                     status);
                }
            });
        });
    });

});
