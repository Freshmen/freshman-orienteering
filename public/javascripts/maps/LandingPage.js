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
        children: ["header", "notification", "map"],
        header: {
            control: Control,
            cssClass: "gamify_header"
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
                        this.parent.parent._showDetails(this.poi.data);
                    }
                }
            },

            listeners: {
                poiclick: function(e) {
                    var poi = e.data[0],
                        event = poi.data;
                    if (!poi.infoBubble) {
                        this.hideInfoBubble();
                        this.showInfoBubble(poi, {
                            content: ["title", "description"],
                            title: event.eventName,
                            description: event.address,
                            left: event.eventImage
                        });
                    }
                    e.preventDefault();
                }
            }
        },
        model: {
            method: "geo.getevents",
            location: null,
            items: []
        },

        build: function() {
            this.constructor.prototype.build.call(this);
            Control.watch(this.model, "items", this, function (items) {
                if (!items) {
                    items = [];
                }
                nokia.mh5.app.controller.updateHistoryEntry();

                if (items.length > 0) {
                    this.map.zoom = 14;
                    setTimeout(function() {
                        this.map.pois = items;
                        var poi = this.map.pois[0];
                        this.map.moveTo(poi);
                    }.bind(this), 1000);
                } 
            });

        },

        setModel: function(model) {

            if (model.items && model.items !== this.model.items) {

                this.model.items = model.items;

            }

        }
    };
})(window);
