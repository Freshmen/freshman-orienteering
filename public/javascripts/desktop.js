function displayNotifier(title_msg, body_msg) {

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

$(function(){
	var timeOut = false;
	setTimeout(function() {
		timeOut = true;
	},10000);
	var loginAttemptsCounter = 0;
	var loginAttempt = function() { 
		$.ajax({
            url: "https://devapi-fip.sp.f-secure.com:443/OneID/user/2_0_0/scim/v1/Users/current",
            headers: {"x-apikey": "l7xx4b2071526ae34e7fb2d33ff02bb82503"},
			xhrFields: { 
				withCredentials: true 
			},
            statusCode: {
                400: function() {
                    loginAttemptsCounter++;
                        if(!timeOut){
                        	loginAttempt();	
                        }               
                        if(loginAttemptsCounter == 5000 || timeOut) {
                            $("#canLoginLoader>img").fadeOut('fast');
                            $("#canLoginLoader>h5").fadeOut('fast');
							displayNotifier("Login to CAN Failed","You must have already granted permissions to the FIP CAN Facebook app. Follow the link below to get it done.")
                        }       
                },
                200: function() {
					$("#create-event").attr("href", "/desktop/create");
					$("#manage-event").attr("href", "/desktop/manage");
                    $("#canLoginLoader>img").fadeOut('fast');
                    $("#canLoginLoader>h5").text('Login to CAN was Successful');
					// Hide text after 5 seconds
					setTimeout(function() {
						$("#canLoginLoader>h5").fadeOut('fast');
					}, 5000); 
                }
            }
        });
	}
	loginAttempt();
});