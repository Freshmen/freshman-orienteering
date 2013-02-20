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
        notification: {
           control: nokia.mh5.ui.Notification,
           visible: false
        },
        footer: {
            control: Container,
            cssClass: "gamify_footer",
            children: ["checkinBtn"],
            checkinBtn: {
                control: nokia.mh5.ui.Button,
                cssClass: "mh5_Button mh5_mode mh5_ColumnLayout gamify_checkinBtn",
                text: "Check in",
                onClick: function(e) {
                    var closest;
                    var distance = 1000;
                    var checkpoints = this.getRootOwnerByClass(nokia.mh5.ui.Page).model.checkpoints;
                    
                    for (var i=0; i < checkpoints.length; i++) {
                        var checkpoint = checkpoints[i];
                        var dist = nokia.mh5.math.pointDistance(nokia.mh5.geolocation.coords, checkpoint);
                        if (dist < distance) {
                              distance = dist;
                              closest = checkpoint;
                        }
                    }
                    if (distance > 100) {
                    	var page = this.getRootOwnerByClass(nokia.mh5.ui.Page);
						page.notification.timeout = 4000;
						page.notification.text = "You are not close enough to any checkpoint.";
						page.notification.visible = true;
                    } else {
                    	var postpath = '/api/v2/events/' + closest.event + "/checkpoints/" + closest._id + "/checkins";
                    	var gopath = '/events/' + closest.event + "/checkpoints/" + closest._id;
                    	$.post(postpath, nokia.mh5.geolocation.coords, function() {
                    		global.location = gopath;
                    	});
                    }
                }
            }
        },
        map: {
            control: Map,
            cssClass: "mh5_Map mh5_box-flex1",
            addressLookup: false,
            suggestions: false,
            settingsButton : null,
            mapLogo: null,
            infoBubble: {
                content: ["title", "description"],
                listeners: {
                    rightclick: function() {
                    	var checkpoint = this.poi.data;
                    	var path = "/events/" + checkpoint.event + "/checkpoints/" + checkpoint._id; 
                        global.location = path;
                    }
                }
            },

            listeners: {
                poiclick: function(e) {
                    var poi = e.data[0],
                        checkpoint = poi.data;
                    if (!poi.infoBubble && checkpoint._id) {
                        this.hideInfoBubble();
                        this.showInfoBubble(poi, {
                            content: ["title", "description"],
                            title: checkpoint.title,
                            description: checkpoint.description,
                            right : "/images/maps/img/back2map_icon.png",
                            rightDelimiter : true
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
                    var next;
                    var smallest;
                    for (var i = 0; i < checkpoints.length; i++) {
                        checkpoints[i].latitude = parseFloat(checkpoints[i].location.latitude);
                        checkpoints[i].longitude = parseFloat(checkpoints[i].location.longitude);
                        delete checkpoints[i].location;
                        if (checkpoints[i].visited) {
                        	checkpoints[i].mapIcon = "/images/maps/img/marker_visited.png";
                        } else {
                        	checkpoints[i].mapIcon = "/images/maps/img/marker.png";
                        	if (!next) {
                        		next = checkpoints[i];
                        		smallest = checkpoints[i].order;
                        	} else if (smallest > checkpoints[i].order) {
								next = checkpoints[i];
                        		smallest = checkpoints[i].order;
                        	}
                        }
                        checkpoints[i].description = checkpoints[i].title;
                        checkpoints[i].title = "Checkpoint";
                        if (Number(checkpoints[i].order)) {
                            checkpoints[i].title += " " + checkpoints[i].order;
                            checkpoints[i].markerOptions = {};
                            checkpoints[i].markerOptions.text = checkpoints[i].order;
                        } 
                    }

                    setTimeout(function() {
                        this.map.pois = checkpoints;
                        //this.map.route = [nokia.mh5.geolocation.coords, next];
                        this.map.moveTo(next?next:this.model.location);
                    }.bind(this), 1000);
                }
            });
			nokia.mh5.event.add(nokia.mh5.geolocation, "positionchange", function(evt) { console.log("location changed!"); }); 
			Control.watch(this.model, "location", this, function (location) { console.log("model location changed!"); });
        },

        setModel: function(model) {

            if (model.checkpoints && model.chekpoints !== this.model.checkpoints) {

                this.model.checkpoints = model.checkpoints;

            }

        }
    };
})(window);
