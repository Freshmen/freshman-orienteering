(function(global) {
    var defaultLocation = {
        coords: {
            latitude: 40.0,
            longitude: 30.0
        }
    };
    if (!global.gamify) {
        global.gamify = {};
    }

    if (global.gamify.SplashPage) {
        return;
    }

    global.gamify.SplashPage = {
        cssClass: "mh5_Page gamify_SplashPage",
        children: ["logo","spinner"],
        layout: {
            type: nokia.mh5.ui.RowLayout
        },
        logo: {
            control: nokia.mh5.ui.Control,
            cssClass: "gamify_biglogo"
        },
        spinner: {
            control: nokia.mh5.ui.Control,
            cssClass: "gamify_spinner mh5_spinner"
        },
        build: function() {
            this.constructor.prototype.build.call(this);
            this._timeoutId = setTimeout(function() {
                onPositionActivated.call(this, {data: defaultLocation});
            }.bind(this), 2000);

            function onPositionActivated(result) {
                if (this._timeoutId) {
                    // cancel the fallback switch
                    clearTimeout(this._timeoutId);
                    delete this._timeoutId;
                    //switch to the landing page but only if the fallback switch hasn't happened
                    var location = ((result && result.data) || defaultLocation).coords;
                    //add checkpoints;
                    nokia.mh5.app.controller.switchTo("landing", 
                    	{ 
	                    	method: "geo.getcheckpoints", 
	                    	checkpoints : global.gamify.checkpoints,
	                    	location : location 
	                    },
                		{replaceLastHistoryEntry: true}
                	);
                }
            }
            nokia.mh5.event.one(nokia.mh5.geolocation, "positionactivate", onPositionActivated.bind(this));
            nokia.mh5.geolocation.activate();
        }
    };
})(window);
