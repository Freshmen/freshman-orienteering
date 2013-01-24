requirejs.config({
    baseUrl: '/dependencies/can'
});

var DEV = {
    api_key : "l7xx4b2071526ae34e7fb2d33ff02bb82503",
    api_key_secret : "d6ad0ed4ad0246d19a2a6c424cfcb65d"
};

requirejs(["jquery", "/dependencies/can/FipCanConfig.js", "Can"], function(
    $, CONFIG, Can) {

    // Create CAN SDK instance.
    var can = new Can(CONFIG, DEV.api_key, DEV.api_key_secret);
    // Get login url with redirect to our login page.
    can.getLoginUrl("http://127.0.0.1/", function(status, url) {
        if(status == 200) {
            window.location.replace(decodeURIComponent(url));
        } else {
            $("body").append("Failed to get login url: " + status);
        }
    });

});
