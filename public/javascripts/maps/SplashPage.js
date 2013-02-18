(function(global) {
    var defaultLocation = {
        coords: {
            latitude: 40.0,
            longitude: 30.0
        }
    };
    if (!global.lastfm) {
        global.lastfm = {};
    }

    if (global.lastfm.SplashPage) {
        return;
    }

    global.lastfm.SplashPage = {
        cssClass: "mh5_Page lastfm_SplashPage",
        children: ["logo","spinner"],
        layout: {
            type: nokia.mh5.ui.RowLayout
        },
        logo: {
            control: nokia.mh5.ui.Control,
            cssClass: "lastfm_biglogo"
        },
        spinner: {
            control: nokia.mh5.ui.Control,
            cssClass: "lastfm_spinner mh5_spinner"
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
                    //get nearby events
                    LastFmSearchAdapter.search(null, {
                        method: "geo.getevents",
                        latitude: location.latitude,
                        longitude: location.longitude
                    }, function(e) {
                        // load the next page with nearby events
                        nokia.mh5.app.controller.switchTo("landing", {
                            method: "geo.getevents",
                            items: e.results
                        }, {
                            replaceLastHistoryEntry: true
                        });
                    }.bind(this), function(e) {
                        nokia.mh5.app.controller.switchTo("landing", {}, {replaceLastHistoryEntry: true});
                    });
                }
            }
            nokia.mh5.event.one(nokia.mh5.geolocation, "positionactivate", onPositionActivated.bind(this));
            nokia.mh5.geolocation.activate();
        }
    };
})(window);
