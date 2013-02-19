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
                    //add checkpoints and route here;
                    var checkpoints = global.gamify.checkpoints;
                    var waypoints = [];
                    for (var i = 0; i < checkpoints.length; i++) {
                        var location = {};
                        location.latitude = parseFloat(checkpoints[i].location.latitude);
                        location.longitude = parseFloat(checkpoints[i].location.longitude);
                        waypoints.push(location);
                    }
                    nokia.mh5.adapters.Route.fetch(waypoints,
                        {mode: "walk"}, function(result) {
                            global.gamify.route = result;
                            nokia.mh5.app.controller.switchTo("landing", { method: "geo.getcheckpoints", checkpoints : checkpoints }, {replaceLastHistoryEntry: true});
                        }, function(error) {
                            nokia.mh5.app.controller.switchTo("landing", { method: "geo.getcheckpoints", checkpoints : checkpoints }, {replaceLastHistoryEntry: true});
                        }
                    );
                }
            }
            nokia.mh5.event.one(nokia.mh5.geolocation, "positionactivate", onPositionActivated.bind(this));
            nokia.mh5.geolocation.activate();
        }
    };
})(window);
