(function(global) {
    if (!global.gamify) {
        global.gamify = {};
    }
    if (global.gamify.LandingPage) {
        return;
    }

    var RowLayout = nokia.mh5.ui.RowLayout,
        ColumnLayout = nokia.mh5.ui.ColumnLayout,
        Control = nokia.mh5.ui.Control,
        Map = nokia.mh5.components.Map,
        Container = nokia.mh5.ui.Container


    global.gamify.LandingPage = {
        cssClass: "gamify_LandingPage mh5_Page",
        layout: {
            type: RowLayout
        },
        children: ["header", "notification", "map", "footer"],
        header: {
            control: Control,
            cssClass: "gamify_header"
        },
        footer: {
            control: Control,
            cssClass: "gamify_footer"
        },
        notification: {
           control: nokia.mh5.ui.Notification,
           visible: false
        },
        map: {
            control: Map,
            cssClass: "mh5_Map mh5_box-flex1",
            addressLookup: false,
            suggestions: false,
            settingsButton : null,
            infoBubble: {
                content: ["title", "description"],
                listeners: {
                    click: function() {
                        global.location = global.location.pathname + this.poi.data._id;
                    }
                }
            },

            listeners: {
                poiclick: function(e) {
                    var poi = e.data[0],
                        checkpoint = poi.data;
                    if (!poi.infoBubble) {
                        this.hideInfoBubble();
                        this.showInfoBubble(poi, {
                            content: ["title", "description"],
                            title: checkpoint.title,
                            description: checkpoint.description
                        });
                    }
                    e.preventDefault();
                }
            }
        },
        model: {
            method: "geo.getcheckpoints",
            location: null,
            checkpoints: []
        },

        build: function() {
            this.constructor.prototype.build.call(this);
            Control.watch(this.model, "checkpoints", this, function (checkpoints) {
                if (!checkpoints) {
                    checkpoints = [];
                }

                nokia.mh5.app.controller.updateHistoryEntry();

                if (checkpoints.length > 0) {
                    this.map.zoom = 14;
                    for (var i = 0; i < checkpoints.length; i++) {
                        checkpoints[i].latitude = parseFloat(checkpoints[i].location.latitude);
                        checkpoints[i].longitude = parseFloat(checkpoints[i].location.longitude);
                        delete checkpoints[i].location;
                        checkpoints[i].mapIcon = "/images/maps/img/marker.png";
                        checkpoints[i].description = checkpoints[i].title;
                        checkpoints[i].title = "Checkpoint";
                        if (checkpoints[i].order != "0") {
                            checkpoints[i].title += " " + checkpoints[i].order;
                        } 
                    }

                    setTimeout(function() {
                        this.map.pois = checkpoints;
                        var poi = this.map.pois[0];
                        this.map.moveTo(poi);
                    }.bind(this), 1000);
                } 
            });

        },

        setModel: function(model) {

            if (model.checkpoints && model.chekpoints !== this.model.checkpoints) {

                this.model.checkpoints = model.checkpoints;

            }

        }
    };
})(window);
